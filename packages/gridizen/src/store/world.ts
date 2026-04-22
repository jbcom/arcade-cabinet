import { PhaseTrait } from "@arcade-cabinet/shared";
import { createWorld } from "koota";
import { GridizenTrait } from "./traits";

export const gridWorld = createWorld();
export const gridEntity = gridWorld.spawn(PhaseTrait({ phase: "menu" }), GridizenTrait());
