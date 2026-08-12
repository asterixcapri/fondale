import { defineConfig } from "@playwright/test";

const port = Number((globalThis as {
  process?: { env: Record<string, string | undefined> };
}).process?.env.CAPRI_TEST_PORT ?? "5173");

export default defineConfig({
  testDir: "./test",
  // The live spike has its own harness in `playwright.live.config.ts`: the
  // standard suite never reaches OpenRouter, PostgreSQL or the network.
  testIgnore: ["live-dialogue.spec.ts"],
  outputDir: "./test/.artifacts",
  fullyParallel: false,
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
