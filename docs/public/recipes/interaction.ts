import { defineScene } from "@asterixcapri/fondale";

export const interactionScene = defineScene({
  background: new URL("./scene.png", import.meta.url),
  walkableRegion: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }],
  hotspots: [{
    target: { kind: "background" },
    area: [{ x: 10, y: 10 }, { x: 30, y: 10 }, { x: 30, y: 30 }],
    approach: { groundPoint: { x: 40, y: 35 }, facing: "back" },
    primaryAction: {
      cases: [{
        when: { variable: "doorOpen", equals: false },
        label: "Open",
        response: "The door opens.",
        operations: [{ type: "set-variable", variable: "doorOpen", value: true }],
      }],
      fallback: { label: "Look", response: "The door is open.", operations: [] },
    },
  }],
});
