import { type NounDefinition, type ObjectDefinition } from "@asterixcapri/fondale";

import installedUrl from "./installed.png";
import inventoryUrl from "./inventory.png";
import sceneUrl from "./scene.png";

export const winchHandle = ({
  initialScene: "cloister",
  initialGroundPoint: { x: 1125, y: 520 },
  initialAppearance: "installed",
  appearances: {
    loose: {
      animations: {
        idle: {
          sheet: { image: sceneUrl, frames: [{ x: 0, y: 0, width: 28, height: 30 }] },
          timing: { framesPerSecond: 1, loop: true },
        },
      },
      roles: { default: "idle" },
      visualAnchor: { x: 14, y: 30 },
    },
    installed: {
      animations: {
        idle: {
          sheet: { image: installedUrl, frames: [{ x: 0, y: 0, width: 384, height: 320 }] },
          timing: { framesPerSecond: 1, loop: true },
        },
      },
      roles: { default: "idle" },
      visualAnchor: { x: 192, y: 320 },
    },
  },
  inventoryAppearance: inventoryUrl,
  noun: ({
    labels: [
      { text: "Manovella liberata", when: { variable: "wellFreed", equals: true } },
      { text: "Manovella" },
    ],
    preferredVerbs: [{ verb: "pick-up" }],
    secondaryVerbs: [{ verb: "look-at" }],
    cases: [
      {
        verb: "pick-up",
        response: { text: "Prendo la manovella liberata dal pozzo. Ora può tornare all'argano." },
        operations: [{ type: "collect-target-object" }],
      },
      {
        verb: "look-at",
        response: { text: "La manovella che manca all'argano del porto." },
      },
    ],
  } satisfies NounDefinition),
} satisfies ObjectDefinition);
