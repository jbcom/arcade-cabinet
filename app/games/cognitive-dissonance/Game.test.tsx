import { verifyBrowserGameStartFlow } from "@app/test/browserGameHarness";
import { cleanup } from "@testing-library/react";
import { afterEach, test } from "vitest";
import Game from "./Game";

afterEach(() => {
  cleanup();
});

test("Cognitive Dissonance reaches gameplay from the mode-aware cartridge start", async () => {
  await verifyBrowserGameStartFlow({
    Component: Game,
    expectsCanvas: true,
    ready: "Coherence",
    startFlow: ["Stabilize Shift"],
    title: "COGNITIVE DISSONANCE",
  });
});
