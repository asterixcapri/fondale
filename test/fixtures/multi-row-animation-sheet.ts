import backgroundUrl from "./multi-row-background.svg";
import backUrl from "./multi-row-character-back.svg";
import frontUrl from "./multi-row-character-front.svg";
import leftUrl from "./multi-row-character-left.svg";
import rightUrl from "./multi-row-character-right.svg";
import multiRowSheetUrl from "./multi-row-sheet.svg";
import staticSheetUrl from "./static-sheet.svg";
import {
  commandVerbs,
  type CharacterAnimationSheets,
  type CharacterDefinition,
  type CommandLexicon,
  type GameProject,
  type GameSession,
  type ObjectDefinition,
  type SceneDefinition,
  startGame,
  uniformGrid,
} from "../../src/index";

declare global {
  interface Window {
    __multiRowAnimationSheet?: { session: GameSession };
    __multiRowAnimationSheetError?: string;
  }
}

const oneFrame = [{ x: 0, y: 0, width: 10, height: 10 }];
const fiveFrameGrid = uniformGrid({
  frameWidth: 10,
  frameHeight: 10,
  columns: 3,
  count: 5,
});
const directionalSheets = {
  left: { image: leftUrl, frames: fiveFrameGrid },
  right: { image: rightUrl, frames: fiveFrameGrid },
  front: { image: frontUrl, frames: fiveFrameGrid },
  back: { image: backUrl, frames: fiveFrameGrid },
} satisfies CharacterAnimationSheets;

const player = {
  initialScene: "stage",
  initialGroundPoint: { x: 213, y: 180 },
  initialFacing: "front",
  initialAppearance: "normal",
  appearances: {
    normal: {
      animations: {
        idle: { sheets: directionalSheets, timing: { framesPerSecond: 2, loop: true } },
        walking: { sheets: directionalSheets, timing: { framesPerSecond: 2, loop: true } },
      },
      roles: { default: "idle", walking: "walking" },
      visualAnchor: { x: 5, y: 10 },
    },
  },
  movementSpeed: 600,
} satisfies CharacterDefinition;

const object = {
  initialScene: "stage",
  initialGroundPoint: { x: 100, y: 180 },
  initialAppearance: "normal",
  appearances: {
    normal: {
      animations: {
        idle: {
          sheet: {
            image: multiRowSheetUrl,
            frames: fiveFrameGrid,
          },
          timing: { framesPerSecond: 2, loop: true },
        },
      },
      roles: { default: "idle" },
      visualAnchor: { x: 5, y: 10 },
    },
  },
  inventoryAppearance: staticSheetUrl,
} satisfies ObjectDefinition;

const scene = {
  background: backgroundUrl,
  walkableRegion: [
    { x: 0, y: 0 },
    { x: 426, y: 0 },
    { x: 426, y: 240 },
    { x: 0, y: 240 },
  ],
  perspectiveScale: [{ y: 0, scale: 2 }, { y: 240, scale: 2 }],
  scenery: {
    animated: {
      baseline: 180,
      position: { x: 300, y: 180 },
      initialAppearance: "normal",
      appearances: {
        normal: {
          animations: {
            idle: {
              sheet: {
                image: multiRowSheetUrl,
                frames: fiveFrameGrid,
              },
              timing: { framesPerSecond: 2 },
            },
          },
          roles: { default: "idle" },
          visualAnchor: { x: 5, y: 10 },
        },
      },
    },
    static: {
      baseline: 180,
      position: { x: 350, y: 180 },
      initialAppearance: "normal",
      appearances: {
        normal: {
          animations: {
            idle: {
              sheet: { image: staticSheetUrl, frames: oneFrame },
              timing: { framesPerSecond: 12, loop: true },
            },
          },
          roles: { default: "idle" },
          visualAnchor: { x: 5, y: 10 },
        },
      },
    },
  },
} satisfies SceneDefinition;

const project = {
  identity: "test.multi-row-animation-sheet",
  version: "1",
  logicalResolution: { width: 426, height: 240 },
  scenes: { stage: scene },
  characters: { player },
  objects: { token: object },
  playerCharacter: "player",
  initialScene: "stage",
  commandLexicon: {
    inventory: { select: "Hold {noun}", deselect: "Put away {noun}" },
    verbs: {
      open: "Open", "pick-up": "Pick up", push: "Push", close: "Close",
      "look-at": "Look at", pull: "Pull", give: "Give", "talk-to": "Talk to", use: "Use",
    },
    patterns: {
      unary: "{verb} {noun}", give: "{verb} {first} to {second}",
      use: "{verb} {first} with {second}",
    },
  } satisfies CommandLexicon,
  commandFallbacks: Object.fromEntries(
    commandVerbs.map((verb) => [verb, { text: "Nothing happens." }]),
  ) as never,
} satisfies GameProject;

try {
  window.__multiRowAnimationSheet = {
    session: await startGame(project, {
      target: document.querySelector<HTMLElement>("#game")!,
    }),
  };
} catch (error) {
  window.__multiRowAnimationSheetError =
    error instanceof Error ? (error.stack ?? error.message) : String(error);
}
