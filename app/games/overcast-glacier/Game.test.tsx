import { verifyBrowserGameStartFlow } from "@app/test/browserGameHarness";
import { cleanup } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import Game from "./Game";

afterEach(() => {
  cleanup();
});

test("Overcast Glacier reaches gameplay from the start screen", async () => {
  const { rootElement } = await verifyBrowserGameStartFlow({
    Component: Game,
    title: "OVERCAST: GLACIER",
    startFlow: ["Drop In"],
    ready: "Warmth",
  });

  expect(rootElement.textContent).toContain("Hazard Ribbon");
  expect(rootElement.textContent).toContain("Segment 1/6");
});
