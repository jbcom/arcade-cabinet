import { normalizeSessionMode, type SessionMode } from "@logic/shared";
import type { VoidZone } from "./constellations";

export interface CosmicModeTuning {
  maxBalls: number;
  startingBalls: number;
  targetMinutes: number;
  voidZoneScale: number;
}

const COSMIC_MODE_TUNING: Record<SessionMode, CosmicModeTuning> = {
  challenge: {
    maxBalls: 4,
    startingBalls: 3,
    targetMinutes: 8,
    voidZoneScale: 1.24,
  },
  cozy: {
    maxBalls: 6,
    startingBalls: 5,
    targetMinutes: 15,
    voidZoneScale: 0.68,
  },
  standard: {
    maxBalls: 5,
    startingBalls: 4,
    targetMinutes: 12,
    voidZoneScale: 1,
  },
};

export function getCosmicModeTuning(mode: string | null | undefined): CosmicModeTuning {
  return COSMIC_MODE_TUNING[normalizeSessionMode(mode)];
}

export function getCosmicSessionTargetMinutes(mode: string | null | undefined): number {
  return getCosmicModeTuning(mode).targetMinutes;
}

export function tuneVoidZonesForMode(
  zones: readonly VoidZone[],
  mode: string | null | undefined
): VoidZone[] {
  const tuning = getCosmicModeTuning(mode);

  return zones.map((zone) => ({
    ...zone,
    drainRate: round(zone.drainRate * tuning.voidZoneScale, 3),
    radius: round(zone.radius * tuning.voidZoneScale, 2),
  }));
}

function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
