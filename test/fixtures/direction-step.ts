import { Application } from "pixi.js";

import backgroundUrl from "./camera-scrolling-horizontal.png";
import idleUrl from "./direction-idle.svg";
import signalUrl from "./direction-signal.svg";
import walk0Url from "./direction-walk-0.svg";
import walk1Url from "./direction-walk-1.svg";
import walk2Url from "./direction-walk-2.svg";
import {
  commandVerbs,
  defineCharacter,
  defineCommandLexicon,
  defineGame,
  defineNoun,
  defineScene,
  defineSequence,
} from "../../src/index";
import { BrowserRenderer, type BrowserSessionControls } from "../../src/browser/renderer";
import { loadProjectAssets } from "../../src/browser/assets";
import { createCoreSession } from "../../src/capabilities/game-session";
import { getGameProjectData } from "../../src/capabilities/game-project";

declare global {
  interface Window {
    __directionStepTest?: {
      advance(ticks: number): void;
      elapsedTicks(): number | undefined;
    };
    __directionStepError?: string;
  }
}

const square = [
  { x: 0, y: 0 }, { x: 1586, y: 0 }, { x: 1586, y: 240 }, { x: 0, y: 240 },
];
const player = defineCharacter({
  initialScene: "stage",
  initialGroundPoint: { x: 213, y: 180 },
  initialFacing: "front",
  initialAppearance: "normal",
  appearances: {
    normal: {
      animations: {
        idle: { frames: [idleUrl], framesPerSecond: 1, loop: true },
        walking: { frames: [walk0Url, walk1Url, walk2Url], framesPerSecond: 60, loop: true },
      },
      roles: { default: "idle", walking: "walking" },
      visualAnchor: { x: 5, y: 10 },
    },
  },
  movementSpeed: 60,
});
const action = defineSequence({
  scene: "stage",
  steps: [{
    type: "direction",
    directions: [{
      type: "animation",
      subject: { kind: "scenery", scenery: "signal" },
      animation: "signal",
    }, {
      type: "motion",
      subject: { kind: "character", character: "player" },
      path: [{ x: 219, y: 180 }],
      startAfter: { direction: 0, cue: "go" },
    }, {
      type: "camera",
      mode: "move",
      from: { x: 213, y: 120 },
      to: { x: 500, y: 120 },
      duration: 4 / 60,
      startAfter: { direction: 0, cue: "go" },
    }],
  }],
});
const scene = defineScene({
  background: backgroundUrl,
  size: { width: 1586, height: 240 },
  walkableRegion: square,
  scenery: {
    signal: {
      baseline: 200,
      position: { x: 100, y: 200 },
      initialAppearance: "normal",
      appearances: {
        normal: {
          animations: {
            idle: { frames: [signalUrl], framesPerSecond: 1, loop: true },
            signal: {
              frames: [signalUrl, signalUrl, signalUrl, signalUrl],
              framesPerSecond: 60,
              cues: { go: 2 / 60 },
            },
          },
          roles: { default: "idle" },
          visualAnchor: { x: 5, y: 10 },
        },
      },
    },
  },
  hotspots: [{
    target: { kind: "background" },
    area: [{ x: 190, y: 160 }, { x: 236, y: 160 }, { x: 236, y: 200 }, { x: 190, y: 200 }],
    approach: { groundPoint: { x: 213, y: 180 }, facing: "front" },
    noun: defineNoun({
      labels: [{ text: "Direction Step" }],
      preferredVerbs: [{ verb: "use" }],
      cases: [{ verb: "use", sequence: "action" }],
    }),
  }],
});
const project = defineGame({
  identity: "test.direction-step-browser",
  version: "1",
  logicalResolution: { width: 426, height: 240 },
  scenes: { stage: scene },
  characters: { player },
  playerCharacter: "player",
  sequences: { action },
  initialScene: "stage",
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
});

try {
  const data = getGameProjectData(project);
  const assets = await loadProjectAssets(data);
  const application = new Application();
  await application.init({
    width: data.logicalResolution.width,
    height: data.logicalResolution.height,
    preference: "webgl",
    antialias: false,
    roundPixels: true,
  });
  const frame = document.createElement("div");
  frame.dataset.fondaleFrame = "";
  frame.tabIndex = -1;
  frame.append(application.canvas);
  document.body.append(frame);

  const core = createCoreSession(project);
  const controls: BrowserSessionControls = {
    slots: () => [],
    save: () => undefined,
    load: () => ({ ok: false, diagnostics: [] }),
  };
  const renderer = new BrowserRenderer(application, frame, data, assets, core, controls);
  renderer.render(core.snapshot(), []);
  core.input({ type: "quick-hotspot", hotspot: 0, verb: "use" });
  core.steps();
  renderer.render(core.snapshot(), core.takeEffects());

  window.__directionStepTest = {
    advance(ticks) {
      core.steps(ticks);
      renderer.render(core.snapshot(), core.takeEffects());
    },
    elapsedTicks() {
      const activity = core.snapshot().activity;
      return activity?.type === "sequence" && activity.active?.kind === "direction"
        ? activity.active.elapsedTicks
        : undefined;
    },
  };
} catch (error) {
  window.__directionStepError = error instanceof Error ? error.stack ?? error.message : String(error);
}
