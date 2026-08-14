import { type NounDefinition, type ObjectDefinition } from "@asterixcapri/fondale";

import keyInventoryUrl from "./inventory.png";
import keyUrl from "./scene.png";

export const key = ({
  initialScene: "alley",
  initialGroundPoint: { x: 118, y: 170 },
  initialAppearance: "unused",
  appearances: {
    unused: { animations: { idle: { sheet: { image: keyUrl, frames: [{ x: 0, y: 0, width: 20, height: 20 }] }, timing: { framesPerSecond: 1, loop: true } } }, roles: { default: "idle" } },
    used: { animations: { idle: { sheet: { image: keyUrl, frames: [{ x: 0, y: 0, width: 20, height: 20 }] }, timing: { framesPerSecond: 1, loop: true } } }, roles: { default: "idle" } },
  },
  inventoryAppearance: keyInventoryUrl,
  noun: ({
    labels: [{ text: "Chiave d'ottone" }],
    preferredVerbs: [{ verb: "pick-up" }],
    secondaryVerbs: [{ verb: "look-at" }],
    cases: [
      {
        verb: "pick-up",
        response: { text: "Prendo la chiave d'ottone." },
        operations: [{ type: "collect-target-object" }],
      },
      {
        verb: "look-at",
        response: { text: "Ottone pesante, denti consumati e ancora un po' di sale nella scanalatura." },
      },
    ],
  } satisfies NounDefinition),
} satisfies ObjectDefinition);
