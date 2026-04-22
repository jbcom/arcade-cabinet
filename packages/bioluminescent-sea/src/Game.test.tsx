import { cleanup } from "@testing-library/react";
import { afterEach, test } from "vitest";
import { verifyBrowserGameStartFlow } from "../../../src/test/browserGameHarness";
import Game from "./Game";

afterEach(() => {
  cleanup();
});

test("Bioluminescent Sea reaches gameplay from the landing screen", async () => {
  await verifyBrowserGameStartFlow({
    Component: Game,
    title: "COLLECTOR",
    startFlow: ["Start Descent"],
    ready: "Time",
    expectsCanvas: true,
  });
});
