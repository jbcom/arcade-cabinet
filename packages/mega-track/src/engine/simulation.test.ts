import { afterEach, describe, expect, test, vi } from "vitest";
import { CONFIG } from "./types";
import { createInitialState, tick } from "./simulation";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("mega track simulation", () => {
  test("does not mutate inactive races", () => {
    const state = createInitialState();

    expect(tick(state, 500, { laneChange: 1 })).toBe(state);
  });

  test("accelerates and clamps lane changes while playing", () => {
    vi.spyOn(Math, "random").mockReturnValue(1);
    const state = { ...createInitialState(), isPlaying: true };

    const next = tick(state, 1_000, { laneChange: 2 });

    expect(next.speed).toBeGreaterThan(0);
    expect(next.speed).toBeLessThanOrEqual(CONFIG.MAX_SPEED);
    expect(next.distance).toBeGreaterThan(0);
    expect(next.currentLane).toBe(1);
  });
});
