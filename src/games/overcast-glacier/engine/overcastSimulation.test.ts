import { describe, expect, test } from "vitest";
import {
  advanceOvercastState,
  createInitialOvercastState,
  getOvercastRunSummary,
  normalizeOvercastControls,
} from "./overcastSimulation";
import { OVERCAST_CONFIG } from "./types";

describe("overcast glacier simulation", () => {
  test("creates a warm opening slope with readable entities", () => {
    const state = createInitialOvercastState("playing");

    expect(state.phase).toBe("playing");
    expect(state.sessionMode).toBe("standard");
    expect(state.warmth).toBe(state.maxWarmth);
    expect(state.entities.map((entity) => entity.kind)).toEqual(["cocoa", "snowman", "glitch"]);
    expect(state.objective).toContain("warm");
  });

  test("standard mode keeps passive warmth loss couch-friendly for the first minute", () => {
    const standard = createInitialOvercastState("playing", "standard");
    const challenge = createInitialOvercastState("playing", "challenge");
    const standardAfterMinute = advanceOvercastState(standard, 60_000, {});
    const challengeAfterMinute = advanceOvercastState(challenge, 60_000, {});

    expect(standardAfterMinute.phase).toBe("playing");
    expect(standardAfterMinute.warmth).toBeGreaterThan(50);
    expect(challengeAfterMinute.warmth).toBeLessThan(standardAfterMinute.warmth);
  });

  test("standard glacier route targets a 9 minute segment run and can finish", () => {
    const targetMinutes = OVERCAST_CONFIG.RUN_TARGET_MS / 60_000;
    const nearFinish = {
      ...createInitialOvercastState("playing", "standard"),
      timeMs: OVERCAST_CONFIG.RUN_TARGET_MS - 1_000,
      warmth: 80,
    };
    const finished = advanceOvercastState(nearFinish, 2_000, {});

    expect(targetMinutes).toBeGreaterThanOrEqual(8);
    expect(targetMinutes).toBeLessThanOrEqual(15);
    expect(finished.phase).toBe("finished");
    expect(finished.segmentsCleared).toBe(OVERCAST_CONFIG.TARGET_SEGMENTS);
    expect(getOvercastRunSummary(finished)).toMatchObject({
      segment: OVERCAST_CONFIG.TARGET_SEGMENTS,
      targetSegments: OVERCAST_CONFIG.TARGET_SEGMENTS,
    });
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

  test("preserves fractional downhill score across frames", () => {
    const state = createInitialOvercastState("playing");
    const first = advanceOvercastState(state, 16, {});
    let advanced = first;
    for (let index = 0; index < 4; index += 1) {
      advanced = advanceOvercastState(advanced, 16, {});
    }

    expect(first.score).toBe(0);
    expect(first.scoreRemainder).toBeGreaterThan(0);
    expect(advanced.score).toBeGreaterThan(0);
    expect(advanced.scoreRemainder).toBeLessThan(1);
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
