export const STATION_NAMES = ["浅草", "蔵前", "本所吾妻橋", "浅草橋"] as const;

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
