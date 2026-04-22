import { describe, expect, test } from "vitest";
import {
  advanceLavaHeight,
  advancePrimordialState,
  calculateAirControlImpulse,
  calculateDistanceToLava,
  calculateJumpImpulse,
  calculateObjectiveProgress,
  calculateTetherImpulse,
  calculateThermalLift,
  canGrapple,
  createCavernLayout,
  createInitialPrimordialState,
} from "./primordialSimulation";
import { CONFIG } from "./types";

describe("primordial simulation", () => {
  test("creates a complete initial ascent state", () => {
    const state = createInitialPrimordialState("playing");

    expect(state.phase).toBe("playing");
    expect(state.altitude).toBe(CONFIG.playerStartPosition.y);
    expect(state.maxAltitude).toBe(CONFIG.playerStartPosition.y);
    expect(state.lavaHeight).toBe(CONFIG.lavaStartHeight);
    expect(state.distToLava).toBe(50);
    expect(state.thermalLift).toBeGreaterThan(0);
    expect(state.objective).toContain("cyan anchors");
  });

  test("keeps the authored cavern route deterministic", () => {
    const layout = createCavernLayout();
    const again = createCavernLayout();

    expect(layout).toEqual(again);
    expect(layout.anchors).toHaveLength(7);
    expect(layout.platforms.map((platform) => platform.id)).toEqual([
      "moss-shelf-1",
      "moss-shelf-2",
      "moss-shelf-3",
      "moss-shelf-4",
      "moss-shelf-5",
      "moss-shelf-6",
    ]);
    expect(layout.ribs).toHaveLength(10);
  });

  test("advances lava pressure from elapsed time", () => {
    expect(advanceLavaHeight(-40, 0, 1000)).toBeCloseTo(-39.4);
    expect(advanceLavaHeight(-40, 60_000, 1000)).toBeCloseTo(-38.92);
    expect(calculateDistanceToLava(12, -38.92)).toBe(50);
    expect(calculateThermalLift(50)).toBeGreaterThan(0);
    expect(calculateThermalLift(8)).toBe(0);
    expect(calculateThermalLift(80)).toBe(0);
  });

  test("advances telemetry, objective progress, and gameover transition", () => {
    const state = createInitialPrimordialState("playing");
    const next = advancePrimordialState(state, 2_000, {
      position: { x: 0, y: 72.4, z: -80 },
      velocity: { x: 4, y: 10, z: 2 },
      lavaHeight: -10,
      grappleDistance: 34,
    });

    expect(next).not.toBe(state);
    expect(next.altitude).toBe(72);
    expect(next.maxAltitude).toBe(72);
    expect(next.velocity).toBe(10);
    expect(next.timeSurvived).toBe(2_000);
    expect(next.distToLava).toBe(82);
    expect(next.isInGrappleRange).toBe(true);
    expect(next.objectiveProgress).toBe(calculateObjectiveProgress(72));
    expect(state.maxAltitude).toBe(CONFIG.playerStartPosition.y);

    const consumed = advancePrimordialState(next, 16, {
      position: { x: 0, y: -9.6, z: 0 },
      velocity: { x: 0, y: -12, z: 0 },
      lavaHeight: -10,
      grappleDistance: null,
    });

    expect(consumed.phase).toBe("gameover");
    expect(consumed.distToLava).toBe(0);
  });

  test("normalizes air control and grapple range decisions", () => {
    const impulse = calculateAirControlImpulse(
      { forward: true, right: true },
      { x: 0, y: 0, z: -1 },
      0.5
    );

    expect(impulse.x).toBeCloseTo(7.0711);
    expect(impulse.z).toBeCloseTo(-7.0711);
    expect(canGrapple(CONFIG.maxTetherDist)).toBe(true);
    expect(canGrapple(CONFIG.maxTetherDist + 1)).toBe(false);
  });

  test("calculates jump and tether impulses toward the grapple target", () => {
    const jump = calculateJumpImpulse();
    const tether = calculateTetherImpulse(
      { x: 0, y: 10, z: 0 },
      { x: 0, y: -4, z: 0 },
      { x: 0, y: 30, z: -10 },
      0.1
    );

    expect(jump.y).toBe(CONFIG.jumpForce * CONFIG.playerMass);
    expect(tether.distance).toBeGreaterThan(20);
    expect(tether.tension).toBeGreaterThan(0);
    expect(tether.impulse.y).toBeGreaterThan(0);
    expect(tether.impulse.z).toBeLessThan(0);
  });
});
