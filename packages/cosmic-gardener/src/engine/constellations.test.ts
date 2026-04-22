import { afterEach, describe, expect, test, vi } from "vitest";
import { CONSTELLATIONS, generateVoidZones, getConstellationForLevel } from "./constellations";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("constellation selection", () => {
  test("returns the first pattern for level one and clamps beyond the catalog", () => {
    expect(getConstellationForLevel(1)).toBe(CONSTELLATIONS[0]);
    expect(getConstellationForLevel(999)).toBe(CONSTELLATIONS[CONSTELLATIONS.length - 1]);
  });
});

describe("void zone generation", () => {
  test("scales count with level and keeps zones inside the play field", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);

    const zones = generateVoidZones(3);

    expect(zones).toHaveLength(3);
    expect(zones[0]).toEqual({
      x: 50,
      y: 50,
      radius: 11,
      drainRate: 1.1,
    });
  });

  test("caps generated hazards at four zones", () => {
    expect(generateVoidZones(12)).toHaveLength(4);
  });
});
