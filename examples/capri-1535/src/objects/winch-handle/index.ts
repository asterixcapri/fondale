import { type NounDefinition, type ObjectDefinition } from "@asterixcapri/fondale";

import installedUrl from "./installed.png";
import inventoryUrl from "./inventory.png";
import sceneUrl from "./scene.png";

export const winchHandle = ({
  initialScene: "cloister",
  initialGroundPoint: { x: 575, y: 211 },
  initialAppearance: "loose",
  appearances: {
    loose: { animations: { idle: { frames: [sceneUrl], framesPerSecond: 1, loop: true } }, roles: { default: "idle" } },
    installed: { animations: { idle: { frames: [installedUrl], framesPerSecond: 1, loop: true } }, roles: { default: "idle" } },
  },
  inventoryAppearance: inventoryUrl,
  noun: ({
    labels: [{ text: "Manovella" }],
    preferredVerbs: [{ verb: "pick-up" }],
    secondaryVerbs: [{ verb: "look-at" }],
    cases: [
      {
        verb: "pick-up",
        when: { variable: "wellFreed", equals: true },
        response: { text: "Ora posso restituire la manovella a Raffaele." },
        operations: [{ type: "collect-target-object" }],
      },
      {
        verb: "pick-up",
        response: { text: "La carrucola è bloccata: togliendola adesso lascerei il secchio nel pozzo." },
      },
      {
        verb: "look-at",
        response: { text: "La manovella dell'argano, promossa temporaneamente a manovella del pozzo." },
      },
    ],
  } satisfies NounDefinition),
} satisfies ObjectDefinition);
