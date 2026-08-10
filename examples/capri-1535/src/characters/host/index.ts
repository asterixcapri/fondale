import { defineCharacter, defineNoun } from "@asterixcapri/fondale";

import idleUrl from "./idle.png";

export const host = defineCharacter({
  initialScene: "tavern",
  initialGroundPoint: { x: 286, y: 170 },
  initialFacing: "left",
  initialAppearance: "welcoming",
  appearances: { welcoming: { kind: "static", image: idleUrl } },
  movementSpeed: 60,
  noun: defineNoun({
    labels: [{ text: "Oste" }],
    preferredVerbs: [{ verb: "talk-to" }],
    secondaryVerbs: [{ verb: "look-at" }],
    objectVerbs: [{ verb: "give" }],
    cases: [{ verb: "talk-to", sequence: "hostConversation" }],
  }),
});
