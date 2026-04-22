import { render } from "@testing-library/react";
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import Game from "./Game";

test("Voxel Realms game renders and is playable", async () => {
  const { getByText } = render(
    <div style={{ width: "100vw", height: "100vh" }}>
      <Game />
    </div>
  );

  await new Promise((resolve) => setTimeout(resolve, 500));
  await page.screenshot({ path: "test-screenshots/voxel-start.png" });

  const startButton = getByText("Enter Realm");
  await expect.element(startButton).toBeVisible();
  await startButton.click();

  await new Promise((resolve) => setTimeout(resolve, 2000));
  await page.screenshot({ path: "test-screenshots/voxel-gameplay.png" });

  const scoreLabel = getByText("Score:", { exact: false });
  await expect.element(scoreLabel).toBeVisible();
});
