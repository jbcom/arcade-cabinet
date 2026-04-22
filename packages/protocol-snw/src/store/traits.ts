import { trait } from "koota";

export const SNWTrait = trait(() => ({
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
