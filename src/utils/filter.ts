import type { Shop, FilterState } from "../types/shop";

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

    if (filters.babyStrollerFriendly && shop.babyStrollerAccess === "difficult") {
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
