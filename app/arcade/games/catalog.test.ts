import { describe, expect, test } from "vitest";
import { gameIslandSlugs } from "../components/GameIsland";
import { games } from "./catalog";

const expectedSlugs = [
  "bioluminescent-sea",
  "mega-track",
  "overcast-glacier",
  "otterly-chaotic",
  "primordial-ascent",
  "titan-mech",
  "beppo-laughs",
  "cognitive-dissonance",
  "farm-follies",
];

describe("arcade cabinet game catalog", () => {
  test("covers every game package in route order", () => {
    expect(games.map((game) => game.slug)).toEqual(expectedSlugs);
  });

  test("keeps the React game loader aligned with the catalog", () => {
    expect([...gameIslandSlugs].sort()).toEqual([...expectedSlugs].sort());
  });

  test("documents design intent for every playable game", () => {
    for (const game of games) {
      expect(game.pillars).toHaveLength(3);
      expect(game.presentation.length).toBeGreaterThan(40);
      expect(game.sceneDirection.length).toBeGreaterThan(40);
      expect(game.responsiveDirection.length).toBeGreaterThan(40);
      expect(game.coreMessage.length).toBeGreaterThan(30);
      expect(game.coreLoop.length).toBeGreaterThan(40);
      expect(game.sessionTarget).toContain("8-15");
      expect(game.pressureType.length).toBeGreaterThan(40);
      expect(game.defaultControls.length).toBeGreaterThan(30);
      expect(game.winReplayPromise.length).toBeGreaterThan(40);
      expect(game.difficultyVariants.map((variant) => variant.mode)).toEqual([
        "cozy",
        "standard",
        "challenge",
      ]);
    }
  });
});
