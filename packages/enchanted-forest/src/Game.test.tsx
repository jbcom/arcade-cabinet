import { render } from "vitest-browser-react";
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import Game from "./Game";

test("Enchanted Forest renders and is playable", async () => {
  const { getByText } = render(
    <div style={{ width: '100vw', height: '100vh' }}>
      <Game />
    </div>
  );
  
  await new Promise((resolve) => setTimeout(resolve, 500));
  await page.screenshot({ path: "test-screenshots/forest-start.png" });

  const startButton = getByText("START");
  await expect.element(startButton).toBeVisible();
  await startButton.click();

  await new Promise((resolve) => setTimeout(resolve, 1000));
  await page.screenshot({ path: "test-screenshots/forest-gameplay.png" });

  const waveLabel = getByText("WAVE", { exact: false });
  await expect.element(waveLabel).toBeVisible();
});
