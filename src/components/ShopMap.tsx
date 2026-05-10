import type { Component } from "solid-js";
import { onMount, onCleanup, createEffect } from "solid-js";
import L from "leaflet";
import type { Shop, StationName } from "../types/shop";
import styles from "./ShopMap.module.css";

const CENTER: [number, number] = [35.7005, 139.792];
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

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    markers = L.layerGroup().addTo(map);
  });

  onCleanup(() => {
    if (map) map.remove();
  });

  createEffect(() => {
    if (!markers) return;
    markers.clearLayers();

    props.shops.forEach((shop) => {
      const marker = L.marker([shop.lat, shop.lng]).bindPopup(
        `<strong>${shop.name}</strong><br/>${shop.address}<br/><a href="${shop.sourceUrl}" target="_blank" rel="noopener noreferrer">食べログで見る</a>`
      );

      marker.on("click", () => {
        props.onShopSelect(shop.id);
      });

      markers.addLayer(marker);
    });

    if (props.shops.length > 0) {
      const bounds = L.latLngBounds(props.shops.map((s) => [s.lat, s.lng]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: DEFAULT_ZOOM });
    } else {
      map.setView(CENTER, DEFAULT_ZOOM);
    }
  });

  return <div ref={mapContainer} class={styles.mapContainer} />;
};
