import BioluminescentSea from "@arcade-cabinet/bioluminescent-sea";
import CosmicGardener from "@arcade-cabinet/cosmic-gardener";
import EnchantedForest from "@arcade-cabinet/enchanted-forest";
import EntropyEdge from "@arcade-cabinet/entropy-edge";
import Gridizen from "@arcade-cabinet/gridizen";
import MegaTrack from "@arcade-cabinet/mega-track";
import OtterlyChaotic from "@arcade-cabinet/otterly-chaotic";
import PrimordialAscent from "@arcade-cabinet/primordial-ascent";
import ProtocolSnw from "@arcade-cabinet/protocol-snw";
import ReachForTheSky from "@arcade-cabinet/reach-for-the-sky";
import Realmwalker from "@arcade-cabinet/realmwalker";
import SimSoviet from "@arcade-cabinet/sim-soviet";
import TitanMech from "@arcade-cabinet/titan-mech";
import VoxelRealms from "@arcade-cabinet/voxel-realms";
import { cleanup } from "@testing-library/react";
import { afterEach, describe, test } from "vitest";
import {
  type BrowserGameStartFlow,
  type BrowserGameViewport,
  captureBrowserGameScreenshot,
  verifyBrowserGameStartFlow,
} from "../src/test/browserGameHarness";

const gameCases: (BrowserGameStartFlow & { name: string; slug: string })[] = [
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
  },
  {
    name: "Otterly Chaotic",
    slug: "otterly-chaotic",
    Component: OtterlyChaotic,
    title: "Otterly Chaotic",
    startFlow: ["Start Sprint"],
    ready: "Bark Pulse",
    expectsCanvas: true,
  },
  {
    name: "Primordial Ascent",
    slug: "primordial-ascent",
    Component: PrimordialAscent,
    title: "PRIMORDIAL ASCENT",
    startFlow: ["Initiate Sequence"],
    ready: "Altitude",
    expectsCanvas: true,
  },
  {
    name: "Protocol SNW",
    slug: "protocol-snw",
    Component: ProtocolSnw,
    title: "PROTOCOL: SILENT NIGHT",
    startFlow: ["Engage"],
    ready: "INTEGRITY",
    expectsCanvas: true,
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
  },
  {
    name: "Voxel Realms",
    slug: "voxel-realms",
    Component: VoxelRealms,
    title: "Voxel Realms",
    startFlow: ["Enter Realm"],
    ready: "HP",
    expectsCanvas: true,
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
