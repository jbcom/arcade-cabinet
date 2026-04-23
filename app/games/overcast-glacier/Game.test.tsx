import { writeGameSaveSlot } from "@app/shared/hooks/useCabinetRuntime";
import { verifyBrowserGameStartFlow } from "@app/test/browserGameHarness";
import {
  createInitialOvercastState,
  createOvercastSegmentCue,
} from "@logic/games/overcast-glacier/engine/overcastSimulation";
import { OVERCAST_CONFIG } from "@logic/games/overcast-glacier/engine/types";
import type { SerializableValue } from "@logic/shared";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import Game from "./Game";

beforeEach(() => {
  localStorage.clear();
});

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

test("Overcast Glacier presents the aurora runout finish from a saved final segment", async () => {
  await page.viewport(1280, 720);
  const nearFinish = {
    ...createInitialOvercastState("playing", "standard"),
    timeMs: OVERCAST_CONFIG.RUN_TARGET_MS - 700,
    warmth: 84,
    score: 4200,
    segmentIndex: OVERCAST_CONFIG.TARGET_SEGMENTS - 1,
    segmentProgress: 0.99,
    segmentsCleared: OVERCAST_CONFIG.TARGET_SEGMENTS - 1,
    entities: [],
  };
  nearFinish.segmentCue = createOvercastSegmentCue({
    entities: nearFinish.entities,
    playerLane: nearFinish.playerLane,
    segmentIndex: nearFinish.segmentIndex,
    segmentProgress: nearFinish.segmentProgress,
    warmth: nearFinish.warmth,
  });
  writeGameSaveSlot({
    label: "Resume Aurora Runout",
    mode: "standard",
    progressSummary: "Aurora Runout",
    slug: "overcast-glacier",
    startedAt: "2026-04-22T00:00:00.000Z",
    status: "active",
    updatedAt: "2026-04-22T00:00:01.000Z",
    snapshot: nearFinish as unknown as SerializableValue,
  });

  render(
    <div data-testid="game-host" style={{ width: "100svw", height: "100svh", overflow: "hidden" }}>
      <Game />
    </div>
  );

  await userEvent.click(page.getByText("Resume Aurora Runout"));

  await waitFor(
    () => {
      expect(document.body.textContent).toContain("Aurora Runout Cleared");
    },
    { timeout: 5000 }
  );

  const screenshot = await page.screenshot({
    base64: true,
    path: "../../../test-screenshots/games/overcast-glacier-finish-desktop.png",
  });
  expect(screenshot.base64.length).toBeGreaterThan(5000);
});
