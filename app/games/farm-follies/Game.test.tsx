import { verifyBrowserGameStartFlow } from "@app/test/browserGameHarness";
import { cleanup } from "@testing-library/react";
import { afterEach, test } from "vitest";
import Game from "./Game";

afterEach(() => {
  cleanup();
});

test("Farm Follies reaches gameplay from the mode-aware cartridge start", async () => {
  await verifyBrowserGameStartFlow({
    Component: Game,
    ready: "Banked",
    startFlow: ["Start Stacking"],
    title: "FARM FOLLIES",
  });
});
