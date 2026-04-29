# sumida-stream-coffee Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a coffee shop map SPA for the Asakusa/Kuramae/Honjo-Azumabashi/Asakusabashi area with Solid + Vite, deployable to GitHub Pages.

**Architecture:** Static SPA with Solid.js reactivity. Leaflet map + card list side-by-side. All data in a JSON file bundled at build time. Client-side filtering and station-based sorting.

**Tech Stack:** Solid.js, Vite, CSS Modules, Leaflet, Vitest, TypeScript

---

## File Structure

```
index.html                          # Vite entry HTML
vite.config.ts                      # Vite + Solid plugin config
data/
  shops.json                        # Shop data (5 sample entries)
src/
  index.tsx                         # Solid app mount point
  App.tsx                           # Root component with state
  App.module.css
  types/
    shop.ts                         # Shop, StationWalk, FilterState types
  utils/
    sort.ts                         # Station-based sort logic
    filter.ts                       # AND-condition filter logic
  components/
    StationSelector.tsx             # Station pill buttons
    StationSelector.module.css
    FilterBar.tsx                   # Toggle filters
    FilterBar.module.css
    ShopCard.tsx                    # Single shop card
    ShopCard.module.css
    ShopList.tsx                    # Scrollable card list
    ShopList.module.css
    ShopMap.tsx                     # Leaflet map with markers
    ShopMap.module.css
  __tests__/
    sort.test.ts                    # Sort utility tests
    filter.test.ts                  # Filter utility tests
.github/
  workflows/
    deploy.yml                      # GitHub Pages deploy
```

---

### Task 1: Project Restructure

**Files:**
- Delete: `src/index.ts`, `src/config/index.ts`, `src/index.test.ts`, `tsup.config.ts`, `.env.example`
- Rewrite: `package.json`, `tsconfig.json`, `vitest.config.ts`
- Create: `vite.config.ts`, `index.html`

- [ ] **Step 1: Remove old files**

```bash
rm src/index.ts src/config/index.ts src/index.test.ts tsup.config.ts .env.example
rmdir src/config
```

- [ ] **Step 2: Rewrite `package.json`**

```json
{
  "name": "sumida-stream-coffee",
  "version": "0.0.1",
  "description": "Coffee shop map for Asakusa, Kuramae, Honjo-Azumabashi and Asakusabashi",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src/**/*.{ts,tsx}",
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,css}\"",
    "prepare": "husky"
  },
  "dependencies": {
    "solid-js": "^1.9.7",
    "leaflet": "^1.9.4"
  },
  "devDependencies": {
    "@solidjs/testing-library": "^0.8.10",
    "@solidjs/vite-plugin-solid": "^2.11.6",
    "@types/leaflet": "^1.9.17",
    "eslint": "^9.20.0",
    "husky": "^9.1.7",
    "jsdom": "^26.1.0",
    "lint-staged": "^16.4.0",
    "prettier": "^3.8.1",
    "typescript": "^5.8.3",
    "typescript-eslint": "^8.59.1",
    "vite": "^6.3.5",
    "vitest": "^3.2.3"
  },
  "lint-staged": {
    "src/**/*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

- [ ] **Step 3: Install dependencies**

Run: `npm install`

- [ ] **Step 4: Rewrite `tsconfig.json`**

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "jsxImportSource": "solid-js",
    "resolveJsonModule": true,
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"]
}
```

- [ ] **Step 5: Create `vite.config.ts`**

```ts
import { defineConfig } from 'vite';
import solidPlugin from '@solidjs/vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  build: {
    target: 'esnext',
  },
});
```

- [ ] **Step 6: Rewrite `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import solidPlugin from '@solidjs/vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    environment: 'jsdom',
    globals: true,
  },
});
```

- [ ] **Step 7: Create `index.html`**

```html
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>sumida-stream-coffee</title>
    <link
      rel="stylesheet"
      href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
      crossorigin=""
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/index.tsx"></script>
  </body>
</html>
```

- [ ] **Step 8: Update `eslint.config.js`**

Replace the entire file:

```js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ['dist/', 'node_modules/'],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
  },
];
```

- [ ] **Step 9: Update `.gitignore`**

Append `dist/` if not already present:

```
dist/
```

- [ ] **Step 10: Verify dev server starts**

Run: `npm run dev`
Expected: Vite dev server starts on localhost, no errors.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "chore: restructure project for Solid + Vite static site"
```

---

### Task 2: Type Definitions and Sample Data

**Files:**
- Create: `src/types/shop.ts`
- Create: `data/shops.json`

- [ ] **Step 1: Create `src/types/shop.ts`**

```ts
export const STATION_NAMES = [
  '浅草',
  '蔵前',
  '本所吾妻橋',
  '浅草橋',
] as const;

export type StationName = (typeof STATION_NAMES)[number];

export const BREW_METHODS = [
  'ドリップ',
  'エスプレッソ',
  'ネル',
  'サイフォン',
  'ハンドドリップ',
] as const;

export type BrewMethod = (typeof BREW_METHODS)[number];

export const ATMOSPHERE_TAGS = [
  '川沿い',
  'テラス',
  '路地裏',
  '隠れ家',
  'モダン',
  'レトロ',
] as const;

export type AtmosphereTag = (typeof ATMOSPHERE_TAGS)[number];

export interface StationWalk {
  station: StationName;
  exitElevatorWalkMin: number;
}

export interface Shop {
  id: string;
  name: string;
  address: string;
  stations: StationWalk[];
  brewMethods: BrewMethod[];
  beansAvailable: boolean;
  selfRoasted: boolean;
  atmosphere: AtmosphereTag[];
  babyStrollerAccess: 'easy' | 'moderate' | 'difficult';
  hasPower: boolean;
  hasWifi: boolean;
  lat: number;
  lng: number;
}

export interface FilterState {
  brewMethods: BrewMethod[];
  hasWifi: boolean;
  hasPower: boolean;
  babyStrollerFriendly: boolean;
  atmosphere: AtmosphereTag[];
  beansAvailable: boolean;
  selfRoasted: boolean;
}

export const DEFAULT_FILTERS: FilterState = {
  brewMethods: [],
  hasWifi: false,
  hasPower: false,
  babyStrollerFriendly: false,
  atmosphere: [],
  beansAvailable: false,
  selfRoasted: false,
};
```

- [ ] **Step 2: Create `data/shops.json`**

```json
[
  {
    "id": "sumidagawa-roastery",
    "name": "墨田川ロースタリー",
    "address": "東京都台東区浅草橋5-20-8",
    "stations": [
      { "station": "浅草橋", "exitElevatorWalkMin": 5 },
      { "station": "蔵前", "exitElevatorWalkMin": 9 }
    ],
    "brewMethods": ["ハンドドリップ", "エスプレッソ"],
    "beansAvailable": true,
    "selfRoasted": true,
    "atmosphere": ["川沿い", "モダン"],
    "babyStrollerAccess": "easy",
    "hasPower": true,
    "hasWifi": true,
    "lat": 35.6954,
    "lng": 139.7925
  },
  {
    "id": "kuramae-coffee-stand",
    "name": "蔵前コーヒースタンド",
    "address": "東京都台東区蔵前3-8-5",
    "stations": [
      { "station": "蔵前", "exitElevatorWalkMin": 3 },
      { "station": "浅草橋", "exitElevatorWalkMin": 8 }
    ],
    "brewMethods": ["エスプレッソ", "ドリップ"],
    "beansAvailable": true,
    "selfRoasted": false,
    "atmosphere": ["路地裏", "モダン"],
    "babyStrollerAccess": "moderate",
    "hasPower": false,
    "hasWifi": false,
    "lat": 35.6931,
    "lng": 139.7885
  },
  {
    "id": "asakusa-blend",
    "name": "浅草ブレンド",
    "address": "東京都台東区浅草2-12-4",
    "stations": [
      { "station": "浅草", "exitElevatorWalkMin": 6 },
      { "station": "本所吾妻橋", "exitElevatorWalkMin": 10 }
    ],
    "brewMethods": ["ハンドドリップ", "ネル"],
    "beansAvailable": true,
    "selfRoasted": true,
    "atmosphere": ["隠れ家", "レトロ"],
    "babyStrollerAccess": "difficult",
    "hasPower": false,
    "hasWifi": false,
    "lat": 35.7118,
    "lng": 139.7966
  },
  {
    "id": "azumabashi-cafe",
    "name": "吾妻橋カフェ",
    "address": "東京都墨田区吾妻橋1-15-3",
    "stations": [
      { "station": "本所吾妻橋", "exitElevatorWalkMin": 4 },
      { "station": "浅草", "exitElevatorWalkMin": 7 }
    ],
    "brewMethods": ["ドリップ", "エスプレッソ"],
    "beansAvailable": false,
    "selfRoasted": false,
    "atmosphere": ["川沿い", "テラス"],
    "babyStrollerAccess": "easy",
    "hasPower": true,
    "hasWifi": true,
    "lat": 35.7082,
    "lng": 139.8035
  },
  {
    "id": "asakusabashi-drip",
    "name": "浅草橋ドリップ",
    "address": "東京都台東区浅草橋1-6-2",
    "stations": [
      { "station": "浅草橋", "exitElevatorWalkMin": 3 },
      { "station": "蔵前", "exitElevatorWalkMin": 11 }
    ],
    "brewMethods": ["ドリップ", "サイフォン"],
    "beansAvailable": true,
    "selfRoasted": false,
    "atmosphere": ["レトロ", "路地裏"],
    "babyStrollerAccess": "moderate",
    "hasPower": true,
    "hasWifi": false,
    "lat": 35.6942,
    "lng": 139.7846
  }
]
```

- [ ] **Step 3: Verify typecheck passes**

Run: `npm run typecheck`
Expected: No errors (no imports yet, but types are valid).

- [ ] **Step 4: Commit**

```bash
git add src/types/shop.ts data/shops.json
git commit -m "feat: add shop type definitions and sample data"
```

---

### Task 3: Sort Utility (TDD)

**Files:**
- Create: `src/utils/sort.ts`
- Create: `src/__tests__/sort.test.ts`

- [ ] **Step 1: Write the failing test `src/__tests__/sort.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { sortShops } from '../utils/sort';
import type { Shop, StationName } from '../types/shop';

const mockShops: Shop[] = [
  {
    id: 'a',
    name: 'Shop A',
    address: 'Address A',
    stations: [
      { station: '浅草', exitElevatorWalkMin: 10 },
      { station: '蔵前', exitElevatorWalkMin: 3 },
    ],
    brewMethods: ['ドリップ'],
    beansAvailable: false,
    selfRoasted: false,
    atmosphere: [],
    babyStrollerAccess: 'easy',
    hasPower: false,
    hasWifi: false,
    lat: 35.7,
    lng: 139.8,
  },
  {
    id: 'b',
    name: 'Shop B',
    address: 'Address B',
    stations: [
      { station: '浅草', exitElevatorWalkMin: 5 },
      { station: '本所吾妻橋', exitElevatorWalkMin: 12 },
    ],
    brewMethods: ['エスプレッソ'],
    beansAvailable: false,
    selfRoasted: false,
    atmosphere: [],
    babyStrollerAccess: 'easy',
    hasPower: false,
    hasWifi: false,
    lat: 35.71,
    lng: 139.81,
  },
  {
    id: 'c',
    name: 'Shop C',
    address: 'Address C',
    stations: [
      { station: '蔵前', exitElevatorWalkMin: 7 },
      { station: '浅草橋', exitElevatorWalkMin: 2 },
    ],
    brewMethods: ['ネル'],
    beansAvailable: false,
    selfRoasted: false,
    atmosphere: [],
    babyStrollerAccess: 'easy',
    hasPower: false,
    hasWifi: false,
    lat: 35.69,
    lng: 139.79,
  },
];

describe('sortShops', () => {
  it('sorts by specified station walk time ascending', () => {
    const result = sortShops(mockShops, '浅草');
    expect(result.map((s) => s.id)).toEqual(['b', 'a']);
  });

  it('filters out shops not near the selected station', () => {
    const result = sortShops(mockShops, '蔵前');
    expect(result.map((s) => s.id)).toEqual(['a', 'c']);
  });

  it('returns all shops sorted by nearest station when station is null', () => {
    const result = sortShops(mockShops, null);
    expect(result.map((s) => s.id)).toEqual(['c', 'b', 'a']);
  });

  it('returns empty array for empty input', () => {
    const result = sortShops([], '浅草');
    expect(result).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/__tests__/sort.test.ts`
Expected: FAIL — `sortShops` module not found.

- [ ] **Step 3: Implement `src/utils/sort.ts`**

```ts
import type { Shop, StationName } from '../types/shop';

export function sortShops(
  shops: Shop[],
  station: StationName | null,
): Shop[] {
  const sorted = [...shops].sort((a, b) => {
    const aMin = station
      ? a.stations.find((s) => s.station === station)
          ?.exitElevatorWalkMin ?? Infinity
      : Math.min(...a.stations.map((s) => s.exitElevatorWalkMin));
    const bMin = station
      ? b.stations.find((s) => s.station === station)
          ?.exitElevatorWalkMin ?? Infinity
      : Math.min(...b.stations.map((s) => s.exitElevatorWalkMin));
    return aMin - bMin;
  });

  if (station) {
    return sorted.filter((s) =>
      s.stations.some((sw) => sw.station === station),
    );
  }

  return sorted;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/__tests__/sort.test.ts`
Expected: All 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/sort.ts src/__tests__/sort.test.ts
git commit -m "feat: add station-based shop sort utility with tests"
```

---

### Task 4: Filter Utility (TDD)

**Files:**
- Create: `src/utils/filter.ts`
- Create: `src/__tests__/filter.test.ts`

- [ ] **Step 1: Write the failing test `src/__tests__/filter.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { filterShops } from '../utils/filter';
import type { Shop, FilterState } from '../types/shop';
import { DEFAULT_FILTERS } from '../types/shop';

const mockShops: Shop[] = [
  {
    id: 'wifi-power',
    name: 'WiFi & Power Shop',
    address: 'Addr',
    stations: [{ station: '浅草', exitElevatorWalkMin: 5 }],
    brewMethods: ['ドリップ', 'エスプレッソ'],
    beansAvailable: true,
    selfRoasted: true,
    atmosphere: ['川沿い', 'モダン'],
    babyStrollerAccess: 'easy',
    hasPower: true,
    hasWifi: true,
    lat: 35.7,
    lng: 139.8,
  },
  {
    id: 'basic',
    name: 'Basic Shop',
    address: 'Addr',
    stations: [{ station: '蔵前', exitElevatorWalkMin: 3 }],
    brewMethods: ['ドリップ'],
    beansAvailable: false,
    selfRoasted: false,
    atmosphere: ['路地裏'],
    babyStrollerAccess: 'difficult',
    hasPower: false,
    hasWifi: false,
    lat: 35.69,
    lng: 139.79,
  },
  {
    id: 'stroller-ok',
    name: 'Stroller OK Shop',
    address: 'Addr',
    stations: [{ station: '浅草橋', exitElevatorWalkMin: 7 }],
    brewMethods: ['ネル'],
    beansAvailable: false,
    selfRoasted: false,
    atmosphere: ['テラス'],
    babyStrollerAccess: 'moderate',
    hasPower: false,
    hasWifi: false,
    lat: 35.695,
    lng: 139.785,
  },
];

describe('filterShops', () => {
  it('returns all shops with default (empty) filters', () => {
    const result = filterShops(mockShops, DEFAULT_FILTERS);
    expect(result).toHaveLength(3);
  });

  it('filters by wifi', () => {
    const filters: FilterState = { ...DEFAULT_FILTERS, hasWifi: true };
    const result = filterShops(mockShops, filters);
    expect(result.map((s) => s.id)).toEqual(['wifi-power']);
  });

  it('filters by power', () => {
    const filters: FilterState = { ...DEFAULT_FILTERS, hasPower: true };
    const result = filterShops(mockShops, filters);
    expect(result.map((s) => s.id)).toEqual(['wifi-power']);
  });

  it('filters by babyStrollerFriendly (excludes difficult)', () => {
    const filters: FilterState = {
      ...DEFAULT_FILTERS,
      babyStrollerFriendly: true,
    };
    const result = filterShops(mockShops, filters);
    expect(result.map((s) => s.id)).toEqual(['wifi-power', 'stroller-ok']);
  });

  it('filters by brewMethods (OR match)', () => {
    const filters: FilterState = {
      ...DEFAULT_FILTERS,
      brewMethods: ['エスプレッソ', 'ネル'],
    };
    const result = filterShops(mockShops, filters);
    expect(result.map((s) => s.id)).toEqual(['wifi-power', 'stroller-ok']);
  });

  it('filters by atmosphere (OR match)', () => {
    const filters: FilterState = {
      ...DEFAULT_FILTERS,
      atmosphere: ['川沿い', 'テラス'],
    };
    const result = filterShops(mockShops, filters);
    expect(result.map((s) => s.id)).toEqual(['wifi-power', 'stroller-ok']);
  });

  it('filters by beansAvailable', () => {
    const filters: FilterState = { ...DEFAULT_FILTERS, beansAvailable: true };
    const result = filterShops(mockShops, filters);
    expect(result.map((s) => s.id)).toEqual(['wifi-power']);
  });

  it('filters by selfRoasted', () => {
    const filters: FilterState = { ...DEFAULT_FILTERS, selfRoasted: true };
    const result = filterShops(mockShops, filters);
    expect(result.map((s) => s.id)).toEqual(['wifi-power']);
  });

  it('applies multiple filters as AND conditions', () => {
    const filters: FilterState = {
      ...DEFAULT_FILTERS,
      hasWifi: true,
      babyStrollerFriendly: true,
    };
    const result = filterShops(mockShops, filters);
    expect(result.map((s) => s.id)).toEqual(['wifi-power']);
  });

  it('returns empty when no shop matches', () => {
    const filters: FilterState = {
      ...DEFAULT_FILTERS,
      hasWifi: true,
      brewMethods: ['サイフォン'],
    };
    const result = filterShops(mockShops, filters);
    expect(result).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/__tests__/filter.test.ts`
Expected: FAIL — `filterShops` module not found.

- [ ] **Step 3: Implement `src/utils/filter.ts`**

```ts
import type { Shop, FilterState } from '../types/shop';

export function filterShops(shops: Shop[], filters: FilterState): Shop[] {
  return shops.filter((shop) => {
    if (
      filters.brewMethods.length > 0 &&
      !filters.brewMethods.some((m) => shop.brewMethods.includes(m))
    ) {
      return false;
    }

    if (filters.hasWifi && !shop.hasWifi) return false;
    if (filters.hasPower && !shop.hasPower) return false;

    if (
      filters.babyStrollerFriendly &&
      shop.babyStrollerAccess === 'difficult'
    ) {
      return false;
    }

    if (
      filters.atmosphere.length > 0 &&
      !filters.atmosphere.some((a) => shop.atmosphere.includes(a))
    ) {
      return false;
    }

    if (filters.beansAvailable && !shop.beansAvailable) return false;
    if (filters.selfRoasted && !shop.selfRoasted) return false;

    return true;
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/__tests__/filter.test.ts`
Expected: All 10 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/filter.ts src/__tests__/filter.test.ts
git commit -m "feat: add shop filter utility with tests"
```

---

### Task 5: ShopCard Component

**Files:**
- Create: `src/components/ShopCard.tsx`
- Create: `src/components/ShopCard.module.css`

- [ ] **Step 1: Create `src/components/ShopCard.module.css`**

```css
.card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.2s;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.name {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 8px;
  color: #2d2016;
}

.address {
  font-size: 0.85rem;
  color: #6b5e50;
  margin: 0 0 8px;
}

.walkTimes {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0 0 10px;
}

.walkBadge {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 999px;
  background: #f0e8dc;
  color: #6b5e50;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin: 0 0 8px;
}

.tag {
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 4px;
  background: #e8ddd0;
  color: #4a3f35;
}

.facilities {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 0.8rem;
  color: #6b5e50;
}

.facilityItem {
  display: flex;
  align-items: center;
  gap: 2px;
}

.babyStrollerEasy {
  color: #4caf50;
}

.babyStrollerModerate {
  color: #ff9800;
}

.babyStrollerDifficult {
  color: #f44336;
}
```

- [ ] **Step 2: Create `src/components/ShopCard.tsx`**

```tsx
import type { Component } from 'solid-js';
import type { Shop } from '../types/shop';
import styles from './ShopCard.module.css';

const STROLLER_LABELS: Record<string, string> = {
  easy: 'ベビーカーOK',
  moderate: 'ベビーカーやや注意',
  difficult: 'ベビーカー困難',
};

interface ShopCardProps {
  shop: Shop;
  selectedStation: string | null;
}

export const ShopCard: Component<ShopCardProps> = (props) => {
  const walkTime = () => {
    if (props.selectedStation) {
      const match = props.shop.stations.find(
        (s) => s.station === props.selectedStation,
      );
      return match ? `${match.station} ${match.exitElevatorWalkMin}分` : null;
    }
    return props.shop.stations.map((s) => `${s.station} ${s.exitElevatorWalkMin}分`);
  };

  const strollerClass = () =>
    styles[`babyStroller${props.shop.babyStrollerAccess.charAt(0).toUpperCase()}${props.shop.babyStrollerAccess.slice(1)}`];

  return (
    <div class={styles.card}>
      <h3 class={styles.name}>{props.shop.name}</h3>
      <p class={styles.address}>{props.shop.address}</p>

      <div class={styles.walkTimes}>
        {(() => {
          const wt = walkTime();
          if (Array.isArray(wt)) {
            return wt.map((t) => (
              <span class={styles.walkBadge}>{t}</span>
            ));
          }
          if (wt) {
            return <span class={styles.walkBadge}>{wt}</span>;
          }
          return null;
        })()}
      </div>

      <div class={styles.tags}>
        {props.shop.brewMethods.map((m) => (
          <span class={styles.tag}>{m}</span>
        ))}
        {props.shop.atmosphere.map((a) => (
          <span class={styles.tag}>{a}</span>
        ))}
        {props.shop.beansAvailable && (
          <span class={styles.tag}>豆販売</span>
        )}
        {props.shop.selfRoasted && (
          <span class={styles.tag}>自家焙煎</span>
        )}
      </div>

      <div class={styles.facilities}>
        {props.shop.hasWifi && (
          <span class={styles.facilityItem}>Wi-Fi</span>
        )}
        {props.shop.hasPower && (
          <span class={styles.facilityItem}>電源</span>
        )}
        <span class={`${styles.facilityItem} ${strollerClass()}`}>
          {STROLLER_LABELS[props.shop.babyStrollerAccess]}
        </span>
      </div>
    </div>
  );
};
```

- [ ] **Step 3: Verify typecheck**

Run: `npm run typecheck`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/ShopCard.tsx src/components/ShopCard.module.css
git commit -m "feat: add ShopCard component"
```

---

### Task 6: StationSelector Component

**Files:**
- Create: `src/components/StationSelector.tsx`
- Create: `src/components/StationSelector.module.css`

- [ ] **Step 1: Create `src/components/StationSelector.module.css`**

```css
.container {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding: 12px 0;
}

.button {
  padding: 8px 16px;
  border: 2px solid #c8b9a4;
  border-radius: 999px;
  background: #fff;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  color: #4a3f35;
}

.button:hover {
  background: #f5efe8;
}

.buttonActive {
  background: #6b5e50;
  color: #fff;
  border-color: #6b5e50;
}

.buttonActive:hover {
  background: #5a4f44;
}
```

- [ ] **Step 2: Create `src/components/StationSelector.tsx`**

```tsx
import type { Component } from 'solid-js';
import { STATION_NAMES, type StationName } from '../types/shop';
import styles from './StationSelector.module.css';

interface StationSelectorProps {
  selected: StationName | null;
  onSelect: (station: StationName | null) => void;
}

export const StationSelector: Component<StationSelectorProps> = (props) => {
  return (
    <div class={styles.container}>
      <button
        class={`${styles.button} ${props.selected === null ? styles.buttonActive : ''}`}
        onClick={() => props.onSelect(null)}
      >
        すべて
      </button>
      {STATION_NAMES.map((station) => (
        <button
          class={`${styles.button} ${props.selected === station ? styles.buttonActive : ''}`}
          onClick={() => props.onSelect(station)}
        >
          {station}
        </button>
      ))}
    </div>
  );
};
```

- [ ] **Step 3: Verify typecheck**

Run: `npm run typecheck`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/StationSelector.tsx src/components/StationSelector.module.css
git commit -m "feat: add StationSelector component"
```

---

### Task 7: FilterBar Component

**Files:**
- Create: `src/components/FilterBar.tsx`
- Create: `src/components/FilterBar.module.css`

- [ ] **Step 1: Create `src/components/FilterBar.module.css`**

```css
.container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 0;
  border-top: 1px solid #e8ddd0;
  border-bottom: 1px solid #e8ddd0;
}

.group {
  display: flex;
  gap: 4px;
  align-items: center;
  margin-right: 12px;
}

.groupLabel {
  font-size: 0.75rem;
  color: #8b7e72;
  margin-right: 4px;
  white-space: nowrap;
}

.toggle {
  padding: 4px 10px;
  border: 1px solid #d4c8b8;
  border-radius: 6px;
  background: #fff;
  font-size: 0.78rem;
  cursor: pointer;
  transition: all 0.15s;
  color: #4a3f35;
}

.toggle:hover {
  background: #f5efe8;
}

.toggleActive {
  background: #6b5e50;
  color: #fff;
  border-color: #6b5e50;
}

.toggleActive:hover {
  background: #5a4f44;
}
```

- [ ] **Step 2: Create `src/components/FilterBar.tsx`**

```tsx
import type { Component } from 'solid-js';
import {
  BREW_METHODS,
  ATMOSPHERE_TAGS,
  type FilterState,
  type BrewMethod,
  type AtmosphereTag,
} from '../types/shop';
import styles from './FilterBar.module.css';

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

export const FilterBar: Component<FilterBarProps> = (props) => {
  const toggleBrewMethod = (method: BrewMethod) => {
    const current = props.filters.brewMethods;
    const next = current.includes(method)
      ? current.filter((m) => m !== method)
      : [...current, method];
    props.onChange({ ...props.filters, brewMethods: next });
  };

  const toggleAtmosphere = (tag: AtmosphereTag) => {
    const current = props.filters.atmosphere;
    const next = current.includes(tag)
      ? current.filter((a) => a !== tag)
      : [...current, tag];
    props.onChange({ ...props.filters, atmosphere: next });
  };

  const toggleBool = (
    key: 'hasWifi' | 'hasPower' | 'babyStrollerFriendly' | 'beansAvailable' | 'selfRoasted',
  ) => {
    props.onChange({ ...props.filters, [key]: !props.filters[key] });
  };

  return (
    <div class={styles.container}>
      <div class={styles.group}>
        <span class={styles.groupLabel}>抽出法</span>
        {BREW_METHODS.map((method) => (
          <button
            class={`${styles.toggle} ${props.filters.brewMethods.includes(method) ? styles.toggleActive : ''}`}
            onClick={() => toggleBrewMethod(method)}
          >
            {method}
          </button>
        ))}
      </div>

      <div class={styles.group}>
        <span class={styles.groupLabel}>設備</span>
        <button
          class={`${styles.toggle} ${props.filters.hasWifi ? styles.toggleActive : ''}`}
          onClick={() => toggleBool('hasWifi')}
        >
          Wi-Fi
        </button>
        <button
          class={`${styles.toggle} ${props.filters.hasPower ? styles.toggleActive : ''}`}
          onClick={() => toggleBool('hasPower')}
        >
          電源
        </button>
        <button
          class={`${styles.toggle} ${props.filters.babyStrollerFriendly ? styles.toggleActive : ''}`}
          onClick={() => toggleBool('babyStrollerFriendly')}
        >
          ベビーカーOK
        </button>
      </div>

      <div class={styles.group}>
        <span class={styles.groupLabel}>雰囲気</span>
        {ATMOSPHERE_TAGS.map((tag) => (
          <button
            class={`${styles.toggle} ${props.filters.atmosphere.includes(tag) ? styles.toggleActive : ''}`}
            onClick={() => toggleAtmosphere(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      <div class={styles.group}>
        <span class={styles.groupLabel}>豆</span>
        <button
          class={`${styles.toggle} ${props.filters.beansAvailable ? styles.toggleActive : ''}`}
          onClick={() => toggleBool('beansAvailable')}
        >
          豆販売
        </button>
        <button
          class={`${styles.toggle} ${props.filters.selfRoasted ? styles.toggleActive : ''}`}
          onClick={() => toggleBool('selfRoasted')}
        >
          自家焙煎
        </button>
      </div>
    </div>
  );
};
```

- [ ] **Step 3: Verify typecheck**

Run: `npm run typecheck`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/FilterBar.tsx src/components/FilterBar.module.css
git commit -m "feat: add FilterBar component"
```

---

### Task 8: ShopMap Component

**Files:**
- Create: `src/components/ShopMap.tsx`
- Create: `src/components/ShopMap.module.css`

- [ ] **Step 1: Create `src/components/ShopMap.module.css`**

```css
.mapContainer {
  width: 100%;
  height: 100%;
  min-height: 400px;
  border-radius: 12px;
  overflow: hidden;
}
```

- [ ] **Step 2: Create `src/components/ShopMap.tsx`**

```tsx
import type { Component } from 'solid-js';
import { onMount, createEffect } from 'solid-js';
import L from 'leaflet';
import type { Shop, StationName } from '../types/shop';
import styles from './ShopMap.module.css';

const CENTER: [number, number] = [35.7005, 139.7920];
const DEFAULT_ZOOM = 14;

interface ShopMapProps {
  shops: Shop[];
  selectedStation: StationName | null;
  onShopSelect: (id: string) => void;
}

export const ShopMap: Component<ShopMapProps> = (props) => {
  let mapContainer!: HTMLDivElement;
  let map: L.Map;
  let markers: L.LayerGroup;

  onMount(() => {
    map = L.map(mapContainer).setView(CENTER, DEFAULT_ZOOM);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    markers = L.layerGroup().addTo(map);
  });

  createEffect(() => {
    if (!markers) return;
    markers.clearLayers();

    props.shops.forEach((shop) => {
      const marker = L.marker([shop.lat, shop.lng]).bindPopup(
        `<strong>${shop.name}</strong><br/>${shop.address}`,
      );

      marker.on('click', () => {
        props.onShopSelect(shop.id);
      });

      markers.addLayer(marker);
    });

    if (props.shops.length > 0) {
      const bounds = L.latLngBounds(
        props.shops.map((s) => [s.lat, s.lng]),
      );
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: DEFAULT_ZOOM });
    } else {
      map.setView(CENTER, DEFAULT_ZOOM);
    }
  });

  return <div ref={mapContainer} class={styles.mapContainer} />;
};
```

- [ ] **Step 3: Verify typecheck**

Run: `npm run typecheck`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/ShopMap.tsx src/components/ShopMap.module.css
git commit -m "feat: add ShopMap component with Leaflet"
```

---

### Task 9: ShopList Component

**Files:**
- Create: `src/components/ShopList.tsx`
- Create: `src/components/ShopList.module.css`

- [ ] **Step 1: Create `src/components/ShopList.module.css`**

```css
.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  padding: 12px;
  height: 100%;
}

.empty {
  text-align: center;
  padding: 40px 16px;
  color: #8b7e72;
  font-size: 0.95rem;
}
```

- [ ] **Step 2: Create `src/components/ShopList.tsx`**

```tsx
import type { Component } from 'solid-js';
import { For } from 'solid-js';
import type { Shop, StationName } from '../types/shop';
import { ShopCard } from './ShopCard';
import styles from './ShopList.module.css';

interface ShopListProps {
  shops: Shop[];
  selectedStation: StationName | null;
}

export const ShopList: Component<ShopListProps> = (props) => {
  return (
    <div class={styles.list}>
      <For
        each={props.shops}
        fallback={<p class={styles.empty}>条件に一致する店舗がありません</p>}
      >
        {(shop) => <ShopCard shop={shop} selectedStation={props.selectedStation} />}
      </For>
    </div>
  );
};
```

- [ ] **Step 3: Verify typecheck**

Run: `npm run typecheck`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/ShopList.tsx src/components/ShopList.module.css
git commit -m "feat: add ShopList component"
```

---

### Task 10: App Root, Entry Point, and Global Styles

**Files:**
- Create: `src/App.tsx`
- Create: `src/App.module.css`
- Create: `src/index.tsx`
- Create: `src/global.css`

- [ ] **Step 1: Create `src/global.css`**

```css
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: 'Hiragino Sans', 'Noto Sans JP', sans-serif;
  background: #faf6f0;
  color: #2d2016;
}

#root {
  min-height: 100vh;
}
```

- [ ] **Step 2: Create `src/App.module.css`**

```css
.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
}

.header {
  padding: 16px 0 0;
}

.headerTitle {
  font-size: 1.6rem;
  font-weight: 800;
  color: #4a3f35;
  margin: 0;
}

.headerSubtitle {
  font-size: 0.85rem;
  color: #8b7e72;
  margin: 4px 0 0;
}

.main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  height: calc(100vh - 240px);
  min-height: 400px;
}

@media (max-width: 768px) {
  .main {
    grid-template-columns: 1fr;
    height: auto;
  }
}
```

- [ ] **Step 3: Create `src/App.tsx`**

```tsx
import type { Component } from 'solid-js';
import { createSignal, createMemo } from 'solid-js';
import type { StationName, FilterState } from './types/shop';
import { DEFAULT_FILTERS } from './types/shop';
import { sortShops } from './utils/sort';
import { filterShops } from './utils/filter';
import { StationSelector } from './components/StationSelector';
import { FilterBar } from './components/FilterBar';
import { ShopMap } from './components/ShopMap';
import { ShopList } from './components/ShopList';
import shopsData from '../../data/shops.json';
import type { Shop } from './types/shop';
import styles from './App.module.css';

const shops: Shop[] = shopsData as Shop[];

export const App: Component = () => {
  const [selectedStation, setSelectedStation] =
    createSignal<StationName | null>(null);
  const [filters, setFilters] = createSignal<FilterState>(DEFAULT_FILTERS);

  const filteredShops = createMemo(() => {
    const filtered = filterShops(shops, filters());
    return sortShops(filtered, selectedStation());
  });

  return (
    <div class={styles.app}>
      <header class={styles.header}>
        <h1 class={styles.headerTitle}>sumida-stream-coffee</h1>
        <p class={styles.headerSubtitle}>
          浅草・蔵前・本所吾妻橋・浅草橋エリアのコーヒーショップマップ
        </p>
      </header>

      <StationSelector
        selected={selectedStation()}
        onSelect={setSelectedStation}
      />
      <FilterBar filters={filters()} onChange={setFilters} />

      <div class={styles.main}>
        <ShopMap
          shops={filteredShops()}
          selectedStation={selectedStation()}
          onShopSelect={() => {}}
        />
        <ShopList
          shops={filteredShops()}
          selectedStation={selectedStation()}
        />
      </div>
    </div>
  );
};
```

- [ ] **Step 4: Create `src/index.tsx`**

```tsx
import { render } from 'solid-js/web';
import './global.css';
import { App } from './App';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

render(() => <App />, root);
```

- [ ] **Step 5: Verify dev server renders**

Run: `npm run dev`
Expected: Browser loads at localhost, shows header, station buttons, and map/cards with sample data.

- [ ] **Step 6: Verify build succeeds**

Run: `npm run build`
Expected: Build completes, `dist/` folder created with no errors.

- [ ] **Step 7: Verify all tests pass**

Run: `npm test`
Expected: All filter and sort tests pass.

- [ ] **Step 8: Commit**

```bash
git add src/App.tsx src/App.module.css src/index.tsx src/global.css
git commit -m "feat: add App root, entry point, and global styles"
```

---

### Task 11: GitHub Actions Deploy Workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

- [ ] **Step 2: Add `base` to `vite.config.ts`**

Update `vite.config.ts` to include the repo name as base path for GitHub Pages:

```ts
import { defineConfig } from 'vite';
import solidPlugin from '@solidjs/vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  base: '/sumida-stream-coffee/',
  build: {
    target: 'esnext',
  },
});
```

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy.yml vite.config.ts
git commit -m "feat: add GitHub Pages deploy workflow"
```

---

### Task 12: Final Verification

- [ ] **Step 1: Run all tests**

Run: `npm test`
Expected: All tests pass.

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: No errors.

- [ ] **Step 3: Run lint**

Run: `npm run lint`
Expected: No errors.

- [ ] **Step 4: Run build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 5: Preview build output**

Run: `npm run preview`
Expected: Site loads correctly with all features working.
