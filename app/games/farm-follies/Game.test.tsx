import { verifyBrowserGameStartFlow } from "@app/test/browserGameHarness";
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

test("Farm Follies reaches gameplay from the mode-aware cartridge start", async () => {
  await verifyBrowserGameStartFlow({
    Component: Game,
    ready: "Banked",
    startFlow: ["Start Stacking"],
    title: "FARM FOLLIES",
  });
});

test("Farm Follies shows a collapse payoff with scattered animal tokens", async () => {
  await page.viewport(1280, 720);
  render(
    <div data-testid="game-host" style={{ width: "100svw", height: "100svh", overflow: "hidden" }}>
      <Game />
    </div>
  );

  await userEvent.click(page.getByText("Challenge"));
  await userEvent.click(page.getByText("Start Stacking"));

  for (
    let drop = 0;
    drop < 24 && !/Tower (Down|Tilted)/.test(document.body.textContent ?? "");
    drop += 1
  ) {
    await userEvent.click(page.getByText("Drop Right"));
  }

  await waitFor(() => {
    expect(document.body.textContent).toMatch(/Tower (Down|Tilted)/);
  });

  const screenshot = await page.screenshot({
    base64: true,
    path: "../../../test-screenshots/games/farm-follies-collapse-desktop.png",
  });
  expect(screenshot.base64.length).toBeGreaterThan(5000);
});
