import { describe, expect, test } from "vitest";
import {
  advanceTitanSystems,
  calculateDriveForces,
  calculateObjectiveProgress,
  createArenaLayout,
  createInitialTitanState,
  normalizeTitanControls,
} from "./titanSimulation";

describe("titan simulation", () => {
  test("creates a full boot state with telemetry and system reserves", () => {
    const state = createInitialTitanState("playing");

    expect(state.phase).toBe("playing");
    expect(state.hp).toBe(state.maxHp);
    expect(state.energy).toBe(state.maxEnergy);
    expect(state.controls).toEqual({ throttle: 0, turn: 0, fire: false, brace: false });
    expect(state.pose.position.y).toBeGreaterThan(0);
    expect(state.systems.reactor).toBe(100);
  });

  test("normalizes analog and binary control input", () => {
    expect(normalizeTitanControls({ throttle: 4, turn: -2, fire: true })).toEqual({
      throttle: 1,
      turn: -1,
      fire: true,
      brace: false,
    });
  });

  test("calculates heading-aware heavy chassis forces", () => {
    const forces = calculateDriveForces(
      { throttle: 1, turn: 1, fire: false, brace: false },
      Math.PI / 2,
      0.5
    );

    expect(forces.impulse.x).toBeCloseTo(22);
    expect(forces.impulse.z).toBeCloseTo(0);
    expect(forces.torqueY).toBeLessThan(0);
    expect(forces.energyCost).toBeGreaterThan(0);
  });

  test("advances heat, energy, telemetry, and objective state without mutating input", () => {
    const state = createInitialTitanState("playing");
    const next = advanceTitanSystems(
      state,
      1_000,
      { throttle: 1, fire: true },
      {
        position: { x: 44, y: 5, z: 44 },
        heading: 0.25,
        velocity: { x: 2, y: 0, z: 3 },
      }
    );

    expect(next).not.toBe(state);
    expect(next.energy).toBeLessThan(state.energy);
    expect(next.heat).toBeGreaterThan(state.heat);
    expect(next.objectiveProgress).toBe(100);
    expect(next.pose.heading).toBe(0.25);
    expect(state.pose.position.x).toBe(0);
  });

  test("keeps authored arena layout deterministic and objective progress radius-based", () => {
    const layout = createArenaLayout();
    const again = createArenaLayout();

    expect(layout).toEqual(again);
    expect(layout.obstacles).toHaveLength(21);
    expect(layout.beacons.map((beacon) => beacon.id)).toEqual([
      "pylon-alpha",
      "pylon-beta",
      "pylon-gamma",
    ]);
    expect(calculateObjectiveProgress({ x: 44, y: 0, z: 44 }, layout)).toBe(100);
    expect(calculateObjectiveProgress({ x: 0, y: 0, z: 0 }, layout)).toBe(0);
  });
});
