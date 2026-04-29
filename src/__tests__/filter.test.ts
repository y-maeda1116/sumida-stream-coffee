import { describe, it, expect } from "vitest";
import { filterShops } from "../utils/filter";
import type { Shop, FilterState } from "../types/shop";
import { DEFAULT_FILTERS } from "../types/shop";

const mockShops: Shop[] = [
  {
    id: "wifi-power",
    name: "WiFi & Power Shop",
    address: "Addr",
    stations: [{ station: "浅草", exitElevatorWalkMin: 5 }],
    brewMethods: ["ドリップ", "エスプレッソ"],
    beansAvailable: true,
    selfRoasted: true,
    atmosphere: ["川沿い", "モダン"],
    babyStrollerAccess: "easy",
    hasPower: true,
    hasWifi: true,
    lat: 35.7,
    lng: 139.8,
  },
  {
    id: "basic",
    name: "Basic Shop",
    address: "Addr",
    stations: [{ station: "蔵前", exitElevatorWalkMin: 3 }],
    brewMethods: ["ドリップ"],
    beansAvailable: false,
    selfRoasted: false,
    atmosphere: ["路地裏"],
    babyStrollerAccess: "difficult",
    hasPower: false,
    hasWifi: false,
    lat: 35.69,
    lng: 139.79,
  },
  {
    id: "stroller-ok",
    name: "Stroller OK Shop",
    address: "Addr",
    stations: [{ station: "浅草橋", exitElevatorWalkMin: 7 }],
    brewMethods: ["ネル"],
    beansAvailable: false,
    selfRoasted: false,
    atmosphere: ["テラス"],
    babyStrollerAccess: "moderate",
    hasPower: false,
    hasWifi: false,
    lat: 35.695,
    lng: 139.785,
  },
];

describe("filterShops", () => {
  it("returns all shops with default (empty) filters", () => {
    const result = filterShops(mockShops, DEFAULT_FILTERS);
    expect(result).toHaveLength(3);
  });

  it("filters by wifi", () => {
    const filters: FilterState = { ...DEFAULT_FILTERS, hasWifi: true };
    const result = filterShops(mockShops, filters);
    expect(result.map((s) => s.id)).toEqual(["wifi-power"]);
  });

  it("filters by power", () => {
    const filters: FilterState = { ...DEFAULT_FILTERS, hasPower: true };
    const result = filterShops(mockShops, filters);
    expect(result.map((s) => s.id)).toEqual(["wifi-power"]);
  });

  it("filters by babyStrollerFriendly (excludes difficult)", () => {
    const filters: FilterState = {
      ...DEFAULT_FILTERS,
      babyStrollerFriendly: true,
    };
    const result = filterShops(mockShops, filters);
    expect(result.map((s) => s.id)).toEqual(["wifi-power", "stroller-ok"]);
  });

  it("filters by brewMethods (OR match)", () => {
    const filters: FilterState = {
      ...DEFAULT_FILTERS,
      brewMethods: ["エスプレッソ", "ネル"],
    };
    const result = filterShops(mockShops, filters);
    expect(result.map((s) => s.id)).toEqual(["wifi-power", "stroller-ok"]);
  });

  it("filters by atmosphere (OR match)", () => {
    const filters: FilterState = {
      ...DEFAULT_FILTERS,
      atmosphere: ["川沿い", "テラス"],
    };
    const result = filterShops(mockShops, filters);
    expect(result.map((s) => s.id)).toEqual(["wifi-power", "stroller-ok"]);
  });

  it("filters by beansAvailable", () => {
    const filters: FilterState = { ...DEFAULT_FILTERS, beansAvailable: true };
    const result = filterShops(mockShops, filters);
    expect(result.map((s) => s.id)).toEqual(["wifi-power"]);
  });

  it("filters by selfRoasted", () => {
    const filters: FilterState = { ...DEFAULT_FILTERS, selfRoasted: true };
    const result = filterShops(mockShops, filters);
    expect(result.map((s) => s.id)).toEqual(["wifi-power"]);
  });

  it("applies multiple filters as AND conditions", () => {
    const filters: FilterState = {
      ...DEFAULT_FILTERS,
      hasWifi: true,
      babyStrollerFriendly: true,
    };
    const result = filterShops(mockShops, filters);
    expect(result.map((s) => s.id)).toEqual(["wifi-power"]);
  });

  it("returns empty when no shop matches", () => {
    const filters: FilterState = {
      ...DEFAULT_FILTERS,
      hasWifi: true,
      brewMethods: ["サイフォン"],
    };
    const result = filterShops(mockShops, filters);
    expect(result).toHaveLength(0);
  });
});
