import type { Component } from "solid-js";
import type { Shop } from "../types/shop";
import styles from "./ShopCard.module.css";

const STROLLER_LABELS: Record<string, string> = {
  easy: "ベビーカーOK",
  moderate: "ベビーカーやや注意",
  difficult: "ベビーカー困難",
};

interface ShopCardProps {
  shop: Shop;
  selectedStation: string | null;
}

export const ShopCard: Component<ShopCardProps> = (props) => {
  const walkTime = () => {
    if (props.selectedStation) {
      const match = props.shop.stations.find((s) => s.station === props.selectedStation);
      return match ? `${match.station} ${match.exitElevatorWalkMin}分` : null;
    }
    return props.shop.stations.map((s) => `${s.station} ${s.exitElevatorWalkMin}分`);
  };

  const strollerClass = () =>
    styles[
      `babyStroller${props.shop.babyStrollerAccess.charAt(0).toUpperCase()}${props.shop.babyStrollerAccess.slice(1)}`
    ];

  return (
    <div class={styles.card}>
      <h3 class={styles.name}>{props.shop.name}</h3>
      <p class={styles.address}>{props.shop.address}</p>

      <div class={styles.walkTimes}>
        {(() => {
          const wt = walkTime();
          if (Array.isArray(wt)) {
            return wt.map((t) => <span class={styles.walkBadge}>{t}</span>);
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
        {props.shop.beansAvailable && <span class={styles.tag}>豆販売</span>}
        {props.shop.selfRoasted && <span class={styles.tag}>自家焙煎</span>}
      </div>

      <div class={styles.facilities}>
        {props.shop.hasWifi && <span class={styles.facilityItem}>Wi-Fi</span>}
        {props.shop.hasPower && <span class={styles.facilityItem}>電源</span>}
        <span class={`${styles.facilityItem} ${strollerClass()}`}>
          {STROLLER_LABELS[props.shop.babyStrollerAccess]}
        </span>
      </div>
    </div>
  );
};
