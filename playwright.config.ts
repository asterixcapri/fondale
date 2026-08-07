import { defineConfig } from "@playwright/test";

/**
 * The harness that makes the agent's work verifiable without a human.
 *
 * Chromium is pre-installed in this environment (PLAYWRIGHT_BROWSERS_PATH is
 * already set), so nothing is downloaded on install.
 */
export default defineConfig({
  testDir: "./test",
  // Screenshots are the output the agent actually reads, so they go somewhere
  // stable rather than into a per-run temp directory.
  outputDir: "./test/.artifacts",
  fullyParallel: false,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:5173",
    // Point at the Chromium already on the image. Its build predates the one
    // this Playwright expects, and downloading another is both slow and
    // pointless for a 2D canvas game.
    launchOptions: { executablePath: "/opt/pw-browsers/chromium" },
    // 1280x720 gives a 3x integer scale with a 1px bar each side, which also
    // exercises the centring maths rather than hiding it behind an exact fit.
    viewport: { width: 1280, height: 720 },
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
