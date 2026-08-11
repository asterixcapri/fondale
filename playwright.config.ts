import { defineConfig } from "@playwright/test";

const testPort = (globalThis as {
  process?: { env: Record<string, string | undefined> };
}).process?.env.FONDALE_TEST_PORT ?? "5173";

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
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
