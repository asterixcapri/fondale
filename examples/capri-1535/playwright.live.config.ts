import { defineConfig } from "@playwright/test";

const port = 5173;

/**
 * The opt-in live spike harness: a real OpenRouter model, Mastra and
 * PostgreSQL. It is deliberately separate from `playwright.config.ts` so
 * `npm run verify` never needs credentials, a database or the network.
 */
export default defineConfig({
  testDir: "./test",
  testMatch: ["live-dialogue.spec.ts"],
  outputDir: "./test/.artifacts",
  fullyParallel: false,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${port}`,
    channel: "chrome",
    viewport: { width: 1280, height: 720 },
  },
  webServer: {
    command: `npm run dev -- --port ${port}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
