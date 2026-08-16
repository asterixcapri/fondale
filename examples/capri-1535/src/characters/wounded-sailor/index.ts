import { type CharacterDefinition, type NounDefinition } from "@asterixcapri/fondale";

import staticUrl from "./static.png";

const staticFrame = [{ x: 0, y: 0, width: 256, height: 256 }];

/** One deliberately static presentation; all Facings reuse the same Runtime image. */
export const woundedSailor = ({
  initialScene: "driftingBoat",
  initialGroundPoint: { x: 1098, y: 602 },
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
      visualAnchor: { x: 128, y: 252 },
    },
  },
  movementSpeed: 60,
  noun: ({
    labels: [{ text: "Marinaio ferito" }],
    preferredVerbs: [{ verb: "look-at" }],
    secondaryVerbs: [{ verb: "talk-to" }],
    cases: [{
      verb: "look-at",
      response: {
        text: "Respira appena. Stringe al petto un involto cerato, come se fosse l'ultima cosa rimasta da difendere.",
      },
    }, {
      verb: "talk-to",
      response: {
        text: "Il marinaio non apre gli occhi, ma il respiro cambia quando Michele gli parla.",
      },
    }],
  } satisfies NounDefinition),
} satisfies CharacterDefinition);
