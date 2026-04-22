import { describe, expect, test } from "vitest";
import {
  advanceSNWState,
  calculatePlayerVelocity,
  calculateThreatPressure,
  createInitialSNWState,
  createProtocolArenaLayout,
  createWaveEnemies,
  normalizeSNWControls,
  resolveEnemyHit,
} from "./protocolSimulation";

describe("protocol simulation", () => {
  test("boots a deterministic playing state with authored wave enemies", () => {
    const state = createInitialSNWState("playing");

    expect(state.phase).toBe("playing");
    expect(state.enemies).toHaveLength(8);
    expect(state.enemies[0]?.id).toBe("w1-runner-1");
    expect(state.threat).toBeGreaterThan(0);
    expect(state.controls).toEqual({ x: 0, z: 0, dash: false, fire: false });
  });

  test("creates stable protocol arena layout data for scene rendering", () => {
    const layout = createProtocolArenaLayout();

    expect(layout).toEqual(createProtocolArenaLayout());
    expect(layout.rings).toEqual([8, 16, 24, 34]);
    expect(layout.perimeter).toHaveLength(12);
    expect(layout.cover).toHaveLength(8);
    expect(layout.terrain.length).toBeGreaterThan(40);
  });

  test("normalizes controls and computes dash-aware velocity", () => {
    const controls = normalizeSNWControls({ x: 5, z: -2, dash: true, fire: true });
    const velocity = calculatePlayerVelocity(controls, true);

    expect(controls).toEqual({ x: 1, z: -1, dash: true, fire: true });
    expect(Math.hypot(velocity.x, velocity.z)).toBeCloseTo(28);
  });

  test("advances enemies toward player, rolls waves, and never mutates input", () => {
    const state = createInitialSNWState("playing");
    const firstX = state.enemies[0]?.position.x ?? 0;
    const next = advanceSNWState(state, 1000, {
      player: { x: 0, y: 1, z: 0 },
      controls: { x: 1, dash: true },
    });

    expect(next).not.toBe(state);
    expect(next.enemies[0]?.position.x).not.toBe(firstX);
    expect(next.dashCooldownMs).toBeGreaterThan(0);
    expect(state.controls.dash).toBe(false);

    const cleared = advanceSNWState({ ...state, enemies: [] }, 16);
    expect(cleared.wave).toBe(2);
    expect(cleared.enemies).toEqual(createWaveEnemies(2));
  });

  test("resolves enemy hits, scoring, leveling, and pressure recalculation", () => {
    const state = {
      ...createInitialSNWState("playing"),
      xp: 4,
      xpNeeded: 5,
    };
    const target = state.enemies[0];
    expect(target).toBeDefined();

    const next = resolveEnemyHit(state, target?.id ?? "", target?.hp ?? 1);

    expect(next.kills).toBe(1);
    expect(next.score).toBe(target?.score);
    expect(next.level).toBe(2);
    expect(next.enemies.some((enemy) => enemy.id === target?.id)).toBe(false);
    expect(next.threat).toBe(calculateThreatPressure(next.enemies, next.player));
  });
});
