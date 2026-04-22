import { expect, test } from "@playwright/test";

test("otterly chaotic loads and starts", async ({ page }) => {
  await page.goto("/games/otterly-chaotic");
  // client:only="react" — wait for JS bundle to hydrate the island
  await expect(page.getByTestId("start-screen")).toBeVisible({ timeout: 20_000 });
  await page.getByRole("button", { name: "Start Sprint" }).click();
  await expect(page.getByTestId("hud-overlay")).toBeVisible({ timeout: 10_000 });
  await expect(page.locator("canvas")).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(200);
  await expect(page.getByText(/Ball health:/)).toBeVisible();
});
