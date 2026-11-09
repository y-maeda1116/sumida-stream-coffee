import type { Shop } from "../types/shop";
import { escapeHtml } from "./escape";

/**
 * ShopMap のマーカーポップアップ用 HTML 文字列を構築する。
 * 外部データ (name / address / sourceUrl / 駅名) はすべて escapeHtml でエスケープする。
 * sourceUrl は http/https スキームのみ許可し、それ以外 (javascript: 等) は "#" に置き換える。
 */
export function buildPopupHtml(shop: Shop): string {
  const walkInfo = shop.stations
    .map((s) => `${escapeHtml(s.station)} ${s.exitElevatorWalkMin}分`)
    .join(" / ");

  const safeUrl = /^https?:\/\//i.test(shop.sourceUrl) ? escapeHtml(shop.sourceUrl) : "#";

  return (
    `<strong>${escapeHtml(shop.name)}</strong><br/>` +
    `${escapeHtml(shop.address)}<br/>` +
    `<span style="color:#6b5e50;font-size:0.85em">${walkInfo}</span><br/>` +
    `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">食べログで見る</a>`
  );
}
