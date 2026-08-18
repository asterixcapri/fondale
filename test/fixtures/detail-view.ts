import backgroundUrl from "./background.png";
import backUrl from "./character-facing-back.svg";
import frontUrl from "./character-facing-front.svg";
import leftUrl from "./character-facing-left.svg";
import rightUrl from "./character-facing-right.svg";
import endingUrl from "./detail-view-ending.svg";
import sealUrl from "./detail-view-seal.svg";
import {
  commandVerbs,
  type CharacterAnimationSheets,
  type CharacterDefinition,
  type CommandLexicon,
  type DetailViewDefinition,
  type GameProject,
  type GameSession,
  type NounDefinition,
  type SceneDefinition,
  startGame,
} from "../../src/index";

declare global {
  interface Window {
    __detailView?: { session: GameSession };
    __detailViewError?: string;
  }
}

const staticCells = [{ x: 0, y: 0, width: 10, height: 10 }];
const sheets = {
  left: { image: leftUrl, frames: staticCells },
  right: { image: rightUrl, frames: staticCells },
  front: { image: frontUrl, frames: staticCells },
  back: { image: backUrl, frames: staticCells },
} satisfies CharacterAnimationSheets;

const player = {
  initialScene: "boat",
  initialGroundPoint: { x: 213, y: 180 },
  initialFacing: "front",
  initialAppearance: "normal",
  appearances: {
    normal: {
      animations: {
        idle: { sheets, timing: { framesPerSecond: 1, loop: true } },
      },
      roles: { default: "idle", walking: "idle" },
      visualAnchor: { x: 5, y: 10 },
    },
  },
  movementSpeed: 900,
} satisfies CharacterDefinition;

const rectangle = (
  left: number,
  top: number,
  right: number,
  bottom: number,
) => [
  { x: left, y: top },
  { x: right, y: top },
  { x: right, y: bottom },
  { x: left, y: bottom },
];

const boat = {
  background: backgroundUrl,
  walkableRegion: rectangle(0, 0, 426, 240),
  hotspots: [{
    target: { kind: "background" },
    area: rectangle(330, 190, 380, 230),
    approach: { groundPoint: { x: 213, y: 180 }, facing: "front" },
    noun: {
      labels: [{ text: "Fagotto" }],
      preferredVerbs: [{ verb: "look-at" }],
      cases: [{
        verb: "look-at",
        operations: [{ type: "present-detail-view", detailView: "seal" }],
      }],
    } satisfies NounDefinition,
  }],
} satisfies SceneDefinition;

const seal = {
  image: sealUrl,
  hotspots: [
    {
      area: rectangle(40, 40, 140, 140),
      noun: {
        labels: [{ text: "Sigillo" }],
        preferredVerbs: [{ verb: "look-at" }],
        cases: [{ verb: "look-at", response: { text: "La ceralacca è spezzata." } }],
      } satisfies NounDefinition,
    },
    {
      area: rectangle(300, 40, 400, 140),
      noun: {
        labels: [{ text: "Bordo" }],
        preferredVerbs: [{ verb: "look-at" }],
        cases: [{
          verb: "look-at",
          operations: [{ type: "dismiss-detail-view" }],
        }],
      } satisfies NounDefinition,
    },
    {
      area: rectangle(40, 170, 180, 220),
      noun: {
        labels: [{ text: "Firma" }],
        preferredVerbs: [{ verb: "look-at" }],
        cases: [{
          verb: "look-at",
          operations: [{ type: "end-game", detailView: "congedo" }],
        }],
      } satisfies NounDefinition,
    },
  ],
} satisfies DetailViewDefinition;

/** The closing image of the Ending: an ordinary Detail View, Hotspot and all. */
const congedo = {
  image: endingUrl,
  hotspots: [{
    area: rectangle(40, 40, 140, 140),
    noun: {
      labels: [{ text: "Dedica" }],
      preferredVerbs: [{ verb: "look-at" }],
      cases: [{ verb: "look-at", response: { text: "Per chi non è tornato." } }],
    } satisfies NounDefinition,
  }],
} satisfies DetailViewDefinition;

const project = {
  identity: "test.detail-view-browser",
  version: "1",
  logicalResolution: { width: 426, height: 240 },
  scenes: { boat },
  detailViews: { seal, congedo },
  characters: { player },
  playerCharacter: "player",
  initialScene: "boat",
  commandLexicon: {
    inventory: { select: "Prendi {noun}", deselect: "Riponi {noun}" },
    verbs: {
      open: "Apri",
      "pick-up": "Raccogli",
      push: "Spingi",
      close: "Chiudi",
      "look-at": "Guarda",
      pull: "Tira",
      give: "Dai",
      "talk-to": "Parla con",
      use: "Usa",
    },
    patterns: {
      unary: "{verb} {noun}",
      give: "{verb} {first} a {second}",
      use: "{verb} {first} con {second}",
    },
  } satisfies CommandLexicon,
  commandFallbacks: Object.fromEntries(
    commandVerbs.map((verb) => [verb, { text: "Non succede nulla." }]),
  ) as never,
} satisfies GameProject;

try {
  window.__detailView = {
    session: await startGame(project, {
      target: document.querySelector<HTMLElement>("#game")!,
    }),
  };
} catch (error) {
  window.__detailViewError =
    error instanceof Error ? (error.stack ?? error.message) : String(error);
}
