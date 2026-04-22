import type { SessionMode } from "@logic/shared";

export type FarmPhase = "menu" | "playing" | "banked" | "collapsed";
export type FarmAnimal = "chick" | "goat" | "pig" | "cow" | "horse";

export interface FarmModeTuning {
  lives: number;
  wobbleLimit: number;
  wobblePerDrop: number;
  recoveryPerBank: number;
}

export interface FarmStackAnimal {
  id: string;
  tier: number;
  animal: FarmAnimal;
  lane: -1 | 0 | 1;
}

export interface FarmState {
  phase: FarmPhase;
  sessionMode: SessionMode;
  elapsedMs: number;
  score: number;
  bankedScore: number;
  lives: number;
  stack: FarmStackAnimal[];
  nextAnimal: FarmAnimal;
  nextTier: number;
  wobble: number;
  combo: number;
  dropCount: number;
  lastEvent: string;
  objective: string;
}
