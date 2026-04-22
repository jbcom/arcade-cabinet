import { PhaseTrait, ScoreTrait, TimerTrait } from "@arcade-cabinet/shared";
import { createWorld } from "koota";
import { createInitialState } from "../engine/simulation";
import { OtterlyTrait } from "./traits";

export const otterlyWorld = createWorld();
export const otterlyEntity = otterlyWorld.spawn(
  PhaseTrait({ phase: "menu" }),
  ScoreTrait({ value: 100, label: "SALAD" }),
  TimerTrait({ elapsedMs: 0, remainingMs: 0, label: "TIMER" }),
  OtterlyTrait(createInitialState() as never)
);
