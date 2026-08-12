import { type NounDefinition, type ObjectDefinition } from "@asterixcapri/fondale";

import inventoryUrl from "./inventory.png";
import sceneUrl from "./scene.png";

export const oilFlask = ({
  initialScene: "harbour",
  initialGroundPoint: { x: 500, y: 211 },
  initialAppearance: "full",
  appearances: {
    full: { animations: { idle: { frames: [sceneUrl], framesPerSecond: 1, loop: true } }, roles: { default: "idle" } },
  },
  inventoryAppearance: inventoryUrl,
  noun: ({
    labels: [{ text: "Ampolla d'olio" }],
    preferredVerbs: [{ verb: "pick-up" }],
    secondaryVerbs: [{ verb: "look-at" }],
    cases: [
      {
        verb: "pick-up",
        response: { text: "Prendo l'ampolla d'olio che Raffaele ha indicato." },
        operations: [{ type: "collect-target-object" }],
      },
      {
        verb: "look-at",
        response: { text: "Poco olio, ma abbastanza per una carrucola ostinata." },
      },
    ],
  } satisfies NounDefinition),
} satisfies ObjectDefinition);
