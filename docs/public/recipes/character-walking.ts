import { type CharacterDefinition, uniformGrid } from "@asterixcapri/fondale";

const idleFrames = uniformGrid({
  frameWidth: 16,
  frameHeight: 24,
  columns: 1,
  count: 1,
});
const performanceFrames = uniformGrid({
  frameWidth: 16,
  frameHeight: 24,
  columns: 4,
  count: 4,
});

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
          sheets: {
            left: { image: new URL("./player-idle-left.png", import.meta.url), frames: idleFrames },
            right: { image: new URL("./player-idle-right.png", import.meta.url), frames: idleFrames },
            front: { image: new URL("./player-idle-front.png", import.meta.url), frames: idleFrames },
            back: { image: new URL("./player-idle-back.png", import.meta.url), frames: idleFrames },
          },
          timing: { framesPerSecond: 1, loop: true },
        },
        speaking: {
          sheets: {
            left: { image: new URL("./player-speaking-left.png", import.meta.url), frames: performanceFrames },
            right: { image: new URL("./player-speaking-right.png", import.meta.url), frames: performanceFrames },
            front: { image: new URL("./player-speaking-front.png", import.meta.url), frames: performanceFrames },
            back: { image: new URL("./player-speaking-back.png", import.meta.url), frames: performanceFrames },
          },
          timing: { framesPerSecond: 6, loop: true },
        },
        walking: {
          sheets: {
            left: { image: new URL("./player-walking-left.png", import.meta.url), frames: performanceFrames },
            right: { image: new URL("./player-walking-right.png", import.meta.url), frames: performanceFrames },
            front: { image: new URL("./player-walking-front.png", import.meta.url), frames: performanceFrames },
            back: { image: new URL("./player-walking-back.png", import.meta.url), frames: performanceFrames },
          },
          timing: { framesPerSecond: 8, loop: true },
        },
      },
      roles: { default: "idle", speaking: "speaking", walking: "walking" },
      visualAnchor: { x: 8, y: 24 },
    },
  },
} satisfies CharacterDefinition);
