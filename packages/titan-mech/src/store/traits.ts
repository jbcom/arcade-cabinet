import { trait } from "koota";
import { createInitialTitanState } from "../engine/titanSimulation";

export const TitanTrait = trait(() => createInitialTitanState());
