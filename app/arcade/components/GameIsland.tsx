import type { ComponentType, LazyExoticComponent } from "react";
import { type GameSlug, gamesBySlug } from "../games/catalog";

type GameComponent = LazyExoticComponent<ComponentType>;

/**
 * Every game that used to live in the cabinet has been extracted to
 * its own standalone repo under `arcade-cabinet/<slug>`. The cabinet
 * is being dissolved; the loader is intentionally empty.
 */
const gameComponents: Record<GameSlug, GameComponent> = {};

export const gameIslandSlugs = Object.keys(gameComponents) as GameSlug[];

interface GameIslandProps {
  slug: GameSlug;
}

export default function GameIsland({ slug }: GameIslandProps) {
  const Component = gameComponents[slug];
  const game = gamesBySlug[slug];

  if (!Component || !game) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          minHeight: 320,
          display: "grid",
          placeItems: "center",
          background: "#020617",
          color: "#e2e8f0",
          fontFamily: "var(--font-mono), monospace",
        }}
      >
        <span style={{ padding: "0.75rem 1rem" }}>
          This game has moved to its own repo under arcade-cabinet/{slug}.
        </span>
      </div>
    );
  }

  return null;
}
