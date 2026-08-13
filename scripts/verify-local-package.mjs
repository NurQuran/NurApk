import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dirname, "..");
globalThis.window = {};
const dataUrl = pathToFileURL(resolve(root, "app/src/main/assets/data/quran-data.js"));
dataUrl.searchParams.set("verify", String(Date.now()));
await import(dataUrl.href);

const data = window.NUR_QURAN_DATA;
const meta = window.NUR_QURAN_META;
if (!Array.isArray(data) || data.length !== 114) throw new Error("The local Quran library must contain 114 surahs.");

for (const surah of data) {
  if (!Array.isArray(surah.hafs) || !surah.hafs.length) throw new Error(`Missing Hafs data for surah ${surah.number}.`);
  if (!Array.isArray(surah.warsh) || !surah.warsh.length) throw new Error(`Missing Warsh data for surah ${surah.number}.`);
  for (const verse of surah.hafs) {
    for (const field of ["arabic", "pronunciation", "fr", "en"]) {
      if (!verse[field]) throw new Error(`Missing ${field} in Hafs ${surah.number}:${verse.n}.`);
    }
  }
  for (const verse of surah.warsh) {
    for (const field of ["arabic", "pronunciation", "fr", "en"]) {
      if (!verse[field]) throw new Error(`Missing ${field} in Warsh ${surah.number}:${verse.n}.`);
    }
  }
}

const [activity, app, index, styles] = await Promise.all([
  readFile(resolve(root, "app/src/main/java/com/nurquran/app/MainActivity.java"), "utf8"),
  readFile(resolve(root, "app/src/main/assets/app.js"), "utf8"),
  readFile(resolve(root, "app/src/main/assets/index.html"), "utf8"),
  readFile(resolve(root, "app/src/main/assets/styles.css"), "utf8"),
]);

if (!activity.includes("webView.loadUrl(HOME_URL);")) throw new Error("Android must start from the packaged application.");
if (activity.includes("isOnline() ? ONLINE_HOME_URL : HOME_URL")) throw new Error("Android still switches shells according to connectivity.");
if (app.includes("NurAndroid?.openOnline")) throw new Error("The local interface still redirects online after reconnecting.");
if (activity.includes("webView.loadUrl(FQIH") || activity.includes("/assistant?source=android")) throw new Error("Android still opens the hosted Fqih page.");
if (!activity.includes("askFqih") || !activity.includes("FQIH_API")) throw new Error("The local Fqih interface cannot request an online answer.");
if (!activity.includes("NET_CAPABILITY_VALIDATED") || !activity.includes("Thread.sleep(850)")) throw new Error("Fqih connectivity and transient retry handling are incomplete.");
if (activity.includes("createNativeNavigation")) throw new Error("The obsolete second Android navigation shell is still bundled.");
if (!app.includes("connectionAvailable()") || !activity.includes("notifyConnectivity")) throw new Error("Online-only controls are not synchronized with Android connectivity.");
if (!app.includes("data-explain-verse")) throw new Error("Online ayah explanations are missing.");
if (!index.includes("ai-online-only") || !styles.includes('html[data-network="offline"] .ai-online-only')) throw new Error("Fqih actions are not hidden offline.");
if (!index.includes("fqih-shell") || !app.includes("sendFqih") || !styles.includes(".fqih-composer")) throw new Error("Fqih is not hosted inside the local application shell.");
if (!index.includes('id="audioSurahSelect"')) throw new Error("The audio download settings do not include a surah picker.");
if (!index.includes('data-translation="none"') || !app.includes("setTranslation")) throw new Error("The app does not enforce a single translation choice.");
if (!app.includes('state.language==="ar"?item.nameArabic:item.nameLatin')) throw new Error("Arabic mode still risks displaying Latin surah names.");
if (!styles.includes("env(safe-area-inset-top)")) throw new Error("The mobile reader does not respect the Android status bar safe area.");

for (const language of ["fr", "en"]) {
  const match = app.match(new RegExp(`${language}:(\\[[^\\n]+\\])`));
  if (!match || JSON.parse(match[1]).length !== 114) throw new Error(`Missing the 114 local ${language} surah meanings.`);
}

const hafsVerses = data.reduce((total, surah) => total + surah.hafs.length, 0);
const warshVerses = data.reduce((total, surah) => total + surah.warsh.length, 0);
console.log(JSON.stringify({ surahs: data.length, hafsVerses, warshVerses, sources: meta?.sources || [] }, null, 2));
