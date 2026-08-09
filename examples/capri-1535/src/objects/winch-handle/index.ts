import { defineObject } from "@asterixcapri/fondale";

import installedUrl from "./installed.png";
import inventoryUrl from "./inventory.png";
import sceneUrl from "./scene.png";

export const winchHandle = defineObject({
  initialScene: "harbour",
  initialGroundPoint: { x: 55, y: 228 },
  initialAppearance: "loose",
  appearances: {
    loose: { kind: "static", image: sceneUrl },
    installed: { kind: "static", image: installedUrl },
  },
  inventoryAppearance: inventoryUrl,
});
