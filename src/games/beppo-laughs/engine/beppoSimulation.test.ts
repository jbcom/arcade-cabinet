import { describe, expect, test } from "vitest";
import {
  advanceBeppoTime,
  createInitialBeppoState,
  getAvailableBeppoMoves,
  getBeppoModeTuning,
  moveBeppo,
  recoverBeppoAfterMistake,
} from "./beppoSimulation";

describe("Beppo Laughs couch-friendly maze logic", () => {
  test("defines gentler standard pressure than challenge", () => {
    expect(getBeppoModeTuning("standard").passiveFearPerMinute).toBeLessThan(
      getBeppoModeTuning("challenge").passiveFearPerMinute
    );
    expect(getBeppoModeTuning("cozy").recoveryPerItem).toBeGreaterThan(
      getBeppoModeTuning("standard").recoveryPerItem
    );
  });

  test("standard mode cannot fail from passive pressure inside the first minute", () => {
    const state = createInitialBeppoState("standard", "playing");
    const afterMinute = advanceBeppoTime(state, 60_000);

    expect(afterMinute.phase).toBe("playing");
    expect(afterMinute.composure).toBeGreaterThan(90);
  });

  test("items unlock route gates and allow a deterministic escape", () => {
    let state = createInitialBeppoState("standard", "playing");
    state = moveBeppo(state, "north");
    state = moveBeppo(state, "east");
    state = moveBeppo(state, "south");
    state = moveBeppo(state, "south");
    state = moveBeppo(state, "west");
    state = moveBeppo(state, "north");

    expect(state.phase).toBe("escaped");
    expect(state.inventory).toEqual(["ticket", "mirror", "red-key"]);
  });

  test("one bad gate choice is recoverable in standard", () => {
    let state = createInitialBeppoState("standard", "playing");
    state = moveBeppo(state, "east");
    state = moveBeppo(state, "north");
    const blocked = moveBeppo(state, "east");
    const recovered = recoverBeppoAfterMistake(blocked);

    expect(blocked.phase).toBe("playing");
    expect(recovered.composure).toBeGreaterThan(blocked.composure);
  });

  test("exposes readable junction choices", () => {
    const state = createInitialBeppoState("standard", "playing");

    expect(
      getAvailableBeppoMoves(state)
        .map((move) => move.direction)
        .sort()
    ).toEqual(["east", "north"]);
  });
});
