import cameraScrollingUrl from "./camera-scrolling.png";
import cameraScrollingHorizontalUrl from "./camera-scrolling-horizontal.png";
import playerUrl from "./invalid-inventory.png";
import {
  commandVerbs,
  type CharacterDefinition,
  type CommandLexicon,
  type GameProject,
  type NounDefinition,
  type SceneDefinition,
  startGame,
  type GameSession,
} from "../../src/index";

declare global {
  interface Window {
    __cameraTest?: {
      session: GameSession;
      restart(point?: { x: number; y: number }): Promise<void>;
    };
    __cameraError?: string;
  }
}

const parameters = new URLSearchParams(window.location.search);
const horizontal = parameters.has("horizontal");
const sceneId = horizontal ? "horizontal" : "fortification";
const sceneHeight = horizontal ? 240 : 992;
const hotspotTop = horizontal ? 100 : 760;
const hotspotBottom = horizontal ? 160 : 820;
const scene = {
  background: horizontal ? cameraScrollingHorizontalUrl : cameraScrollingUrl,
  size: { width: 1586, height: sceneHeight },
  walkableRegion: [
    { x: 0, y: 0 },
    { x: 1586, y: 0 },
    { x: 1586, y: sceneHeight },
    { x: 0, y: sceneHeight },
  ],
  hotspots: [
    {
      target: { kind: "background" },
      area: [
        { x: 480, y: hotspotTop },
        { x: 560, y: hotspotTop },
        { x: 560, y: hotspotBottom },
        { x: 480, y: hotspotBottom },
      ],
      approach: { groundPoint: { x: 520, y: hotspotBottom }, facing: "back" },
      noun: {
        labels: [{ text: "Fortification marker" }],
        preferredVerbs: [{ verb: "look-at" }],
        secondaryVerbs: [{ verb: "talk-to" }],
        cases: [
          {
            verb: "look-at",
            response: { text: "The projected marker is aligned." },
          },
          {
            verb: "talk-to",
            line: {
              character: "guide",
              text: "The Camera still follows the Player.",
            },
          },
        ],
      } satisfies NounDefinition,
    },
  ],
} satisfies SceneDefinition;
const player = {
  initialScene: sceneId,
  initialGroundPoint: { x: 213, y: horizontal ? 180 : 850 },
  initialFacing: "front",
  initialAppearance: "idle",
  appearances: {
    idle: {
      animations: {
        idle: { sheets: { left: { image: playerUrl, frames: [{ x: 0, y: 0, width: 20, height: 20 }] }, right: { image: playerUrl, frames: [{ x: 0, y: 0, width: 20, height: 20 }] }, front: { image: playerUrl, frames: [{ x: 0, y: 0, width: 20, height: 20 }] }, back: { image: playerUrl, frames: [{ x: 0, y: 0, width: 20, height: 20 }] } }, timing: { framesPerSecond: 1, loop: true } },
      },
      roles: { default: "idle", walking: "idle" },
      visualAnchor: { x: 10, y: 20 },
    },
  },
  movementSpeed: 240,
} satisfies CharacterDefinition;
const guide = {
  initialScene: sceneId,
  initialGroundPoint: { x: 520, y: horizontal ? 130 : 790 },
  initialFacing: "front",
  initialAppearance: "idle",
  appearances: {
    idle: {
      animations: {
        idle: { sheets: { left: { image: playerUrl, frames: [{ x: 0, y: 0, width: 20, height: 20 }] }, right: { image: playerUrl, frames: [{ x: 0, y: 0, width: 20, height: 20 }] }, front: { image: playerUrl, frames: [{ x: 0, y: 0, width: 20, height: 20 }] }, back: { image: playerUrl, frames: [{ x: 0, y: 0, width: 20, height: 20 }] } }, timing: { framesPerSecond: 1, loop: true } },
      },
      roles: { default: "idle" },
      visualAnchor: { x: 10, y: 20 },
    },
  },
  movementSpeed: 60,
} satisfies CharacterDefinition;
const noPlayer = parameters.has("noPlayer");
const project = {
  identity: "test.camera-scrolling",
  version: "1",
  logicalResolution: { width: 426, height: 240 },
  scenes: { [sceneId]: scene },
  characters: { ...(noPlayer ? {} : { player }), guide },
  ...(noPlayer ? {} : { playerCharacter: "player" }),
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
  initialScene: sceneId,
} satisfies GameProject;

try {
  const target = document.querySelector<HTMLElement>("#game")!;
  const fixture = {
    session: await startGame(project, { target }),
    async restart(point?: { x: number; y: number }) {
      const stored = structuredClone(fixture.session.createSaveSnapshot()) as {
        state: {
          characters: Record<string, { groundPoint: { x: number; y: number } }>;
        };
      };
      if (point && stored.state.characters.player) {
        stored.state.characters.player.groundPoint = { ...point };
      }
      fixture.session.stop();
      fixture.session = await startGame(project, { target, snapshot: stored });
    },
  };
  window.__cameraTest = fixture;
} catch (error) {
  window.__cameraError = error instanceof Error ? error.message : String(error);
}
