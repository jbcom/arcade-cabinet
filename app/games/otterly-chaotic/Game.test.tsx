import { verifyBrowserGameStartFlow } from "@app/test/browserGameHarness";
import { cleanup } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import Game from "./Game";

afterEach(() => {
  cleanup();
});

test("Otterly Chaotic reaches gameplay from the start screen", async () => {
  const { container } = await verifyBrowserGameStartFlow({
    Component: Game,
    title: "Otterly Chaotic",
    startFlow: ["Start Sprint"],
    ready: "Bark Pulse",
    expectsCanvas: true,
  });

  expect(container.textContent).toContain("Otter:");
  expect(container.textContent).toContain("billy:");
});
