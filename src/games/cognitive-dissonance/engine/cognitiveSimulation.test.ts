import { describe, expect, test } from "vitest";
import {
  advanceCognitiveState,
  createInitialCognitiveState,
  getCognitiveModeTuning,
  getCognitiveRunSummary,
  recoverCognitiveAfterMistake,
} from "./cognitiveSimulation";

describe("Cognitive Dissonance coherence loop", () => {
  test("keeps challenge pressure opt-in", () => {
    expect(getCognitiveModeTuning("challenge").tensionRisePerSecond).toBeGreaterThan(
      getCognitiveModeTuning("standard").tensionRisePerSecond
    );
    expect(getCognitiveModeTuning("cozy").shiftDurationMs).toBeGreaterThan(
      getCognitiveModeTuning("standard").shiftDurationMs
    );
  });

  test("standard mode does not shatter without input in the first minute", () => {
    const state = createInitialCognitiveState("standard", "playing");
    const afterMinute = advanceCognitiveState(state, 60_000, null);

    expect(afterMinute.phase).toBe("playing");
    expect(afterMinute.coherence).toBeGreaterThan(70);
  });

  test("standard shift target is a 12 minute couch loop with run summary", () => {
    const state = {
      ...createInitialCognitiveState("standard", "playing"),
      elapsedMs: getCognitiveModeTuning("standard").shiftDurationMs / 2,
      stableMatches: 42,
      tension: 34.4,
    };
    const summary = getCognitiveRunSummary(state);

    expect(summary.targetSeconds / 60).toBeGreaterThanOrEqual(8);
    expect(summary.targetSeconds / 60).toBeLessThanOrEqual(15);
    expect(summary).toMatchObject({
      progressPercent: 50,
      stableMatches: 42,
      tension: 34,
    });
  });

  test("matching the active pattern lowers tension and restores coherence", () => {
    const state = {
      ...createInitialCognitiveState("standard", "playing"),
      coherence: 80,
      tension: 55,
    };
    const next = advanceCognitiveState(state, 1000, "violet");

    expect(next.tension).toBeLessThan(state.tension);
    expect(next.coherence).toBeGreaterThan(state.coherence);
  });

  test("one mismatch is recoverable in standard", () => {
    const state = createInitialCognitiveState("standard", "playing");
    const mistake = advanceCognitiveState(state, 5000, "gold");
    const recovered = recoverCognitiveAfterMistake(mistake);

    expect(mistake.phase).toBe("playing");
    expect(recovered.coherence).toBeGreaterThan(mistake.coherence);
    expect(recovered.tension).toBeLessThan(mistake.tension);
  });
});
