import { defineGame, defineScene } from "@asterixcapri/fondale";

export const firstScene = defineScene({
  background: new URL("./scene.png", import.meta.url),
  walkableRegion: [
    { x: 0, y: 100 }, { x: 320, y: 100 },
    { x: 320, y: 180 }, { x: 0, y: 180 },
  ],
  perspectiveScale: [{ y: 100, scale: 0.6 }, { y: 180, scale: 1 }],
});

export const firstProject = defineGame({
  identity: "com.example.first-scene",
  version: "1",
  logicalResolution: { width: 320, height: 180 },
  scenes: { opening: firstScene },
  initialScene: "opening",
});
