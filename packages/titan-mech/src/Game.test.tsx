import { render } from "@testing-library/react";
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import Game from "./Game";

test("Titan Mech game renders and is playable", async () => {
  const { getByText } = render(
    <div style={{ width: "100vw", height: "100vh" }}>
      <Game />
    </div>
  );

  await new Promise((resolve) => setTimeout(resolve, 500));
  await page.screenshot({ path: "test-screenshots/titan-start.png" });

  const startButton = getByText("Engage Chassis");
  await expect.element(startButton).toBeVisible();
  await startButton.click();

  await new Promise((resolve) => setTimeout(resolve, 2000));
  await page.screenshot({ path: "test-screenshots/titan-gameplay.png" });

  const scrapLabel = getByText("SCRAP:", { exact: false });
  await expect.element(scrapLabel).toBeVisible();
});
