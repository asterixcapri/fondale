import backgroundUrl from "./background.png";
import idleUrl from "./direction-idle.svg";
import speakingUrl from "./direction-speaking.svg";
import {
  AuthoringError,
  type CharacterDefinition,
  type GameProject,
  type SceneDefinition,
  startGame,
} from "../../src/index";

declare global {
  interface Window {
    __characterAnimationDimensions?: {
      code: string;
      path: string;
      children: number;
    };
  }
}

const scene = {
  background: backgroundUrl,
  walkableRegion: [
    { x: 0, y: 0 },
    { x: 426, y: 0 },
    { x: 426, y: 240 },
    { x: 0, y: 240 },
  ],
} satisfies SceneDefinition;

const validationCase = new URLSearchParams(window.location.search).get("case");
const missingUrl = new URL("./missing-character.png", import.meta.url);
const speakingFrameUrl =
  validationCase === "dimensions" ? speakingUrl : idleUrl;
const incompleteFrames = {
  left: { image: idleUrl, frames: [{ x: 0, y: 0, width: 10, height: 10 }] },
  right: { image: idleUrl, frames: [{ x: 0, y: 0, width: 10, height: 10 }] },
  front: { image: idleUrl, frames: [{ x: 0, y: 0, width: 10, height: 10 }] },
} as unknown as CharacterDefinition["appearances"][string]["animations"][string]["sheets"];

const player = {
  initialScene: "opening",
  initialGroundPoint: { x: 213, y: 180 },
  initialFacing: "front",
  initialAppearance: "normal",
  appearances: {
    normal: {
      animations: {
        idle: { sheets: validationCase === "missing-facing" ? incompleteFrames : {
            left: { image: idleUrl, frames: [{ x: 0, y: 0, width: 10, height: 10 }] },
            right: { image: idleUrl, frames: [{ x: 0, y: 0, width: 10, height: 10 }] },
            front: { image: idleUrl, frames: [{ x: 0, y: 0, width: 10, height: 10 }] },
            back: { image: idleUrl, frames: [{ x: 0, y: 0, width: 10, height: 10 }] },
          }, timing: { framesPerSecond: 1, loop: true } },
        speaking: { sheets: { left: { image: validationCase === "invalid-asset"
                  ? missingUrl
                  : speakingFrameUrl, frames: [{ x: 0, y: 0, width: validationCase === "dimensions" ? 20 : 10, height: 10 }] }, right: { image: speakingFrameUrl, frames: [{ x: 0, y: 0, width: validationCase === "dimensions" ? 20 : 10, height: 10 }] }, front: { image: speakingFrameUrl, frames: [{ x: 0, y: 0, width: validationCase === "dimensions" ? 20 : 10, height: 10 }] }, back: { image: speakingFrameUrl, frames: [{ x: 0, y: 0, width: validationCase === "dimensions" ? 20 : 10, height: 10 }] } }, timing: { framesPerSecond: 1, loop: true } },
      },
      roles: { default: "idle", walking: "idle", speaking: "speaking" },
      visualAnchor: { x: validationCase === "anchor" ? 11 : 5, y: 5 },
    },
  },
  movementSpeed: 60,
} satisfies CharacterDefinition;

const project = {
  identity: "test.character-animation-dimensions",
  version: "1",
  logicalResolution: { width: 426, height: 240 },
  scenes: { opening: scene },
  characters: { player },
  playerCharacter: "player",
  initialScene: "opening",
} satisfies GameProject;

const target = document.querySelector<HTMLElement>("#game")!;
try {
  await startGame(project, { target });
} catch (error) {
  const diagnostic =
    error instanceof AuthoringError ? error.diagnostics[0] : undefined;
  window.__characterAnimationDimensions = {
    code: diagnostic?.code ?? String(error),
    path: diagnostic?.path ?? "",
    children: target.childElementCount,
  };
}
