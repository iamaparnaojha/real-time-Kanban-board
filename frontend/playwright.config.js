// playwright.config.js
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./src/tests/e2e", // Path to your test files
  timeout: 20 * 1000, // Test timeout in milliseconds
  use: {
    headless: true,
    baseURL: "http://localhost:5173",
    viewport: { width: 1300, height: 720 },
  },
  workers: 1,
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
    {
      name: "webkit",
      use: { browserName: "webkit" },
    },
  ],
  webServer: {
    command: "npm run dev",
    port: 5173,
    timeout: 60 * 1000,
    reuseExistingServer: true,
  },
});
