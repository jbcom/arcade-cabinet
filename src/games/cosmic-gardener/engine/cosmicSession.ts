import { normalizeSessionMode, type SessionMode } from "@logic/shared";
import type { VoidZone } from "./constellations";

export interface CosmicModeTuning {
  maxBalls: number;
  startingBalls: number;
  targetMinutes: number;
  voidZoneScale: number;
}

export interface CosmicDrainRecoveryInput {
  mode: string | null | undefined;
  ballsRemaining: number;
  completedConnections: number;
  cosmicCold: number;
  recoveryBloomsUsed: number;
}

export interface CosmicDrainRecoveryResult {
  ballsRemaining: number;
  message: string;
  recoveryBloomsUsed: number;
  saved: boolean;
  scoreBonus: number;
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

export function resolveCosmicDrainRecovery({
  ballsRemaining,
  completedConnections,
  cosmicCold,
  mode,
  recoveryBloomsUsed,
}: CosmicDrainRecoveryInput): CosmicDrainRecoveryResult {
  const sessionMode = normalizeSessionMode(mode);
  const maxRecoveryBlooms = sessionMode === "cozy" ? 2 : sessionMode === "standard" ? 1 : 0;
  const canSave =
    ballsRemaining <= 1 &&
    recoveryBloomsUsed < maxRecoveryBlooms &&
    (completedConnections > 0 || cosmicCold >= 72);

  if (!canSave) {
    return {
      ballsRemaining: Math.max(0, ballsRemaining - 1),
      message: "Orb drained. Spend the next launch carefully.",
      recoveryBloomsUsed,
      saved: false,
      scoreBonus: 0,
    };
  }

  const scoreBonus = 300 + Math.max(1, completedConnections) * 175;

  return {
    ballsRemaining,
    message: "Recovery bloom catches the last orb and cools the garden.",
    recoveryBloomsUsed: recoveryBloomsUsed + 1,
    saved: true,
    scoreBonus,
  };
}

function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
