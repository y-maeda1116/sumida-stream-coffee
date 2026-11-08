import type { Shop } from "../types/shop";
import { escapeHtml } from "./escape";

/**
 * ShopMap のマーカーポップアップ用 HTML 文字列を構築する。
 * 外部データ (name / address / sourceUrl / 駅名) はすべて escapeHtml でエスケープする。
 */
export function buildPopupHtml(shop: Shop): string {
  const walkInfo = shop.stations
    .map((s) => `${escapeHtml(s.station)} ${s.exitElevatorWalkMin}分`)
    .join(" / ");

  return (
    `<strong>${escapeHtml(shop.name)}</strong><br/>` +
    `${escapeHtml(shop.address)}<br/>` +
    `<span style="color:#6b5e50;font-size:0.85em">${walkInfo}</span><br/>` +
    `<a href="${escapeHtml(shop.sourceUrl)}" target="_blank" rel="noopener noreferrer">食べログで見る</a>`
  );
}
