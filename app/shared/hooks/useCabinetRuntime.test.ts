import { beforeEach, describe, expect, test } from "vitest";
import {
  beginGameRun,
  clearGameSaveSlot,
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
});
