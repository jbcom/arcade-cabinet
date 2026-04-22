import { trait } from "koota";

export const VoxelTrait = trait(() => ({
  phase: "menu",
  score: 0,
  hp: 20,
  maxHp: 20,
  inventory: [],
}));
