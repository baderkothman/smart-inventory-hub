import { defineConfig, devices } from "@playwright/test";

/**
 * E2E test configuration for Smart Inventory Hub.
 *
 * Required environment variables (set as GitHub Actions secrets or in .env.local):
 *   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
 *   CLERK_SECRET_KEY
 *   DATABASE_URL
 *
 * E2E_TEST_MODE=true is injected automatically via webServer.env below.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "html",

  use: {
    baseURL: "http://localhost:3001",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    // Use port 3001 to avoid collisions with the normal dev server on 3000
    command: "bun dev --port 3001",
    url: "http://localhost:3001",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      E2E_TEST_MODE: "true",
    },
  },
});
