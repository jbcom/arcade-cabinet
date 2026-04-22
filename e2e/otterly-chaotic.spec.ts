import { expect, test } from "@playwright/test";

test("otterly chaotic loads and starts", async ({ page }) => {
  await page.goto("/games/otterly-chaotic");
  await expect(page.getByTestId("start-screen")).toBeVisible();
  await page.getByRole("button", { name: "Start Sprint" }).click();
  await expect(page.getByTestId("hud-overlay")).toBeVisible();
  await expect(page.locator("canvas")).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(200);
  await expect(page.getByText(/Ball health:/)).toBeVisible();
});
