import { defineConfig } from "@playwright/test";

const environment = (globalThis as {
  process?: { env: Record<string, string | undefined> };
}).process?.env ?? {};
// The Example's own dev port, which the adapter already accepts as an origin.
const port = 5173;
const adapterPort = 4315;

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
  webServer: [{
    command: `npm run dev -- --port ${port}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: true,
    timeout: 60_000,
  }, {
    command: "npm run dev:dialogue-adapter",
    port: adapterPort,
    reuseExistingServer: false,
    timeout: 60_000,
    env: {
      DIALOGUE_ADAPTER_MODEL: "live",
      DIALOGUE_ADAPTER_PORT: String(adapterPort),
      DATABASE_URL: environment.DIALOGUE_ADAPTER_TEST_DATABASE_URL ?? "",
    },
    stdout: "pipe",
    stderr: "pipe",
  }],
});
