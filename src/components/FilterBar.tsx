import type { Component } from "solid-js";
import {
  BREW_METHODS,
  ATMOSPHERE_TAGS,
  type FilterState,
  type BrewMethod,
  type AtmosphereTag,
} from "../types/shop";
import styles from "./FilterBar.module.css";

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
    const next = current.includes(tag) ? current.filter((a) => a !== tag) : [...current, tag];
    props.onChange({ ...props.filters, atmosphere: next });
  };

  const toggleBool = (
    key: "hasWifi" | "hasPower" | "babyStrollerFriendly" | "beansAvailable" | "selfRoasted"
  ) => {
    props.onChange({ ...props.filters, [key]: !props.filters[key] });
  };

  return (
    <div class={styles.container}>
      <div class={styles.group}>
        <span class={styles.groupLabel}>抽出法</span>
        {BREW_METHODS.map((method) => (
          <button
            class={`${styles.toggle} ${props.filters.brewMethods.includes(method) ? styles.toggleActive : ""}`}
            onClick={() => toggleBrewMethod(method)}
          >
            {method}
          </button>
        ))}
      </div>

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
        <span class={styles.groupLabel}>雰囲気</span>
        {ATMOSPHERE_TAGS.map((tag) => (
          <button
            class={`${styles.toggle} ${props.filters.atmosphere.includes(tag) ? styles.toggleActive : ""}`}
            onClick={() => toggleAtmosphere(tag)}
          >
            {tag}
          </button>
        ))}
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
    </div>
  );
};
