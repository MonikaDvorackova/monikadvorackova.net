import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30000,
  use: { baseURL: process.env.BASE_URL || "http://127.0.0.1:3000" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" },
    },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: "npm start -- --hostname 127.0.0.1",
        env: {
          AGENT_A2A_KEY: "e2e-a2a-" + "x".repeat(32),
          AGENT_INQUIRY_KEY: "e2e-inquiry-" + "x".repeat(32),
        },
        url: "http://127.0.0.1:3000",
        reuseExistingServer: !process.env.CI,
      },
  reporter: [["list"], ["json", { outputFile: "test-results/e2e.json" }]],
});
