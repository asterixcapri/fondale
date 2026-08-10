import { defineNoun, defineScene } from "@asterixcapri/fondale";

const doorArea = [{ x: 10, y: 10 }, { x: 30, y: 10 }, { x: 30, y: 30 }];

export const interactionScene = defineScene({
  background: new URL("./scene.png", import.meta.url),
  walkableRegion: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 40 }, { x: 0, y: 40 }],
  scenery: {
    door: {
      baseline: 30,
      initialAppearance: "closed",
      appearances: { closed: { kind: "background-region", area: doorArea } },
      noun: defineNoun({
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
      }),
    },
  },
  hotspots: [{
    target: { kind: "scenery", scenery: "door" },
    area: doorArea,
    approach: { groundPoint: { x: 40, y: 35 }, facing: "back" },
  }],
});
