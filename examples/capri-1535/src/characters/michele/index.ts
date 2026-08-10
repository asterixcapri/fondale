import { defineCharacter } from "@asterixcapri/fondale";

import walkBackUrl from "./walk-back.png";
import walkFrontUrl from "./walk-front.png";
import walkSideUrl from "./walk-side.png";

export const michele = defineCharacter({
  initialScene: "townSquare",
  initialGroundPoint: { x: 92, y: 210 },
  initialFacing: "right",
  initialAppearance: "travelling",
  appearances: {
    travelling: {
      animations: {
        walking: { frames: {
          side: { image: walkSideUrl, count: 8 },
          front: { image: walkFrontUrl, count: 8 },
          back: { image: walkBackUrl, count: 8 },
        }, framesPerSecond: 10 },
        "use-winch": { frames: {
          side: { image: walkSideUrl, count: 8 },
          front: { image: walkFrontUrl, count: 8 },
          back: { image: walkBackUrl, count: 8 },
        }, framesPerSecond: 10, cues: { contact: 0.4 } },
      },
      roles: { default: "walking", walking: "walking" },
    },
    determined: {
      animations: {
        walking: { frames: {
          side: { image: walkSideUrl, count: 8 },
          front: { image: walkFrontUrl, count: 8 },
          back: { image: walkBackUrl, count: 8 },
        }, framesPerSecond: 12 },
        "use-winch": { frames: {
          side: { image: walkSideUrl, count: 8 },
          front: { image: walkFrontUrl, count: 8 },
          back: { image: walkBackUrl, count: 8 },
        }, framesPerSecond: 12, cues: { contact: 1 / 3 } },
      },
      roles: { default: "walking", walking: "walking" },
    },
  },
  movementSpeed: 150,
});
