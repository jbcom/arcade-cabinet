import { beforeEach, describe, expect, test } from "vitest";
import {
  beginGameRun,
  clearGameSaveSlot,
  finishGameRun,
  readCabinetSettings,
  readGameProgress,
  readGameSaveSlot,
  writeCabinetSettings,
} from "./useCabinetRuntime";

describe("cabinet browser runtime storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("persists settings locally", () => {
    writeCabinetSettings({
      graphicsQuality: "high",
      handedness: "left",
      hapticsEnabled: false,
      joystickSensitivity: 1.2,
      reducedMotion: true,
      soundEnabled: false,
      textScale: 1.15,
    });

    expect(readCabinetSettings()).toMatchObject({
      graphicsQuality: "high",
      handedness: "left",
      hapticsEnabled: false,
      reducedMotion: true,
      soundEnabled: false,
    });
  });

  test("starts and clears one active run per game", () => {
    beginGameRun("otterly-chaotic", "challenge", {
      progressSummary: "Round 2 rescue",
      snapshot: { saladHealth: 72 },
    });

    expect(readGameProgress("otterly-chaotic")).toMatchObject({
      lastSelectedMode: "challenge",
      sessionsStarted: 1,
    });
    expect(readGameSaveSlot("otterly-chaotic")).toMatchObject({
      mode: "challenge",
      progressSummary: "Round 2 rescue",
      snapshot: { saladHealth: 72 },
      status: "active",
    });

    clearGameSaveSlot("otterly-chaotic");

    expect(readGameSaveSlot("otterly-chaotic")).toBeUndefined();
  });

  test("finishes a run, records progress, and clears stale resume state", () => {
    beginGameRun("mega-track", "standard", {
      progressSummary: "Leg 2",
      snapshot: { integrity: 74 },
    });

    const { progress, result } = finishGameRun("mega-track", {
      milestones: ["first-cup"],
      mode: "standard",
      now: new Date("2026-04-22T12:12:00.000Z"),
      score: 7200,
      status: "completed",
      summary: "Cup complete",
    });

    expect(result).toMatchObject({
      mode: "standard",
      score: 7200,
      slug: "mega-track",
      status: "completed",
      summary: "Cup complete",
    });
    expect(progress).toMatchObject({
      bestScore: 7200,
      sessionsCompleted: 1,
      sessionsStarted: 1,
    });
    expect(progress.milestones).toEqual(["first-cup"]);
    expect(readGameSaveSlot("mega-track")).toBeUndefined();
  });
});
