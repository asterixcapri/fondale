import { execFileSync } from "node:child_process";

import { defineConfig } from "@playwright/test";

/**
 * Asks the OS for a currently free port. The suite binds to an ephemeral port
 * by default so that a run in any checkout or worktree can never silently
 * reuse a dev server started from another checkout and test the wrong code.
 */
function freePort(): number {
  const probe =
    "const s=require('node:net').createServer();" +
    "s.listen(0,'127.0.0.1',()=>{process.stdout.write(String(s.address().port));s.close();});";
  return Number(execFileSync(process.execPath, ["-e", probe], { encoding: "utf8" }).trim());
}

const testPort = process.env.FONDALE_TEST_PORT ?? String(freePort());
// Expose the resolved port to the workers, so anything reading
// FONDALE_TEST_PORT observes the value the suite actually bound to.
process.env.FONDALE_TEST_PORT = testPort;

/**
 * The harness that makes the agent's work verifiable without a human.
 *
 * The harness uses the system Google Chrome through Playwright's `chrome`
 * channel, so it is not tied to a container-specific executable path.
 */
export default defineConfig({
  testDir: ".",
  testMatch: ["test/**/*.spec.ts", "src/capabilities/**/*.spec.ts"],
  testIgnore: ["examples/**"],
  // Screenshots are the output the agent actually reads, so they go somewhere
  // stable rather than into a per-run temp directory.
  outputDir: "./test/.artifacts",
  fullyParallel: false,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${testPort}`,
    // Let Playwright discover the system Chrome installation. An absolute
    // executable path tied the harness to one container image and broke as
    // soon as that image changed.
    channel: "chrome",
    // 1280x720 gives a 3x integer scale with a 1px bar each side, which also
    // exercises the centring maths rather than hiding it behind an exact fit.
    viewport: { width: 1280, height: 720 },
  },
  webServer: {
    command: `npm run dev -- --port ${testPort}`,
    url: `http://localhost:${testPort}`,
    // Never reuse a server somebody else started: it might belong to another
    // checkout or worktree, and testing that code silently invalidates the run.
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
