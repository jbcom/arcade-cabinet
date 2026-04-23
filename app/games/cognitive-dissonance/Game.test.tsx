import { writeGameSaveSlot } from "@app/shared/hooks/useCabinetRuntime";
import { verifyBrowserGameStartFlow } from "@app/test/browserGameHarness";
import {
  createInitialCognitiveState,
  getCognitiveModeTuning,
} from "@logic/games/cognitive-dissonance/engine/cognitiveSimulation";
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

test("Cognitive Dissonance reaches gameplay from the mode-aware cartridge start", async () => {
  await verifyBrowserGameStartFlow({
    Component: Game,
    expectsCanvas: true,
    ready: "Listening",
    startFlow: ["Stabilize Shift"],
    title: "COGNITIVE DISSONANCE",
  });
});

test("Cognitive Dissonance shows stable glass-lock ending payoff from a saved late shift", async () => {
  await page.viewport(1280, 720);
  const nearStable = {
    ...createInitialCognitiveState("standard", "playing"),
    coherence: 91,
    elapsedMs: getCognitiveModeTuning("standard").shiftDurationMs - 250,
    phaseLocks: 4,
    tension: 28,
  };
  writeGameSaveSlot({
    label: "Resume Clear Glass Lock",
    mode: "standard",
    progressSummary: "Clear Glass Lock",
    slug: "cognitive-dissonance",
    startedAt: "2026-04-22T00:00:00.000Z",
    status: "active",
    updatedAt: "2026-04-22T00:00:01.000Z",
    snapshot: nearStable as unknown as SerializableValue,
  });

  render(
    <div data-testid="game-host" style={{ width: "100svw", height: "100svh", overflow: "hidden" }}>
      <Game />
    </div>
  );

  await userEvent.click(page.getByText("Resume Clear Glass Lock"));

  await waitFor(
    () => {
      expect(document.body.textContent).toContain("Clear Glass Lock");
    },
    { timeout: 5000 }
  );

  const screenshot = await page.screenshot({
    base64: true,
    path: "../../../test-screenshots/games/cognitive-dissonance-stable-desktop.png",
  });
  expect(screenshot.base64.length).toBeGreaterThan(5000);
});

test("Cognitive Dissonance shows shatter ending payoff from a saved failed shift", async () => {
  await page.viewport(1280, 720);
  const nearShatter = {
    ...createInitialCognitiveState("standard", "playing"),
    coherence: 0,
    currentPattern: "cyan" as const,
    elapsedMs: getCognitiveModeTuning("standard").shiftDurationMs * 0.42,
    phaseLocks: 1,
    tension: 96,
  };
  writeGameSaveSlot({
    label: "Resume Shatter Trace",
    mode: "standard",
    progressSummary: "Shatter Trace",
    slug: "cognitive-dissonance",
    startedAt: "2026-04-22T00:00:00.000Z",
    status: "active",
    updatedAt: "2026-04-22T00:00:01.000Z",
    snapshot: nearShatter as unknown as SerializableValue,
  });

  render(
    <div data-testid="game-host" style={{ width: "100svw", height: "100svh", overflow: "hidden" }}>
      <Game />
    </div>
  );

  await userEvent.click(page.getByText("Resume Shatter Trace"));

  await waitFor(
    () => {
      expect(document.body.textContent).toContain("Shatter Trace");
    },
    { timeout: 5000 }
  );

  const screenshot = await page.screenshot({
    base64: true,
    path: "../../../test-screenshots/games/cognitive-dissonance-shattered-desktop.png",
  });
  expect(screenshot.base64.length).toBeGreaterThan(5000);
});
