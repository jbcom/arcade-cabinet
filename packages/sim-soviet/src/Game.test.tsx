import { cleanup } from "@testing-library/react";
import { afterEach, test } from "vitest";
import { verifyBrowserGameStartFlow } from "../../../src/test/browserGameHarness";
import Game from "./Game";

afterEach(() => {
  cleanup();
});

test("Sim Soviet reaches gameplay from the start screen", async () => {
  await verifyBrowserGameStartFlow({
    Component: Game,
    title: "Sim Soviet 3000",
    startFlow: ["Begin the Plan"],
    ready: "Quota progress",
    expectsCanvas: true,
  });
});
