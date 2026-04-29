# sumida-stream-coffee Design

## Overview

浅草・蔵前・本所吾妻橋・浅草橋エリアのコーヒーショップマップ。Solid + Vite の SPA として構築し、GitHub Pages で公開する。地図（Leaflet）とカード一覧を並列表示し、駅選択によるソートとメタデータによるフィルタリングを提供する。

## Data Schema

`data/shops.json` に店舗データを格納。1店舗は複数駅からのアクセス情報を持つ。

```ts
interface StationWalk {
  station: "浅草" | "蔵前" | "本所吾妻橋" | "浅草橋";
  exitElevatorWalkMin: number;
}

interface Shop {
  id: string;
  name: string;
  address: string;
  stations: StationWalk[];
  brewMethods: ("ドリップ" | "エスプレッソ" | "ネル" | "サイフォン" | "ハンドドリップ")[];
  beansAvailable: boolean;
  selfRoasted: boolean;
  atmosphere: ("川沿い" | "テラス" | "路地裏" | "隠れ家" | "モダン" | "レトロ")[];
  babyStrollerAccess: "easy" | "moderate" | "difficult";
  hasPower: boolean;
  hasWifi: boolean;
  lat: number;
  lng: number;
}
```

- `exitElevatorWalkMin`: エレベーター出口基準の徒歩分数（ベビーカー利用者配慮）
- `babyStrollerAccess`: easy（段差なし・通路広い）/ moderate（少し段差）/ difficult（階段のみ等）
- `lat` / `lng`: Leaflet 地図表示用

## Tech Stack

- **Framework**: Solid.js + Vite
- **Styling**: CSS Modules
- **Map**: Leaflet
- **Testing**: Vitest（既存維持）
- **Deploy**: GitHub Actions → GitHub Pages

## Component Architecture

```
src/
├── App.tsx                     # ルート：状態管理・データ読み込み
├── components/
│   ├── ShopCard.tsx            # 店舗カード1件分
│   ├── ShopCard.module.css
│   ├── ShopList.tsx            # カード一覧コンテナ
│   ├── ShopList.module.css
│   ├── FilterBar.tsx           # フィルターUI
│   ├── FilterBar.module.css
│   ├── StationSelector.tsx     # 駅選択（ソート基準）
│   ├── StationSelector.module.css
│   ├── ShopMap.tsx             # Leaflet地図
│   └── ShopMap.module.css
├── types/
│   └── shop.ts                 # 型定義
├── utils/
│   ├── filter.ts               # フィルタリングロジック
│   └── sort.ts                 # 駅別ソートロジック
├── data/
│   └── shops.json              # 店舗データ
└── index.tsx                   # エントリーポイント
```

## UI Layout

```
┌─────────────────────────────────────────┐
│ Header: "sumida-stream-coffee"          │
├─────────────────────────────────────────┤
│ StationSelector: [浅草][蔵前][本所吾妻橋][浅草橋][すべて] │
├─────────────────────────────────────────┤
│ FilterBar: 抽出法 | 設備(Wi-Fi/電源) | ベビーカー | 雰囲気 │
├──────────────────────┬──────────────────┤
│    ShopMap            │   ShopList       │
│    (Leaflet地図)      │   (カード一覧)    │
└──────────────────────┴──────────────────┘
```

## Filtering and Sorting Logic

### Sort（駅選択）

- 選択駅が `stations` 配列に含まれる店舗を抽出
- `exitElevatorWalkMin` 昇順でソート
- 「すべて」選択時は各店舗の最寄り駅を基準にソート

### Filter（AND条件）

各フィルター項目はトグル。複数ON時は全条件を満たす店舗のみ表示。

- `brewMethods`: 選択した抽出法を含む（OR）
- `hasWifi` / `hasPower`: true のみ
- `babyStrollerAccess`: easy または moderate のみ
- `atmosphere`: 選択した雰囲気を含む（OR）
- `beansAvailable` / `selfRoasted`: true のみ

### 適用順序

フィルタ → ソート → 表示

## Deployment

### Project Restructure

- Node.js ツール用テンプレートから Solid + Vite 静的サイトに置き換え
- `tsup` → Vite ビルドに変更
- `dotenv` 依存を削除

### GitHub Actions（`.github/workflows/deploy.yml`）

- トリガー: `main` ブランチへの push
- 手順: `npm ci` → `npm run build` → `dist/` を GitHub Pages にデプロイ
- `actions/deploy-pages` + `actions/configure-pages` 使用

### Dependencies

- solid-js, vite, @solidjs/vite-plugin-solid
- leaflet, @types/leaflet
- vitest, eslint, prettier は既存維持

## Sample Data

5件程度のサンプルデータを `data/shops.json` に含める。実在する店舗をベースにした架空データとする。
