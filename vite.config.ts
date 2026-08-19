import { defineConfig } from "vite";

/**
 * Development server for browser-test fixtures.
 *
 * Not Vite's default 5173: the Engine has no application to serve, and that
 * port belongs to the example game, which does. Both bind strictly, so sharing
 * one meant whichever started second simply failed. Playwright passes its own
 * ephemeral port and never reuses a running server, so this default only
 * matters to a person opening a fixture by hand.
 */
export default defineConfig({
  publicDir: false,
  server: { port: 5170, strictPort: true },
});
