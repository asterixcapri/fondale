import { defineCharacter, defineNoun } from "@asterixcapri/fondale";

import idleUrl from "./idle.png";

export const raffaele = defineCharacter({
  initialScene: "harbour",
  initialGroundPoint: { x: 430, y: 205 },
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
          text: "L'argano tiene. Sali alla torre e controlla il segnale: al ritorno ti pago.",
          character: "raffaele",
        },
      },
      {
        verb: "talk-to",
        when: { variable: "jobAccepted", equals: true },
        line: {
          text: "L'ampolla è accanto alle reti. La manovella è ancora nel chiostro.",
          character: "raffaele",
        },
      },
      { verb: "talk-to", sequence: "raffaeleConversation" },
    ],
  }),
});
