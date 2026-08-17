import { execFileSync } from "node:child_process";

import { defineConfig } from "@playwright/test";

/**
 * Asks the OS for a currently free port. The suite binds to ephemeral ports
 * by default so that a run in any checkout or worktree can never silently
 * reuse a dev server started from another checkout and test the wrong code.
 */
function freePort(): number {
  const probe =
    "const s=require('node:net').createServer();" +
    "s.listen(0,'127.0.0.1',()=>{process.stdout.write(String(s.address().port));s.close();});";
  return Number(execFileSync(process.execPath, ["-e", probe], { encoding: "utf8" }).trim());
}

const environment = process.env;
const acceptancePort = Number(environment.CAPRI_TEST_PORT ?? freePort());
const ordinaryPort = Number(environment.CAPRI_ORDINARY_PORT ?? freePort());
// Expose the resolved ports to the workers; specs such as
// dialogue-server-unreachable.spec.ts read them back through test/ports.ts.
environment.CAPRI_TEST_PORT = String(acceptancePort);
environment.CAPRI_ORDINARY_PORT = String(ordinaryPort);

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
    // Never reuse a server somebody else started: it might belong to another
    // checkout or worktree, and testing that code silently invalidates the run.
    reuseExistingServer: false,
    timeout: 60_000,
  }, {
    // The ordinary build, serving the same entry point a Player opens. Only the
    // startup-failure test uses it, and that test refuses the adapter address
    // itself, so this server still reaches no database, model or network.
    command: `npm run dev -- --port ${ordinaryPort}`,
    url: `http://localhost:${ordinaryPort}`,
    reuseExistingServer: false,
    timeout: 60_000,
  }],
});
