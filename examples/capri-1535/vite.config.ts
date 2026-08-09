import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  root: new URL(".", import.meta.url).pathname,
  publicDir: false,
  plugins: [viteSingleFile()],
  build: {
    target: "esnext",
    outDir: "../../dist-example",
    emptyOutDir: true,
    assetsInlineLimit: Number.MAX_SAFE_INTEGER,
    cssCodeSplit: false,
  },
  server: { port: 5173, strictPort: true },
  preview: { port: 4173, strictPort: true },
});
