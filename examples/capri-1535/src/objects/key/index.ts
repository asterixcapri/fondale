import { defineObject } from "@asterixcapri/fondale";

import keyInventoryUrl from "./inventory.png";
import keyUrl from "./scene.png";

export const key = defineObject({
  initialScene: "alley",
  initialGroundPoint: { x: 118, y: 204 },
  initialAppearance: "unused",
  appearances: {
    unused: { kind: "static", image: keyUrl },
    used: { kind: "static", image: keyUrl },
  },
  inventoryAppearance: keyInventoryUrl,
});
