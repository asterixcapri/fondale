import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: { index: "src/index.ts", testing: "src/testing.ts" },
      formats: ["es"],
    },
    rollupOptions: {
      external: ["pixi.js"],
    },
    sourcemap: true,
  },
});
