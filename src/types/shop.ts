import { z } from "zod";

export const STATION_NAMES = ["浅草", "蔵前", "本所吾妻橋", "浅草橋", "田原町", "両国"] as const;

export type StationName = (typeof STATION_NAMES)[number];

export const BREW_METHODS = [
  "ドリップ",
  "エスプレッソ",
  "ネル",
  "サイフォン",
  "ハンドドリップ",
] as const;

export type BrewMethod = (typeof BREW_METHODS)[number];

export const ATMOSPHERE_TAGS = [
  "川沿い",
  "テラス",
  "路地裏",
  "隠れ家",
  "モダン",
  "レトロ",
] as const;

export type AtmosphereTag = (typeof ATMOSPHERE_TAGS)[number];

export const StationWalkSchema = z.object({
  station: z.enum(STATION_NAMES),
  exitElevatorWalkMin: z.number().int().min(0),
});

export const ShopSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  address: z.string().min(1),
  stations: z.array(StationWalkSchema).min(1),
  brewMethods: z.array(z.enum(BREW_METHODS)),
  beansAvailable: z.boolean(),
  selfRoasted: z.boolean(),
  atmosphere: z.array(z.enum(ATMOSPHERE_TAGS)),
  babyStrollerAccess: z.enum(["easy", "moderate", "difficult"]),
  hasPower: z.boolean(),
  hasWifi: z.boolean(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  sourceUrl: z.string().url(),
});

export const ShopsArraySchema = z.array(ShopSchema);

export interface StationWalk {
  station: StationName;
  exitElevatorWalkMin: number;
}

export interface Shop {
  id: string;
  name: string;
  address: string;
  stations: StationWalk[];
  brewMethods: BrewMethod[];
  beansAvailable: boolean;
  selfRoasted: boolean;
  atmosphere: AtmosphereTag[];
  babyStrollerAccess: "easy" | "moderate" | "difficult";
  hasPower: boolean;
  hasWifi: boolean;
  lat: number;
  lng: number;
  sourceUrl: string;
}

export interface FilterState {
  brewMethods: BrewMethod[];
  hasWifi: boolean;
  hasPower: boolean;
  babyStrollerFriendly: boolean;
  atmosphere: AtmosphereTag[];
  beansAvailable: boolean;
  selfRoasted: boolean;
}

export const DEFAULT_FILTERS: FilterState = {
  brewMethods: [],
  hasWifi: false,
  hasPower: false,
  babyStrollerFriendly: false,
  atmosphere: [],
  beansAvailable: false,
  selfRoasted: false,
};

export function validateShops(data: unknown): Shop[] {
  return ShopsArraySchema.parse(data);
}
