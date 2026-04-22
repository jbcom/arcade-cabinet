import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import Game from "./Game";

test("Realmwalker game renders and is playable", async () => {
  const { getByText } = render(
    <div style={{ width: "100vw", height: "100vh" }}>
      <Game />
    </div>
  );

  await new Promise((resolve) => setTimeout(resolve, 500));
  await page.screenshot({ path: "test-screenshots/realm-start.png" });

  const startButton = getByText("Enter the Shifting Realm");
  await expect.element(startButton).toBeVisible();
  await startButton.click();

  // Wait for 3D world to initialize
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await page.screenshot({ path: "test-screenshots/realm-gameplay.png" });

  const zoneLabel = getByText("ZONE", { exact: false });
  await expect.element(zoneLabel).toBeVisible();
});
