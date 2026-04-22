import { trait } from "koota";
import type { SNWState } from "../engine/types";

export const SNWTrait = trait<SNWState>(() => ({
  phase: "menu",
  score: 0,
  level: 1,
  xp: 0,
  xpNeeded: 5,
  hp: 100,
  maxHp: 100,
  wave: 1,
  waveTime: 0,
  kills: 0,
}));
