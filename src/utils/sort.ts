import type { Shop, StationName } from "../types/shop";

export function sortShops(shops: Shop[], station: StationName | null): Shop[] {
  const sorted = [...shops].sort((a, b) => {
    const aMin = station
      ? (a.stations.find((s) => s.station === station)?.exitElevatorWalkMin ?? Infinity)
      : Math.min(...a.stations.map((s) => s.exitElevatorWalkMin));
    const bMin = station
      ? (b.stations.find((s) => s.station === station)?.exitElevatorWalkMin ?? Infinity)
      : Math.min(...b.stations.map((s) => s.exitElevatorWalkMin));
    return aMin - bMin;
  });

  if (station) {
    return sorted.filter((s) => s.stations.some((sw) => sw.station === station));
  }

  return sorted;
}
