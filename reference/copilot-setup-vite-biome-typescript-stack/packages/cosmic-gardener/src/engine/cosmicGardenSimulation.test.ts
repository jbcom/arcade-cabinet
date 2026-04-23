import { describe, expect, test } from "vitest";
import { CONSTELLATIONS } from "./constellations";
import {
  advanceEnergyNetwork,
  advancePinballOrb,
  calculateComboMultiplier,
  calculateGrowthStage,
  calculateResonanceBloomBonus,
  calculateStarHitScore,
  createDeterministicVoidZones,
  createEnergyStream,
  createPinballOrb,
  createStarSeed,
  createStarterGarden,
  resolveOrbStarCollision,
} from "./cosmicGardenSimulation";

const lyra = CONSTELLATIONS[0];

describe("cosmic garden simulation", () => {
  test("calculates star growth stages from energy ratios", () => {
    expect(calculateGrowthStage(20, 100)).toBe(0);
    expect(calculateGrowthStage(30, 100)).toBe(1);
    expect(calculateGrowthStage(60, 100)).toBe(2);
    expect(calculateGrowthStage(90, 100)).toBe(3);
  });

  test("creates deterministic starter stars aligned to the current constellation", () => {
    const starter = createStarterGarden(lyra, 1);
    const again = createStarterGarden(lyra, 1);

    expect(starter).toEqual(again);
    expect(starter.stars).toHaveLength(lyra.points.length);
    expect(starter.completedPoints).toEqual(new Set(lyra.points.map((point) => point.id)));
    expect(starter.starPointMatches.get("nursery-lyra-l1")).toBe("l1");
    expect(new Set(starter.stars.map((star) => star.growthStage))).toContain(1);
  });

  test("generates deterministic void zones without runtime randomness", () => {
    expect(createDeterministicVoidZones(3)).toEqual(createDeterministicVoidZones(3));
    expect(createDeterministicVoidZones(12)).toHaveLength(4);
    expect(createDeterministicVoidZones(3)[0]).toMatchObject({
      drainRate: 1.1,
      radius: expect.any(Number),
      x: expect.any(Number),
      y: expect.any(Number),
    });
  });

  test("advances energy streams without mutating input stars", () => {
    const from = createStarSeed({ energy: 50, id: "from", x: 20, y: 30 });
    const to = createStarSeed({ energy: 20, id: "to", x: 50, y: 30 });
    const stars = new Map([
      [from.id, from],
      [to.id, to],
    ]);
    const streams = new Map([
      [createEnergyStream("from", "to").id, createEnergyStream("from", "to")],
    ]);
    const next = advanceEnergyNetwork(stars, streams, 4);

    expect(next.get("from")?.energy).toBe(42);
    expect(next.get("to")?.energy).toBe(28);
    expect(stars.get("from")?.energy).toBe(50);
  });

  test("calculates hit chains and star hit scoring", () => {
    expect(calculateComboMultiplier(0, 1_000, 4)).toBe(1);
    expect(calculateComboMultiplier(1_000, 2_500, 1)).toBe(1.5);
    expect(calculateComboMultiplier(1_000, 2_500, 5)).toBe(5);
    expect(calculateStarHitScore(2, 1.5)).toBe(450);
    expect(calculateResonanceBloomBonus(3, 2)).toBe(1500);
  });

  test("creates and advances pinball orbs through walls, flippers, and drains", () => {
    const orb = { ...createPinballOrb("orb-1", 2, 90, -30, 5), vx: -2 };
    const wallBounce = advancePinballOrb(orb, {
      delta: 1,
      leftFlipper: false,
      rightFlipper: false,
    });

    expect(wallBounce.orb.x).toBe(3);
    expect(wallBounce.orb.vx).toBeGreaterThan(0);

    const flipperHit = advancePinballOrb(
      { ...orb, vx: 0, vy: 1, x: 25, y: 90 },
      { delta: 1, leftFlipper: true, rightFlipper: false }
    );

    expect(flipperHit.orb.y).toBe(87);
    expect(flipperHit.orb.vy).toBe(-12);

    const drained = advancePinballOrb(
      { ...orb, vx: 0, vy: 3, x: 50, y: 99 },
      { delta: 1, leftFlipper: false, rightFlipper: false }
    );
    expect(drained.drained).toBe(true);
    expect(drained.orb.active).toBe(false);
  });

  test("resolves star bumper collisions and preserves non-collisions", () => {
    const orb = { ...createPinballOrb("orb-1", 49, 50, 0, 2), vx: 3, vy: 0 };
    const star = createStarSeed({ energy: 90, id: "star", x: 50, y: 50 });
    const collision = resolveOrbStarCollision(orb, star);

    expect(collision.hit).toBe(true);
    expect(collision.orb.vx).toBeLessThan(0);
    expect(resolveOrbStarCollision({ ...orb, x: 20, y: 20 }, star).hit).toBe(false);
  });
});
