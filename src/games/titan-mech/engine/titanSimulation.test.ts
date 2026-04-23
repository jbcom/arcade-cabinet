import { describe, expect, test } from "vitest";
import {
  advanceTitanSystems,
  calculateDriveForces,
  calculateObjectiveProgress,
  calculateTitanContractCue,
  calculateTitanDeliveryCue,
  calculateTitanThreatCue,
  createArenaLayout,
  createInitialTitanState,
  getTitanRunSummary,
  getWeaponFeedbackState,
  normalizeTitanControls,
} from "./titanSimulation";
import { CONFIG } from "./types";

describe("titan simulation", () => {
  test("creates a full boot state with telemetry and system reserves", () => {
    const state = createInitialTitanState("playing");

    expect(state.phase).toBe("playing");
    expect(state.sessionMode).toBe("standard");
    expect(state.hp).toBe(state.maxHp);
    expect(state.energy).toBe(state.maxEnergy);
    expect(state.controls).toEqual({
      throttle: 0,
      turn: 0,
      fire: false,
      brace: false,
      extract: false,
    });
    expect(state.pose.position.y).toBeGreaterThan(0);
    expect(state.systems.reactor).toBe(100);
    expect(state.coolantCharge).toBe(100);
    expect(state.coolantBurstMs).toBe(0);
    expect(state.weaponFeedback).toBe("idle");
    expect(state.contractCue.stage).toBe("survey");
    expect(state.contractCue.nextBeaconId).toBe("pylon-beta");
    expect(state.contractCue.distanceToBeacon).toBeGreaterThan(0);
    expect(state.deliveryCue.state).toBe("idle");
    expect(state.threatCue.sourceId).toBeTruthy();
    expect(state.threatCue.level).toBe("tracking");
    expect(state.extraction.hopperLoad).toBe(0);
    expect(state.extraction.hopperCapacity).toBeGreaterThan(0);
    expect(state.extraction.lastPayoutMs).toBe(0);
    expect(state.extraction.feedback).toBe("idle");
  });

  test("session modes tune heat pressure and recovery", () => {
    const input = { throttle: 1, fire: true };
    const cozy = advanceTitanSystems(createInitialTitanState("playing", "cozy"), 1_000, input);
    const challenge = advanceTitanSystems(
      createInitialTitanState("playing", "challenge"),
      1_000,
      input
    );

    expect(challenge.heat).toBeGreaterThan(cozy.heat);
  });

  test("normalizes analog and binary control input", () => {
    expect(normalizeTitanControls({ throttle: 4, turn: -2, fire: true })).toEqual({
      throttle: 1,
      turn: -1,
      fire: true,
      brace: false,
      extract: false,
    });
  });

  test("calculates heading-aware heavy chassis forces", () => {
    const forces = calculateDriveForces(
      { throttle: 1, turn: 1, fire: false, brace: false, extract: false },
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
    expect(next.weaponFeedback).toBe("firing");
    expect(next.lastWeaponEventMs).toBeGreaterThan(0);
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

  test("describes contract route, extraction readiness, and cooling priority", () => {
    const base = createInitialTitanState("playing");
    const survey = calculateTitanContractCue({
      extraction: base.extraction,
      heat: 0,
      objectiveProgress: 0,
      position: base.pose.position,
    });
    const ready = calculateTitanContractCue({
      extraction: base.extraction,
      heat: 24,
      objectiveProgress: 100,
      position: { x: 44, y: 5, z: 44 },
    });
    const hot = calculateTitanContractCue({
      extraction: base.extraction,
      heat: 86,
      objectiveProgress: 100,
      position: { x: 44, y: 5, z: 44 },
    });
    const complete = calculateTitanContractCue({
      extraction: {
        ...base.extraction,
        credits: CONFIG.CONTRACT_CREDITS_TARGET,
      },
      heat: 20,
      objectiveProgress: 100,
      position: { x: 44, y: 5, z: 44 },
    });

    expect(survey.stage).toBe("survey");
    expect(survey.nextBeaconLabel).toBe("BETA");
    expect(survey.bearing.z).toBeGreaterThan(0);
    expect(ready.stage).toBe("extract");
    expect(ready.extractorReady).toBe(true);
    expect(hot.stage).toBe("cool");
    expect(hot.heatWarning).toBe(true);
    expect(complete.stage).toBe("complete");
  });

  test("describes nearby threat attack lanes before impact range", () => {
    const clear = calculateTitanThreatCue({ x: 110, y: 5, z: 110 });
    const warning = calculateTitanThreatCue({ x: 20, y: 5, z: 55 });
    const impact = calculateTitanThreatCue({ x: 0, y: 5, z: 72 });

    expect(clear.level).toBe("clear");
    expect(warning.level).toBe("warning");
    expect(warning.label).toContain("attack lane");
    expect(impact.level).toBe("impact");
    expect(impact.bearing.z).toBeGreaterThan(0);
  });

  test("vents a coolant burst from a defensive brace at high heat", () => {
    const hot = { ...createInitialTitanState("playing"), heat: 64, coolantCharge: 100 };
    const burst = advanceTitanSystems(hot, 500, { brace: true }, {});

    expect(burst.coolantBurstMs).toBeGreaterThan(0);
    expect(burst.coolantCharge).toBe(0);
    expect(burst.heat).toBeLessThan(hot.heat);
    expect(burst.weaponFeedback).toBe("cooling");
    expect(burst.objective).toContain("Coolant burst");
  });

  test("classifies weapon feedback for dry fire and overheating", () => {
    expect(
      getWeaponFeedbackState({
        coolantActive: false,
        energy: 100,
        firingAllowed: false,
        heat: 20,
        requestedFire: false,
      })
    ).toBe("idle");
    expect(
      getWeaponFeedbackState({
        coolantActive: false,
        energy: 100,
        firingAllowed: true,
        heat: 20,
        requestedFire: true,
      })
    ).toBe("firing");
    expect(
      getWeaponFeedbackState({
        coolantActive: false,
        energy: 0,
        firingAllowed: false,
        heat: 20,
        requestedFire: true,
      })
    ).toBe("dry");
    expect(
      getWeaponFeedbackState({
        coolantActive: false,
        energy: 100,
        firingAllowed: false,
        heat: 94,
        requestedFire: true,
      })
    ).toBe("overheated");
    expect(
      getWeaponFeedbackState({
        coolantActive: true,
        energy: 100,
        firingAllowed: false,
        heat: 50,
        requestedFire: false,
      })
    ).toBe("cooling");
  });

  test("resets transient weapon and extraction timers when feedback returns idle", () => {
    const active = {
      ...createInitialTitanState("playing"),
      lastWeaponEventMs: 640,
      weaponFeedback: "firing" as const,
      extraction: {
        ...createInitialTitanState("playing").extraction,
        feedback: "grinding" as const,
        lastExtractionEventMs: 480,
      },
    };
    const next = advanceTitanSystems(active, 100, {}, {});

    expect(next.weaponFeedback).toBe("idle");
    expect(next.lastWeaponEventMs).toBe(0);
    expect(next.extraction.feedback).toBe("idle");
    expect(next.extraction.lastExtractionEventMs).toBe(0);
  });

  test("allows natural cooling while extract is held but overheated", () => {
    const hot = { ...createInitialTitanState("playing"), heat: 92, coolantCharge: 0 };
    const next = advanceTitanSystems(
      hot,
      1_000,
      { extract: true },
      {
        position: { x: 44, y: 5, z: 44 },
        heading: 0,
        velocity: { x: 0, y: 0, z: 0 },
      }
    );

    expect(next.extraction.feedback).toBe("blocked");
    expect(next.heat).toBeLessThan(hot.heat);
  });

  test("grinds pylon ore into the hopper and converts a full hopper into credits", () => {
    const state = createInitialTitanState("playing");
    const grinding = advanceTitanSystems(
      state,
      1_000,
      { extract: true },
      {
        position: { x: 44, y: 5, z: 44 },
        heading: 0,
        velocity: { x: 0, y: 0, z: 0 },
      }
    );

    expect(grinding.extraction.feedback).toBe("grinding");
    expect(grinding.extraction.hopperLoad).toBeGreaterThan(0);
    expect(grinding.energy).toBeLessThan(state.energy);
    expect(grinding.heat).toBeGreaterThan(state.heat);
    expect(grinding.objective).toContain("Extractor grinding");

    const nearlyFull = {
      ...grinding,
      extraction: {
        ...grinding.extraction,
        hopperLoad: grinding.extraction.hopperCapacity - 2,
      },
    };
    const sold = advanceTitanSystems(
      nearlyFull,
      1_000,
      { extract: true },
      {
        position: { x: 44, y: 5, z: 44 },
        heading: 0,
        velocity: { x: 0, y: 0, z: 0 },
      }
    );

    expect(sold.extraction.feedback).toBe("ejecting");
    expect(sold.extraction.hopperLoad).toBe(0);
    expect(sold.extraction.credits).toBeGreaterThan(grinding.extraction.credits);
    expect(sold.extraction.lastPayoutMs).toBeGreaterThan(0);
    expect(sold.deliveryCue.state).toBe("ejecting");
    expect(sold.scrap).toBeGreaterThan(grinding.scrap);

    const bankedCue = calculateTitanDeliveryCue({
      extraction: {
        ...sold.extraction,
        feedback: "idle",
        lastPayoutMs: 2400,
      },
      phase: "playing",
    });
    expect(bankedCue.state).toBe("banked");
    expect(bankedCue.label).toContain("Cube banked");
  });

  test("overheat damage is recoverable but can destroy the chassis if ignored", () => {
    const hot = {
      ...createInitialTitanState("playing"),
      heat: 100,
      hp: 8,
    };
    const destroyed = advanceTitanSystems(hot, 2_000, { throttle: 1 }, {});

    expect(destroyed.hp).toBeLessThan(hot.hp);
    expect(destroyed.phase).toBe("gameover");
  });

  test("completes a contract when enough ore credits are banked", () => {
    const almostDone = {
      ...createInitialTitanState("playing"),
      extraction: {
        ...createInitialTitanState("playing").extraction,
        credits: CONFIG.CONTRACT_CREDITS_TARGET - CONFIG.HOPPER_CAPACITY * CONFIG.ORE_CREDIT_VALUE,
        hopperLoad: CONFIG.HOPPER_CAPACITY - 1,
      },
    };
    const completed = advanceTitanSystems(
      almostDone,
      1_000,
      { extract: true },
      {
        position: { x: 44, y: 5, z: 44 },
        heading: 0,
        velocity: { x: 0, y: 0, z: 0 },
      }
    );

    expect(completed.phase).toBe("upgrade");
    expect(completed.deliveryCue.state).toBe("complete");
    expect(completed.extraction.credits).toBe(CONFIG.CONTRACT_CREDITS_TARGET);
    expect(getTitanRunSummary(completed)).toMatchObject({
      contractCreditsTarget: CONFIG.CONTRACT_CREDITS_TARGET,
      credits: CONFIG.CONTRACT_CREDITS_TARGET,
    });
  });
});
