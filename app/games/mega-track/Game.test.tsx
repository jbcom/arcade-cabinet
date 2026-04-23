import { verifyBrowserGameStartFlow } from "@app/test/browserGameHarness";
import { cleanup } from "@testing-library/react";
import { afterEach, test } from "vitest";
import Game from "./Game";

afterEach(() => {
  cleanup();
});

test("Mega Track reaches gameplay from the start screen", async () => {
  await verifyBrowserGameStartFlow({
    Component: Game,
    title: "Mega Track",
    startFlow: ["Start Race"],
    ready: /Leg 1\/3/,
    expectsCanvas: true,
  });
});
