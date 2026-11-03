import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL;

if (!baseURL)
  throw new Error("PLAYWRIGHT_BASE_URL is required for system E2E tests");

export default defineConfig({
  testDir: "./e2e/system",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    ...devices["Desktop Chrome"],
    baseURL,
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    video: "retain-on-failure",
  },
});
