import { describe, expect, test } from "vitest";
import { createInitialState, handleInteraction, initMap, setTool, tickGame } from "./logic";
import { GRID_SIZE } from "./types";

describe("gridizen logic", () => {
  test("initializes a full map", () => {
    const state = initMap(createInitialState());

    expect(state.grid).toHaveLength(GRID_SIZE * GRID_SIZE);
  });

  test("places buildings only when the selected tool and terrain allow it", () => {
    let state = initMap(createInitialState());
    const tile = state.grid.find((entry) => entry.terrain !== "FOREST");
    if (!tile) {
      throw new Error("Expected the generated map to include at least one buildable tile.");
    }

    state = setTool(state, "ROAD");
    const next = handleInteraction(state, tile.x, tile.z);

    expect(next.grid[tile.z * GRID_SIZE + tile.x].building).toBe("ROAD");
    expect(next.funds).toBe(state.funds - 10);
  });

  test("ticks time without mutating an empty map", () => {
    const state = createInitialState();

    expect(tickGame(state)).toBe(state);
  });
});
