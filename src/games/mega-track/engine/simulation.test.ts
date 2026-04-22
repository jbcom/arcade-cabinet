import { describe, expect, test } from "vitest";
import { createInitialState, createObstacle, tick } from "./simulation";
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
    expect(first.obstacles.length).toBeGreaterThan(3);
    expect(first.obstacles[0]).toEqual(createObstacle(0));
    expect(first.nextObstacleIndex).toBe(first.obstacles.length);
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
});
