import { defineNoun, defineObject } from "@asterixcapri/fondale";

import inventoryUrl from "./inventory.png";
import sceneUrl from "./scene.png";

export const oilFlask = defineObject({
  initialScene: "harbour",
  initialGroundPoint: { x: 409, y: 170 },
  initialAppearance: "full",
  appearances: {
    full: { kind: "static", image: sceneUrl },
  },
  inventoryAppearance: inventoryUrl,
  noun: defineNoun({
    labels: [{ text: "Ampolla d'olio" }],
    preferredVerbs: [{ verb: "pick-up" }],
    secondaryVerbs: [{ verb: "look-at" }],
    cases: [
      {
        verb: "pick-up",
        response: { text: "Prendo la piccola ampolla d'olio." },
        operations: [{ type: "collect-target-object" }],
      },
      {
        verb: "look-at",
        response: { text: "Poco olio, ma abbastanza per convincere un ingranaggio ostinato." },
      },
    ],
  }),
});
