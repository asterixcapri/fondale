import { defineNoun, defineObject } from "@asterixcapri/fondale";

import installedUrl from "./installed.png";
import inventoryUrl from "./inventory.png";
import sceneUrl from "./scene.png";

export const winchHandle = defineObject({
  initialScene: "harbour",
  initialGroundPoint: { x: 375, y: 174 },
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
        response: { text: "Libero la manovella dalle reti." },
        operations: [{ type: "collect-target-object" }],
      },
      {
        verb: "look-at",
        response: { text: "Una manovella robusta, fatta proprio per l'argano del porto." },
      },
    ],
  }),
});
