import { execFileSync } from "node:child_process";

import { defineConfig } from "@playwright/test";

function freePort(): number {
  const probe =
    "const s=require('node:net').createServer();" +
    "s.listen(0,'127.0.0.1',()=>{process.stdout.write(String(s.address().port));s.close();});";
  return Number(execFileSync(process.execPath, ["-e", probe], { encoding: "utf8" }).trim());
}

const port = process.env.CAPRI_LIVE_PORT ?? String(freePort());
process.env.CAPRI_LIVE_PORT = port;

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
    // Never reuse a server started from another checkout: testing stale code
    // would silently invalidate the spike.
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
