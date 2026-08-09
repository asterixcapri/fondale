import { defineCharacter } from "@asterixcapri/fondale";

import { tavernNouns } from "../../nouns";
import idleUrl from "./idle.png";

export const host = defineCharacter({
  initialScene: "tavern",
  initialGroundPoint: { x: 286, y: 170 },
  initialFacing: "left",
  initialAppearance: "welcoming",
  appearances: { welcoming: { kind: "static", image: idleUrl } },
  movementSpeed: 60,
  noun: tavernNouns.host,
});
