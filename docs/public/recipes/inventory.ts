import { defineObject } from "@asterixcapri/fondale";

export const key = defineObject({
  initialScene: "opening",
  initialGroundPoint: { x: 40, y: 80 },
  initialAppearance: "unused",
  appearances: {
    unused: { kind: "static", image: new URL("./key.png", import.meta.url) },
    used: { kind: "static", image: new URL("./used-key.png", import.meta.url) },
  },
  inventoryAppearance: new URL("./key-inventory-32.png", import.meta.url),
});

export const successfulUse = {
  object: "key",
  outcome: "success",
  response: "The key turns.",
  operations: [{ type: "consume-selected-object" }],
} as const;
