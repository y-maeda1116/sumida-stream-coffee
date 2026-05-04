import { describe, it, expect } from "vitest";
import { sortShops } from "../utils/sort";
import type { Shop } from "../types/shop";

const mockShops: Shop[] = [
  {
    id: "a",
    name: "Shop A",
    address: "Address A",
    stations: [
      { station: "浅草", exitElevatorWalkMin: 10 },
      { station: "蔵前", exitElevatorWalkMin: 3 },
    ],
    brewMethods: ["ドリップ"],
    beansAvailable: false,
    selfRoasted: false,
    atmosphere: [],
    babyStrollerAccess: "easy",
    hasPower: false,
    hasWifi: false,
    lat: 35.7,
    lng: 139.8,
    sourceUrl: "https://tabelog.com/example/a/",
  },
  {
    id: "b",
    name: "Shop B",
    address: "Address B",
    stations: [
      { station: "浅草", exitElevatorWalkMin: 5 },
      { station: "本所吾妻橋", exitElevatorWalkMin: 12 },
    ],
    brewMethods: ["エスプレッソ"],
    beansAvailable: false,
    selfRoasted: false,
    atmosphere: [],
    babyStrollerAccess: "easy",
    hasPower: false,
    hasWifi: false,
    lat: 35.71,
    lng: 139.81,
    sourceUrl: "https://tabelog.com/example/b/",
  },
  {
    id: "c",
    name: "Shop C",
    address: "Address C",
    stations: [
      { station: "蔵前", exitElevatorWalkMin: 7 },
      { station: "浅草橋", exitElevatorWalkMin: 2 },
    ],
    brewMethods: ["ネル"],
    beansAvailable: false,
    selfRoasted: false,
    atmosphere: [],
    babyStrollerAccess: "easy",
    hasPower: false,
    hasWifi: false,
    lat: 35.69,
    lng: 139.79,
    sourceUrl: "https://tabelog.com/example/c/",
  },
];

describe("sortShops", () => {
  it("sorts by specified station walk time ascending", () => {
    const result = sortShops(mockShops, "浅草");
    expect(result.map((s) => s.id)).toEqual(["b", "a"]);
  });

  it("filters out shops not near the selected station", () => {
    const result = sortShops(mockShops, "蔵前");
    expect(result.map((s) => s.id)).toEqual(["a", "c"]);
  });

  it("returns all shops sorted by nearest station when station is null", () => {
    const result = sortShops(mockShops, null);
    expect(result.map((s) => s.id)).toEqual(["c", "a", "b"]);
  });

  it("returns empty array for empty input", () => {
    const result = sortShops([], "浅草");
    expect(result).toEqual([]);
  });
});
