import { type NounDefinition, type ObjectDefinition } from "@asterixcapri/fondale";

import installedUrl from "./installed.png";
import inventoryUrl from "./inventory.png";
import sceneUrl from "./scene.png";

export const winchHandle = ({
  initialScene: "harbour",
  initialGroundPoint: { x: 920, y: 585 },
  initialAppearance: "loose",
  appearances: {
    loose: { animations: { idle: { sheet: { image: sceneUrl, frames: [{ x: 0, y: 0, width: 28, height: 30 }] }, timing: { framesPerSecond: 1, loop: true } } }, roles: { default: "idle" } },
    installed: { animations: { idle: { sheet: { image: installedUrl, frames: [{ x: 0, y: 0, width: 1, height: 1 }] }, timing: { framesPerSecond: 1, loop: true } } }, roles: { default: "idle" } },
  },
  inventoryAppearance: inventoryUrl,
  noun: ({
    labels: [{ text: "Manovella" }],
    preferredVerbs: [{ verb: "pick-up" }],
    secondaryVerbs: [{ verb: "look-at" }],
    cases: [
      {
        verb: "pick-up",
        response: { text: "Prendo la manovella. L'argano è qui accanto." },
        operations: [{ type: "collect-target-object" }],
      },
      {
        verb: "look-at",
        response: { text: "La manovella che manca all'argano del porto." },
      },
    ],
  } satisfies NounDefinition),
} satisfies ObjectDefinition);
