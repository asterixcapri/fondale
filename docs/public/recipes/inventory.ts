import { type NounDefinition, type ObjectDefinition, type CommandCase } from "@asterixcapri/fondale";

export const key = ({
  initialScene: "opening",
  initialGroundPoint: { x: 40, y: 30 },
  initialAppearance: "unused",
  appearances: {
    unused: { animations: { idle: { sheet: { image: new URL("./key.png", import.meta.url), frames: [{ x: 0, y: 0, width: 20, height: 20 }] }, timing: { framesPerSecond: 1, loop: true } } }, roles: { default: "idle" } },
    used: { animations: { idle: { sheet: { image: new URL("./used-key.png", import.meta.url), frames: [{ x: 0, y: 0, width: 20, height: 20 }] }, timing: { framesPerSecond: 1, loop: true } } }, roles: { default: "idle" } },
  },
  inventoryAppearance: new URL("./key-inventory-32.png", import.meta.url),
  noun: ({
    labels: [{ text: "Key" }],
    preferredVerbs: [{ verb: "pick-up" }],
    cases: [{
      verb: "pick-up",
      response: { text: "The key enters the Inventory." },
      operations: [{ type: "collect-target-object" }],
    }],
  } satisfies NounDefinition),
} satisfies ObjectDefinition);

export const successfulUse: CommandCase = {
  verb: "use",
  firstNoun: "key",
  response: { text: "The key turns." },
  operations: [{ type: "consume-selected-object" }],
};
