import { describe, expect, test } from "vitest";
import {
  advanceOvercastState,
  createInitialOvercastState,
  createOvercastSegmentCue,
  getOvercastFinishCue,
  getOvercastRunSummary,
  getOvercastSpawnProfile,
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
    expect(state.segmentCue.label).toBe("Hazard Ribbon");
    expect(state.segmentCue.nearestKind).toBe("cocoa");
    expect(state.objective).toContain("warm");
  });

  test("describes segment identity, weather, and lane warnings", () => {
    const cue = createOvercastSegmentCue({
      entities: [{ id: "snow", kind: "snowman", lane: 0, distance: 20 }],
      playerLane: 0,
      segmentIndex: 4,
      segmentProgress: 0.64,
      warmth: 74,
    });
    const coldCue = createOvercastSegmentCue({
      entities: [],
      playerLane: -1,
      segmentIndex: 5,
      segmentProgress: 0.12,
      warmth: 20,
    });

    expect(cue.label).toBe("Blizzard Arcade");
    expect(cue.weather).toBe("blizzard");
    expect(cue.progressLabel).toContain("64%");
    expect(cue.trafficLevel).toBe("storm");
    expect(cue.nearestKind).toBe("snowman");
    expect(cue.warmthWarning).toBe(true);
    expect(coldCue.warmthWarning).toBe(true);
  });

  test("ramps late-route traffic without making standard harsher than challenge", () => {
    const opening = getOvercastSpawnProfile(0, "standard");
    const late = getOvercastSpawnProfile(OVERCAST_CONFIG.SEGMENT_DURATION_MS * 4, "standard");
    const lateChallenge = getOvercastSpawnProfile(
      OVERCAST_CONFIG.SEGMENT_DURATION_MS * 4,
      "challenge"
    );

    expect(opening.trafficLevel).toBe("gentle");
    expect(late.trafficLevel).toBe("storm");
    expect(late.intervalMs).toBeLessThan(opening.intervalMs);
    expect(lateChallenge.intervalMs).toBeLessThan(late.intervalMs);
    expect(late.maxEntities).toBeLessThanOrEqual(OVERCAST_CONFIG.MAX_ENTITIES);
  });

  test("biases late-route low-warmth spawns toward recovery cocoa", () => {
    const lateCold = {
      ...createInitialOvercastState("playing", "standard"),
      entities: [],
      warmth: 30,
      timeMs: OVERCAST_CONFIG.SEGMENT_DURATION_MS * 4,
    };
    const next = advanceOvercastState(lateCold, 900, {});

    expect(next.entities.some((entity) => entity.kind === "cocoa")).toBe(true);
    expect(next.segmentCue.trafficLevel).toBe("storm");
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
    expect(finished.finishCue?.rating).toBe("Hot Cocoa Victory");
    expect(finished.finishCue?.scoreBonus).toBeGreaterThan(OVERCAST_CONFIG.TARGET_SEGMENTS * 100);
    expect(getOvercastRunSummary(finished)).toMatchObject({
      segment: OVERCAST_CONFIG.TARGET_SEGMENTS,
      targetSegments: OVERCAST_CONFIG.TARGET_SEGMENTS,
    });
  });

  test("creates readable finish cues for cold clears", () => {
    const state = {
      ...createInitialOvercastState("finished", "standard"),
      warmth: 24,
      segmentsCleared: OVERCAST_CONFIG.TARGET_SEGMENTS,
    };
    const cue = getOvercastFinishCue(state);

    expect(cue.rating).toBe("Shivering Clear");
    expect(cue.routeLights).toBe(OVERCAST_CONFIG.TARGET_SEGMENTS);
    expect(cue.nextAction).toContain("cocoa");
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
