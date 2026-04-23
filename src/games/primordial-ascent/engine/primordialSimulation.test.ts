import { describe, expect, test } from "vitest";
import {
  advanceLavaHeight,
  advancePrimordialState,
  calculateAirControlImpulse,
  calculateDistanceToLava,
  calculateGrappleTargetState,
  calculateJumpImpulse,
  calculateObjectiveProgress,
  calculatePrimordialGrappleGuideCue,
  calculatePrimordialRouteCue,
  calculateTetherImpulse,
  calculateThermalLift,
  canGrapple,
  createCavernLayout,
  createInitialPrimordialState,
  getPrimordialRunSummary,
} from "./primordialSimulation";
import { CONFIG } from "./types";

describe("primordial simulation", () => {
  test("creates a complete initial ascent state", () => {
    const state = createInitialPrimordialState("playing");

    expect(state.phase).toBe("playing");
    expect(state.sessionMode).toBe("standard");
    expect(state.altitude).toBe(CONFIG.playerStartPosition.y);
    expect(state.maxAltitude).toBe(CONFIG.playerStartPosition.y);
    expect(state.lavaHeight).toBe(CONFIG.lavaStartHeight);
    expect(state.distToLava).toBe(50);
    expect(state.thermalLift).toBeGreaterThan(0);
    expect(state.grappleTargetState).toBe("none");
    expect(state.grappleGuideCue).toMatchObject({
      inputHint: "Look at cyan, hold Grip",
      kind: "launch-aim",
      label: "First contact: center the cyan ring before holding Grip.",
    });
    expect(state.routeCue.kind).toBe("launch");
    expect(state.routeCue.nextAnchorId).toBe("anchor-1");
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

  test("describes the next climb route and recovery windows", () => {
    const launchCue = calculatePrimordialRouteCue({ x: 0, y: 10, z: 0 }, 50);
    const recoveryCue = calculatePrimordialRouteCue({ x: -12, y: 42, z: -50 }, 42);
    const dangerCue = calculatePrimordialRouteCue({ x: 0, y: 72, z: -76 }, 18);
    const escapeCue = calculatePrimordialRouteCue({ x: 0, y: CONFIG.escapeAltitude, z: -170 }, 80);

    expect(launchCue).toMatchObject({
      kind: "launch",
      nextAnchorId: "anchor-1",
      targetAltitude: 18,
    });
    expect(launchCue.bearing.y).toBeGreaterThan(0);
    expect(recoveryCue.kind).toBe("recovery");
    expect(recoveryCue.nextShelfId).toBe("moss-shelf-3");
    expect(recoveryCue.recoveryWindow).toBe(true);
    expect(dangerCue.kind).toBe("danger");
    expect(dangerCue.label).toContain("Lava wake close");
    expect(escapeCue.kind).toBe("escape");
    expect(escapeCue.nextAnchorId).toBeNull();
  });

  test("advances lava pressure from elapsed time", () => {
    expect(advanceLavaHeight(-40, 0, 1000)).toBeCloseTo(-39.532);
    expect(advanceLavaHeight(-40, 60_000, 1000)).toBeCloseTo(-39.158);
    expect(advanceLavaHeight(-40, 60_000, 1000, "challenge")).toBeGreaterThan(
      advanceLavaHeight(-40, 60_000, 1000, "cozy")
    );
    expect(calculateDistanceToLava(12, -39.158)).toBe(51);
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
      grappleAttempted: true,
      grappleActive: true,
      grappleDistance: 34,
      grappleTension: 0.8,
    });

    expect(next).not.toBe(state);
    expect(next.altitude).toBe(72);
    expect(next.maxAltitude).toBe(72);
    expect(next.velocity).toBe(10);
    expect(next.timeSurvived).toBe(2_000);
    expect(next.distToLava).toBe(82);
    expect(next.isInGrappleRange).toBe(true);
    expect(next.grappleTargetState).toBe("taut");
    expect(next.grappleFeedback).toBe("locked");
    expect(next.grappleGuideCue.kind).toBe("tension-release");
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

  test("completes the ascent when escape altitude is reached", () => {
    const state = createInitialPrimordialState("playing");
    const escaped = advancePrimordialState(state, 720_000, {
      position: { x: 0, y: CONFIG.escapeAltitude + 2, z: -180 },
      velocity: { x: 0, y: 6, z: 0 },
      lavaHeight: 42,
      grappleDistance: null,
    });

    expect(escaped.phase).toBe("complete");
    expect(escaped.objectiveProgress).toBe(100);
    expect(getPrimordialRunSummary(escaped)).toMatchObject({
      elapsedSeconds: 720,
      maxAltitude: CONFIG.escapeAltitude + 2,
      objectiveProgress: 100,
    });
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
    expect(calculateGrappleTargetState(null, false)).toBe("none");
    expect(calculateGrappleTargetState(CONFIG.maxTetherDist + 1, true)).toBe("missed");
    expect(calculateGrappleTargetState(24, false)).toBe("in-range");
    expect(calculateGrappleTargetState(24, true, 0.2)).toBe("locked");
    expect(calculateGrappleTargetState(24, true, 0.9)).toBe("taut");
  });

  test("grapple guide teaches first missed grips and recovery cues", () => {
    const state = createInitialPrimordialState("playing");
    const missed = advancePrimordialState(state, 120, {
      position: { x: 0, y: 11, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
      lavaHeight: -40,
      grappleAttempted: true,
      grappleDistance: null,
    });

    expect(missed.grappleFeedback).toBe("missed");
    expect(missed.grappleFeedbackMs).toBeGreaterThan(0);
    expect(missed.grappleGuideCue).toMatchObject({
      focus: "reticle",
      inputHint: "Aim center, then Grip",
      kind: "missed-grip",
      urgency: "medium",
    });

    const faded = advancePrimordialState(missed, 2_000, {
      position: { x: 0, y: 11, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
      lavaHeight: -40,
      grappleDistance: null,
    });

    expect(faded.grappleFeedback).toBe("none");
    expect(faded.grappleGuideCue.kind).toBe("launch-aim");

    const recoveryCue = calculatePrimordialGrappleGuideCue({
      distToLava: 42,
      grappleFeedback: "none",
      grappleFeedbackMs: 0,
      grappleTargetState: "none",
      objectiveProgress: 30,
      routeCue: calculatePrimordialRouteCue({ x: -12, y: 42, z: -50 }, 42),
      timeSurvived: 60_000,
    });

    expect(recoveryCue).toMatchObject({
      focus: "shelf",
      inputHint: "Land on green moss",
      kind: "shelf-reset",
    });
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
