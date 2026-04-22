import { describe, expect, test } from "vitest";
import { GRID_SIZE } from "./types";
import { createInitialState, handleInteraction, initMap, setTool, tickGame } from "./logic";

describe("gridizen logic", () => {
  test("initializes a full map", () => {
    const state = initMap(createInitialState());

    expect(state.grid).toHaveLength(GRID_SIZE * GRID_SIZE);
  });

  test("places buildings only when the selected tool and terrain allow it", () => {
    let state = initMap(createInitialState());
    const tile = state.grid.find((entry) => entry.terrain !== "FOREST");
    expect(tile).toBeDefined();

    state = setTool(state, "ROAD");
    const next = handleInteraction(state, tile!.x, tile!.z);

    expect(next.grid[tile!.z * GRID_SIZE + tile!.x].building).toBe("ROAD");
    expect(next.funds).toBe(state.funds - 10);
  });

  test("ticks time without mutating an empty map", () => {
    const state = createInitialState();

    expect(tickGame(state)).toBe(state);
  });
});
