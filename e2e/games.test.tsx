import BioluminescentSea from "@app/games/bioluminescent-sea";
import CosmicGardener from "@app/games/cosmic-gardener";
import EnchantedForest from "@app/games/enchanted-forest";
import EntropyEdge from "@app/games/entropy-edge";
import Gridizen from "@app/games/gridizen";
import MegaTrack from "@app/games/mega-track";
import OtterlyChaotic from "@app/games/otterly-chaotic";
import PrimordialAscent from "@app/games/primordial-ascent";
import ProtocolSnw from "@app/games/protocol-snw";
import ReachForTheSky from "@app/games/reach-for-the-sky";
import Realmwalker from "@app/games/realmwalker";
import SimSoviet from "@app/games/sim-soviet";
import TitanMech from "@app/games/titan-mech";
import VoxelRealms from "@app/games/voxel-realms";
import {
  type BrowserGameStartFlow,
  type BrowserGameViewport,
  captureBrowserGameScreenshot,
  verifyBrowserGameStartFlow,
} from "@app/test/browserGameHarness";
import { cleanup, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

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
    name: "Cosmic Gardener",
    slug: "cosmic-gardener",
    Component: CosmicGardener,
    title: "Cosmic Gardener",
    startFlow: ["Begin the Journey", "Play Ball"],
    ready: "Cosmic Energy",
  },
  {
    name: "Enchanted Forest",
    slug: "enchanted-forest",
    Component: EnchantedForest,
    title: "START",
    startFlow: ["START"],
    ready: /WAVE/,
  },
  {
    name: "Entropy Edge",
    slug: "entropy-edge",
    Component: EntropyEdge,
    title: "Entropy's Edge",
    startFlow: ["Initialize Link"],
    ready: /RESONANCE/,
    expectsCanvas: true,
    expectsJoystick: true,
  },
  {
    name: "Gridizen",
    slug: "gridizen",
    Component: Gridizen,
    title: "Gridizen",
    startFlow: ["Found a Settlement"],
    ready: "Data Lens",
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
    name: "Otterly Chaotic",
    slug: "otterly-chaotic",
    Component: OtterlyChaotic,
    title: "Otterly Chaotic",
    startFlow: ["Start Sprint"],
    ready: "Bark Pulse",
    expectsCanvas: true,
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
    name: "Protocol SNW",
    slug: "protocol-snw",
    Component: ProtocolSnw,
    title: "PROTOCOL: SILENT NIGHT",
    startFlow: ["Engage"],
    ready: "INTEGRITY",
    expectsCanvas: true,
    expectsJoystick: true,
  },
  {
    name: "Reach for the Sky",
    slug: "reach-for-the-sky",
    Component: ReachForTheSky,
    title: "REACH FOR THE SKY",
    startFlow: ["Break Ground"],
    ready: /DAY/,
    expectsCanvas: true,
  },
  {
    name: "Realmwalker",
    slug: "realmwalker",
    Component: Realmwalker,
    title: "REALMWALKER",
    startFlow: ["Enter the Shifting Realm"],
    ready: "VITALITY",
    expectsCanvas: true,
    expectsJoystick: true,
  },
  {
    name: "Sim Soviet",
    slug: "sim-soviet",
    Component: SimSoviet,
    title: "Sim Soviet 3000",
    startFlow: ["Begin the Plan"],
    ready: "Quota progress",
    expectsCanvas: true,
  },
  {
    name: "Titan Mech",
    slug: "titan-mech",
    Component: TitanMech,
    title: "TITAN MECH OS",
    startFlow: ["Engage Chassis"],
    ready: "SYSTEM INTEGRITY",
    expectsCanvas: true,
    expectsJoystick: true,
  },
  {
    name: "Voxel Realms",
    slug: "voxel-realms",
    Component: VoxelRealms,
    title: "Voxel Realms",
    startFlow: ["Enter Realm"],
    ready: "HP",
    expectsCanvas: true,
    expectsJoystick: true,
  },
];

const screenshotViewports: BrowserGameViewport[] = [
  { name: "desktop", width: 1280, height: 720 },
  { name: "mobile", width: 390, height: 844 },
];

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
