import { defineNoun, defineObject, type CommandCase } from "@asterixcapri/fondale";

export const key = defineObject({
  initialScene: "opening",
  initialGroundPoint: { x: 40, y: 30 },
  initialAppearance: "unused",
  appearances: {
    unused: { animations: { idle: { frames: [new URL("./key.png", import.meta.url)], framesPerSecond: 1, loop: true } }, roles: { default: "idle" } },
    used: { animations: { idle: { frames: [new URL("./used-key.png", import.meta.url)], framesPerSecond: 1, loop: true } }, roles: { default: "idle" } },
  },
  inventoryAppearance: new URL("./key-inventory-32.png", import.meta.url),
  noun: defineNoun({
    labels: [{ text: "Key" }],
    preferredVerbs: [{ verb: "pick-up" }],
    cases: [{
      verb: "pick-up",
      response: { text: "The key enters the Inventory." },
      operations: [{ type: "collect-target-object" }],
    }],
  }),
});

export const successfulUse: CommandCase = {
  verb: "use",
  firstNoun: "key",
  response: { text: "The key turns." },
  operations: [{ type: "consume-selected-object" }],
};
