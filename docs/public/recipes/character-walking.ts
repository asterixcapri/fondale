import { type CharacterDefinition } from "@asterixcapri/fondale";

export const player = ({
  initialScene: "opening",
  initialGroundPoint: { x: 160, y: 140 },
  initialFacing: "front",
  initialAppearance: "walking",
  movementSpeed: 48,
  appearances: {
    walking: {
      animations: {
        walking: {
          frames: {
            left: { image: new URL("./player-left.png", import.meta.url), count: 4 },
            right: { image: new URL("./player-right.png", import.meta.url), count: 4 },
            front: { image: new URL("./player-front.png", import.meta.url), count: 4 },
            back: { image: new URL("./player-back.png", import.meta.url), count: 4 },
          },
          framesPerSecond: 8,
        },
        speaking: {
          frames: {
            left: { image: new URL("./player-left.png", import.meta.url), count: 4 },
            right: { image: new URL("./player-right.png", import.meta.url), count: 4 },
            front: { image: new URL("./player-front.png", import.meta.url), count: 4 },
            back: { image: new URL("./player-back.png", import.meta.url), count: 4 },
          },
          framesPerSecond: 6,
          loop: true,
        },
      },
      roles: { default: "walking", speaking: "speaking", walking: "walking" },
      visualAnchor: { x: 8, y: 24 },
    },
  },
} satisfies CharacterDefinition);
