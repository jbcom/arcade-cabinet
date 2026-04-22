import { describe, expect, test } from "vitest";
import {
  bankFarmScore,
  createInitialFarmState,
  dropFarmAnimal,
  getFarmModeTuning,
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
});
