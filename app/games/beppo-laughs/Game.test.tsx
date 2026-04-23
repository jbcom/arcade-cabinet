import { verifyBrowserGameStartFlow } from "@app/test/browserGameHarness";
import { cleanup } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import Game from "./Game";

afterEach(() => {
  cleanup();
});

test("Beppo Laughs reaches gameplay from the mode-aware cartridge start", async () => {
  const { rootElement } = await verifyBrowserGameStartFlow({
    Component: Game,
    ready: "Fear",
    startFlow: ["Enter Tent"],
    title: "BEPPO LAUGHS",
  });

  expect(rootElement.textContent).toContain("Route Cue");
  expect(rootElement.textContent).toContain("Center Ring");
});
