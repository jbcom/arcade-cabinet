import { describe, expect, test } from "vitest";
import { didLose, didWin, startGame, tick } from "./simulation";

describe("entropy simulation", () => {
  test("starts a playable sector with a target anchor", () => {
    const state = startGame({} as never);

    expect(state.phase).toBe("playing");
    expect(state.targetNode).not.toBeNull();
    expect(state.anchorsRequired).toBe(3);
  });

  test("secures an anchor when the player reaches the target cell", () => {
    const state = startGame({} as never);
    state.targetNode = { id: "target", gridX: 1, gridZ: 0 };

    const next = tick(state, 250, { x: 1, y: 0 });

    expect(next.playerGridX).toBe(1);
    expect(next.anchorsSecuredThisLevel).toBe(1);
    expect(next.totalAnchors).toBe(1);
    expect(next.score).toBeGreaterThan(0);
    expect(didWin(next)).toBe(false);
  });

  test("reports loss only for depleted active sectors", () => {
    expect(didLose({ phase: "playing", timeMs: 0 } as never)).toBe(true);
    expect(didLose({ phase: "menu", timeMs: 0 } as never)).toBe(false);
  });
});
