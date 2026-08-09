import { defineObject } from "@asterixcapri/fondale";

import inventoryUrl from "./inventory.png";
import sceneUrl from "./scene.png";

export const oilFlask = defineObject({
  initialScene: "harbour",
  initialGroundPoint: { x: 409, y: 207 },
  initialAppearance: "full",
  appearances: {
    full: { kind: "static", image: sceneUrl },
  },
  inventoryAppearance: inventoryUrl,
});
