import { test, expect } from '@playwright/test';

test('Primordial Ascent Gameplay', async ({ page }) => {
  // Use the default Astro port for the docs app since it hosts all games
  await page.goto('http://localhost:4321/games/primordial-ascent');
  
  // Wait for the start screen
  const startBtn = page.getByRole("button", { name: /Initiate Sequence/i });
  await expect(startBtn).toBeVisible({ timeout: 10000 });
  
  // Take a screenshot of the start screen
  await page.screenshot({ path: 'test-screenshots/primordial-start.png' });

  // Start the game
  await startBtn.click();

  // Wait for physics to settle and HUD to appear
  await expect(page.getByText(/Altitude/i)).toBeVisible({ timeout: 10000 });
  await page.waitForTimeout(2000);

  // Take a screenshot of gameplay
  await page.screenshot({ path: 'test-screenshots/primordial-gameplay.png' });
});
