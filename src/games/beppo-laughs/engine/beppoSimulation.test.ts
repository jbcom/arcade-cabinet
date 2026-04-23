import { describe, expect, test } from "vitest";
import {
  advanceBeppoTime,
  BEPPO_ESCAPE_VISIT_TARGET,
  createInitialBeppoState,
  getAvailableBeppoMoves,
  getBeppoEndingCue,
  getBeppoModeTuning,
  getBeppoRoomCue,
  getBeppoRouteCue,
  getBeppoRunSummary,
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
    state = moveBeppo(state, "south");
    state = moveBeppo(state, "east");
    state = moveBeppo(state, "north");
    state = moveBeppo(state, "east");
    state = moveBeppo(state, "north");
    state = moveBeppo(state, "east");
    state = moveBeppo(state, "south");
    state = moveBeppo(state, "east");
    state = moveBeppo(state, "east");
    state = moveBeppo(state, "west");
    state = moveBeppo(state, "west");
    state = moveBeppo(state, "west");
    state = moveBeppo(state, "north");

    expect(state.phase).toBe("escaped");
    expect(state.inventory).toEqual(["ticket", "mirror", "red-key"]);
    expect(getBeppoRunSummary(state).roomsMapped).toBeGreaterThanOrEqual(BEPPO_ESCAPE_VISIT_TARGET);
  });

  test("exit stays route-locked until enough rooms are mapped", () => {
    let state = createInitialBeppoState("standard", "playing");
    state = moveBeppo(state, "east");
    state = moveBeppo(state, "south");
    state = moveBeppo(state, "west");
    state = moveBeppo(state, "west");
    state = moveBeppo(state, "west");
    state = moveBeppo(state, "north");

    expect(state.phase).toBe("playing");
    expect(state.lastEvent).toContain("Map");
    expect(getAvailableBeppoMoves(state).some((move) => move.lockedByRouteMemory)).toBe(true);
  });

  test("one bad gate choice is recoverable in standard", () => {
    let state = createInitialBeppoState("standard", "playing");
    state = moveBeppo(state, "east");
    const blocked = moveBeppo(state, "north");
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
    ).toEqual(["east", "north", "west"]);
  });

  test("describes route memory, item gates, and recommended curtains", () => {
    const start = createInitialBeppoState("standard", "playing");
    const startCue = getBeppoRouteCue(start);

    expect(startCue.threatLevel).toBe("steady");
    expect(startCue.routeMemoryRemaining).toBe(BEPPO_ESCAPE_VISIT_TARGET - 1);
    expect(startCue.recommendedDirections.sort()).toEqual(["east", "north", "west"]);
    expect(startCue.requiredItemsRemaining).toEqual(["ticket", "mirror", "red-key"]);

    let mapped = moveBeppo(start, "north");
    mapped = moveBeppo(mapped, "south");
    mapped = moveBeppo(mapped, "east");
    mapped = moveBeppo(mapped, "north");
    mapped = moveBeppo(mapped, "east");
    mapped = moveBeppo(mapped, "north");

    const mappedCue = getBeppoRouteCue(mapped);
    expect(mappedCue.requiredItemsRemaining).toEqual(["red-key"]);
    expect(mappedCue.label).toContain("red clown-car key");
  });

  test("exposes distinct room lighting and late-maze identity cues", () => {
    const start = createInitialBeppoState("standard", "playing");
    const startRoomCue = getBeppoRoomCue(start);

    expect(startRoomCue).toMatchObject({
      mood: "opening",
      motif: "ring",
      roomDetail: "The first spotlight waits for a clean choice.",
    });

    let state = moveBeppo(start, "north");
    state = moveBeppo(state, "south");
    state = moveBeppo(state, "east");
    state = moveBeppo(state, "north");
    state = moveBeppo(state, "east");
    state = moveBeppo(state, "north");
    state = moveBeppo(state, "east");
    state = moveBeppo(state, "south");
    state = moveBeppo(state, "east");

    const lateCue = getBeppoRoomCue(state);
    expect(lateCue.mood).toBe("late-maze");
    expect(lateCue.spotlightCount).toBeGreaterThan(startRoomCue.spotlightCount);
    expect(lateCue.lightingBeat).toContain("last map beats");
  });

  test("exposes deterministic ending variants for clean exits, panic exits, and losses", () => {
    const cleanEscape = {
      ...createInitialBeppoState("standard", "escaped"),
      composure: 82,
      despair: 8,
      fear: 10,
      visitedRoomIds: Array.from(
        { length: BEPPO_ESCAPE_VISIT_TARGET },
        (_, index) => `room-${index}`
      ),
    };
    const panicEscape = {
      ...cleanEscape,
      composure: 38,
      despair: 26,
      fear: 36,
    };
    const loopLost = {
      ...createInitialBeppoState("standard", "lost"),
      composure: 0,
      despair: 64,
      fear: 36,
      visitedRoomIds: ["center-ring", "ticket-booth", "mirror-midway"],
    };
    const spiralLost = {
      ...loopLost,
      despair: 24,
      fear: 76,
    };

    expect(getBeppoEndingCue(cleanEscape).variant).toBe("clean-route");
    expect(getBeppoEndingCue(panicEscape).variant).toBe("panic-exit");
    expect(getBeppoEndingCue(loopLost).variant).toBe("loop-collapse");
    expect(getBeppoEndingCue(spiralLost).variant).toBe("laughing-spiral");
  });
});
