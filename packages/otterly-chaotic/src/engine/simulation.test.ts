import { describe, expect, test } from "vitest";
import { GOAL, createInitialState, didLose, didWin, tick } from "./simulation";

describe("otterly simulation", () => {
  test("moves the otter from player input", () => {
    const state = createInitialState();
    const next = tick(state, 250, { x: 1, y: 0 }, false);

    expect(next.otter.x).toBeGreaterThan(state.otter.x);
    expect(next.elapsedMs).toBe(250);
  });

  test("bark stuns goats in range and starts cooldown", () => {
    const state = createInitialState();
    state.goats[0].position = { ...state.otter };

    const next = tick(state, 16, { x: 0, y: 0 }, true);

    expect(next.barkCooldownMs).toBeGreaterThan(0);
    expect(next.goats[0].stunnedMs).toBeGreaterThan(0);
  });

  test("detects win and loss terminal conditions", () => {
    const won = createInitialState();
    won.ball = { ...GOAL };
    expect(didWin(won)).toBe(true);

    const lost = createInitialState();
    lost.ballHealth = 0;
    expect(didLose(lost)).toBe(true);
  });
});
