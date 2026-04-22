import { cleanup } from "@testing-library/react";
import { afterEach, test } from "vitest";
import { verifyBrowserGameStartFlow } from "../../../src/test/browserGameHarness";
import Game from "./Game";

afterEach(() => {
  cleanup();
});

test("Titan Mech reaches gameplay from the start screen", async () => {
  await verifyBrowserGameStartFlow({
    Component: Game,
    title: "TITAN MECH OS",
    startFlow: ["Engage Chassis"],
    ready: "SYSTEM INTEGRITY",
    expectsCanvas: true,
  });
});
