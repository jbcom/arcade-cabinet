import { trait } from "koota";
import { createInitialState, type SimSovietState } from "../engine/Simulation";

export const SimSovietTrait = trait<SimSovietState>(() => createInitialState());
