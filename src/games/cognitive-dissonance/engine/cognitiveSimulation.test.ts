import { describe, expect, test } from "vitest";
import {
  advanceCognitiveState,
  createInitialCognitiveState,
  getCognitiveModeTuning,
  getCognitiveRunSummary,
  getCognitiveShiftCue,
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

  test("sustained matching triggers a phase-lock recovery event", () => {
    const state = {
      ...createInitialCognitiveState("standard", "playing"),
      coherence: 72,
      tension: 74,
    };

    const charged = advanceCognitiveState(state, 4300, "violet");
    const cue = getCognitiveShiftCue(charged);

    expect(charged.phaseLocks).toBe(1);
    expect(charged.phaseLockPulseMs).toBeGreaterThan(0);
    expect(charged.stableHoldMs).toBe(0);
    expect(charged.tension).toBeLessThan(58);
    expect(charged.coherence).toBeGreaterThan(state.coherence);
    expect(charged.lastEvent).toContain("phase lock");
    expect(cue.phaseLockActive).toBe(true);
  });

  test("shift cue exposes stage, next pattern, urgency, and phase lock charge", () => {
    const state = {
      ...createInitialCognitiveState("standard", "playing"),
      coherence: 54,
      elapsedMs: getCognitiveModeTuning("standard").shiftDurationMs * 0.52,
      stableHoldMs: 3200,
      tension: 68,
    };
    const cue = getCognitiveShiftCue(state);

    expect(cue.stage).toBe("rain");
    expect(cue.stageLabel).toBe("Pattern Rain");
    expect(cue.instruction).toContain("phase lock");
    expect(cue.nextPattern).toBe("cyan");
    expect(cue.phaseLockPercent).toBeGreaterThan(70);
    expect(cue.urgency).toBe("medium");
  });

  test("one mismatch is recoverable in standard", () => {
    const state = createInitialCognitiveState("standard", "playing");
    const mistake = advanceCognitiveState(state, 5000, "gold");
    const recovered = recoverCognitiveAfterMistake(mistake);

    expect(mistake.phase).toBe("playing");
    expect(recovered.coherence).toBeGreaterThan(mistake.coherence);
    expect(recovered.stableHoldMs).toBeGreaterThan(mistake.stableHoldMs);
    expect(recovered.tension).toBeLessThan(mistake.tension);
  });
});
