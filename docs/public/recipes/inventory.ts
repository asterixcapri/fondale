import { defineNoun, defineObject, type CommandCase } from "@asterixcapri/fondale";

export const keyNoun = defineNoun({
  labels: [{ text: "Key" }],
  preferredVerbs: [{ verb: "pick-up" }],
  cases: [{
    verb: "pick-up",
    response: { text: "The key enters the Inventory." },
    operations: [{ type: "collect-target-object" }],
  }],
});

export const key = defineObject({
  initialScene: "opening",
  initialGroundPoint: { x: 40, y: 30 },
  initialAppearance: "unused",
  appearances: {
    unused: { kind: "static", image: new URL("./key.png", import.meta.url) },
    used: { kind: "static", image: new URL("./used-key.png", import.meta.url) },
  },
  inventoryAppearance: new URL("./key-inventory-32.png", import.meta.url),
  noun: keyNoun,
});

export const successfulUse: CommandCase = {
  verb: "use",
  firstNoun: "key",
  response: { text: "The key turns." },
  operations: [{ type: "consume-selected-object" }],
};
