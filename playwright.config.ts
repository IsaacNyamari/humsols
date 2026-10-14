import { defineConfig, devices } from "@playwright/test";
import { E2E_PORT } from "./tests/e2e/fixtures";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1, // tests share one database
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://localhost:${E2E_PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npx tsx scripts/e2e-server.ts",
    url: `http://localhost:${E2E_PORT}`,
    timeout: 600_000, // includes `next build`
    reuseExistingServer: false,
    stdout: "pipe",
  },
});
