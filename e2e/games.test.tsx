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
  verifyBrowserGameStartFlow,
} from "../src/test/browserGameHarness";

const gameCases: (BrowserGameStartFlow & { name: string })[] = [
  {
    name: "Bioluminescent Sea",
    Component: BioluminescentSea,
    title: "COLLECTOR",
    startFlow: ["Start Descent"],
    ready: "Time",
    expectsCanvas: true,
  },
  {
    name: "Cosmic Gardener",
    Component: CosmicGardener,
    title: "Cosmic Gardener",
    startFlow: ["Begin the Journey", "Play Ball"],
    ready: "Cosmic Energy",
  },
  {
    name: "Enchanted Forest",
    Component: EnchantedForest,
    title: "START",
    startFlow: ["START"],
    ready: /WAVE/,
  },
  {
    name: "Entropy Edge",
    Component: EntropyEdge,
    title: "Entropy's Edge",
    startFlow: ["Initialize Link"],
    ready: /RESONANCE/,
    expectsCanvas: true,
  },
  {
    name: "Gridizen",
    Component: Gridizen,
    title: "Gridizen",
    startFlow: ["Found a Settlement"],
    ready: "Data Lens",
    expectsCanvas: true,
  },
  {
    name: "Mega Track",
    Component: MegaTrack,
    title: "Mega Track",
    startFlow: ["Start Race"],
    ready: /Speed:/,
    expectsCanvas: true,
  },
  {
    name: "Otterly Chaotic",
    Component: OtterlyChaotic,
    title: "Otterly Chaotic",
    startFlow: ["Start Sprint"],
    ready: "Bark Pulse",
    expectsCanvas: true,
  },
  {
    name: "Primordial Ascent",
    Component: PrimordialAscent,
    title: "PRIMORDIAL ASCENT",
    startFlow: ["Initiate Sequence"],
    ready: "Altitude",
    expectsCanvas: true,
  },
  {
    name: "Protocol SNW",
    Component: ProtocolSnw,
    title: "PROTOCOL: SILENT NIGHT",
    startFlow: ["Engage"],
    ready: "INTEGRITY",
    expectsCanvas: true,
  },
  {
    name: "Reach for the Sky",
    Component: ReachForTheSky,
    title: "REACH FOR THE SKY",
    startFlow: ["Break Ground"],
    ready: /DAY/,
    expectsCanvas: true,
  },
  {
    name: "Realmwalker",
    Component: Realmwalker,
    title: "REALMWALKER",
    startFlow: ["Enter the Shifting Realm"],
    ready: "VITALITY",
    expectsCanvas: true,
  },
  {
    name: "Sim Soviet",
    Component: SimSoviet,
    title: "Sim Soviet 3000",
    startFlow: ["Begin the Plan"],
    ready: "Quota progress",
    expectsCanvas: true,
  },
  {
    name: "Titan Mech",
    Component: TitanMech,
    title: "TITAN MECH OS",
    startFlow: ["Engage Chassis"],
    ready: "SYSTEM INTEGRITY",
    expectsCanvas: true,
  },
  {
    name: "Voxel Realms",
    Component: VoxelRealms,
    title: "Voxel Realms",
    startFlow: ["Enter Realm"],
    ready: "HP",
    expectsCanvas: true,
  },
];

afterEach(() => {
  cleanup();
});

describe("browser game e2e smoke flows", () => {
  test.each(gameCases)("$name reaches gameplay through the public start flow", async (game) => {
    await verifyBrowserGameStartFlow(game);
  });
});
