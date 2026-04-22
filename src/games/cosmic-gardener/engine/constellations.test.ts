import { describe, expect, test } from "vitest";
import { CONSTELLATIONS, generateVoidZones, getConstellationForLevel } from "./constellations";

describe("constellation selection", () => {
  test("returns the first pattern for level one and clamps beyond the catalog", () => {
    expect(getConstellationForLevel(1)).toBe(CONSTELLATIONS[0]);
    expect(getConstellationForLevel(999)).toBe(CONSTELLATIONS[CONSTELLATIONS.length - 1]);
  });
});

describe("void zone generation", () => {
  test("scales count with level and keeps deterministic zones inside the play field", () => {
    const zones = generateVoidZones(3);

    expect(zones).toHaveLength(3);
    expect(zones).toEqual(generateVoidZones(3));
    expect(zones[0].x).toBeGreaterThanOrEqual(18);
    expect(zones[0].x).toBeLessThanOrEqual(82);
    expect(zones[0].y).toBeGreaterThanOrEqual(22);
    expect(zones[0].y).toBeLessThanOrEqual(76);
    expect(zones[0].drainRate).toBe(1.1);
  });

  test("caps generated hazards at four zones", () => {
    expect(generateVoidZones(12)).toHaveLength(4);
  });
});
