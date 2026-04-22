import { trait } from "koota";

export const RealmTrait = trait(() => ({
  phase: "menu",
  hp: 100,
  maxHp: 100,
  atk: 10,
  zone: 1,
  score: 0,
  loot: [],
}));
