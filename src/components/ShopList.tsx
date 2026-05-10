import type { Component } from "solid-js";
import { For } from "solid-js";
import type { Shop, StationName } from "../types/shop";
import { ShopCard } from "./ShopCard";
import styles from "./ShopList.module.css";

interface ShopListProps {
  shops: Shop[];
  selectedStation: StationName | null;
  selectedShopId: string | null;
}

export const ShopList: Component<ShopListProps> = (props) => {
  let listRef!: HTMLDivElement;

  return (
    <div ref={listRef} class={styles.list}>
      <For each={props.shops} fallback={<p class={styles.empty}>条件に一致する店舗がありません</p>}>
        {(shop) => (
          <ShopCard
            shop={shop}
            selectedStation={props.selectedStation}
            highlighted={shop.id === props.selectedShopId}
            onMount={(el: HTMLElement) => {
              if (shop.id === props.selectedShopId) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
              }
            }}
          />
        )}
      </For>
    </div>
  );
};
