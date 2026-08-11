import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const OUTPUT = resolve(ROOT, "app/src/main/assets/data/quran-data.js");
const EDITIONS = "quran-uthmani,quran-tajweed,fr.hamidullah,en.asad,en.transliteration";
const TAJWEED_CLASSES = {h:"ham_wasl",s:"silent",l:"silent",n:"madda_normal",p:"madda_permissible",m:"madda_necessary",q:"qalqalah",o:"madda_obligatory",c:"ikhfa_shafawi",f:"ikhfa",w:"idgham_shafawi",i:"iqlab",a:"idgham_ghunnah",u:"idgham_without_ghunnah",d:"idgham_mutajanisayn",b:"idgham_mutaqaribayn",g:"ghunnah"};

function escapeHtml(value="") {
  return value.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

function stripLeadingBasmala(value="") {
  const target = "بسم الله الرحمن الرحيم";
  let normalized = "", insideTag = false, previousSpace = false, cut = 0;
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (char === "<") { insideTag = true; continue; }
    if (insideTag) { if (char === ">") insideTag = false; continue; }
    if (/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06EDـ]/u.test(char)) continue;
    const next = char === "ٱ" ? "ا" : /\s/u.test(char) ? " " : char;
    if (next === " " && previousSpace) continue;
    normalized += next;
    previousSpace = next === " ";
    cut = index + 1;
    if (normalized.length >= target.length) break;
  }
  if (!normalized.startsWith(target)) return value;
  return value.slice(cut).replace(/^(?:[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06EDـ\s]+|<\/[^>]+>)*/u, "").trimStart();
}

function parseTajweed(value="") {
  const html = escapeHtml(value).replace(/\[([hslpnmqocfwiaudbg])(?::\d+)?\[([^\]]*)\]/g, (_, code, text) => `<tajweed class="${TAJWEED_CLASSES[code]}">${text}</tajweed>`);
  return stripLeadingBasmala(html);
}

async function fetchJson(url, attempts=4) {
  let failure;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { accept: "application/json", "user-agent": "Nur-Offline-Builder/1.0" } });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return await response.json();
    } catch (error) {
      failure = error;
      await new Promise(resolve => setTimeout(resolve, attempt * 700));
    }
  }
  throw failure;
}

async function buildSurah(number) {
  const [hafsPayload, warshPayload] = await Promise.all([
    fetchJson(`https://api.alquran.cloud/v1/surah/${number}/editions/${EDITIONS}`),
    fetchJson(`https://api.quranpedia.net/v1/mushafs/4/${number}`),
  ]);
  if (hafsPayload.code !== 200 || !Array.isArray(hafsPayload.data) || !Array.isArray(warshPayload)) throw new Error(`Invalid source data for surah ${number}`);
  const byId = Object.fromEntries(hafsPayload.data.map(item => [item.edition.identifier, item]));
  const ar = byId["quran-uthmani"], tajweed = byId["quran-tajweed"], fr = byId["fr.hamidullah"], en = byId["en.asad"], tr = byId["en.transliteration"];
  if (!ar || !tajweed || !fr || !en || !tr) throw new Error(`Missing edition for surah ${number}`);
  const start = number === 1 ? 1 : 0;
  const hafs = ar.ayahs.slice(start).map((ayah, index) => {
    const sourceIndex = index + start;
    return {
      n: index + 1,
      global: ayah.number,
      arabic: stripLeadingBasmala(ayah.text),
      tajweed: parseTajweed(tajweed.ayahs[sourceIndex]?.text || ""),
      pronunciation: tr.ayahs[sourceIndex]?.text || "",
      fr: fr.ayahs[sourceIndex]?.text || "",
      en: en.ayahs[sourceIndex]?.text || "",
      juz: ayah.juz || null,
      page: ayah.page || null,
    };
  });
  const warsh = warshPayload.map(ayah => {
    const hafsNumber = ayah.number_in_hafs?.[0] || ayah.number;
    const sourceIndex = number === 1 ? Math.min(ar.ayahs.length - 1, ayah.number) : Math.max(0, hafsNumber - 1);
    return {
      n: ayah.number,
      global: ar.ayahs[sourceIndex]?.number || null,
      arabic: stripLeadingBasmala(ayah.text || ""),
      pronunciation: tr.ayahs[sourceIndex]?.text || "",
      fr: fr.ayahs[sourceIndex]?.text || "",
      en: en.ayahs[sourceIndex]?.text || "",
      juz: ar.ayahs[sourceIndex]?.juz || null,
      page: ayah.page_number || ar.ayahs[sourceIndex]?.page || null,
    };
  });
  return {
    number,
    nameArabic: ar.name,
    nameLatin: ar.englishName,
    revelation: ar.revelationType,
    hafs,
    warsh,
  };
}

const results = new Array(114);
let cursor = 1;
const workers = Array.from({ length: 6 }, async () => {
  while (cursor <= 114) {
    const number = cursor++;
    results[number - 1] = await buildSurah(number);
    console.log(`Prepared ${number}/114`);
  }
});
await Promise.all(workers);

const generatedAt = new Date().toISOString();
const payload = `/* Generated from AlQuran Cloud and Quranpedia. Do not edit manually. */\nwindow.NUR_QURAN_DATA=${JSON.stringify(results)};\nwindow.NUR_QURAN_META=${JSON.stringify({generatedAt,sources:["AlQuran Cloud: quran-uthmani, quran-tajweed, fr.hamidullah, en.asad, en.transliteration","Quranpedia mushaf 4: Warsh"]})};\n`;
await mkdir(dirname(OUTPUT), { recursive: true });
await writeFile(OUTPUT, payload, "utf8");
console.log(`Wrote ${OUTPUT} (${Buffer.byteLength(payload)} bytes)`);
