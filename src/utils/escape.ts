const ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/**
 * HTML の要素内容および属性値に埋め込めるよう文字列をエスケープする。
 * 食べログスクレイプ由来の外部データ (店名・住所・URL) を Leaflet ポップアップの
 * HTML 文字列に展開する際に必ず通すこと。
 */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ESCAPE_MAP[c]);
}
