import BioluminescentSea from "@app/games/bioluminescent-sea";
import CosmicGardener from "@app/games/cosmic-gardener";
import EnchantedForest from "@app/games/enchanted-forest";
import EntropyEdge from "@app/games/entropy-edge";
import MegaTrack from "@app/games/mega-track";
import OtterlyChaotic from "@app/games/otterly-chaotic";
import OvercastGlacier from "@app/games/overcast-glacier";
import PrimordialAscent from "@app/games/primordial-ascent";
import TitanMech from "@app/games/titan-mech";
import type { TextMatcher } from "@app/test/browserGameHarness";
import { cleanup, render } from "@testing-library/react";
import type { ComponentType } from "react";
import { afterEach, describe, expect, test } from "vitest";
import { page } from "vitest/browser";

const landingCases: {
  Component: ComponentType;
  slug: string;
  title: TextMatcher;
}[] = [
  {
    Component: BioluminescentSea,
    slug: "bioluminescent-sea",
    title: "COLLECTOR",
  },
  {
    Component: CosmicGardener,
    slug: "cosmic-gardener",
    title: "Cosmic Gardener",
  },
  {
    Component: EnchantedForest,
    slug: "enchanted-forest",
    title: "START",
  },
  {
    Component: EntropyEdge,
    slug: "entropy-edge",
    title: "Entropy's Edge",
  },
  {
    Component: MegaTrack,
    slug: "mega-track",
    title: "Mega Track",
  },
  {
    Component: OvercastGlacier,
    slug: "overcast-glacier",
    title: "OVERCAST: GLACIER",
  },
  {
    Component: OtterlyChaotic,
    slug: "otterly-chaotic",
    title: "Otterly Chaotic",
  },
  {
    Component: PrimordialAscent,
    slug: "primordial-ascent",
    title: "PRIMORDIAL ASCENT",
  },
  {
    Component: TitanMech,
    slug: "titan-mech",
    title: "TITAN MECH: OVERHEAT",
  },
];

const landingViewports = [
  { name: "desktop", width: 1280, height: 720 },
  { name: "mobile", width: 390, height: 844 },
];

afterEach(() => {
  cleanupBrowserRender();
});

describe("game cartridge landing captures", () => {
  test.each(landingCases)("$slug renders a responsive cartridge landing", async (game) => {
    for (const viewport of landingViewports) {
      await page.viewport(viewport.width, viewport.height);

      const { container } = render(
        <div
          data-testid="game-host"
          style={{ width: "100svw", height: "100svh", overflow: "hidden" }}
        >
          <game.Component />
        </div>
      );

      await expect.element(page.getByText(game.title)).toBeVisible();

      const host = container.querySelector('[data-testid="game-host"]');
      expect(host).not.toBeNull();

      await new Promise((resolve) => window.setTimeout(resolve, 320));
      const screenshot = await page.screenshot({
        base64: true,
        element: host as Element,
        path: `../test-screenshots/landings/${game.slug}-${viewport.name}.png`,
      });

      expect(screenshot.base64.length).toBeGreaterThan(5_000);
      cleanupBrowserRender();
    }
  }, 60_000);
});

function cleanupBrowserRender() {
  for (const canvas of document.querySelectorAll("canvas")) {
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  }

  cleanup();
}
