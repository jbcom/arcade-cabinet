import { expect, test } from "@playwright/test";

test("sim soviet loads and starts", async ({ page }) => {
  await page.goto("/games/sim-soviet");
  // client:only="react" — wait for JS bundle to hydrate the island
  await expect(page.getByTestId("start-screen")).toBeVisible({ timeout: 20_000 });
  await page.getByRole("button", { name: "Begin the Plan" }).click();
  await expect(page.getByTestId("hud-overlay")).toBeVisible({ timeout: 10_000 });
  await expect(page.locator("canvas")).toBeVisible();
});
