import { describe, expect, test } from "vitest";
import {
  advanceOvercastState,
  createInitialOvercastState,
  normalizeOvercastControls,
} from "./overcastSimulation";

describe("overcast glacier simulation", () => {
  test("creates a warm opening slope with readable entities", () => {
    const state = createInitialOvercastState("playing");

    expect(state.phase).toBe("playing");
    expect(state.warmth).toBe(state.maxWarmth);
    expect(state.entities.map((entity) => entity.kind)).toEqual(["cocoa", "snowman", "glitch"]);
    expect(state.objective).toContain("warm");
  });

  test("normalizes steering and action controls", () => {
    expect(normalizeOvercastControls({ steer: 3, kick: true })).toEqual({
      steer: 1,
      kick: true,
      photo: false,
    });
  });

  test("collects cocoa and restores warmth", () => {
    const state = {
      ...createInitialOvercastState("playing"),
      warmth: 52,
      entities: [{ id: "cocoa-now", kind: "cocoa" as const, lane: 0 as const, distance: 0 }],
    };
    const next = advanceOvercastState(state, 100, {});

    expect(next.warmth).toBeGreaterThan(state.warmth);
    expect(next.score).toBeGreaterThan(state.score);
    expect(next.lastEvent).toBe("cocoa");
  });

  test("kick defeats snowmen while missed snowmen damage warmth", () => {
    const base = {
      ...createInitialOvercastState("playing"),
      entities: [{ id: "snowman-now", kind: "snowman" as const, lane: 0 as const, distance: 0 }],
    };

    expect(advanceOvercastState(base, 100, { kick: true }).lastEvent).toBe("kick");
    expect(advanceOvercastState(base, 100, {}).warmth).toBeLessThan(base.warmth);
  });

  test("photos capture glitches and consume charges", () => {
    const state = {
      ...createInitialOvercastState("playing"),
      photoCharges: 1,
      entities: [{ id: "glitch-now", kind: "glitch" as const, lane: 0 as const, distance: 0 }],
    };
    const next = advanceOvercastState(state, 100, { photo: true });

    expect(next.lastEvent).toBe("photo");
    expect(next.photoCharges).toBe(0);
    expect(next.combo).toBeGreaterThan(state.combo);
  });
});
