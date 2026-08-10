import { defineCharacter } from "@asterixcapri/fondale";

export const player = defineCharacter({
  initialScene: "opening",
  initialGroundPoint: { x: 160, y: 140 },
  initialFacing: "front",
  initialAppearance: "walking",
  movementSpeed: 48,
  appearances: {
    walking: {
      animations: { walking: {
        frames: {
          side: { image: new URL("./player-side.png", import.meta.url), count: 4 },
          front: { image: new URL("./player-front.png", import.meta.url), count: 4 },
          back: { image: new URL("./player-back.png", import.meta.url), count: 4 },
        },
        framesPerSecond: 8,
      } },
      roles: { default: "walking", walking: "walking" },
      visualAnchor: { x: 8, y: 24 },
    },
  },
});
