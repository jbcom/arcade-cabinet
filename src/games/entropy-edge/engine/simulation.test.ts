import { describe, expect, test } from "vitest";
import {
  cellKey,
  chooseFallingBlockCell,
  createInitialBlockedCells,
  createInitialFallingBlocks,
  createSectorCells,
  didLose,
  didWin,
  findNearestBlockedCell,
  generateNode,
  getStabilityBand,
  getTargetVector,
  startGame,
  tick,
} from "./simulation";

describe("entropy simulation", () => {
  test("starts a playable sector with a target anchor", () => {
    const state = startGame({} as never);

    expect(state.phase).toBe("playing");
    expect(state.sessionMode).toBe("standard");
    expect(state.targetNode).not.toBeNull();
    expect(state.anchorsRequired).toBe(3);
    expect(state.blockedCells.length).toBeGreaterThan(0);
    expect(state.fallingBlocks.length).toBeGreaterThan(0);
    expect(startGame({} as never)).toEqual(state);
  });

  test("uses couch-friendly standard reserves and opt-in challenge pressure", () => {
    const standard = startGame({} as never, "standard");
    const challenge = startGame({} as never, "challenge");
    const afterMinute = tick(standard, 60_000, { x: 0, y: 0 });

    expect(standard.timeMs).toBeGreaterThan(60_000);
    expect(challenge.timeMs).toBeLessThan(standard.timeMs);
    expect(didLose(afterMinute)).toBe(false);
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
    expect(next.shockwaves[0].id).toBe("sw-1-1");
  });

  test("uses max resonance to clear the nearest landed block after securing an anchor", () => {
    const state = startGame({} as never);
    state.targetNode = { id: "target", gridX: 1, gridZ: 0 };
    state.blockedCells = ["2,0", "-5,-5"];
    state.isResonanceMax = true;
    state.resonance = 1;

    expect(findNearestBlockedCell(state.blockedCells, 1, 0)).toBe("2,0");

    const next = tick(state, 250, { x: 1, y: 0 });

    expect(next.lastSurgeClearedKey).toBe("2,0");
    expect(next.blockedCells).not.toContain("2,0");
  });

  test("reports loss only for depleted active sectors", () => {
    expect(didLose({ phase: "playing", timeMs: 0 } as never)).toBe(true);
    expect(didLose({ phase: "menu", timeMs: 0 } as never)).toBe(false);
  });

  test("chooses deterministic anchors and blocked cell layouts", () => {
    const node = generateNode(["0,0"], 0, 0, 2, 4);
    const again = generateNode(["0,0"], 0, 0, 2, 4);
    const protectedKeys = ["0,0", cellKey(node.gridX, node.gridZ)];
    const blocked = createInitialBlockedCells(2, protectedKeys);
    const falling = createInitialFallingBlocks(2, [...protectedKeys, ...blocked]);

    expect(node).toEqual(again);
    expect(blocked).toHaveLength(5);
    expect(blocked).not.toContain(cellKey(node.gridX, node.gridZ));
    expect(falling.map((block) => block.id)).toEqual(["blk-seed-2-0", "blk-seed-2-1"]);
  });

  test("spawns falling blocks from available cells without randomness", () => {
    const state = startGame({} as never);
    const pick = chooseFallingBlockCell({ ...state, elapsedMs: 4_200, eventCount: 2 });
    const again = chooseFallingBlockCell({ ...state, elapsedMs: 4_200, eventCount: 2 });

    expect(pick).toEqual(again);
    expect(pick).not.toBeNull();
    expect(state.blockedCells).not.toContain(cellKey(pick?.x ?? 0, pick?.y ?? 0));
  });

  test("describes sector cells, target vector, and stability bands", () => {
    const cells = createSectorCells();
    const state = startGame({} as never);
    const vector = getTargetVector(state);

    expect(cells).toHaveLength(121);
    expect(cells.some((cell) => cell.unstable)).toBe(true);
    expect(vector.distance).toBeGreaterThanOrEqual(3);
    expect(vector.label).toContain("cells");
    expect(getStabilityBand(20_000)).toBe("stable");
    expect(getStabilityBand(8_000)).toBe("unstable");
    expect(getStabilityBand(3_000)).toBe("critical");
  });
});
