import { cleanup } from "@testing-library/react";
import { afterEach, test } from "vitest";
import { verifyBrowserGameStartFlow } from "../../../src/test/browserGameHarness";
import Game from "./Game";

afterEach(() => {
  cleanup();
});

test("Gridizen reaches gameplay from the start screen", async () => {
  await verifyBrowserGameStartFlow({
    Component: Game,
    title: "Gridizen",
    startFlow: ["Found a Settlement"],
    ready: "Data Lens",
    expectsCanvas: true,
  });
});
