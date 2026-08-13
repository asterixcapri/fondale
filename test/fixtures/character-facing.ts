import backgroundUrl from "./background.png";
import backUrl from "./character-facing-back.svg";
import frontUrl from "./character-facing-front.svg";
import gestureBackUrl from "./character-facing-gesture-back.svg";
import gestureFrontUrl from "./character-facing-gesture-front.svg";
import gestureLeftUrl from "./character-facing-gesture-left.svg";
import gestureRightUrl from "./character-facing-gesture-right.svg";
import leftUrl from "./character-facing-left.svg";
import rightUrl from "./character-facing-right.svg";
import {
  commandVerbs,
  type CharacterAnimationFrames,
  type CharacterDefinition,
  type CommandLexicon,
  type GameProject,
  type GameSession,
  type NounDefinition,
  type SceneDefinition,
  type SequenceDefinition,
  startGame,
} from "../../src/index";

declare global {
  interface Window {
    __characterFacing?: { session: GameSession };
    __characterFacingError?: string;
  }
}

const frames = {
  left: { image: leftUrl, count: 1 },
  right: { image: rightUrl, count: 1 },
  front: { image: frontUrl, count: 1 },
  back: { image: backUrl, count: 1 },
} satisfies CharacterAnimationFrames;
const gestureFrames = {
  left: { image: gestureLeftUrl, count: 3 },
  right: { image: gestureRightUrl, count: 3 },
  front: { image: gestureFrontUrl, count: 3 },
  back: { image: gestureBackUrl, count: 3 },
} satisfies CharacterAnimationFrames;

const player = {
  initialScene: "opening",
  initialGroundPoint: { x: 213, y: 180 },
  initialFacing: "front",
  initialAppearance: "normal",
  appearances: {
    normal: {
      animations: {
        idle: { frames, framesPerSecond: 1, loop: true },
        walking: { frames, framesPerSecond: 1, loop: true },
        gesture: {
          frames: gestureFrames,
          framesPerSecond: 0.5,
          loop: true,
          cues: { turn: 3 },
        },
      },
      roles: { default: "idle", walking: "walking" },
      visualAnchor: { x: 5, y: 10 },
    },
  },
  movementSpeed: 600,
} satisfies CharacterDefinition;

const scene = {
  background: backgroundUrl,
  walkableRegion: [
    { x: 0, y: 0 },
    { x: 426, y: 0 },
    { x: 426, y: 240 },
    { x: 0, y: 240 },
  ],
  hotspots: [{
    target: { kind: "background" },
    area: [
      { x: 290, y: 170 },
      { x: 310, y: 170 },
      { x: 310, y: 190 },
      { x: 290, y: 190 },
    ],
    approach: { groundPoint: { x: 213, y: 180 }, facing: "front" },
    noun: {
      labels: [{ text: "Directed turn" }],
      preferredVerbs: [{ verb: "use" }],
      cases: [{ verb: "use", sequence: "turn" }],
    } satisfies NounDefinition,
  }],
} satisfies SceneDefinition;

const turn = {
  scene: "opening",
  steps: [{
    type: "direction",
    directions: [
      {
        type: "animation",
        subject: { kind: "character", character: "player" },
        animation: "gesture",
      },
      {
        type: "motion",
        subject: { kind: "character", character: "player" },
        path: [{ x: 223, y: 180 }],
        facing: "right",
        startAfter: { direction: 0, cue: "turn" },
      },
      {
        type: "camera",
        mode: "hold",
        point: { x: 213, y: 120 },
        duration: 9,
      },
    ],
  }],
} satisfies SequenceDefinition;

const project = {
  identity: "test.character-facing-browser",
  version: "1",
  logicalResolution: { width: 426, height: 240 },
  scenes: { opening: scene },
  characters: { player },
  playerCharacter: "player",
  sequences: { turn },
  initialScene: "opening",
  commandLexicon: {
    inventory: { select: "Hold {noun}", deselect: "Put away {noun}" },
    verbs: {
      open: "Open",
      "pick-up": "Pick up",
      push: "Push",
      close: "Close",
      "look-at": "Look at",
      pull: "Pull",
      give: "Give",
      "talk-to": "Talk to",
      use: "Use",
    },
    patterns: {
      unary: "{verb} {noun}",
      give: "{verb} {first} to {second}",
      use: "{verb} {first} with {second}",
    },
  } satisfies CommandLexicon,
  commandFallbacks: Object.fromEntries(
    commandVerbs.map((verb) => [verb, { text: "Nothing happens." }]),
  ) as never,
} satisfies GameProject;

try {
  window.__characterFacing = {
    session: await startGame(project, {
      target: document.querySelector<HTMLElement>("#game")!,
    }),
  };
} catch (error) {
  window.__characterFacingError =
    error instanceof Error ? (error.stack ?? error.message) : String(error);
}
