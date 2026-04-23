import BeppoLaughs from "@app/games/beppo-laughs";
import BioluminescentSea from "@app/games/bioluminescent-sea";
import CognitiveDissonance from "@app/games/cognitive-dissonance";
import FarmFollies from "@app/games/farm-follies";
import MegaTrack from "@app/games/mega-track";
import OvercastGlacier from "@app/games/overcast-glacier";
import PrimordialAscent from "@app/games/primordial-ascent";
import TitanMech from "@app/games/titan-mech";
import {
  type BrowserGameStartFlow,
  type BrowserGameViewport,
  captureBrowserGameScreenshot,
  verifyBrowserGameStartFlow,
} from "@app/test/browserGameHarness";
import { cleanup, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

const gameCases: (BrowserGameStartFlow & {
  name: string;
  slug: string;
  expectsJoystick?: boolean;
})[] = [
  {
    name: "Bioluminescent Sea",
    slug: "bioluminescent-sea",
    Component: BioluminescentSea,
    title: "COLLECTOR",
    startFlow: ["Start Descent"],
    ready: "Time",
    expectsCanvas: true,
  },
  {
    name: "Mega Track",
    slug: "mega-track",
    Component: MegaTrack,
    title: "Mega Track",
    startFlow: ["Start Race"],
    ready: /Speed:/,
    expectsCanvas: true,
    expectsJoystick: true,
  },
  {
    name: "Overcast Glacier",
    slug: "overcast-glacier",
    Component: OvercastGlacier,
    title: "OVERCAST: GLACIER",
    startFlow: ["Drop In"],
    ready: "Warmth",
    expectsJoystick: true,
  },
  {
    name: "Primordial Ascent",
    slug: "primordial-ascent",
    Component: PrimordialAscent,
    title: "PRIMORDIAL ASCENT",
    startFlow: ["Initiate Sequence"],
    ready: "Altitude",
    expectsCanvas: true,
    expectsJoystick: true,
  },
  {
    name: "Titan Mech",
    slug: "titan-mech",
    Component: TitanMech,
    title: "TITAN MECH: OVERHEAT",
    startFlow: ["Engage Chassis"],
    ready: "SYSTEM INTEGRITY",
    expectsCanvas: true,
    expectsJoystick: true,
  },
  {
    name: "Beppo Laughs",
    slug: "beppo-laughs",
    Component: BeppoLaughs,
    title: "BEPPO LAUGHS",
    startFlow: ["Enter Tent"],
    ready: "Fear",
  },
  {
    name: "Cognitive Dissonance",
    slug: "cognitive-dissonance",
    Component: CognitiveDissonance,
    title: "COGNITIVE DISSONANCE",
    startFlow: ["Stabilize Shift"],
    ready: "Coherence",
    expectsCanvas: true,
  },
  {
    name: "Farm Follies",
    slug: "farm-follies",
    Component: FarmFollies,
    title: "FARM FOLLIES",
    startFlow: ["Start Stacking", "Drop Center", "Drop Center"],
    ready: "Banked",
  },
];

const screenshotViewports: BrowserGameViewport[] = [
  { name: "desktop", width: 1280, height: 720 },
  { name: "mobile", width: 390, height: 844 },
];

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanupBrowserRender();
});

describe("browser game e2e flows and visual captures", () => {
  test.each(
    gameCases
  )("$name reaches gameplay and captures responsive screenshots", async (game) => {
    const { host, rootElement } = await verifyBrowserGameStartFlow(game);

    if (game.expectsJoystick) {
      await verifyFloatingJoystick(rootElement);
    }

    for (const viewport of screenshotViewports) {
      await captureBrowserGameScreenshot(
        host,
        rootElement,
        viewport,
        `test-screenshots/games/${game.slug}-${viewport.name}.png`
      );
    }
  }, 90_000);
});

function cleanupBrowserRender() {
  for (const canvas of document.querySelectorAll("canvas")) {
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  }

  cleanup();
}

async function verifyFloatingJoystick(rootElement: Element) {
  await waitFor(() => {
    expect(rootElement.querySelector('[data-floating-joystick="true"]')).not.toBeNull();
  });
  await new Promise((resolve) => requestAnimationFrame(resolve));

  const rect = rootElement.getBoundingClientRect();
  const pointerId = 41;
  const originX = rect.left + Math.min(180, rect.width * 0.42);
  const originY = rect.top + Math.min(360, rect.height * 0.58);

  rootElement.dispatchEvent(
    new PointerEvent("pointerdown", {
      bubbles: true,
      clientX: originX,
      clientY: originY,
      isPrimary: true,
      pointerId,
      pointerType: "touch",
    })
  );
  window.dispatchEvent(
    new PointerEvent("pointermove", {
      clientX: originX + 44,
      clientY: originY - 30,
      isPrimary: true,
      pointerId,
      pointerType: "touch",
    })
  );

  await waitFor(() => {
    expect(document.querySelector('[data-testid="floating-joystick"]')).not.toBeNull();
  });

  window.dispatchEvent(
    new PointerEvent("pointerup", {
      clientX: originX + 44,
      clientY: originY - 30,
      isPrimary: true,
      pointerId,
      pointerType: "touch",
    })
  );
}
