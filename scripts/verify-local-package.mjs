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

const [activity, app] = await Promise.all([
  readFile(resolve(root, "app/src/main/java/com/nurquran/app/MainActivity.java"), "utf8"),
  readFile(resolve(root, "app/src/main/assets/app.js"), "utf8"),
]);

if (!activity.includes("webView.loadUrl(HOME_URL);")) throw new Error("Android must start from the packaged application.");
if (activity.includes("isOnline() ? ONLINE_HOME_URL : HOME_URL")) throw new Error("Android still switches shells according to connectivity.");
if (app.includes("NurAndroid?.openOnline")) throw new Error("The local interface still redirects online after reconnecting.");

const hafsVerses = data.reduce((total, surah) => total + surah.hafs.length, 0);
const warshVerses = data.reduce((total, surah) => total + surah.warsh.length, 0);
console.log(JSON.stringify({ surahs: data.length, hafsVerses, warshVerses, sources: meta?.sources || [] }, null, 2));
