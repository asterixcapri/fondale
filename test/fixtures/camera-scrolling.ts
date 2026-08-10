import cameraScrollingUrl from "./camera-scrolling.png";
import cameraScrollingHorizontalUrl from "./camera-scrolling-horizontal.png";
import playerUrl from "./invalid-inventory.png";
import {
  commandVerbs,
  defineCharacter,
  defineCommandLexicon,
  defineGame,
  defineNoun,
  defineScene,
  startGame,
  type GameSession,
  validateSaveSnapshot,
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
const scene = defineScene({
  background: horizontal ? cameraScrollingHorizontalUrl : cameraScrollingUrl,
  size: { width: 1586, height: sceneHeight },
  walkableRegion: [
    { x: 0, y: 0 },
    { x: 1586, y: 0 },
    { x: 1586, y: sceneHeight },
    { x: 0, y: sceneHeight },
  ],
  hotspots: [{
    target: { kind: "background" },
    area: [
      { x: 480, y: hotspotTop },
      { x: 560, y: hotspotTop },
      { x: 560, y: hotspotBottom },
      { x: 480, y: hotspotBottom },
    ],
    approach: { groundPoint: { x: 520, y: hotspotBottom }, facing: "back" },
    noun: defineNoun({
      labels: [{ text: "Fortification marker" }],
      preferredVerbs: [{ verb: "look-at" }],
      secondaryVerbs: [{ verb: "talk-to" }],
      cases: [{
        verb: "look-at",
        response: { text: "The projected marker is aligned." },
      }, {
        verb: "talk-to",
        line: { character: "guide", text: "The Camera still follows the Player." },
      }],
    }),
  }],
});
const player = defineCharacter({
  initialScene: sceneId,
  initialGroundPoint: { x: 213, y: horizontal ? 180 : 850 },
  initialFacing: "front",
  initialAppearance: "idle",
  appearances: {
    idle: { kind: "static", image: playerUrl, visualAnchor: { x: 10, y: 20 } },
  },
  movementSpeed: 240,
});
const guide = defineCharacter({
  initialScene: sceneId,
  initialGroundPoint: { x: 520, y: horizontal ? 130 : 790 },
  initialFacing: "front",
  initialAppearance: "idle",
  appearances: {
    idle: { kind: "static", image: playerUrl, visualAnchor: { x: 10, y: 20 } },
  },
  movementSpeed: 60,
});
const noPlayer = parameters.has("noPlayer");
const project = defineGame({
  identity: "test.camera-scrolling",
  version: "1",
  logicalResolution: { width: 426, height: 240 },
  scenes: { [sceneId]: scene },
  characters: noPlayer ? { guide } : { player, guide },
  ...(noPlayer ? {} : { playerCharacter: "player" }),
  commandLexicon: defineCommandLexicon({
    inventory: { select: "Hold {noun}", deselect: "Put away {noun}" },
    verbs: {
      open: "Open", "pick-up": "Pick up", push: "Push", close: "Close",
      "look-at": "Look at", pull: "Pull", give: "Give", "talk-to": "Talk to", use: "Use",
    },
    patterns: {
      unary: "{verb} {noun}", give: "{verb} {first} to {second}", use: "{verb} {first} with {second}",
    },
  }),
  commandFallbacks: Object.fromEntries(
    commandVerbs.map((verb) => [verb, { text: "Nothing happens." }]),
  ) as never,
  initialScene: sceneId,
});

try {
  const target = document.querySelector<HTMLElement>("#game")!;
  const fixture = {
    session: await startGame(project, { target }),
    async restart(point?: { x: number; y: number }) {
      const stored = structuredClone(fixture.session.createSaveSnapshot()) as {
        state: { characters: Record<string, { groundPoint: { x: number; y: number } }> };
      };
      if (point && stored.state.characters.player) {
        stored.state.characters.player.groundPoint = { ...point };
      }
      const validation = validateSaveSnapshot(project, stored);
      if (!validation.ok) throw new Error(validation.diagnostics[0]?.message);
      fixture.session.stop();
      fixture.session = await startGame(project, { target, snapshot: validation.snapshot });
    },
  };
  window.__cameraTest = fixture;
} catch (error) {
  window.__cameraError = error instanceof Error ? error.message : String(error);
}
