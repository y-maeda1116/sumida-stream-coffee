import type { Component } from "solid-js";
import { createSignal, createMemo } from "solid-js";
import type { StationName, FilterState } from "./types/shop";
import { DEFAULT_FILTERS } from "./types/shop";
import { sortShops } from "./utils/sort";
import { filterShops } from "./utils/filter";
import { StationSelector } from "./components/StationSelector";
import { FilterBar } from "./components/FilterBar";
import { ShopMap } from "./components/ShopMap";
import { ShopList } from "./components/ShopList";
import shopsData from "../data/shops.json";
import { validateShops } from "./types/shop";
import styles from "./App.module.css";

const shops = validateShops(shopsData);

export const App: Component = () => {
  const [selectedStation, setSelectedStation] = createSignal<StationName | null>(null);
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
          浅草・蔵前・本所吾妻橋・浅草橋・両国エリアのコーヒーショップマップ
        </p>
      </header>

      <StationSelector selected={selectedStation()} onSelect={setSelectedStation} />
      <FilterBar filters={filters()} onChange={setFilters} />

      <p class={styles.shopCount}>{filteredShops().length}件</p>

      <div class={styles.main}>
        <ShopMap
          shops={filteredShops()}
          selectedStation={selectedStation()}
          onShopSelect={() => {}}
        />
        <ShopList shops={filteredShops()} selectedStation={selectedStation()} />
      </div>
    </div>
  );
};
