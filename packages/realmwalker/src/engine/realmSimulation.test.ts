import { describe, expect, test } from "vitest";
import {
  advanceRealmState,
  calculateMovementVelocity,
  createInitialRealmState,
  createRealmLayout,
  getZonePalette,
  normalizeMovement,
} from "./realmSimulation";
import { CONFIG } from "./types";

describe("realm simulation", () => {
  test("creates a full initial state for menu and gameplay", () => {
    const menu = createInitialRealmState();
    const playing = createInitialRealmState("playing");

    expect(menu.phase).toBe("menu");
    expect(playing.phase).toBe("playing");
    expect(playing.hp).toBe(playing.maxHp);
    expect(playing.loot).toEqual([]);
    expect(playing.movement).toEqual({ x: 0, z: 0 });
  });

  test("creates deterministic realm layout and zone palettes", () => {
    const layout = createRealmLayout(2);

    expect(layout).toEqual(createRealmLayout(2));
    expect(layout.pillars).toHaveLength(12);
    expect(layout.pathSlabs).toHaveLength(11);
    expect(layout.relics.map((relic) => relic.name)).toEqual([
      "Moonlit Lens II",
      "Ashen Compass II",
      "Violet Key II",
    ]);
    expect(getZonePalette(1).accent).not.toBe(getZonePalette(2).accent);
  });

  test("normalizes movement and keeps diagonal velocity clamped to move speed", () => {
    const input = normalizeMovement({ x: 5, z: -2 });
    const velocity = calculateMovementVelocity(input);

    expect(input).toEqual({ x: 1, z: -1 });
    expect(Math.hypot(velocity.x, velocity.z)).toBeCloseTo(CONFIG.MOVE_SPEED);
  });

  test("collects nearby relics once and updates score and attack", () => {
    const state = createInitialRealmState("playing");
    const relic = createRealmLayout(1).relics[0];
    expect(relic).toBeDefined();

    const next = advanceRealmState(state, {
      player: { x: relic?.position[0] ?? 0, y: 1, z: relic?.position[2] ?? 0 },
    });
    const again = advanceRealmState(next, {
      player: { x: relic?.position[0] ?? 0, y: 1, z: relic?.position[2] ?? 0 },
    });

    expect(next.loot).toEqual(["Moonlit Lens I"]);
    expect(next.atk).toBe(state.atk + 2);
    expect(next.score).toBeGreaterThan(state.score);
    expect(again.loot).toEqual(next.loot);
  });

  test("crosses the portal into the next zone", () => {
    const state = createInitialRealmState("playing");
    const next = advanceRealmState(state, {
      player: { x: 0, y: 7, z: -42 },
      movement: { z: -1 },
    });

    expect(next.zone).toBe(2);
    expect(next.score).toBeGreaterThanOrEqual(120);
    expect(next.objective).toContain("Zone 2");
    expect(next.movement).toEqual({ x: 0, z: -1 });
  });
});
