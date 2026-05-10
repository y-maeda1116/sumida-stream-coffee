/**
 * raw_shops.json → shops.json 変換スクリプト
 *
 * 自動変換: id, name, address, hasWifi, hasPower, lat/lng(ジオコーディング), stations(交通手段パース)
 * 要手動: brewMethods, beansAvailable, selfRoasted, atmosphere, babyStrollerAccess
 *
 * 使い方: npm run convert
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const INPUT_PATH = resolve(__dirname, "..", "data", "raw_shops.json");
const IGNORE_PATH = resolve(__dirname, "..", "data", "ignore.json");
const OUTPUT_PATH = resolve(__dirname, "..", "data", "shops.json");

const VALID_STATIONS = ["浅草 (TX)", "浅草", "蔵前", "本所吾妻橋", "浅草橋", "田原町", "両国", "押上", "入谷", "三ノ輪"] as const;

interface RawShop {
  id: string;
  name: string;
  address: string;
  station: string;
  accessText: string;
  phone: string;
  hasWifi: boolean | null;
  hasPower: boolean | null;
  lat: number | null;
  lng: number | null;
  genre: string;
  sourceUrl: string;
}

interface Shop {
  id: string;
  name: string;
  address: string;
  stations: { station: string; exitElevatorWalkMin: number }[];
  brewMethods: string[];
  beansAvailable: boolean;
  selfRoasted: boolean;
  atmosphere: string[];
  babyStrollerAccess: "easy" | "moderate" | "difficult";
  hasPower: boolean;
  hasWifi: boolean;
  lat: number;
  lng: number;
  sourceUrl: string;
}

const FALLBACK_LAT = 35.7148;
const FALLBACK_LNG = 139.7967;

const STATION_COORDS: Record<string, [number, number]> = {
  "浅草": [35.7148, 139.7967],
  "浅草 (TX)": [35.7115, 139.7968],
  "蔵前": [35.6975, 139.7935],
  "本所吾妻橋": [35.7085, 139.8045],
  "浅草橋": [35.6980, 139.7890],
  "田原町": [35.7100, 139.7930],
  "両国": [35.6935, 139.7935],
  "押上": [35.7102, 139.8135],
  "入谷": [35.7220, 139.7840],
  "三ノ輪": [35.7300, 139.7900],
};

function estimateWalkMin(lat: number, lng: number, sLat: number, sLng: number): number {
  const dx = (lat - sLat) * 111000;
  const dy = (lng - sLng) * 111000 * Math.cos((lat * Math.PI) / 180);
  const distM = Math.sqrt(dx * dx + dy * dy);
  return Math.max(1, Math.round(distM / 80));
}

function nearestStations(lat: number, lng: number): { station: string; exitElevatorWalkMin: number }[] {
  const entries = Object.entries(STATION_COORDS).map(([station, [sLat, sLng]]) => ({
    station,
    exitElevatorWalkMin: estimateWalkMin(lat, lng, sLat, sLng),
  }));
  entries.sort((a, b) => a.exitElevatorWalkMin - b.exitElevatorWalkMin);
  return entries.slice(0, 2);
}

function loadIgnoreList(): Set<string> {
  try {
    const raw = readFileSync(IGNORE_PATH, "utf-8");
    const ids: string[] = JSON.parse(raw);
    return new Set(ids);
  } catch {
    return new Set();
  }
}

function parseAccessText(accessText: string): { station: string; exitElevatorWalkMin: number }[] {
  const results: { station: string; exitElevatorWalkMin: number }[] = [];
  const seen = new Set<string>();

  // Normalize: newlines → spaces, full-width digits → half-width, bracket variations
  const text = accessText
    .replace(/[\n\r]+/g, " ")
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/(\d),(\d)/g, "$1$2")
    .replace(/[【「『]/g, "")
    .replace(/[】」』]/g, "");

  // Strategy: find all (station context, walk time) pairs
  // Each entry looks like: "〜駅...徒歩N分" or "〜駅からNm" or "〜駅N分"

  // Replace TX mentions before parsing so they match as "浅草 (TX)駅"
  const txText = text.replace(/つくばエクスプレス\s*浅草駅/g, "浅草 (TX)駅");

  // Pattern 1: 徒歩N分 — find each occurrence, look backwards for nearest station
  const walkRe = /徒歩[^0-9]*(\d+)分/g;
  let m: RegExpExecArray | null;
  while ((m = walkRe.exec(txText)) !== null) {
    const walkMin = parseInt(m[1], 10);
    const before = txText.slice(Math.max(0, m.index - 40), m.index + m[0].length);
    const bestMatch = findBestStation(before);
    if (bestMatch && !seen.has(bestMatch)) {
      seen.add(bestMatch);
      results.push({ station: bestMatch, exitElevatorWalkMin: walkMin });
    }
  }

  // Pattern 2: 駅からNm — distance to walking time
  const distRe = /(\S+?駅\S*?)から(\d+)m/g;
  while ((m = distRe.exec(txText)) !== null) {
    const dist = parseInt(m[2], 10);
    const walkMin = Math.max(1, Math.ceil(dist / 80));
    const bestMatch = findBestStation(m[1]);
    if (bestMatch && !seen.has(bestMatch)) {
      seen.add(bestMatch);
      results.push({ station: bestMatch, exitElevatorWalkMin: walkMin });
    }
  }

  // Pattern 3: 駅N分 (e.g. 田原町駅2分)
  const shortRe = /(\S+?駅)\D*?(\d+)分/g;
  while ((m = shortRe.exec(txText)) !== null) {
    const walkMin = parseInt(m[2], 10);
    const bestMatch = findBestStation(m[1]);
    if (bestMatch && !seen.has(bestMatch)) {
      seen.add(bestMatch);
      results.push({ station: bestMatch, exitElevatorWalkMin: walkMin });
    }
  }

  return results;
}

function findBestStation(text: string): string | null {
  let bestMatch: string | null = null;
  for (const valid of VALID_STATIONS) {
    if (text.includes(valid)) {
      if (!bestMatch || valid.length > bestMatch.length) {
        bestMatch = valid;
      }
    }
  }
  return bestMatch;
}

async function convertShop(raw: RawShop, index: number, total: number): Promise<Shop> {
  console.log(`Converting ${index + 1}/${total}: ${raw.name}`);

  const lat = raw.lat ?? FALLBACK_LAT;
  const lng = raw.lng ?? FALLBACK_LNG;

  let stations = parseAccessText(raw.accessText).map((s) => ({
    ...s,
    exitElevatorWalkMin: Math.max(1, s.exitElevatorWalkMin),
  }));

  if (stations.length === 0) {
    const stationNames = matchStation(raw.station);
    if (stationNames.length > 0) {
      stations = stationNames.map((station) => ({
        station,
        exitElevatorWalkMin: STATION_COORDS[station]
          ? estimateWalkMin(lat, lng, ...STATION_COORDS[station])
          : 0,
      }));
    } else {
      stations = nearestStations(lat, lng);
    }
  }

  return {
    id: raw.id,
    name: raw.name,
    address: raw.address,
    stations,
    brewMethods: [],
    beansAvailable: false,
    selfRoasted: false,
    atmosphere: [],
    babyStrollerAccess: "moderate",
    hasPower: raw.hasPower ?? false,
    hasWifi: raw.hasWifi ?? false,
    lat,
    lng,
    sourceUrl: raw.sourceUrl,
  };
}

function matchStation(rawStation: string): string[] {
  const matched: string[] = [];
  for (const s of VALID_STATIONS) {
    if (rawStation.includes(s)) {
      matched.push(s);
    }
  }
  if (matched.length === 0) {
    if (rawStation.includes("(TX)") || rawStation.includes("つくばエクスプレス")) {
      matched.push("浅草 (TX)");
    }
    if (rawStation.includes("蔵前")) matched.push("蔵前");
    if (rawStation.includes("吾妻橋")) matched.push("本所吾妻橋");
    if (rawStation.includes("浅草橋")) matched.push("浅草橋");
    if (rawStation.includes("田原町")) matched.push("田原町");
    if (rawStation.includes("両国")) matched.push("両国");
    if (rawStation.includes("押上")) matched.push("押上");
    if (rawStation.includes("入谷")) matched.push("入谷");
    if (rawStation.includes("三ノ輪")) matched.push("三ノ輪");
    if (matched.length === 0 && rawStation.includes("浅草")) matched.push("浅草");
  }
  return [...new Set(matched)];
}

const CAFE_GENRE_KEYWORDS = ["カフェ", "喫茶", "コーヒー", "珈琲"];

function isCafeGenre(genre: string): boolean {
  return CAFE_GENRE_KEYWORDS.some((keyword) => genre.includes(keyword));
}

function matchesTargetStation(raw: RawShop): boolean {
  if (parseAccessText(raw.accessText).length > 0) return true;
  const stationText = raw.station.includes("つくばエクスプレス")
    ? raw.station.replace(/つくばエクスプレス\S*?浅草/g, "浅草 (TX)")
    : raw.station;
  return matchStation(stationText).length > 0;
}

async function main(): Promise<void> {
  const raw: RawShop[] = JSON.parse(readFileSync(INPUT_PATH, "utf-8"));
  const ignoreIds = loadIgnoreList();

  const filtered = raw.filter((s) => {
    if (ignoreIds.has(s.id)) return false;
    if (!isCafeGenre(s.genre)) {
      console.log(`  Skipping non-cafe: ${s.name} (${s.genre})`);
      return false;
    }
    if (!matchesTargetStation(s)) {
      console.log(`  Skipping out-of-area: ${s.name} (${s.station})`);
      return false;
    }
    return true;
  });
  if (ignoreIds.size > 0) {
    console.log(`Ignoring ${raw.length - filtered.length} shops from ignore list\n`);
  }

  console.log(`Converting ${filtered.length} shops...\n`);

  const shops: Shop[] = [];
  const seenNames = new Set<string>();

  for (let i = 0; i < filtered.length; i++) {
    const shop = await convertShop(filtered[i], i, filtered.length);
    if (seenNames.has(shop.name)) {
      console.log(`  Skipping duplicate: ${shop.name}`);
      continue;
    }
    seenNames.add(shop.name);
    shops.push(shop);
  }

  writeFileSync(OUTPUT_PATH, JSON.stringify(shops, null, 2), "utf-8");
  console.log(`\nDone! Wrote ${shops.length} shops to ${OUTPUT_PATH}`);

  const needsWork = shops.filter(
    (s) =>
      s.stations.some((st) => st.exitElevatorWalkMin === 0) ||
      s.brewMethods.length === 0 ||
      s.atmosphere.length === 0
  );
  if (needsWork.length > 0) {
    console.log(
      `\n⚠ ${needsWork.length} shops need manual data (exitElevatorWalkMin, brewMethods, atmosphere, etc.)`
    );
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
