import { describe, expect, test } from "vitest";
import {
  getSessionTuning,
  LAUNCH_GAME_SESSION_TUNING,
  LAUNCH_GAME_SLUGS,
  normalizeSessionMode,
  SESSION_MODES,
} from "./sessionMode";

describe("launch game session tuning", () => {
  test("normalizes unknown values to the default cabinet mode", () => {
    expect(normalizeSessionMode("cozy")).toBe("cozy");
    expect(normalizeSessionMode("challenge")).toBe("challenge");
    expect(normalizeSessionMode("broken")).toBe("standard");
    expect(normalizeSessionMode(undefined)).toBe("standard");
  });

  test("defines the three modes for every launch cartridge", () => {
    for (const slug of LAUNCH_GAME_SLUGS) {
      expect(Object.keys(LAUNCH_GAME_SESSION_TUNING[slug]).sort()).toEqual(
        [...SESSION_MODES].sort()
      );
    }
  });

  test("keeps standard mode couch-friendly and challenge opt-in", () => {
    for (const slug of LAUNCH_GAME_SLUGS) {
      const cozy = getSessionTuning("cozy", slug);
      const standard = getSessionTuning("standard", slug);
      const challenge = getSessionTuning("challenge", slug);

      expect(standard.targetMinutes).toEqual([8, 15]);
      expect(standard.minimumNoInputGraceMs).toBeGreaterThanOrEqual(60_000);
      expect(standard.mistakeRecoveryCount).toBeGreaterThanOrEqual(2);
      expect(cozy.pressureScale).toBeLessThan(standard.pressureScale);
      expect(cozy.recoveryScale).toBeGreaterThan(standard.recoveryScale);
      expect(challenge.pressureScale).toBeGreaterThan(standard.pressureScale);
      expect(challenge.recoveryScale).toBeLessThan(standard.recoveryScale);
    }
  });
});
