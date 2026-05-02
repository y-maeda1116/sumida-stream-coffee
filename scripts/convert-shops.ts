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

const VALID_STATIONS = ["浅草", "蔵前", "本所吾妻橋", "浅草橋"] as const;

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
}

const FALLBACK_LAT = 35.7148;
const FALLBACK_LNG = 139.7967;

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

  const lines = accessText.split(/[\n\r]+/).map((l) => l.trim()).filter(Boolean);

  for (const line of lines) {
    let walkMin: number | null = null;

    const walkMatch = line.match(/徒歩(\d+)分/);
    if (walkMatch) {
      walkMin = parseInt(walkMatch[1], 10);
    }

    if (walkMin === null) {
      const distMatch = line.match(/(\d+)m/);
      if (distMatch) {
        walkMin = Math.max(1, Math.ceil(parseInt(distMatch[1], 10) / 80));
      }
    }

    if (walkMin === null) continue;

    let bestMatch: string | null = null;
    for (const valid of VALID_STATIONS) {
      if (line.includes(valid)) {
        if (!bestMatch || valid.length > bestMatch.length) {
          bestMatch = valid;
        }
      }
    }

    if (bestMatch && !seen.has(bestMatch)) {
      seen.add(bestMatch);
      results.push({ station: bestMatch, exitElevatorWalkMin: walkMin });
    }
  }

  return results;
}

async function convertShop(raw: RawShop, index: number, total: number): Promise<Shop> {
  console.log(`Converting ${index + 1}/${total}: ${raw.name}`);

  const lat = raw.lat ?? FALLBACK_LAT;
  const lng = raw.lng ?? FALLBACK_LNG;

  const stations = parseAccessText(raw.accessText);

  if (stations.length === 0) {
    const stationNames = matchStation(raw.station);
    stations =
      stationNames.length > 0
        ? stationNames.map((station) => ({ station, exitElevatorWalkMin: 0 }))
        : [{ station: "浅草", exitElevatorWalkMin: 0 }];
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
    if (rawStation.includes("蔵前")) matched.push("蔵前");
    if (rawStation.includes("吾妻橋")) matched.push("本所吾妻橋");
    if (rawStation.includes("浅草橋")) matched.push("浅草橋");
    if (rawStation.includes("浅草")) matched.push("浅草");
  }
  return [...new Set(matched)];
}

async function main(): Promise<void> {
  const raw: RawShop[] = JSON.parse(readFileSync(INPUT_PATH, "utf-8"));
  const ignoreIds = loadIgnoreList();

  const filtered = raw.filter((s) => !ignoreIds.has(s.id));
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
