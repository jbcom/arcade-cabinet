import { PhaseTrait, ScoreTrait, TimerTrait } from "@logic/shared";
import { createWorld } from "koota";
import { createInitialState } from "../engine/Simulation";
import { SimSovietTrait } from "./traits";

export const simSovietWorld = createWorld();
export const simSovietEntity = simSovietWorld.spawn(
  PhaseTrait({ phase: "menu" }),
  ScoreTrait({ value: 1000, label: "FUNDS" }),
  TimerTrait({ elapsedMs: 0, remainingMs: 0, label: "MONTH" }),
  SimSovietTrait(createInitialState())
);
