import { defineObject } from "@asterixcapri/fondale";

import installedUrl from "./installed.png";
import inventoryUrl from "./inventory.png";
import sceneUrl from "./scene.png";
import { harbourNouns } from "../../nouns";

export const winchHandle = defineObject({
  initialScene: "harbour",
  initialGroundPoint: { x: 375, y: 174 },
  initialAppearance: "loose",
  appearances: {
    loose: { kind: "static", image: sceneUrl },
    installed: { kind: "static", image: installedUrl },
  },
  inventoryAppearance: inventoryUrl,
  noun: harbourNouns.winchHandle,
});
