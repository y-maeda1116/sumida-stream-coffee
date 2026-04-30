/**
 * raw_shops.json → shops.json 変換スクリプト
 *
 * 自動変換: id, name, address, hasWifi, hasPower, lat/lng(ジオコーディング), stations(駅名マッチ)
 * 要手動: brewMethods, beansAvailable, selfRoasted, atmosphere, babyStrollerAccess, exitElevatorWalkMin
 *
 * 使い方: npm run convert
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const INPUT_PATH = resolve(__dirname, "..", "data", "raw_shops.json");
const OUTPUT_PATH = resolve(__dirname, "..", "data", "shops.json");

const VALID_STATIONS = ["浅草", "蔵前", "本所吾妻橋", "浅草橋"] as const;

interface RawShop {
  id: string;
  name: string;
  address: string;
  station: string;
  phone: string;
  hasWifi: boolean | null;
  hasPower: boolean | null;
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

const SLEEP_MS = 1100; // Nominatim requires >= 1s between requests

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function matchStation(rawStation: string): string[] {
  const matched: string[] = [];
  for (const s of VALID_STATIONS) {
    if (rawStation.includes(s)) {
      matched.push(s);
    }
  }
  // Fallback: try common aliases
  if (matched.length === 0) {
    if (rawStation.includes("蔵前")) matched.push("蔵前");
    if (rawStation.includes("吾妻橋")) matched.push("本所吾妻橋");
    if (rawStation.includes("浅草橋")) matched.push("浅草橋");
    if (rawStation.includes("浅草")) matched.push("浅草");
  }
  return [...new Set(matched)];
}

async function geocode(address: string): Promise<{ lat: number; lng: number }> {
  const query = encodeURIComponent(address);
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=jp`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "sumida-stream-coffee/1.0" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (data.length === 0) {
      console.warn(`  Geocode failed for: ${address}`);
      return { lat: 35.7148, lng: 139.7967 }; // 浅草周辺のフォールバック
    }

    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch (error) {
    console.warn(`  Geocode error for ${address}:`, error);
    return { lat: 35.7148, lng: 139.7967 };
  }
}

async function convertShop(raw: RawShop, index: number, total: number): Promise<Shop> {
  console.log(`Geocoding ${index + 1}/${total}: ${raw.name}`);

  const { lat, lng } = await geocode(raw.address);
  await sleep(SLEEP_MS);

  const stationNames = matchStation(raw.station);
  const stations =
    stationNames.length > 0
      ? stationNames.map((station) => ({
          station,
          exitElevatorWalkMin: 0, // TODO: 手動で設定
        }))
      : [{ station: "浅草", exitElevatorWalkMin: 0 }]; // フォールバック

  return {
    id: raw.id,
    name: raw.name,
    address: raw.address,
    stations,
    brewMethods: [], // TODO: 手動で設定
    beansAvailable: false, // TODO: 手動で設定
    selfRoasted: false, // TODO: 手動で設定
    atmosphere: [], // TODO: 手動で設定
    babyStrollerAccess: "moderate", // デフォルト
    hasPower: raw.hasPower ?? false,
    hasWifi: raw.hasWifi ?? false,
    lat,
    lng,
  };
}

async function main(): Promise<void> {
  const raw: RawShop[] = JSON.parse(readFileSync(INPUT_PATH, "utf-8"));
  console.log(`Converting ${raw.length} shops...\n`);

  const shops: Shop[] = [];
  for (let i = 0; i < raw.length; i++) {
    const shop = await convertShop(raw[i], i, raw.length);
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
