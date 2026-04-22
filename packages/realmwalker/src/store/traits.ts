import { trait } from "koota";
import type { RealmState } from "../engine/types";

export const RealmTrait = trait<RealmState>(() => ({
  phase: "menu",
  hp: 100,
  maxHp: 100,
  atk: 10,
  zone: 1,
  score: 0,
  loot: [],
}));
