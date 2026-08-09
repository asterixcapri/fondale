import { defineCharacter } from "@asterixcapri/fondale";

import idleUrl from "./idle.png";

export const raffaele = defineCharacter({
  initialScene: "harbour",
  initialGroundPoint: { x: 360, y: 207 },
  initialFacing: "left",
  initialAppearance: "working",
  appearances: {
    working: { kind: "static", image: idleUrl },
  },
  movementSpeed: 70,
});
