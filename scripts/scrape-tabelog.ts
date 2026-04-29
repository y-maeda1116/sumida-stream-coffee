/**
 * 食べログ スクレイピングスクリプト
 * 浅草・浅草橋・蔵前エリアのカフェ情報を収集し data/raw_shops.json に出力
 *
 * 使い方: npm run scrape
 */

import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = resolve(__dirname, "..", "data", "raw_shops.json");

const AREA_URLS = [
  "https://tabelog.com/tokyo/A1311/A131102/rstLst/cafe/",
  "https://tabelog.com/tokyo/A1311/A131103/rstLst/cafe/",
];

const SLEEP_MS = 3000;
const MAX_PAGES_PER_AREA = 3;
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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "ja,en-US;q=0.7,en;q=0.3",
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }

  return res.text();
}

function extractShopUrls(listHtml: string): string[] {
  const urls: string[] = [];
  const pattern =
    /<a[^>]+href="(https:\/\/tabelog\.com\/tokyo\/A\d+\/A\d+\/\d+\/)"[^>]*>/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(listHtml)) !== null) {
    const url = match[1];
    if (!urls.includes(url)) {
      urls.push(url);
    }
  }

  return urls;
}

function extractBetween(html: string, start: string, end: string): string {
  const s = html.indexOf(start);
  if (s === -1) return "";
  const content = html.substring(s + start.length);
  const e = content.indexOf(end);
  if (e === -1) return "";
  return content.substring(0, e).trim();
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, "").trim();
}

function extractName(html: string): string {
  const match = html.match(
    /<h2[^>]*class="display-name"[^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/
  );
  if (match) return stripTags(match[1]);

  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/);
  if (titleMatch) {
    const parts = stripTags(titleMatch[1]).split("-")[0];
    return parts.trim();
  }

  return "";
}

function extractAddress(html: string): string {
  const block = extractBetween(
    html,
    'class="rstinfo-table__address"',
    "</p>"
  );
  return stripTags(block);
}

function extractPhone(html: string): string {
  const block = extractBetween(
    html,
    'class="rstinfo-table__tel-number"',
    "</strong>"
  );
  return stripTags(block);
}

function extractStation(html: string): string {
  const block = extractBetween(
    html,
    'class="rstinfo-table__access-text"',
    "</div>"
  );
  const text = stripTags(block);
  const match = text.match(/([^\x00-\x7F]+?)駅/);
  return match ? match[1] + "駅" : text.substring(0, 30);
}

function checkFeature(html: string, keyword: string): boolean | null {
  const text = html.toLowerCase();
  const found = text.includes(keyword.toLowerCase());
  if (!found) return null;
  return true;
}

function extractDetail(html: string, url: string): RawShop {
  const name = extractName(html);
  const address = extractAddress(html);
  const phone = extractPhone(html);
  const station = extractStation(html);

  const featureSection = extractBetween(
    html,
    'class="rstinfo-table__free-text"',
    "</div>"
  );

  const hasWifi = checkFeature(featureSection || html, "Wi-Fi") ??
    checkFeature(featureSection || html, "WiFi");
  const hasPower = checkFeature(featureSection || html, "電源") ??
    checkFeature(featureSection || html, "コンセント");

  const id = `tabelog-${url.split("/").filter(Boolean).pop() || Date.now()}`;

  return {
    id,
    name,
    address,
    station,
    phone,
    hasWifi,
    hasPower,
    sourceUrl: url,
  };
}

async function scrapeArea(baseUrl: string): Promise<string[]> {
  const shopUrls: string[] = [];

  for (let page = 1; page <= MAX_PAGES_PER_AREA; page++) {
    const url = page === 1 ? baseUrl : `${baseUrl}${page}/`;
    console.log(`  Fetching list page ${page}: ${url}`);

    try {
      const html = await fetchPage(url);
      const urls = extractShopUrls(html);
      console.log(`    Found ${urls.length} shop URLs`);

      for (const u of urls) {
        if (!shopUrls.includes(u)) {
          shopUrls.push(u);
        }
      }

      if (urls.length === 0) {
        console.log("    No more results, stopping pagination");
        break;
      }

      if (page < MAX_PAGES_PER_AREA) {
        await sleep(SLEEP_MS);
      }
    } catch (error) {
      console.error(`  Error fetching page ${page}:`, error);
      break;
    }
  }

  return shopUrls;
}

async function scrapeShopDetail(url: string): Promise<RawShop | null> {
  try {
    const html = await fetchPage(url);
    return extractDetail(html, url);
  } catch (error) {
    console.error(`  Error fetching ${url}:`, error);
    return null;
  }
}

async function main(): Promise<void> {
  console.log("Starting Tabelog scrape...\n");

  const allShopUrls: string[] = [];

  for (const areaUrl of AREA_URLS) {
    console.log(`Scraping area: ${areaUrl}`);
    const urls = await scrapeArea(areaUrl);
    console.log(`  Total shop URLs from area: ${urls.length}\n`);

    for (const u of urls) {
      if (!allShopUrls.includes(u)) {
        allShopUrls.push(u);
      }
    }

    await sleep(SLEEP_MS);
  }

  console.log(`Total unique shop URLs: ${allShopUrls.length}\n`);

  const shops: RawShop[] = [];

  for (let i = 0; i < allShopUrls.length; i++) {
    const url = allShopUrls[i];
    console.log(
      `Scraping detail ${i + 1}/${allShopUrls.length}: ${url}`
    );

    const shop = await scrapeShopDetail(url);
    if (shop && shop.name) {
      shops.push(shop);
      console.log(`  -> ${shop.name}`);
    } else {
      console.log("  -> Skipped (no name extracted)");
    }

    await sleep(SLEEP_MS);
  }

  writeFileSync(OUTPUT_PATH, JSON.stringify(shops, null, 2), "utf-8");

  console.log(`\nDone! Wrote ${shops.length} shops to ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
