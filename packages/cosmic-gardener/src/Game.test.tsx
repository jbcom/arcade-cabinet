import { cleanup } from "@testing-library/react";
import { afterEach, test } from "vitest";
import { verifyBrowserGameStartFlow } from "../../../src/test/browserGameHarness";
import Game from "./Game";

afterEach(() => {
  cleanup();
});

test("Cosmic Gardener reaches gameplay after onboarding", async () => {
  await verifyBrowserGameStartFlow({
    Component: Game,
    title: "Cosmic Gardener",
    startFlow: ["Begin the Journey", "Play Ball"],
    ready: "Cosmic Energy",
  });
});
