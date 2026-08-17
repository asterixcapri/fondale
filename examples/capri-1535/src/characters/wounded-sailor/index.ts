import { type CharacterDefinition, type NounDefinition } from "@asterixcapri/fondale";

import staticUrl from "./static.png";

const staticFrame = [{ x: 0, y: 0, width: 166, height: 166 }];

export const woundedSailorGroundPoint = { x: 1098, y: 602 } as const;

/** One deliberately static presentation; all Facings reuse the same Runtime image. */
export const woundedSailor = ({
  initialScene: "driftingBoat",
  initialGroundPoint: woundedSailorGroundPoint,
  initialFacing: "left",
  initialAppearance: "wounded",
  appearances: {
    wounded: {
      animations: {
        idle: {
          sheets: {
            left: { image: staticUrl, frames: staticFrame },
            right: { image: staticUrl, frames: staticFrame },
            front: { image: staticUrl, frames: staticFrame },
            back: { image: staticUrl, frames: staticFrame },
          },
          timing: { framesPerSecond: 1, loop: true },
        },
      },
      roles: { default: "idle" },
      visualAnchor: { x: 83, y: 164 },
    },
    // The encounter ends with the sailor losing consciousness. The deliberate
    // static presentation keeps the same Runtime image; only the authored
    // responses change.
    unconscious: {
      animations: {
        idle: {
          sheets: {
            left: { image: staticUrl, frames: staticFrame },
            right: { image: staticUrl, frames: staticFrame },
            front: { image: staticUrl, frames: staticFrame },
            back: { image: staticUrl, frames: staticFrame },
          },
          timing: { framesPerSecond: 1, loop: true },
        },
      },
      roles: { default: "idle" },
      visualAnchor: { x: 83, y: 164 },
    },
  },
  movementSpeed: 60,
  noun: ({
    labels: [{ text: "Marinaio ferito" }],
    preferredVerbs: [{ verb: "look-at" }],
    secondaryVerbs: [{ verb: "talk-to" }],
    cases: [{
      verb: "look-at",
      when: { variable: "sailorEncountered", equals: false },
      response: {
        text: "Respira appena. Tiene una mano sulle bende, come se anche quel piccolo gesto gli costasse fatica.",
      },
    }, {
      verb: "look-at",
      response: {
        text: "È svenuto. Le bende si muovono appena con il respiro: vivo, ma lontano.",
      },
    }, {
      // The first talk-to opens the canonical encounter; afterwards the
      // sailor can no longer answer.
      verb: "talk-to",
      when: { variable: "sailorEncountered", equals: false },
      sequence: "sailorEncounter",
    }, {
      verb: "talk-to",
      response: {
        text: "Il marinaio non risponde più. Quello che sapeva, lo ha affidato al fagotto.",
      },
    }],
  } satisfies NounDefinition),
} satisfies CharacterDefinition);
