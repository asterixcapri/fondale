import {
  commandVerbs,
  type CommandLexicon,
  type GameProject,
  type NounDefinition,
  type SceneDefinition,
} from "@asterixcapri/fondale";

const walkableRegion = [
  { x: 0, y: 100 }, { x: 320, y: 100 },
  { x: 320, y: 120 }, { x: 0, y: 120 },
];

export const nextScene = ({
  background: new URL("./scene.png", import.meta.url),
  walkableRegion,
  entrances: { fromOpening: { groundPoint: { x: 40, y: 110 }, facing: "right" } },
} satisfies SceneDefinition);

export const firstScene = ({
  background: new URL("./scene.png", import.meta.url),
  walkableRegion,
  perspectiveScale: [{ y: 100, scale: 0.6 }, { y: 120, scale: 1 }],
  scenery: {
    arch: {
      baseline: 120,
      initialAppearance: "closed",
      appearances: {
        closed: {
          kind: "background-region",
          area: [{ x: 260, y: 60 }, { x: 300, y: 60 }, { x: 300, y: 120 }],
        },
      },
    },
  },
  passages: [{
    area: [{ x: 270, y: 100 }, { x: 300, y: 100 }, { x: 300, y: 118 }],
    approach: { groundPoint: { x: 260, y: 110 }, facing: "right" },
    noun: ({
      labels: [{ text: "Path to the next scene" }],
      preferredVerbs: [{ verb: "walk-to" }],
      cases: [],
    } satisfies NounDefinition),
    direction: "right",
    destination: { scene: "next", entrance: "fromOpening" },
  }],
} satisfies SceneDefinition);

// A Scene may instead extend beyond the 320×180 viewport on either axis.
// Its Background PNG must be exactly 640×360 and all geometry remains in
// that complete Scene Space.
export const panoramicScene = ({
  background: new URL("./panorama.png", import.meta.url),
  size: { width: 640, height: 360 },
  walkableRegion: [
    { x: 0, y: 180 }, { x: 640, y: 180 },
    { x: 640, y: 360 }, { x: 0, y: 360 },
  ],
} satisfies SceneDefinition);

export const englishCommandLexicon = ({
  inventory: { select: "Hold {noun}", deselect: "Put back {noun}" },
  verbs: {
    open: "Open", "pick-up": "Pick up", push: "Push", close: "Close",
    "look-at": "Look at", pull: "Pull", give: "Give", "talk-to": "Talk to", use: "Use",
  },
  patterns: {
    unary: "{verb} {noun}",
    give: "{verb} {first} to {second}",
    use: "{verb} {first} with {second}",
  },
} satisfies CommandLexicon);

export const englishCommandFallbacks = Object.fromEntries(
  commandVerbs.map((verb) => [verb, { text: "That does not work." }]),
);

export const firstProject = ({
  identity: "com.example.first-scene",
  version: "1",
  logicalResolution: { width: 320, height: 180 },
  scenes: { opening: firstScene, next: nextScene },
  commandLexicon: englishCommandLexicon,
  commandFallbacks: englishCommandFallbacks,
  initialScene: "opening",
} satisfies GameProject);
