import { describe, expect, test } from "vitest";
import {
  createInitialState,
  didLose,
  didWin,
  GOAL,
  getGoatIntent,
  getOtterlyRescueCue,
  getOtterlyRunSummary,
  TARGET_RESCUES,
  tick,
} from "./simulation";

describe("otterly simulation", () => {
  test("moves the otter from player input", () => {
    const state = createInitialState();
    const next = tick(state, 250, { x: 1, y: 0 }, false);

    expect(state.sessionMode).toBe("standard");
    expect(state.targetRescues).toBe(TARGET_RESCUES);
    expect(next.otter.x).toBeGreaterThan(state.otter.x);
    expect(next.elapsedMs).toBe(250);
  });

  test("session modes tune goat pressure without changing deterministic setup", () => {
    const cozy = createInitialState("cozy");
    const challenge = createInitialState("challenge");

    expect(challenge.goats[0].speed).toBeGreaterThan(cozy.goats[0].speed);
    expect(challenge.goats.map((goat) => goat.id)).toEqual(cozy.goats.map((goat) => goat.id));
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
    expect(next.lastBarkMs).toBe(next.elapsedMs);
    expect(next.goats[0].stunnedMs).toBeGreaterThan(0);
  });

  test("reports goat intent for chase, chew, and stun telegraphs", () => {
    const chasing = createInitialState();
    const chaseIntent = getGoatIntent(chasing, chasing.goats[0]);

    const chewing = createInitialState();
    chewing.goats[0].position = { ...chewing.ball };
    const chewIntent = getGoatIntent(chewing, chewing.goats[0]);

    const nearOtter = createInitialState();
    nearOtter.goats[0].position = { ...nearOtter.otter };
    const stunned = tick(nearOtter, 16, { x: 0, y: 0 }, true);
    stunned.goats[0].position = { ...stunned.otter };
    const stunIntent = getGoatIntent(stunned, stunned.goats[0]);

    expect(chaseIntent.state).toBe("chasing");
    expect(chewIntent.state).toBe("chewing");
    expect(stunIntent.state).toBe("stunned");
    expect(chaseIntent.alertLevel).toBeGreaterThanOrEqual(0);
  });

  test("summarizes rescue cue decisions from goat threat and bark readiness", () => {
    const clear = createInitialState();
    clear.goats = clear.goats.map((goat) => ({ ...goat, position: { x: 4, y: -4 } }));
    const clearCue = getOtterlyRescueCue(clear);

    const chewing = createInitialState();
    chewing.goats[0].position = { ...chewing.ball };
    const chewingCue = getOtterlyRescueCue(chewing);

    const recovering = createInitialState();
    recovering.barkCooldownMs = 900;
    recovering.goats[0].position = { x: recovering.ball.x + 1.2, y: recovering.ball.y };
    const recoverCue = getOtterlyRescueCue(recovering);

    expect(clearCue).toMatchObject({
      action: "push",
      progressLabel: "1/5",
      threatBand: "clear",
    });
    expect(chewingCue).toMatchObject({
      action: "bark",
      chewingGoats: 1,
      threatBand: "danger",
    });
    expect(recoverCue).toMatchObject({
      action: "recover",
      barkReady: false,
      closestGoatId: "billy",
      threatBand: "pressure",
    });
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

  test("fresh standard runs keep a playable first minute without immediate input", () => {
    let state = createInitialState();

    for (let elapsed = 0; elapsed < 60_000; elapsed += 250) {
      state = tick(state, 250, { x: 0, y: 0 }, false);
    }

    expect(didLose(state)).toBe(false);
    expect(state.ballHealth).toBeGreaterThan(20);
  });

  test("requires a full five-piece rescue run instead of one fast crater touch", () => {
    let state = createInitialState();
    for (let rescue = 0; rescue < TARGET_RESCUES - 1; rescue += 1) {
      state = tick({ ...state, ball: { ...GOAL } }, 16, { x: 0, y: 0 }, false);
      expect(didWin(state)).toBe(false);
      expect(state.ball).not.toEqual(GOAL);
    }

    const won = tick({ ...state, ball: { ...GOAL } }, 16, { x: 0, y: 0 }, false);
    const summary = getOtterlyRunSummary(won);

    expect(didWin(won)).toBe(true);
    expect(summary.rescuesCompleted).toBe(TARGET_RESCUES);
    expect(summary.rescueProgressPercent).toBe(100);

    const lost = createInitialState();
    lost.ballHealth = 0;
    expect(didLose(lost)).toBe(true);
  });
});
