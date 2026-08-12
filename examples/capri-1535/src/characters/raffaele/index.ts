import { type CharacterDefinition, type NounDefinition } from "@asterixcapri/fondale";

import idleUrl from "./idle.png";

export const raffaele = ({
  initialScene: "harbour",
  initialGroundPoint: { x: 430, y: 205 },
  initialFacing: "left",
  initialAppearance: "working",
  appearances: {
    working: { animations: { idle: { frames: [idleUrl], framesPerSecond: 1, loop: true } }, roles: { default: "idle" } },
  },
  movementSpeed: 70,
  noun: ({
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
  } satisfies NounDefinition),
} satisfies CharacterDefinition);
