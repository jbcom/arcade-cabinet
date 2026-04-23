import { verifyBrowserGameStartFlow } from "@app/test/browserGameHarness";
import { cleanup } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import Game from "./Game";

afterEach(() => {
  cleanup();
});

test("Primordial Ascent reaches gameplay from the start screen", async () => {
  const { container } = await verifyBrowserGameStartFlow({
    Component: Game,
    title: "PRIMORDIAL ASCENT",
    startFlow: ["Initiate Sequence"],
    ready: "Altitude",
    expectsCanvas: true,
  });

  expect(container.textContent).toContain("Route Cue");
  expect(container.textContent).toContain("Target");
  expect(container.textContent).toContain("Grip Guide");
  expect(container.textContent).toContain("Look at cyan, hold Grip");
});
