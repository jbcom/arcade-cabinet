import { describe, expect, test } from "vitest";
import { createInitialState, placeBuilding, selectTool, tickSimulation } from "./Simulation";

describe("sim soviet simulation", () => {
  test("places the selected building and recomputes derived state", () => {
    const state = selectTool(createInitialState(), "housing");
    const next = placeBuilding(state, 0, 0);

    expect(next).not.toBe(state);
    expect(next.funds).toBe(state.funds - 20);
    expect(next.population).toBeGreaterThan(state.population);
  });

  test("does not place buildings without enough funds", () => {
    const state = { ...selectTool(createInitialState(), "power"), funds: 0 };

    expect(placeBuilding(state, 0, 0)).toBe(state);
  });

  test("advances calendar and quota in monthly ticks", () => {
    const state = createInitialState();
    const next = tickSimulation(state, 1_500);

    expect(next.month).toBe(2);
    expect(next.year).toBe(1980);
    expect(next.morale).toBeGreaterThan(0);
    expect(next.quotaProgress).toBe(state.quotaProgress + 4 + Math.floor(state.morale / 35));
  });
});
