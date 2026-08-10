import { defineCharacter, defineNoun } from "@asterixcapri/fondale";

import idleUrl from "./idle.png";

export const raffaele = defineCharacter({
  initialScene: "harbour",
  initialGroundPoint: { x: 322, y: 170 },
  initialFacing: "left",
  initialAppearance: "working",
  appearances: {
    working: { kind: "static", image: idleUrl },
  },
  movementSpeed: 70,
  noun: defineNoun({
    labels: [{ text: "Raffaele" }],
    preferredVerbs: [{ verb: "talk-to" }],
    secondaryVerbs: [{ verb: "look-at" }],
    objectVerbs: [{ verb: "give" }],
    cases: [
      {
        verb: "talk-to",
        when: { variable: "boatReady", equals: true },
        line: {
          text: "L'argano tiene. Attraversa la grotta e porta il pacco a Monte Solaro.",
          character: "raffaele",
        },
      },
      {
        verb: "talk-to",
        when: { variable: "raffaeleMet", equals: true },
        line: {
          text: "L'olio è vicino alle botti; la manovella era fra le reti.",
          character: "raffaele",
        },
      },
      { verb: "talk-to", sequence: "raffaeleConversation" },
    ],
  }),
});
