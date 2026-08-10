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
      kind: "walking",
      side: { image: walkSideUrl, frames: 8 },
      front: { image: walkFrontUrl, frames: 8 },
      back: { image: walkBackUrl, frames: 8 },
      framesPerSecond: 10,
    },
    determined: {
      kind: "walking",
      side: { image: walkSideUrl, frames: 8 },
      front: { image: walkFrontUrl, frames: 8 },
      back: { image: walkBackUrl, frames: 8 },
      framesPerSecond: 12,
    },
  },
  movementSpeed: 150,
});
