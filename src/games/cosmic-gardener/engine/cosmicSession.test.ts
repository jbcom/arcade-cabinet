import { describe, expect, test } from "vitest";
import { generateVoidZones } from "./constellations";
import {
  getCosmicModeTuning,
  getCosmicSessionTargetMinutes,
  resolveCosmicDrainRecovery,
  tuneVoidZonesForMode,
} from "./cosmicSession";

describe("cosmic session tuning", () => {
  test("keeps standard play in the couch-session range with opt-in pressure", () => {
    expect(getCosmicSessionTargetMinutes("standard")).toBeGreaterThanOrEqual(8);
    expect(getCosmicSessionTargetMinutes("standard")).toBeLessThanOrEqual(15);
    expect(getCosmicModeTuning("cozy").startingBalls).toBeGreaterThan(
      getCosmicModeTuning("standard").startingBalls
    );
    expect(getCosmicModeTuning("challenge").startingBalls).toBeLessThan(
      getCosmicModeTuning("standard").startingBalls
    );
    expect(getCosmicModeTuning("challenge").voidZoneScale).toBeGreaterThan(
      getCosmicModeTuning("standard").voidZoneScale
    );
  });

  test("scales void-zone pressure without changing deterministic placement", () => {
    const zones = generateVoidZones(3);
    const cozy = tuneVoidZonesForMode(zones, "cozy");
    const challenge = tuneVoidZonesForMode(zones, "challenge");

    expect(cozy.map((zone) => [zone.x, zone.y])).toEqual(challenge.map((zone) => [zone.x, zone.y]));
    expect(cozy[0]?.radius).toBeLessThan(zones[0]?.radius ?? 0);
    expect(challenge[0]?.radius).toBeGreaterThan(zones[0]?.radius ?? 0);
    expect(challenge[0]?.drainRate).toBeGreaterThan(cozy[0]?.drainRate ?? 0);
  });

  test("saves the last ball through deterministic recovery blooms in non-challenge modes", () => {
    const standardSave = resolveCosmicDrainRecovery({
      ballsRemaining: 1,
      completedConnections: 2,
      cosmicCold: 40,
      mode: "standard",
      recoveryBloomsUsed: 0,
    });
    const challengeDrain = resolveCosmicDrainRecovery({
      ballsRemaining: 1,
      completedConnections: 2,
      cosmicCold: 90,
      mode: "challenge",
      recoveryBloomsUsed: 0,
    });
    const spentSave = resolveCosmicDrainRecovery({
      ballsRemaining: 1,
      completedConnections: 2,
      cosmicCold: 90,
      mode: "standard",
      recoveryBloomsUsed: 1,
    });

    expect(standardSave).toMatchObject({
      ballsRemaining: 1,
      recoveryBloomsUsed: 1,
      saved: true,
    });
    expect(standardSave.scoreBonus).toBeGreaterThan(300);
    expect(challengeDrain.saved).toBe(false);
    expect(challengeDrain.ballsRemaining).toBe(0);
    expect(spentSave.saved).toBe(false);
  });
});
