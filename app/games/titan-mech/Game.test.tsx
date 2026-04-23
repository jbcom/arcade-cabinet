import {
  captureBrowserGameScreenshot,
  verifyBrowserGameStartFlow,
} from "@app/test/browserGameHarness";
import { cleanup } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import Game from "./Game";

afterEach(() => {
  cleanup();
});

test("Titan Mech reaches gameplay from the start screen", async () => {
  const { host, rootElement } = await verifyBrowserGameStartFlow({
    Component: Game,
    title: "TITAN MECH: OVERHEAT",
    startFlow: ["Engage Chassis"],
    ready: "SYSTEM INTEGRITY",
    expectsCanvas: true,
  });

  expect(rootElement.textContent).toContain("CONTRACT");
  expect(rootElement.textContent).toContain("BETA");
  expect(rootElement.textContent).toContain("ENEMY");

  await captureBrowserGameScreenshot(
    host,
    rootElement,
    {
      name: "desktop",
      width: 1280,
      height: 720,
    },
    "test-screenshots/components/titan-mech-extraction-rig.png"
  );
});
