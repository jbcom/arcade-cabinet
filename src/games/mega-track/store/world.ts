import { PhaseTrait, ScoreTrait, TimerTrait } from "@logic/shared";
import { createWorld } from "koota";
import { createInitialState } from "../engine/simulation";
import { MegaTrackTrait } from "./traits";

export const megaTrackWorld = createWorld();
export const megaTrackEntity = megaTrackWorld.spawn(
  PhaseTrait({ phase: "menu" }),
  ScoreTrait({ value: 0, label: "METERS" }),
  TimerTrait({ elapsedMs: 0, remainingMs: 0, label: "SPEED" }),
  MegaTrackTrait(createInitialState())
);
