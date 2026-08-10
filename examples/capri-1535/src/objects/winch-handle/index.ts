import { defineNoun, defineObject } from "@asterixcapri/fondale";

import installedUrl from "./installed.png";
import inventoryUrl from "./inventory.png";
import sceneUrl from "./scene.png";

export const winchHandle = defineObject({
  initialScene: "cloister",
  initialGroundPoint: { x: 575, y: 211 },
  initialAppearance: "loose",
  appearances: {
    loose: { kind: "static", image: sceneUrl },
    installed: { kind: "static", image: installedUrl },
  },
  inventoryAppearance: inventoryUrl,
  noun: defineNoun({
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
  }),
});
