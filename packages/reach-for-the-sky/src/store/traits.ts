import { trait } from "koota";
import { CONFIG, type SkyState } from "../engine/types";

export const SkyTrait = trait<SkyState>(() => ({
  funds: CONFIG.STARTING_FUNDS,
  tick: 500,
  day: 1,
  speed: 1,
  population: 0,
  stars: 1,
}));

export interface BuildingData {
  id: string;
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
  dirt: number;
}

export const TowerTrait = trait<{ buildings: BuildingData[] }>(() => ({
  buildings: [],
}));
