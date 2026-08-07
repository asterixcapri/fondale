import { defineConfig } from "vite";

export default defineConfig({
  // Processed room art is served straight from where the pipeline writes it,
  // so there is no copy step to forget: art/rooms/x.png -> /rooms/x.png
  publicDir: "art",
  server: { port: 5173, strictPort: true },
  preview: { port: 4173, strictPort: true },
});
