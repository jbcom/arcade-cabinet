import { defineConfig, devices } from "@playwright/test";

const usePagesBase =
  process.env.USE_CI === "true" ||
  process.env.CI === "true" ||
  process.env.GITHUB_ACTIONS === "true";
const appBasePath = usePagesBase ? "/arcade-cabinet" : "";
const appBaseUrl = `http://localhost:4321${appBasePath}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  ...(process.env.CI ? { workers: 1 } : {}),
  reporter: "html",
  use: {
    baseURL: appBaseUrl,
    trace: "on-first-retry",
    // R3F games hydrate client-only; give the JS bundle time to load
    actionTimeout: 15_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command:
      "corepack pnpm --filter @arcade-cabinet/docs build && corepack pnpm --filter @arcade-cabinet/docs preview --host 0.0.0.0 --port 4321",
    url: appBaseUrl,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
