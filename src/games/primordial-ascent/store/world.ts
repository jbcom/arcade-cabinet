import { PhaseTrait, ScoreTrait, TimerTrait } from "@logic/shared";
import { createWorld } from "koota";
import { PrimordialTrait } from "./traits";

export const primordialWorld = createWorld();
export const primordialEntity = primordialWorld.spawn(
  PhaseTrait({ phase: "menu" }),
  ScoreTrait({ value: 0, label: "ALTITUDE" }),
  TimerTrait({ elapsedMs: 0, remainingMs: 0, label: "TIME" }),
  PrimordialTrait()
);
