import { trait } from "koota";
import { createInitialSNWState } from "../engine/protocolSimulation";

export const SNWTrait = trait(() => createInitialSNWState());
