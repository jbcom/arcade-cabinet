import { trait } from "koota";
import { createInitialPrimordialState } from "../engine/primordialSimulation";

export const PrimordialTrait = trait(() => createInitialPrimordialState());
