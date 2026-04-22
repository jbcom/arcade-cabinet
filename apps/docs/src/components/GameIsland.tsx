import { type ComponentType, type LazyExoticComponent, lazy, Suspense } from "react";
import { type GameSlug, gamesBySlug } from "../games/catalog";

type GameComponent = LazyExoticComponent<ComponentType>;

const gameComponents = {
  "bioluminescent-sea": lazy(() => import("@arcade-cabinet/bioluminescent-sea")),
  "cosmic-gardener": lazy(() => import("@arcade-cabinet/cosmic-gardener")),
  "enchanted-forest": lazy(() => import("@arcade-cabinet/enchanted-forest")),
  "entropy-edge": lazy(() => import("@arcade-cabinet/entropy-edge")),
  gridizen: lazy(() => import("@arcade-cabinet/gridizen")),
  "mega-track": lazy(() => import("@arcade-cabinet/mega-track")),
  "otterly-chaotic": lazy(() => import("@arcade-cabinet/otterly-chaotic")),
  "primordial-ascent": lazy(() => import("@arcade-cabinet/primordial-ascent")),
  "protocol-snw": lazy(() => import("@arcade-cabinet/protocol-snw")),
  "reach-for-the-sky": lazy(() => import("@arcade-cabinet/reach-for-the-sky")),
  realmwalker: lazy(() => import("@arcade-cabinet/realmwalker")),
  "sim-soviet": lazy(() => import("@arcade-cabinet/sim-soviet")),
  "titan-mech": lazy(() => import("@arcade-cabinet/titan-mech")),
  "voxel-realms": lazy(() => import("@arcade-cabinet/voxel-realms")),
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
