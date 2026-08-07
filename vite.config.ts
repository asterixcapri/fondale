import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  // Processed room art is served straight from where the pipeline writes it,
  // so there is no copy step to forget: art/rooms/x.png -> /rooms/x.png
  publicDir: "art",
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
