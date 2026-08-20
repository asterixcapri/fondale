import { type NounDefinition, type ObjectDefinition } from "fondale";

import inventoryUrl from "./inventory.png";
import sceneUrl from "./scene.png";

export const oilFlask = ({
  initialScene: "harbour",
  initialGroundPoint: { x: 1470, y: 595 },
  initialAppearance: "full",
  appearances: {
    full: {
      animations: {
        idle: {
          sheet: { image: sceneUrl, frames: [{ x: 0, y: 0, width: 17, height: 22 }] },
          timing: { framesPerSecond: 1, loop: true },
        },
      },
      roles: { default: "idle" },
      visualAnchor: { x: 8, y: 22 },
    },
  },
  inventoryAppearance: inventoryUrl,
  noun: ({
    labels: [{ text: "Ampolla d'olio" }],
    preferredVerbs: [{ verb: "pick-up" }],
    secondaryVerbs: [{ verb: "look-at" }],
    cases: [
      {
        verb: "pick-up",
        response: { text: "Prendo l'ampolla d'olio nascosta sotto le reti." },
        operations: [{ type: "collect-target-object" }],
      },
      {
        verb: "look-at",
        response: { text: "Poco olio, ma abbastanza per una carrucola ostinata." },
      },
    ],
    fallbacks: {
      use: { response: { text: "Non spreco l'olio senza un meccanismo che ne abbia bisogno." } },
      give: { response: { text: "L'ampolla mi servirà ancora; non la cedo a caso." } },
    },
  } satisfies NounDefinition),
} satisfies ObjectDefinition);
