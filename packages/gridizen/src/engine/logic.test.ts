import { describe, expect, test } from "vitest";
import {
  CIVIC_CENTER,
  createInitialState,
  handleInteraction,
  initMap,
  setTool,
  shouldGrowTile,
  tickGame,
} from "./logic";
import { GRID_SIZE } from "./types";

describe("gridizen logic", () => {
  test("initializes a full map", () => {
    const state = initMap(createInitialState());

    expect(state.grid).toHaveLength(GRID_SIZE * GRID_SIZE);
  });

  test("initializes a deterministic starter settlement with working civic services", () => {
    const first = initMap(createInitialState());
    const second = initMap(createInitialState());
    const tileAt = (dx: number, dz: number) =>
      first.grid[(CIVIC_CENTER.z + dz) * GRID_SIZE + CIVIC_CENTER.x + dx];

    expect(first).toEqual(second);
    expect(tileAt(7, 0)?.building).toBe("POWER");
    expect(tileAt(-7, 0)?.building).toBe("WATER_PUMP");
    expect(tileAt(0, 4)?.building).toBe("PARK");
    expect(tileAt(0, 0)?.building).toBe("ROAD");
    expect(first.population).toBeGreaterThan(0);
    expect(first.powerMax).toBeGreaterThan(first.powerUse);
    expect(first.waterMax).toBeGreaterThan(first.waterUse);
    expect(first.grid.filter((tile) => tile.warning !== "NONE")).toHaveLength(0);
  });

  test("places buildings only when the selected tool and terrain allow it", () => {
    let state = initMap(createInitialState());
    const tile = state.grid.find(
      (entry) => entry.terrain !== "FOREST" && entry.building === "NONE"
    );
    if (!tile) {
      throw new Error("Expected the generated map to include at least one buildable tile.");
    }

    state = setTool(state, "ROAD");
    const next = handleInteraction(state, tile.x, tile.z);

    expect(next.grid[tile.z * GRID_SIZE + tile.x].building).toBe("ROAD");
    expect(next.funds).toBe(state.funds - 10);
  });

  test("ticks deterministic service state and zone growth without random inputs", () => {
    const initial = initMap(createInitialState());
    const growthCandidate = initial.grid.find(
      (tile) =>
        tile.building === "RESIDENTIAL" &&
        tile.roadAccess &&
        tile.powered &&
        tile.watered &&
        shouldGrowTile(tile, 9, initial.population)
    );

    expect(growthCandidate).toBeDefined();

    const firstTick = tickGame(initial);
    const repeatedTick = tickGame(initMap(createInitialState()));

    expect(firstTick).toEqual(repeatedTick);
    expect(firstTick.population).toBeGreaterThanOrEqual(initial.population);
    if (growthCandidate) {
      const updated = firstTick.grid[growthCandidate.id];
      expect(updated.level).toBe(growthCandidate.level + 1);
    }
  });

  test("ticks time without mutating an empty map", () => {
    const state = createInitialState();

    expect(tickGame(state)).toBe(state);
  });
});
