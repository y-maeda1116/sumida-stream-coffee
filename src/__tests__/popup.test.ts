import { describe, it, expect } from "vitest";
import { escapeHtml } from "../utils/escape";
import { buildPopupHtml } from "../utils/popup";
import type { Shop } from "../types/shop";

describe("escapeHtml", () => {
  it("HTML特殊文字をエスケープする", () => {
    expect(escapeHtml(`<a href="x">&amp;'`)).toBe("&lt;a href=&quot;x&quot;&gt;&amp;amp;&#39;");
  });

  it("エスケープ不要な文字はそのまま通す", () => {
    expect(escapeHtml("浅草のコーヒー店")).toBe("浅草のコーヒー店");
  });
});

const baseShop: Shop = {
  id: "tabelog-1",
  name: "正常な店名",
  address: "東京都台東区 x-y",
  stations: [{ station: "浅草", exitElevatorWalkMin: 5 }],
  brewMethods: ["ドリップ"],
  beansAvailable: false,
  selfRoasted: false,
  atmosphere: ["川沿い"],
  babyStrollerAccess: "easy",
  hasPower: false,
  hasWifi: true,
  lat: 35.7,
  lng: 139.8,
  sourceUrl: "https://tabelog.com/tokyo/A1311/A131102/100001/",
};

describe("buildPopupHtml", () => {
  it("店名・住所・徒歩情報・リンクを含むHTMLを生成する", () => {
    const html = buildPopupHtml(baseShop);
    expect(html).toContain("<strong>正常な店名</strong>");
    expect(html).toContain("東京都台東区 x-y");
    expect(html).toContain("浅草 5分");
    expect(html).toContain('href="https://tabelog.com/tokyo/A1311/A131102/100001/"');
  });

  it("店名・住所のHTMLインジェクションをエスケープする", () => {
    const html = buildPopupHtml({
      ...baseShop,
      name: `<img src=x onerror="alert(1)">`,
      address: `台東区<script>alert('xss')</script>`,
    });
    expect(html).not.toContain("<img");
    expect(html).not.toContain("<script");
    expect(html).not.toContain('onerror="');
    expect(html).toContain("&lt;img src=x ");
    expect(html).toContain("&lt;script&gt;");
  });

  it("href 属性へのインジェクションをエスケープする", () => {
    const html = buildPopupHtml({
      ...baseShop,
      sourceUrl: `https://tabelog.com/x/" onmouseover="alert(1)`,
    });
    expect(html).not.toContain('" onmouseover="');
    expect(html).toContain("&quot;");
  });
});
