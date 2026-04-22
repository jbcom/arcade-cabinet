import type { SessionMode } from "@logic/shared";

export type FarmPhase = "menu" | "playing" | "banked" | "collapsed";
export type FarmAnimal = "chick" | "goat" | "pig" | "cow" | "horse";
export type FarmAbility = "chirp" | "headbutt" | "mud-cushion" | "milk-brace" | "gallop-brace";
export type FarmWobbleBand = "steady" | "sway" | "danger";

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

export interface FarmAbilityEvent {
  ability: FarmAbility;
  animal: FarmAnimal;
  dropCount: number;
  message: string;
  scoreBonus: number;
  wobbleRecovery: number;
}

export interface FarmState {
  phase: FarmPhase;
  sessionMode: SessionMode;
  elapsedMs: number;
  score: number;
  bankedScore: number;
  lives: number;
  lastAbility: FarmAbilityEvent | null;
  stack: FarmStackAnimal[];
  nextAnimal: FarmAnimal;
  nextTier: number;
  wobble: number;
  combo: number;
  dropCount: number;
  lastEvent: string;
  objective: string;
}
