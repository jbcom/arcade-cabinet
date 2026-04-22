import { trait } from "koota";
import type { PrimordialState } from "../engine/types";

export const PrimordialTrait = trait<PrimordialState>(() => ({
  phase: "menu",
  altitude: 0,
  maxAltitude: 0,
  timeSurvived: 0,
  velocity: 0,
  distToLava: 100,
  isInGrappleRange: false,
}));
