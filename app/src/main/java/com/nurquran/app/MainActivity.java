package com.nurquran.app;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.net.ConnectivityManager;
import android.net.NetworkCapabilities;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;
import android.view.HapticFeedbackConstants;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Collections;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class MainActivity extends Activity {
    private static final String HOME_URL = "file:///android_asset/index.html";
    private static final String ONLINE_HOME_URL = "https://nur.youbianas1.workers.dev/?source=android";
    private static final String APP_HOST = "nur.youbianas1.workers.dev";
    private static final String OFFLINE_AUDIO_HOST = "offline.nur";
    private final ExecutorService downloads = Executors.newSingleThreadExecutor();
    private WebView webView;
    private SharedPreferences preferences;

    @SuppressLint({"SetJavaScriptEnabled", "JavascriptInterface"})
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(Color.BLACK);
        getWindow().setNavigationBarColor(Color.BLACK);
        preferences = getSharedPreferences("nur-shared-state", MODE_PRIVATE);

        webView = new WebView(this);
        webView.setBackgroundColor(Color.BLACK);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);

        webView.addJavascriptInterface(new OfflineBridge(), "NurAndroid");
        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if ("file".equals(uri.getScheme()) || APP_HOST.equals(uri.getHost())) return false;
                startActivity(new Intent(Intent.ACTION_VIEW, uri));
                return true;
            }

            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (OFFLINE_AUDIO_HOST.equals(uri.getHost()) && uri.getPath() != null && uri.getPath().startsWith("/audio/")) {
                    String key = safeKey(uri.getLastPathSegment() == null ? "" : uri.getLastPathSegment().replaceFirst("\\.mp3$", ""));
                    File file = audioFile(key);
                    try {
                        if (file.isFile() && file.length() > 1024) return new WebResourceResponse("audio/mpeg", null, new FileInputStream(file));
                    } catch (Exception ignored) { }
                    return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found", Collections.emptyMap(), new ByteArrayInputStream(new byte[0]));
                }
                return super.shouldInterceptRequest(view, request);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                if (url != null && url.startsWith("file:///android_asset/")) {
                    view.evaluateJavascript("window.NurOffline&&window.NurOffline.syncSharedState&&window.NurOffline.syncSharedState()", null);
                }
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, android.webkit.WebResourceError error) {
                if (request.isForMainFrame() && !"file".equals(request.getUrl().getScheme())) {
                    Toast.makeText(MainActivity.this, "Cette fonction nécessite une connexion. La lecture hors ligne reste disponible.", Toast.LENGTH_LONG).show();
                    view.loadUrl(HOME_URL);
                }
            }
        });

        if (savedInstanceState == null) webView.loadUrl(isOnline() ? ONLINE_HOME_URL : HOME_URL);
        else webView.restoreState(savedInstanceState);
    }

    private boolean isOnline() {
        ConnectivityManager manager = (ConnectivityManager) getSystemService(CONNECTIVITY_SERVICE);
        if (manager == null || manager.getActiveNetwork() == null) return false;
        NetworkCapabilities capabilities = manager.getNetworkCapabilities(manager.getActiveNetwork());
        return capabilities != null && capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET);
    }

    private void haptic(String kind) {
        runOnUiThread(() -> {
            int feedback = "warning".equals(kind) ? HapticFeedbackConstants.LONG_PRESS : "medium".equals(kind) ? HapticFeedbackConstants.CONTEXT_CLICK : HapticFeedbackConstants.CLOCK_TICK;
            if (webView.performHapticFeedback(feedback)) return;
            long duration = "warning".equals(kind) ? 28 : "medium".equals(kind) ? 18 : 8;
            int amplitude = "warning".equals(kind) ? 190 : "medium".equals(kind) ? 135 : 75;
            Vibrator vibrator;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) vibrator = ((VibratorManager) getSystemService(VIBRATOR_MANAGER_SERVICE)).getDefaultVibrator();
            else vibrator = (Vibrator) getSystemService(VIBRATOR_SERVICE);
            if (vibrator == null || !vibrator.hasVibrator()) return;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) vibrator.vibrate(VibrationEffect.createOneShot(duration, amplitude));
            else vibrator.vibrate(duration);
        });
    }

    private File audioDirectory() {
        File directory = new File(getFilesDir(), "quran-audio");
        if (!directory.exists()) directory.mkdirs();
        return directory;
    }

    private String safeKey(String value) { return value.replaceAll("[^A-Za-z0-9_-]", ""); }
    private File audioFile(String key) { return new File(audioDirectory(), safeKey(key) + ".mp3"); }

    private void sendProgress(int surah, int done, int total, boolean finished, boolean failed) {
        runOnUiThread(() -> webView.evaluateJavascript("window.NurOffline&&window.NurOffline.onAudioDownloadProgress(" + surah + "," + done + "," + total + "," + finished + "," + failed + ")", null));
    }

    private final class OfflineBridge {
        @JavascriptInterface
        public String getState() {
            return preferences.getString("state", "");
        }

        @JavascriptInterface
        public void setState(String stateJson) {
            if (stateJson != null && stateJson.length() <= 200000) {
                preferences.edit().putString("state", stateJson).apply();
            }
        }

        @JavascriptInterface
        public void clearState() {
            preferences.edit().remove("state").apply();
        }

        @JavascriptInterface
        public void performHaptic(String kind) {
            haptic(kind == null ? "selection" : kind);
        }

        @JavascriptInterface
        public void openOffline() {
            runOnUiThread(() -> webView.loadUrl(HOME_URL));
        }

        @JavascriptInterface
        public void openOnline() {
            runOnUiThread(() -> {
                int surah = 1;
                int verse = 1;
                try {
                    JSONObject state = new JSONObject(preferences.getString("state", "{}"));
                    surah = Math.max(1, Math.min(114, state.optInt("current", 1)));
                    verse = Math.max(1, state.optInt("currentVerse", 1));
                } catch (Exception ignored) { }
                webView.loadUrl("https://nur.youbianas1.workers.dev/read?surah=" + surah + "&source=android#verse-" + verse);
            });
        }

        @JavascriptInterface
        public boolean hasAudio(String key) {
            File file = audioFile(key);
            return file.isFile() && file.length() > 1024;
        }

        @JavascriptInterface
        public void downloadAudioPack(int surah, String itemsJson) {
            downloads.execute(() -> {
                int done = 0;
                try {
                    JSONArray items = new JSONArray(itemsJson);
                    int total = items.length();
                    sendProgress(surah, 0, total, false, false);
                    for (int index = 0; index < total; index++) {
                        JSONObject item = items.getJSONObject(index);
                        String key = safeKey(item.getString("key"));
                        String remoteUrl = item.getString("url");
                        File target = audioFile(key);
                        if (!target.isFile() || target.length() <= 1024) download(remoteUrl, target);
                        done += 1;
                        sendProgress(surah, done, total, false, false);
                    }
                    sendProgress(surah, done, total, true, false);
                } catch (Exception error) {
                    sendProgress(surah, done, Math.max(done + 1, 1), true, true);
                }
            });
        }

        @JavascriptInterface
        public void deleteAllAudio() {
            downloads.execute(() -> {
                File[] files = audioDirectory().listFiles();
                if (files != null) for (File file : files) file.delete();
            });
        }
    }

    private void download(String remoteUrl, File target) throws Exception {
        File temporary = new File(target.getParentFile(), target.getName() + ".part");
        HttpURLConnection connection = (HttpURLConnection) new URL(remoteUrl).openConnection();
        connection.setConnectTimeout(20000);
        connection.setReadTimeout(45000);
        connection.setInstanceFollowRedirects(true);
        connection.setRequestProperty("User-Agent", "Nur-Android/3.1");
        try {
            int status = connection.getResponseCode();
            if (status < 200 || status >= 300) throw new IllegalStateException("Audio HTTP " + status);
            try (InputStream input = connection.getInputStream(); FileOutputStream output = new FileOutputStream(temporary)) {
                byte[] buffer = new byte[64 * 1024];
                int count;
                while ((count = input.read(buffer)) != -1) output.write(buffer, 0, count);
            }
            if (temporary.length() <= 1024) throw new IllegalStateException("Empty audio");
            if (target.exists()) target.delete();
            if (!temporary.renameTo(target)) throw new IllegalStateException("Cannot save audio");
        } finally {
            connection.disconnect();
            if (temporary.exists() && !target.exists()) temporary.delete();
        }
    }

    @Override
    protected void onDestroy() {
        downloads.shutdownNow();
        if (webView != null) webView.destroy();
        super.onDestroy();
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        webView.saveState(outState);
        super.onSaveInstanceState(outState);
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }
}
