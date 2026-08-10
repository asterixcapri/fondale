import { defineCharacter, defineNoun } from "@asterixcapri/fondale";

import idleUrl from "./idle.png";

export const brotherElia = defineCharacter({
  initialScene: "cloister",
  initialGroundPoint: { x: 405, y: 205 },
  initialFacing: "left",
  initialAppearance: "welcoming",
  appearances: { welcoming: { kind: "static", image: idleUrl } },
  movementSpeed: 60,
  noun: defineNoun({
    labels: [{ text: "Frate Elia" }],
    preferredVerbs: [{ verb: "talk-to" }],
    secondaryVerbs: [{ verb: "look-at" }],
    objectVerbs: [{ verb: "give" }],
    cases: [{ verb: "talk-to", sequence: "brotherEliaConversation" }],
  }),
});
