import { verifyBrowserGameStartFlow } from "@app/test/browserGameHarness";
import { createInitialState, createObstacleRun } from "@logic/games/mega-track/engine/simulation";
import { CONFIG } from "@logic/games/mega-track/engine/types";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import { page } from "vitest/browser";
import Game from "./Game";
import { TrackScene } from "./r3f/TrackScene";
import { HUD } from "./ui/HUD";

afterEach(() => {
  cleanup();
});

test("Mega Track reaches gameplay from the start screen", async () => {
  await verifyBrowserGameStartFlow({
    Component: Game,
    title: "Mega Track",
    startFlow: ["Start Race"],
    ready: /Leg 1\/3/,
    expectsCanvas: true,
  });
});

test("Mega Track renders the second-leg Service Canyon scenery band", async () => {
  await page.viewport(1280, 720);
  const distance = CONFIG.GOAL_DISTANCE / 3 + 1600;
  const state = {
    ...createInitialState("standard"),
    distance,
    isPlaying: true,
    obstacles: createObstacleRun(distance, CONFIG.OBSTACLE_LOOKAHEAD),
  };

  render(
    <div data-testid="game-host" style={{ width: "100svw", height: "100svh", overflow: "hidden" }}>
      <TrackScene state={state} />
      <HUD state={state} onLaneControl={() => undefined} />
    </div>
  );

  await expect.element(page.getByText("Service Canyon")).toBeVisible();
  await waitFor(() => {
    expect(document.querySelector("canvas")).not.toBeNull();
  });
  await new Promise((resolve) => window.setTimeout(resolve, 1000));
  const screenshot = await page.screenshot({
    base64: true,
    path: "../../../test-screenshots/games/mega-track-service-canyon-desktop.png",
  });

  expect(screenshot.base64.length).toBeGreaterThan(5000);
});
