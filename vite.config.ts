import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  // No public directory: rooms import their background as a module, so Vite
  // fingerprints and inlines exactly the art that is actually referenced.
  // Serving art/ wholesale would also drag 15MB of concept sketches into
  // every deploy.
  publicDir: false,
  // The build collapses to one self-contained HTML file with the script and
  // the art inlined, so the game can be handed over as a single link with no
  // server, no install and no network requests of its own.
  plugins: [viteSingleFile()],
  build: {
    assetsInlineLimit: Number.MAX_SAFE_INTEGER,
    cssCodeSplit: false,
  },
  server: { port: 5173, strictPort: true },
  preview: { port: 4173, strictPort: true },
});
