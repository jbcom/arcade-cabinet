import { trait } from "koota";

export const PrimordialTrait = trait(() => ({
  phase: "menu",
  altitude: 0,
  maxAltitude: 0,
  timeSurvived: 0,
  velocity: 0,
  distToLava: 100,
  isInGrappleRange: false,
}));
