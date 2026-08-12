import {
  type CharacterDefinition,
  type NounDefinition,
  type ObjectDefinition,
  type SceneDefinition,
} from "@asterixcapri/fondale";

const doorArea = [{ x: 10, y: 10 }, { x: 30, y: 10 }, { x: 30, y: 30 }];

export const interactionHost = ({
  initialScene: "opening",
  initialGroundPoint: { x: 65, y: 35 },
  initialFacing: "left",
  initialAppearance: "idle",
  appearances: {
    idle: { animations: { idle: { frames: [new URL("./key.png", import.meta.url)], framesPerSecond: 1, loop: true } }, roles: { default: "idle" } },
  },
  movementSpeed: 60,
  noun: ({
    labels: [{ text: "Host" }],
    preferredVerbs: [{ verb: "talk-to" }],
    cases: [{ verb: "talk-to", response: { text: "Welcome." } }],
  } satisfies NounDefinition),
} satisfies CharacterDefinition);

export const interactionKey = ({
  initialScene: "opening",
  initialGroundPoint: { x: 85, y: 35 },
  initialAppearance: "present",
  appearances: {
    present: { animations: { idle: { frames: [new URL("./key.png", import.meta.url)], framesPerSecond: 1, loop: true } }, roles: { default: "idle" } },
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

export const interactionScene = ({
  background: new URL("./scene.png", import.meta.url),
  walkableRegion: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 40 }, { x: 0, y: 40 }],
  scenery: {
    door: {
      baseline: 30,
      initialAppearance: "closed",
      appearances: { closed: { kind: "background-region", area: doorArea } },
      noun: ({
        labels: [
          { when: { variable: "doorOpen", equals: true }, text: "Open door" },
          { text: "Door" },
        ],
        preferredVerbs: [
          { when: { variable: "doorOpen", equals: false }, verb: "open" },
          { verb: "look-at" },
        ],
        cases: [{
          verb: "open",
          when: { variable: "doorOpen", equals: false },
          response: { text: "The door opens." },
          operations: [{ type: "set-variable", variable: "doorOpen", value: true }],
        }, {
          verb: "look-at",
          response: { text: "The door is open." },
        }],
      } satisfies NounDefinition),
    },
  },
  hotspots: [
    {
      target: { kind: "scenery", scenery: "door" },
      area: doorArea,
      approach: { groundPoint: { x: 40, y: 35 }, facing: "back" },
    },
    {
      target: { kind: "character", character: "host" },
      area: [{ x: 55, y: 10 }, { x: 70, y: 10 }, { x: 70, y: 35 }],
      approach: { groundPoint: { x: 50, y: 35 }, facing: "right" },
    },
    {
      target: { kind: "object", object: "key" },
      area: [{ x: 78, y: 25 }, { x: 92, y: 25 }, { x: 92, y: 38 }],
      approach: { groundPoint: { x: 75, y: 35 }, facing: "right" },
    },
    {
      target: { kind: "background" },
      area: [{ x: 35, y: 5 }, { x: 50, y: 5 }, { x: 50, y: 20 }],
      approach: { groundPoint: { x: 45, y: 35 }, facing: "back" },
      noun: ({
        labels: [{ text: "Mural" }],
        preferredVerbs: [{ verb: "look-at" }],
        cases: [{ verb: "look-at", response: { text: "Faded paint." } }],
      } satisfies NounDefinition),
    },
  ],
} satisfies SceneDefinition);
