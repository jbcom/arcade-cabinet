import { verifyBrowserGameStartFlow } from "@app/test/browserGameHarness";
import { cleanup } from "@testing-library/react";
import { afterEach, test } from "vitest";
import Game from "./Game";

afterEach(() => {
  cleanup();
});

test("Overcast Glacier reaches gameplay from the start screen", async () => {
  await verifyBrowserGameStartFlow({
    Component: Game,
    title: "OVERCAST: GLACIER",
    startFlow: ["Drop In"],
    ready: "Warmth",
  });
});
