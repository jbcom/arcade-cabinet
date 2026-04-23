import { describe, expect, test } from "vitest";
import { gameIslandSlugs } from "../components/GameIsland";
import { games } from "./catalog";

const expectedSlugs = [
  "bioluminescent-sea",
  "cosmic-gardener",
  "enchanted-forest",
  "entropy-edge",
  "gridizen",
  "mega-track",
  "otterly-chaotic",
  "primordial-ascent",
  "protocol-snw",
  "reach-for-the-sky",
  "realmwalker",
  "sim-soviet",
  "titan-mech",
  "voxel-realms",
];

describe("Astro cabinet game catalog", () => {
  test("covers every game package in route order", () => {
    expect(games.map((game) => game.slug)).toEqual(expectedSlugs);
  });

  test("keeps the React island loader aligned with the catalog", () => {
    expect([...gameIslandSlugs].sort()).toEqual([...expectedSlugs].sort());
  });

  test("documents design intent for every playable game", () => {
    for (const game of games) {
      expect(game.pillars).toHaveLength(3);
      expect(game.presentation.length).toBeGreaterThan(40);
      expect(game.sceneDirection.length).toBeGreaterThan(40);
      expect(game.responsiveDirection.length).toBeGreaterThan(40);
    }
  });
});
