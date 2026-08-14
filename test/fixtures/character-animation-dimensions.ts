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
const idleFrames = validationCase === "empty"
  ? []
  : [{ x: 0, y: 0, width: 10, height: 10 }];
const speakingFrame = {
  x: 0,
  y: 0,
  width: validationCase === "dimensions" ? 20 : 10,
  height: 10,
};
const leftSpeakingFrame = {
  ...speakingFrame,
  x: validationCase === "bounds" ? 1 : validationCase === "coordinate" ? -1 : 0,
  width: validationCase === "dimensions" ? 20 : validationCase === "frame-dimension" ? 0 : 10,
};
const speakingFrames = [speakingFrame];
const leftSpeakingFrames = validationCase === "unequal-frame-count"
  ? [speakingFrame, speakingFrame]
  : [leftSpeakingFrame];
const speakingTiming = {
  framesPerSecond: validationCase === "timing" ? 0 : 1,
  loop: validationCase === "timing" ? "yes" : true,
  ...(validationCase === "cue" ? { cues: { late: 2 } } : {}),
} as unknown as CharacterDefinition["appearances"][string]["animations"][string]["timing"];
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
            left: { image: idleUrl, frames: idleFrames },
            right: { image: idleUrl, frames: idleFrames },
            front: { image: idleUrl, frames: idleFrames },
            back: { image: idleUrl, frames: idleFrames },
          }, timing: { framesPerSecond: 1, loop: true } },
        speaking: { sheets: { left: { image: validationCase === "invalid-asset"
                  ? missingUrl
                  : speakingFrameUrl, frames: leftSpeakingFrames }, right: { image: speakingFrameUrl, frames: speakingFrames }, front: { image: speakingFrameUrl, frames: speakingFrames }, back: { image: speakingFrameUrl, frames: speakingFrames } }, timing: speakingTiming },
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
