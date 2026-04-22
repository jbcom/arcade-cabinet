import { cleanup } from "@testing-library/react";
import { afterEach, test } from "vitest";
import { verifyBrowserGameStartFlow } from "../../../src/test/browserGameHarness";
import Game from "./Game";

afterEach(() => {
  cleanup();
});

test("Voxel Realms reaches gameplay from the start screen", async () => {
  await verifyBrowserGameStartFlow({
    Component: Game,
    title: "Voxel Realms",
    startFlow: ["Enter Realm"],
    ready: "HP",
    expectsCanvas: true,
  });
});
