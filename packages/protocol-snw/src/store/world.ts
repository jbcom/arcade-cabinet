import { PhaseTrait, ScoreTrait, TimerTrait } from "@arcade-cabinet/shared";
import { createWorld } from "koota";
import { SNWTrait } from "./traits";

export const snwWorld = createWorld();
export const snwEntity = snwWorld.spawn(
  PhaseTrait({ phase: "menu" }),
  ScoreTrait({ value: 0, label: "KILLS" }),
  TimerTrait({ elapsedMs: 0, remainingMs: 0, label: "WAVE" }),
  SNWTrait()
);
