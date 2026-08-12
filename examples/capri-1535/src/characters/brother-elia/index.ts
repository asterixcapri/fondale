import { type CharacterDefinition, type NounDefinition } from "@asterixcapri/fondale";

import idleUrl from "./idle.png";

export const brotherElia = ({
  initialScene: "cloister",
  initialGroundPoint: { x: 405, y: 205 },
  initialFacing: "left",
  initialAppearance: "welcoming",
  appearances: { welcoming: { animations: { idle: { frames: [idleUrl], framesPerSecond: 1, loop: true } }, roles: { default: "idle" } } },
  movementSpeed: 60,
  noun: ({
    labels: [{ text: "Frate Elia" }],
    preferredVerbs: [{ verb: "talk-to" }],
    secondaryVerbs: [{ verb: "look-at" }],
    objectVerbs: [{ verb: "give" }],
    cases: [{ verb: "talk-to", sequence: "brotherEliaConversation" }],
  } satisfies NounDefinition),
} satisfies CharacterDefinition);
