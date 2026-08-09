import { defineConfig } from "vite";

/** Development server for browser-test fixtures. */
export default defineConfig({
  publicDir: false,
  server: { port: 5173, strictPort: true },
});
