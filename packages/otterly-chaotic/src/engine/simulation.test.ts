import { describe, expect, test } from "vitest";
import { createInitialState, didLose, didWin, GOAL, tick } from "./simulation";

describe("otterly simulation", () => {
  test("moves the otter from player input", () => {
    const state = createInitialState();
    const next = tick(state, 250, { x: 1, y: 0 }, false);

    expect(next.otter.x).toBeGreaterThan(state.otter.x);
    expect(next.elapsedMs).toBe(250);
  });

  test("simulation is deterministic for the same input sequence", () => {
    const state = createInitialState();
    const first = tick(tick(state, 120, { x: 1, y: -1 }, false), 180, { x: 0, y: -1 }, true);
    const second = tick(
      tick(createInitialState(), 120, { x: 1, y: -1 }, false),
      180,
      { x: 0, y: -1 },
      true
    );

    expect(first).toEqual(second);
  });

  test("bark stuns goats in range and starts cooldown", () => {
    const state = createInitialState();
    state.goats[0].position = { ...state.otter };

    const next = tick(state, 16, { x: 0, y: 0 }, true);

    expect(next.barkCooldownMs).toBeGreaterThan(0);
    expect(next.goats[0].stunnedMs).toBeGreaterThan(0);
  });

  test("double bark rallies restore salad health and damp goat damage", () => {
    const state = createInitialState();
    state.ballHealth = 90;
    state.goats = state.goats.map((goat) => ({ ...goat, position: { ...state.otter } }));

    const rallied = tick(state, 16, { x: 0, y: 0 }, true);

    expect(rallied.lastBarkStunned).toBe(2);
    expect(rallied.rescueStreak).toBe(2);
    expect(rallied.ballHealth).toBe(96);
    expect(rallied.rallyMs).toBeGreaterThan(0);
  });

  test("goats damage the salad only while unstunned and close", () => {
    const state = createInitialState();
    state.goats[0].position = { ...state.ball };

    const damaged = tick(state, 500, { x: 0, y: 0 }, false);
    expect(damaged.ballHealth).toBeLessThan(state.ballHealth);

    const stunned = createInitialState();
    stunned.goats[0].position = { ...stunned.otter };
    const barked = tick(stunned, 16, { x: 0, y: 0 }, true);
    const billy = barked.goats[0];
    const elder = barked.goats[1];
    if (!billy) throw new Error("Expected the first goat to exist.");
    if (!elder) throw new Error("Expected the elder goat to exist.");
    const protectedState = {
      ...barked,
      goats: [{ ...billy, position: { ...barked.ball } }, { ...elder }],
    };
    const protectedNext = tick(protectedState, 500, { x: 0, y: 0 }, false);
    expect(protectedNext.ballHealth).toBe(protectedState.ballHealth);
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
