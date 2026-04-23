import { describe, expect, test } from "vitest";
import {
  bankFarmScore,
  createInitialFarmState,
  dropFarmAnimal,
  FARM_BANK_TARGET,
  FARM_MIN_RUN_MS,
  getFarmAnimalPoseCue,
  getFarmCollapseCue,
  getFarmModeTuning,
  getFarmRunSummary,
  getFarmStackCue,
  getFarmWobbleBand,
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
    state = dropFarmAnimal(state, 0);

    expect(state.stack).toHaveLength(1);
    expect(state.stack[0]?.animal).toBe("goat");
    expect(state.lastAbility).toMatchObject({
      ability: "headbutt",
      animal: "goat",
    });
    expect(state.score).toBeGreaterThan(100);
  });

  test("merge abilities reduce wobble and expose warning bands", () => {
    const state = dropFarmAnimal(
      {
        ...createInitialFarmState("standard", "playing"),
        nextAnimal: "pig",
        nextTier: 2,
        stack: [
          {
            animal: "pig",
            id: "setup-pig",
            lane: 1,
            tier: 2,
          },
        ],
        wobble: 88,
      },
      1
    );

    expect(state.stack.at(-1)).toMatchObject({ animal: "cow", tier: 3 });
    expect(state.lastAbility).toMatchObject({
      ability: "milk-brace",
      wobbleRecovery: 11,
    });
    expect(getFarmWobbleBand(state)).toBe("sway");
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

  test("stack cue recommends merge lanes, bank readiness, and danger recovery", () => {
    const mergeState = {
      ...createInitialFarmState("standard", "playing"),
      nextAnimal: "goat" as const,
      nextTier: 1,
      stack: [
        { animal: "goat" as const, id: "left-goat", lane: -1 as const, tier: 1 },
        { animal: "chick" as const, id: "center-chick", lane: 0 as const, tier: 0 },
      ],
    };
    const mergeCue = getFarmStackCue(mergeState);

    expect(mergeCue.recommendedLane).toBe(-1);
    expect(mergeCue.mergePreviewAnimal).toBe("pig");
    expect(mergeCue.recommendedAction).toContain("merge");
    expect(mergeCue.laneHeights[-1]).toBe(1);

    const bankCue = getFarmStackCue({
      ...mergeState,
      bankedScore: FARM_BANK_TARGET,
      elapsedMs: FARM_MIN_RUN_MS,
    });
    expect(bankCue.bankReady).toBe(true);
    expect(bankCue.recommendedAction).toContain("Bank now");

    const dangerCue = getFarmStackCue({
      ...mergeState,
      stack: [],
      wobble: getFarmModeTuning("standard").wobbleLimit * 0.86,
    });
    expect(dangerCue.wobbleBand).toBe("danger");
    expect(dangerCue.recommendedAction).toContain("Danger sway");
  });

  test("describes collapse payoff and late-tier animal poses deterministically", () => {
    const collapsed = {
      ...createInitialFarmState("standard", "collapsed"),
      bankedScore: FARM_BANK_TARGET * 0.8,
      stack: [
        { animal: "pig" as const, id: "left-pig", lane: -1 as const, tier: 2 },
        { animal: "cow" as const, id: "right-cow", lane: 1 as const, tier: 3 },
        { animal: "horse" as const, id: "right-horse", lane: 1 as const, tier: 4 },
      ],
      wobble: getFarmModeTuning("standard").wobbleLimit,
    };
    const collapseCue = getFarmCollapseCue(collapsed);
    const horsePose = getFarmAnimalPoseCue("horse", 4);

    expect(collapseCue).toMatchObject({
      bankedPercent: 80,
      severity: "auction-loss",
      spillDirection: 1,
    });
    expect(collapseCue.scatterCount).toBeGreaterThan(collapsed.stack.length);
    expect(horsePose).toMatchObject({
      expression: "wild",
      pose: "gallop",
      showMotionMarks: true,
      showRibbon: true,
    });
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
