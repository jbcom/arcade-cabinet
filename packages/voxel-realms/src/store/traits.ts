import { trait } from "koota";
import type { VoxelState } from "../engine/types";

export const VoxelTrait = trait<VoxelState>(() => ({
  phase: "menu",
  score: 0,
  hp: 20,
  maxHp: 20,
  inventory: [],
}));
