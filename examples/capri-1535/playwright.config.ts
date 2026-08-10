import { defineConfig } from "@playwright/test";

const port = Number((globalThis as {
  process?: { env: Record<string, string | undefined> };
}).process?.env.CAPRI_TEST_PORT ?? "5173");

export default defineConfig({
  testDir: "./test",
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
