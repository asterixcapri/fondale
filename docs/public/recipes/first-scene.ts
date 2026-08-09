import { defineGame, defineScene } from "@asterixcapri/fondale";

const walkableRegion = [
  { x: 0, y: 100 }, { x: 320, y: 100 },
  { x: 320, y: 180 }, { x: 0, y: 180 },
];

export const nextScene = defineScene({
  background: new URL("./scene.png", import.meta.url),
  walkableRegion,
  entrances: { fromOpening: { groundPoint: { x: 40, y: 140 }, facing: "right" } },
});

export const firstScene = defineScene({
  background: new URL("./scene.png", import.meta.url),
  walkableRegion,
  perspectiveScale: [{ y: 100, scale: 0.6 }, { y: 180, scale: 1 }],
  scenery: {
    arch: {
      baseline: 120,
      initialAppearance: "closed",
      appearances: {
        closed: {
          kind: "background-region",
          area: [{ x: 260, y: 60 }, { x: 300, y: 60 }, { x: 300, y: 120 }],
        },
      },
    },
  },
  passages: [{
    area: [{ x: 270, y: 100 }, { x: 300, y: 100 }, { x: 300, y: 130 }],
    approach: { groundPoint: { x: 260, y: 130 }, facing: "right" },
    destination: { scene: "next", entrance: "fromOpening" },
  }],
});

export const firstProject = defineGame({
  identity: "com.example.first-scene",
  version: "1",
  logicalResolution: { width: 320, height: 180 },
  scenes: { opening: firstScene, next: nextScene },
  initialScene: "opening",
});
