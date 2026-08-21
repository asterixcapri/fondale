import { type NounDefinition, type SceneDefinition } from "fondale";

const brazierNoun = ({
  labels: [{ text: "Brazier" }],
  preferredVerbs: [{ verb: "look-at" }],
  objectVerbs: [{ verb: "use" }],
  cases: [
    {
      verb: "use",
      firstNoun: "lantern",
      when: { variable: "lanternLit", equals: false },
      response: { text: "The wick catches." },
      operations: [
        { type: "set-variable", variable: "lanternLit", value: true },
        { type: "set-appearance", target: { kind: "object", object: "lantern" }, appearance: "lit" },
      ],
    },
    { verb: "look-at", response: { text: "Coals, kept alive out of habit." } },
  ],
} satisfies NounDefinition);

const noticeNoun = ({
  labels: [{ text: "Notice" }],
  preferredVerbs: [{ verb: "look-at" }],
  cases: [{ verb: "look-at", operations: [{ type: "present-detail-view", detailView: "notice" }] }],
} satisfies NounDefinition);

const doorNoun = ({
  labels: [{ text: "Storeroom door" }],
  preferredVerbs: [{ verb: "walk-to" }],
  cases: [],
} satisfies NounDefinition);

/**
 * The quay is wider than the viewport, so the Camera follows and clamps.
 * Its Background is exactly the declared Scene Size, and every coordinate
 * below is in that same Scene Space.
 */
export const quay = ({
  background: new URL("./quay.png", import.meta.url),
  size: { width: 1920, height: 720 },
  walkableRegion: [
    { x: 80, y: 500 }, { x: 1840, y: 500 },
    { x: 1840, y: 690 }, { x: 80, y: 690 },
  ],
  perspectiveScale: [{ y: 500, scale: 0.7 }, { y: 690, scale: 1 }],
  scenery: {
    crate: {
      baseline: 660,
      position: { x: 460, y: 660 },
      initialAppearance: "default",
      appearances: {
        default: {
          animations: {
            idle: {
              sheet: { image: new URL("./crate.png", import.meta.url), frames: [{ x: 0, y: 0, width: 220, height: 180 }] },
              timing: { framesPerSecond: 1, loop: true },
            },
          },
          roles: { default: "idle" },
        },
      },
    },
  },
  hotspots: [
    {
      target: { kind: "background" },
      area: [{ x: 900, y: 470 }, { x: 1040, y: 470 }, { x: 1040, y: 580 }, { x: 900, y: 580 }],
      approach: { groundPoint: { x: 970, y: 600 }, facing: "back" },
      noun: brazierNoun,
    },
    {
      target: { kind: "background" },
      area: [{ x: 1300, y: 430 }, { x: 1420, y: 430 }, { x: 1420, y: 520 }, { x: 1300, y: 520 }],
      approach: { groundPoint: { x: 1360, y: 560 }, facing: "back" },
      noun: noticeNoun,
    },
    {
      target: { kind: "object", object: "lantern" },
      area: [{ x: 500, y: 590 }, { x: 590, y: 590 }, { x: 590, y: 660 }, { x: 500, y: 660 }],
      approach: { groundPoint: { x: 545, y: 670 }, facing: "back" },
    },
    {
      target: { kind: "character", character: "keeper" },
      area: [{ x: 720, y: 400 }, { x: 800, y: 400 }, { x: 800, y: 560 }, { x: 720, y: 560 }],
      approach: { groundPoint: { x: 700, y: 570 }, facing: "right" },
    },
  ],
  entrances: { fromStoreroom: { groundPoint: { x: 1700, y: 620 }, facing: "left" } },
  passages: [
    {
      // Withdrawn until the lantern is lit: a dark storeroom is no use.
      when: { variable: "lanternLit", equals: true },
      area: [{ x: 1740, y: 440 }, { x: 1860, y: 440 }, { x: 1860, y: 660 }, { x: 1740, y: 660 }],
      approach: { groundPoint: { x: 1760, y: 640 }, facing: "right" },
      noun: doorNoun,
      direction: "right",
      destination: { scene: "storeroom", entrance: "fromQuay" },
    },
  ],
  cases: [{ sequence: "backOutside" }],
} satisfies SceneDefinition);

const ledgerNoun = ({
  labels: [{ text: "Ledger" }],
  // Once it has been read, taking it is the obvious next thing to do with it.
  preferredVerbs: [{ verb: "pick-up", when: { variable: "readTheLedger", equals: true } }, { verb: "look-at" }],
  cases: [
    {
      verb: "look-at",
      line: { character: "player", text: "Every crossing since the spring. And then nothing." },
      operations: [{ type: "set-variable", variable: "readTheLedger", value: true }],
    },
    {
      verb: "pick-up",
      when: { variable: "readTheLedger", equals: true },
      response: { text: "It has told you what it knows." },
      operations: [{ type: "end-game", detailView: "notice" }],
    },
  ],
} satisfies NounDefinition);

const backDoorNoun = ({
  labels: [{ text: "Way back to the quay" }],
  preferredVerbs: [{ verb: "walk-to" }],
  cases: [],
} satisfies NounDefinition);

export const storeroom = ({
  background: new URL("./storeroom.png", import.meta.url),
  walkableRegion: [
    { x: 120, y: 470 }, { x: 1160, y: 470 },
    { x: 1160, y: 680 }, { x: 120, y: 680 },
  ],
  hotspots: [
    {
      target: { kind: "background" },
      area: [{ x: 560, y: 360 }, { x: 720, y: 360 }, { x: 720, y: 470 }, { x: 560, y: 470 }],
      approach: { groundPoint: { x: 640, y: 500 }, facing: "back" },
      noun: ledgerNoun,
    },
  ],
  entrances: { fromQuay: { groundPoint: { x: 200, y: 620 }, facing: "right" } },
  passages: [
    {
      area: [{ x: 100, y: 420 }, { x: 190, y: 420 }, { x: 190, y: 660 }, { x: 100, y: 660 }],
      approach: { groundPoint: { x: 220, y: 640 }, facing: "left" },
      noun: backDoorNoun,
      direction: "left",
      destination: { scene: "quay", entrance: "fromStoreroom" },
    },
  ],
  cases: [{ sequence: "firstLight", when: { variable: "sawTheStoreroom", equals: false } }],
} satisfies SceneDefinition);
