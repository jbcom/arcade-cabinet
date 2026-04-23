import { verifyBrowserGameStartFlow } from "@app/test/browserGameHarness";
import { cleanup } from "@testing-library/react";
import { afterEach, test } from "vitest";
import Game from "./Game";

afterEach(() => {
  cleanup();
});

test("Enchanted Forest reaches gameplay from the start screen", async () => {
  await verifyBrowserGameStartFlow({
    Component: Game,
    title: "START",
    startFlow: ["START"],
    ready: /GROVE CHORUS/,
  });
});
