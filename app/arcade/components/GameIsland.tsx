import { type ComponentType, type LazyExoticComponent, lazy, Suspense } from "react";
import { type GameSlug, gamesBySlug } from "../games/catalog";

type GameComponent = LazyExoticComponent<ComponentType>;

const gameComponents = {
  "bioluminescent-sea": lazy(() => import("@app/games/bioluminescent-sea")),
  "cosmic-gardener": lazy(() => import("@app/games/cosmic-gardener")),
  "enchanted-forest": lazy(() => import("@app/games/enchanted-forest")),
  "entropy-edge": lazy(() => import("@app/games/entropy-edge")),
  "mega-track": lazy(() => import("@app/games/mega-track")),
  "overcast-glacier": lazy(() => import("@app/games/overcast-glacier")),
  "otterly-chaotic": lazy(() => import("@app/games/otterly-chaotic")),
  "primordial-ascent": lazy(() => import("@app/games/primordial-ascent")),
  "titan-mech": lazy(() => import("@app/games/titan-mech")),
} satisfies Record<GameSlug, GameComponent>;

export const gameIslandSlugs = Object.keys(gameComponents) as GameSlug[];

interface GameIslandProps {
  slug: GameSlug;
}

export default function GameIsland({ slug }: GameIslandProps) {
  const Component = gameComponents[slug];
  const game = gamesBySlug[slug];

  return (
    <div style={{ width: "100%", height: "100%", minHeight: 0 }}>
      <Suspense
        fallback={
          <div
            style={{
              width: "100%",
              height: "100%",
              minHeight: 320,
              display: "grid",
              placeItems: "center",
              background: `${game.gradient}, #020617`,
              color: "#e2e8f0",
              fontFamily: "var(--font-mono), monospace",
              textTransform: "uppercase",
              border: `1px solid ${game.color}66`,
            }}
          >
            <span
              style={{
                background: "rgba(2,6,23,0.72)",
                border: `1px solid ${game.color}99`,
                padding: "0.75rem 1rem",
                boxShadow: `0 0 24px ${game.color}4d`,
              }}
            >
              Booting {game.title}
            </span>
          </div>
        }
      >
        <Component />
      </Suspense>
    </div>
  );
}
