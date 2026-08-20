import { defineConfig } from "vite";

export default defineConfig({
  build: {
    target: "es2022",
    lib: {
      entry: {
        index: "src/index.ts",
        main: "src/main.ts",
      },
      formats: ["es"],
    },
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      external: [
        "fondale",
        "@hono/node-server",
        "@mastra/core/agent",
        "@mastra/core/llm",
        "@mastra/memory",
        "@mastra/pg",
        "hono",
        "hono/cors",
        "hono/utils/http-status",
        "zod",
        /^node:/,
      ],
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "chunks/[name]-[hash].js",
      },
    },
  },
});
