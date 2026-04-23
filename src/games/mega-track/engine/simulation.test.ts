import { describe, expect, test } from "vitest";
import {
  createInitialState,
  createObstacle,
  didFinishCup,
  getCupLegProgress,
  getMegaTrackRaceCue,
  getMegaTrackRunSummary,
  tick,
} from "./simulation";
import { CONFIG } from "./types";

describe("mega track simulation", () => {
  test("does not mutate inactive races", () => {
    const state = createInitialState();

    expect(tick(state, 500, { laneChange: 1 })).toBe(state);
  });

  test("starts with a deterministic authored obstacle run", () => {
    const first = createInitialState();
    const second = createInitialState();

    expect(first).toEqual(second);
    expect(first.sessionMode).toBe("standard");
    expect(first.obstacles.length).toBeGreaterThan(3);
    expect(first.obstacles[0]).toEqual(createObstacle(0));
    expect(first.nextObstacleIndex).toBe(first.obstacles.length);
  });

  test("standard mode survives one minute of imperfect center-lane driving", () => {
    let state = { ...createInitialState("standard"), isPlaying: true };

    for (let elapsed = 0; elapsed < 60_000; elapsed += 250) {
      state = tick(state, 250, { laneChange: 0 });
    }

    expect(state.integrity).toBeGreaterThan(0);
    expect(didFinishCup(state)).toBe(false);
  });

  test("standard cup target is an 8 to 15 minute couch loop at cruise speed", () => {
    const targetMinutes =
      CONFIG.GOAL_DISTANCE / (CONFIG.MAX_SPEED * CONFIG.DISTANCE_PER_SPEED_MS * 60_000);

    expect(targetMinutes).toBeGreaterThanOrEqual(8);
    expect(targetMinutes).toBeLessThanOrEqual(15);
    expect(CONFIG.MAX_OBSTACLE_INDEX * 290).toBeGreaterThan(CONFIG.GOAL_DISTANCE);
  });

  test("challenge impacts hit harder than cozy impacts", () => {
    const obstacle = createObstacle(0);
    const base = {
      isPlaying: true,
      currentLane: obstacle.lane,
      distance: obstacle.z - 5,
      obstacles: [obstacle],
      nextObstacleIndex: 1,
      speed: 2,
    };
    const cozy = tick({ ...createInitialState("cozy"), ...base }, 16, { laneChange: 0 });
    const challenge = tick({ ...createInitialState("challenge"), ...base }, 16, { laneChange: 0 });

    expect(challenge.integrity).toBeLessThan(cozy.integrity);
  });

  test("accelerates and clamps lane changes while playing", () => {
    const state = { ...createInitialState(), isPlaying: true };

    const next = tick(state, 1_000, { laneChange: 2 });

    expect(next.speed).toBeGreaterThan(0);
    expect(next.speed).toBeLessThanOrEqual(CONFIG.MAX_SPEED);
    expect(next.distance).toBeGreaterThan(0);
    expect(next.currentLane).toBe(1);
  });

  test("spawns, cleans up, and resolves collisions deterministically", () => {
    const obstacle = createObstacle(0);
    const state = {
      ...createInitialState(),
      isPlaying: true,
      currentLane: obstacle.lane,
      distance: obstacle.z - 5,
      obstacles: [obstacle],
      nextObstacleIndex: 1,
      speed: 2,
    };

    const next = tick(state, 16, { laneChange: 0 });

    expect(next.integrity).toBeLessThan(state.integrity);
    expect(next.impactCount).toBe(1);
    expect(next.lastImpactType).toBe(obstacle.type);
    expect(next.lastImpactMs).toBe(next.elapsedMs);
    expect(next.obstacles.some((entry) => entry.id === obstacle.id)).toBe(false);
    expect(next.nextObstacleIndex).toBeGreaterThanOrEqual(1);
  });

  test("rewards clean passes with overdrive instead of only punishing impacts", () => {
    const obstacle = { ...createObstacle(0), lane: 1 as const, x: CONFIG.LANE_WIDTH };
    const state = {
      ...createInitialState(),
      boostCharge: 99,
      cleanPassStreak: 3,
      currentLane: 0,
      distance: obstacle.z - 2,
      isPlaying: true,
      nextObstacleIndex: 1,
      obstacles: [obstacle],
      speed: 2,
    };

    const next = tick(state, 16, { laneChange: 0 });

    expect(next.cleanPassStreak).toBe(4);
    expect(next.overdriveMs).toBeGreaterThan(0);
    expect(next.lastCleanPassMs).toBe(next.elapsedMs);
    expect(next.lastOverdriveStartMs).toBe(next.elapsedMs);
    expect(next.boostCharge).toBe(0);
  });

  test("repairs integrity and boost at cup leg checkpoints", () => {
    const legLength = CONFIG.GOAL_DISTANCE / 3;
    const state = {
      ...createInitialState("standard"),
      boostCharge: 10,
      distance: legLength - 5,
      integrity: 52,
      isPlaying: true,
      speed: 4,
    };

    const next = tick(state, 1000, { laneChange: 0 });

    expect(getCupLegProgress(next).leg).toBe(2);
    expect(next.checkpointRepairs).toBe(1);
    expect(next.lastCheckpointLeg).toBe(2);
    expect(next.lastCheckpointMs).toBe(next.elapsedMs);
    expect(next.integrity).toBeGreaterThan(state.integrity);
    expect(next.boostCharge).toBeGreaterThan(state.boostCharge);
  });

  test("builds a deterministic race cue for hazard and lane readability", () => {
    const obstacle = { ...createObstacle(0), lane: 0 as const, x: 0, z: 1770 };
    const state = {
      ...createInitialState("standard"),
      currentLane: 0,
      distance: 1500,
      elapsedMs: 2_000,
      isPlaying: true,
      lastCheckpointMs: 1_000,
      obstacles: [obstacle],
    };

    const cue = getMegaTrackRaceCue(state);

    expect(cue).toMatchObject({
      checkpointRepairActive: true,
      legLabel: "Leg 1/3",
      nextHazardDistance: 27,
      nextHazardLane: 0,
      nextHazardType: obstacle.type,
      pressure: "danger",
      recommendedLane: -1,
      recommendedLaneLabel: "left lane",
    });
    expect(cue.checkpointProgressPercent).toBeGreaterThan(0);
  });

  test("reports cup legs and run summary deterministically", () => {
    const state = {
      ...createInitialState(),
      checkpointRepairs: 1,
      distance: CONFIG.GOAL_DISTANCE * 0.52,
      elapsedMs: 560_000,
      impactCount: 2,
      integrity: 76.4,
    };

    expect(getCupLegProgress(state).leg).toBe(2);
    expect(getMegaTrackRunSummary(state)).toMatchObject({
      cupLeg: 2,
      cupLegCount: 3,
      elapsedSeconds: 560,
      impactCount: 2,
      integrity: 76,
      progressPercent: 52,
      checkpointRepairs: 1,
    });
    expect(didFinishCup({ ...state, distance: CONFIG.GOAL_DISTANCE })).toBe(true);
  });
});
