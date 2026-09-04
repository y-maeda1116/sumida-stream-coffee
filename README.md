# Sumida Stream Coffee

浅草・浅草(TX)・蔵前・本所吾妻橋・浅草橋・田原町・両国・押上・入谷・三ノ輪エリアのコーヒーショップマップ。

食べログから毎日自動で店舗データを収集し、地図とリストで絞り込み・閲覧できるSPA。

<https://y-maeda1116.github.io/sumida-stream-coffee/>

## 技術スタック

- SolidJS + Vite
- Leaflet（地図）
- CSS Modules
- TypeScript
- GitHub Pages（ホスティング）

## 機能

- 駅別カフェ一覧表示（浅草・浅草(TX)・蔵前・本所吾妻橋・浅草橋・田原町・両国・押上・入谷・三ノ輪）
- 地図マーカー表示（Leaflet）+ マーカークリックでリストの該当店舗をハイライト
- フィルター（WiFi・電源・豆販売・自家焙煎）
- 駅からの徒歩分数表示
- 自家焙煎の自動判定（店名から「焙煎」「ロースター」等を検出）

## データパイプライン

```
食べログ → scrape → raw_shops.json → convert → shops.json → GitHub Pages
```

- **スクレイピング**: 毎日 JST 04:30 に GitHub Actions で自動実行
- **変換**: 駅マッチング + 座標ベース最寄り駅フォールバック + 徒歩分数算出 + 自家焙煎判定
- **デプロイ**: `shops.json` またはソースコードの変更を検知して自動デプロイ

## 店舗データ

| 項目 | 説明 |
|------|------|
| name | 店名 |
| address | 住所 |
| stations | 最寄り駅と徒歩分数（複数対応） |
| hasWifi / hasPower | WiFi・電源の有無 |
| beansAvailable / selfRoasted | 豆販売・自家焙煎（店名から自動判定） |

## 開発

```bash
npm install
npm run dev
```

## スクリプト

| コマンド | 内容 |
|----------|------|
| `npm run scrape` | 食べログから店舗データを収集 |
| `npm run convert` | raw_shops.json → shops.json に変換 |
| `npm run build` | プロダクションビルド |
| `npm test` | テスト実行 |
| `npm run typecheck` | 型チェック |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

## 除外設定

`data/ignore.json` に店舗IDを追加すると、変換時にスキップされます。

## ライセンス

MIT
