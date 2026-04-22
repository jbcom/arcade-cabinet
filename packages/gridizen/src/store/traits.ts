import { trait } from "koota";
import { createInitialState, initMap } from "../engine/logic";
import type { GridizenState } from "../engine/types";

export const GridizenTrait = trait(() => initMap(createInitialState()) as GridizenState);
