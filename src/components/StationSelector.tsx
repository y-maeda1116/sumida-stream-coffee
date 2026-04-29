import type { Component } from "solid-js";
import { STATION_NAMES, type StationName } from "../types/shop";
import styles from "./StationSelector.module.css";

interface StationSelectorProps {
  selected: StationName | null;
  onSelect: (station: StationName | null) => void;
}

export const StationSelector: Component<StationSelectorProps> = (props) => {
  return (
    <div class={styles.container}>
      <button
        class={`${styles.button} ${props.selected === null ? styles.buttonActive : ""}`}
        onClick={() => props.onSelect(null)}
      >
        すべて
      </button>
      {STATION_NAMES.map((station) => (
        <button
          class={`${styles.button} ${props.selected === station ? styles.buttonActive : ""}`}
          onClick={() => props.onSelect(station)}
        >
          {station}
        </button>
      ))}
    </div>
  );
};
