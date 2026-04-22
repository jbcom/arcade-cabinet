import { describe, expect, test } from "vitest";
import { generateVoidZones } from "./constellations";
import {
  getCosmicModeTuning,
  getCosmicSessionTargetMinutes,
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
});
