import { type CartridgeMotif, CircularGallery, useResponsive } from "@app/shared";
import type { MouseEvent } from "react";
import { flushSync } from "react-dom";
import { useNavigate } from "react-router-dom";
import { games } from "../games/catalog";
import { withBasePath } from "../utils/basePath";

export default function ArcadeGallery() {
  const { isMobile, isPortrait } = useResponsive();
  const navigate = useNavigate();
  const radius = isMobile ? (isPortrait ? 260 : 340) : 560;
  const items = games.map((game, index) => ({
    binomial: `Cabinet slot ${String(index + 1).padStart(2, "0")}`,
    color: game.color,
    common: game.title,
    description: game.description,
    href: withBasePath(`/games/${game.slug}`),
    cartridge: {
      accent: game.color,
      cartridgeId: `Slot ${String(index + 1).padStart(2, "0")}`,
      description: game.description,
      kicker: "Cabinet Cartridge",
      motif: getCartridgeMotif(game.slug),
      secondaryAccent: getSecondaryAccent(game.slug),
      title: game.title,
    },
    onActivate: (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      launchGameFromGallery(event, game.slug, navigate);
    },
  }));

  return (
    <section
      id="games"
      className="relative min-h-[170svh] overflow-clip bg-[#07070b] text-white sm:min-h-[190svh]"
    >
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 12%, rgba(56,189,248,0.22), transparent 34%), linear-gradient(180deg, rgba(15,23,42,0.16), rgba(2,6,23,0.96)), repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 64px)",
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-[34%]"
          style={{
            background:
              "linear-gradient(180deg, transparent, rgba(0,0,0,0.82)), repeating-linear-gradient(90deg, rgba(236,72,153,0.24) 0 3px, transparent 3px 9vw)",
            clipPath: "polygon(0 42%, 100% 20%, 100% 100%, 0 100%)",
          }}
        />
        <header className="relative z-10 mx-auto w-full max-w-5xl px-5 pt-8 text-center sm:pt-12">
          <div className="font-mono text-[0.68rem] font-black uppercase tracking-[0.34em] text-cyan-200/70">
            Select Cabinet
          </div>
          <h2 className="mt-3 font-display text-4xl font-black uppercase leading-none tracking-normal sm:text-6xl">
            Choose A World
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
            Scroll the marquee, pick a cabinet card, and launch directly into the game.
          </p>
        </header>
        <div className="relative z-10 min-h-0 flex-1">
          <CircularGallery
            items={items}
            radius={radius}
            autoRotateSpeed={isMobile ? 0.012 : 0.018}
          />
        </div>
      </div>
    </section>
  );
}

type NavigateFunction = ReturnType<typeof useNavigate>;
type ViewTransitionDocument = Document & {
  startViewTransition?: (updateCallback: () => void) => { finished: Promise<void> };
};

function launchGameFromGallery(
  event: MouseEvent<HTMLAnchorElement>,
  slug: string,
  navigate: NavigateFunction
) {
  const label = event.currentTarget.querySelector<HTMLElement>("[data-cartridge-label]");
  label?.style.setProperty("view-transition-name", "active-cartridge-label");

  const route = `/games/${slug}`;
  const viewTransitionDocument = document as ViewTransitionDocument;
  const runNavigation = () => flushSync(() => navigate(route));

  if (!viewTransitionDocument.startViewTransition) {
    runNavigation();
    return;
  }

  const transition = viewTransitionDocument.startViewTransition(runNavigation);
  transition.finished.finally(() => {
    label?.style.removeProperty("view-transition-name");
  });
}

function getCartridgeMotif(slug: string): CartridgeMotif {
  switch (slug) {
    case "bioluminescent-sea":
      return "sea";
    case "cosmic-gardener":
      return "cosmic";
    case "enchanted-forest":
      return "forest";
    case "entropy-edge":
      return "entropy";
    case "mega-track":
      return "track";
    case "otterly-chaotic":
      return "otter";
    case "primordial-ascent":
      return "primordial";
    case "titan-mech":
      return "mech";
    default:
      return "voxel";
  }
}

function getSecondaryAccent(slug: string) {
  switch (slug) {
    case "bioluminescent-sea":
      return "#a78bfa";
    case "cosmic-gardener":
      return "#ec4899";
    case "enchanted-forest":
      return "#fbbf24";
    case "entropy-edge":
      return "#ff0055";
    case "mega-track":
      return "#facc15";
    case "otterly-chaotic":
      return "#84cc16";
    case "primordial-ascent":
      return "#ff3333";
    case "titan-mech":
      return "#f59e0b";
    default:
      return "#38bdf8";
  }
}
