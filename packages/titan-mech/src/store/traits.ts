import { trait } from "koota";
import type { TitanState } from "../engine/types";

export const TitanTrait = trait<TitanState>(() => ({
  phase: "menu",
  hp: 200,
  maxHp: 200,
  energy: 100,
  maxEnergy: 100,
  scrap: 0,
  score: 0,
}));
