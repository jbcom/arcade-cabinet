import { describe, expect, test } from "vitest";
import {
  bankFarmScore,
  createInitialFarmState,
  dropFarmAnimal,
  FARM_BANK_TARGET,
  FARM_MIN_RUN_MS,
  getFarmModeTuning,
  getFarmRunSummary,
  tickFarmState,
} from "./farmSimulation";

describe("Farm Follies stack and bank loop", () => {
  test("keeps recovery available in standard and cozy", () => {
    expect(getFarmModeTuning("standard").lives).toBeGreaterThan(
      getFarmModeTuning("challenge").lives
    );
    expect(getFarmModeTuning("cozy").wobbleLimit).toBeGreaterThan(
      getFarmModeTuning("standard").wobbleLimit
    );
  });

  test("standard mode does not fail passively during the first minute", () => {
    const state = createInitialFarmState("standard", "playing");
    const afterMinute = tickFarmState(state, 60_000);

    expect(afterMinute.phase).toBe("playing");
    expect(afterMinute.lives).toBe(3);
  });

  test("drops animals deterministically and can merge same-lane tiers", () => {
    let state = createInitialFarmState("standard", "playing");
    state = dropFarmAnimal(state, 0);
    state = { ...state, nextAnimal: "chick", nextTier: 0 };
    state = dropFarmAnimal(state, 0);

    expect(state.stack).toHaveLength(1);
    expect(state.stack[0]?.animal).toBe("goat");
    expect(state.score).toBeGreaterThan(100);
  });

  test("banking recovers wobble after a mistake", () => {
    const state = {
      ...createInitialFarmState("standard", "playing"),
      score: 500,
      wobble: 88,
    };
    const banked = bankFarmScore(state);

    expect(banked.bankedScore).toBeGreaterThan(0);
    expect(banked.wobble).toBeLessThan(state.wobble);
    expect(banked.phase).toBe("playing");
  });

  test("banks a complete standard run only after quota and couch loop time", () => {
    const premature = bankFarmScore({
      ...createInitialFarmState("standard", "playing"),
      bankedScore: FARM_BANK_TARGET - 100,
      elapsedMs: FARM_MIN_RUN_MS - 1_000,
      score: 1_000,
    });
    const completed = bankFarmScore({
      ...premature,
      phase: "playing",
      elapsedMs: FARM_MIN_RUN_MS,
      score: 1_000,
    });

    expect(premature.phase).toBe("playing");
    expect(premature.objective).toContain("auction");
    expect(completed.phase).toBe("banked");
    expect(getFarmRunSummary(completed)).toMatchObject({
      bankTarget: FARM_BANK_TARGET,
      progressPercent: 100,
    });
  });
});
