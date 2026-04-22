import { expect, test } from '@playwright/test';

test('sim soviet loads and starts', async ({ page }) => {
  await page.goto('/games/sim-soviet');
  await expect(page.getByTestId('start-screen')).toBeVisible();
  await page.getByRole('button', { name: 'Begin the Plan' }).click();
  await expect(page.getByTestId('hud-overlay')).toBeVisible();
  await expect(page.locator('canvas')).toBeVisible();
});
