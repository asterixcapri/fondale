import { type CharacterDefinition } from "@asterixcapri/fondale";

export const player = ({
  initialScene: "opening",
  initialGroundPoint: { x: 160, y: 140 },
  initialFacing: "front",
  initialAppearance: "workwear",
  movementSpeed: 48,
  appearances: {
    workwear: {
      animations: {
        idle: {
          frames: {
            left: { image: new URL("./player-idle-left.png", import.meta.url), count: 1 },
            right: { image: new URL("./player-idle-right.png", import.meta.url), count: 1 },
            front: { image: new URL("./player-idle-front.png", import.meta.url), count: 1 },
            back: { image: new URL("./player-idle-back.png", import.meta.url), count: 1 },
          },
          framesPerSecond: 1,
          loop: true,
        },
        speaking: {
          frames: {
            left: { image: new URL("./player-speaking-left.png", import.meta.url), count: 4 },
            right: { image: new URL("./player-speaking-right.png", import.meta.url), count: 4 },
            front: { image: new URL("./player-speaking-front.png", import.meta.url), count: 4 },
            back: { image: new URL("./player-speaking-back.png", import.meta.url), count: 4 },
          },
          framesPerSecond: 6,
          loop: true,
        },
        walking: {
          frames: {
            left: { image: new URL("./player-walking-left.png", import.meta.url), count: 4 },
            right: { image: new URL("./player-walking-right.png", import.meta.url), count: 4 },
            front: { image: new URL("./player-walking-front.png", import.meta.url), count: 4 },
            back: { image: new URL("./player-walking-back.png", import.meta.url), count: 4 },
          },
          framesPerSecond: 8,
          loop: true,
        },
      },
      roles: { default: "idle", speaking: "speaking", walking: "walking" },
      visualAnchor: { x: 8, y: 24 },
    },
  },
} satisfies CharacterDefinition);
