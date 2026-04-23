import { describe, expect, test } from "vitest";
import { gameIslandSlugs } from "../components/GameIsland";
import { games } from "./catalog";

describe("arcade cabinet game catalog", () => {
  test("catalog is empty after unconsolidation", () => {
    expect(games).toEqual([]);
  });

  test("React game loader has no registered games", () => {
    expect(gameIslandSlugs).toEqual([]);
  });
});
