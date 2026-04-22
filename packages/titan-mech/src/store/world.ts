import { PhaseTrait, ScoreTrait, TimerTrait } from "@arcade-cabinet/shared";
import { createWorld } from "koota";
import { TitanTrait } from "./traits";

export const titanWorld = createWorld();
export const titanEntity = titanWorld.spawn(
  PhaseTrait({ phase: "menu" }),
  ScoreTrait({ value: 0, label: "SCRAP" }),
  TimerTrait({ elapsedMs: 0, remainingMs: 0, label: "ENERGY" }),
  TitanTrait()
);
