import { defineConfig } from "@playwright/test";

import { acceptancePort, ordinaryPort } from "./test/ports";

export default defineConfig({
  testDir: "./test",
  // The live spike has its own harness in `playwright.live.config.ts`: the
  // standard suite intercepts the production HTTP seam and never reaches a
  // model, PostgreSQL or the external network.
  testIgnore: ["live-dialogue.spec.ts"],
  outputDir: "./test/.artifacts",
  fullyParallel: false,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${acceptancePort}`,
    channel: "chrome",
    viewport: { width: 1280, height: 720 },
  },
  webServer: [{
    command: `npm run dev:acceptance -- --port ${acceptancePort}`,
    url: `http://localhost:${acceptancePort}`,
    reuseExistingServer: true,
    timeout: 60_000,
  }, {
    // The ordinary build, serving the same entry point a Player opens. Only the
    // startup-failure test uses it, and that test refuses the adapter address
    // itself, so this server still reaches no database, model or network.
    command: `npm run dev -- --port ${ordinaryPort}`,
    url: `http://localhost:${ordinaryPort}`,
    reuseExistingServer: true,
    timeout: 60_000,
  }],
});
