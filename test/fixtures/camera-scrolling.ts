import coastalFortificationUrl from "../../examples/capri-1535/art/scenes/coastal-fortification/background.png";
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
      restart(): Promise<void>;
    };
    __cameraError?: string;
  }
}

const scene = defineScene({
  background: coastalFortificationUrl,
  size: { width: 1586, height: 992 },
  walkableRegion: [
    { x: 0, y: 0 },
    { x: 1586, y: 0 },
    { x: 1586, y: 992 },
    { x: 0, y: 992 },
  ],
  hotspots: [{
    target: { kind: "background" },
    area: [
      { x: 480, y: 760 },
      { x: 560, y: 760 },
      { x: 560, y: 820 },
      { x: 480, y: 820 },
    ],
    approach: { groundPoint: { x: 520, y: 820 }, facing: "back" },
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
  initialScene: "fortification",
  initialGroundPoint: { x: 213, y: 850 },
  initialFacing: "front",
  initialAppearance: "idle",
  appearances: {
    idle: { kind: "static", image: playerUrl, visualAnchor: { x: 10, y: 20 } },
  },
  movementSpeed: 240,
});
const guide = defineCharacter({
  initialScene: "fortification",
  initialGroundPoint: { x: 520, y: 790 },
  initialFacing: "front",
  initialAppearance: "idle",
  appearances: {
    idle: { kind: "static", image: playerUrl, visualAnchor: { x: 10, y: 20 } },
  },
  movementSpeed: 60,
});
const project = defineGame({
  identity: "test.camera-scrolling",
  version: "1",
  logicalResolution: { width: 426, height: 240 },
  scenes: { fortification: scene },
  characters: { player, guide },
  playerCharacter: "player",
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
  initialScene: "fortification",
});

try {
  const target = document.querySelector<HTMLElement>("#game")!;
  const fixture = {
    session: await startGame(project, { target }),
    async restart() {
      const validation = validateSaveSnapshot(project, fixture.session.createSaveSnapshot());
      if (!validation.ok) throw new Error(validation.diagnostics[0]?.message);
      fixture.session.stop();
      fixture.session = await startGame(project, { target, snapshot: validation.snapshot });
    },
  };
  window.__cameraTest = fixture;
} catch (error) {
  window.__cameraError = error instanceof Error ? error.message : String(error);
}
