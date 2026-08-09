import { defineCharacter } from "@asterixcapri/fondale";

import idleUrl from "./idle.png";
import { harbourNouns } from "../../nouns";

export const raffaele = defineCharacter({
  initialScene: "harbour",
  initialGroundPoint: { x: 322, y: 170 },
  initialFacing: "left",
  initialAppearance: "working",
  appearances: {
    working: { kind: "static", image: idleUrl },
  },
  movementSpeed: 70,
  noun: harbourNouns.raffaele,
});
