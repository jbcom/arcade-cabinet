import { PhaseTrait, ScoreTrait, TimerTrait } from "@logic/shared";
import { createWorld } from "koota";
import { MovementTrait, RealmTrait } from "./traits";

export const realmWorld = createWorld();
export const realmEntity = realmWorld.spawn(
  PhaseTrait({ phase: "menu" }),
  ScoreTrait({ value: 0, label: "LOOT" }),
  TimerTrait({ elapsedMs: 0, remainingMs: 0, label: "ZONE" }),
  RealmTrait(),
  MovementTrait()
);
