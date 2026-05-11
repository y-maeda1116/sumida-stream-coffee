import type { Component } from "solid-js";
import { DEFAULT_FILTERS, type FilterState } from "../types/shop";
import styles from "./FilterBar.module.css";

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

export const FilterBar: Component<FilterBarProps> = (props) => {
  const toggleBool = (
    key: "hasWifi" | "hasPower" | "babyStrollerFriendly" | "beansAvailable" | "selfRoasted"
  ) => {
    props.onChange({ ...props.filters, [key]: !props.filters[key] });
  };

  const hasActiveFilters = () => {
    const f = props.filters;
    return (
      f.brewMethods.length > 0 ||
      f.hasWifi ||
      f.hasPower ||
      f.babyStrollerFriendly ||
      f.atmosphere.length > 0 ||
      f.beansAvailable ||
      f.selfRoasted
    );
  };

  return (
    <div class={styles.container}>
      <div class={styles.group}>
        <span class={styles.groupLabel}>設備</span>
        <button
          class={`${styles.toggle} ${props.filters.hasWifi ? styles.toggleActive : ""}`}
          onClick={() => toggleBool("hasWifi")}
        >
          Wi-Fi
        </button>
        <button
          class={`${styles.toggle} ${props.filters.hasPower ? styles.toggleActive : ""}`}
          onClick={() => toggleBool("hasPower")}
        >
          電源
        </button>
        <button
          class={`${styles.toggle} ${props.filters.babyStrollerFriendly ? styles.toggleActive : ""}`}
          onClick={() => toggleBool("babyStrollerFriendly")}
        >
          ベビーカーOK
        </button>
      </div>

      <div class={styles.group}>
        <span class={styles.groupLabel}>豆</span>
        <button
          class={`${styles.toggle} ${props.filters.beansAvailable ? styles.toggleActive : ""}`}
          onClick={() => toggleBool("beansAvailable")}
        >
          豆販売
        </button>
        <button
          class={`${styles.toggle} ${props.filters.selfRoasted ? styles.toggleActive : ""}`}
          onClick={() => toggleBool("selfRoasted")}
        >
          自家焙煎
        </button>
      </div>

      {hasActiveFilters() && (
        <button class={styles.clearButton} onClick={() => props.onChange(DEFAULT_FILTERS)}>
          クリア
        </button>
      )}
    </div>
  );
};
