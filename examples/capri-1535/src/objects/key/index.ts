import { defineNoun, defineObject } from "@asterixcapri/fondale";

import keyInventoryUrl from "./inventory.png";
import keyUrl from "./scene.png";

export const key = defineObject({
  initialScene: "alley",
  initialGroundPoint: { x: 118, y: 170 },
  initialAppearance: "unused",
  appearances: {
    unused: { kind: "static", image: keyUrl },
    used: { kind: "static", image: keyUrl },
  },
  inventoryAppearance: keyInventoryUrl,
  noun: defineNoun({
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
  }),
});
