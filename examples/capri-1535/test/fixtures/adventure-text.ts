import {
  type CharacterDefinition,
  type GameProject,
  type HUDTheme,
  type NounDefinition,
  type SceneDefinition,
  type SequenceDefinition,
  startGame,
} from "@asterixcapri/fondale";

import { italianCommandFallbacks, italianCommandLexicon } from "../../src/hud";
import { logicalBackground } from "./logical-background";

const requestedScene = new URLSearchParams(location.search).get("scene");
const sceneFamily = requestedScene === "boffe" ? "boffe" : requestedScene === "harbour" ? "harbour" : "aiano";
const background = await logicalBackground(`/art/scenes/${sceneFamily}/background.png`);
const hudTheme = ({
  font: { family: "Alegreya Sans", source: "/src/hud/alegreya-sans-medium.ttf" },
  colors: {
    text: "#f4dfb4",
    preferred: "#f2ad62",
    selected: "#58d6d2",
    backing: "#0c1626",
    border: "#5c7182",
    inventoryWell: "#152536",
  },
  opacity: 0.9,
  maxSpeechWidth: 160,
  cursors: {
    left: "/src/hud/cursors/left.svg",
    right: "/src/hud/cursors/right.svg",
    up: "/src/hud/cursors/up.svg",
    down: "/src/hud/cursors/down.svg",
    enter: "/src/hud/cursors/enter.svg",
  },
  speechColors: { player: "#f4dfb4", guide: "#f2ad62" },
} satisfies HUDTheme);

const responseNoun = ({
  labels: [{ text: "Panorama" }],
  preferredVerbs: [{ verb: "look-at" }],
  cases: [{ verb: "look-at", response: { text: "La luce cambia ogni pietra senza nascondere la strada." } }],
} satisfies NounDefinition);
const narrationNoun = ({
  labels: [{ text: "Ricordo" }],
  preferredVerbs: [{ verb: "look-at" }],
  cases: [{ verb: "look-at", sequence: "memory" }],
} satisfies NounDefinition);
const guideNoun = ({
  labels: [{ text: "Guida" }],
  preferredVerbs: [{ verb: "talk-to" }],
  cases: [{
    verb: "talk-to",
    line: { character: "guide", text: "Qui ogni voce deve restare sopra chi la pronuncia." },
  }],
} satisfies NounDefinition);

const project = ({
  identity: `capri.adventure-text.${sceneFamily}`,
  version: "1",
  logicalResolution: { width: 426, height: 240 },
  initialScene: sceneFamily,
  playerCharacter: "player",
  scenes: {
    [sceneFamily]: ({
      background,
      walkableRegion: [{ x: 0, y: 130 }, { x: 426, y: 130 }, { x: 426, y: 215 }, { x: 0, y: 215 }],
      hotspots: [{
        target: { kind: "background" },
        area: [{ x: 24, y: 80 }, { x: 128, y: 80 }, { x: 128, y: 145 }, { x: 24, y: 145 }],
        approach: { groundPoint: { x: 90, y: 165 }, facing: "back" },
        noun: responseNoun,
      }, {
        target: { kind: "background" },
        area: [{ x: 155, y: 80 }, { x: 268, y: 80 }, { x: 268, y: 145 }, { x: 155, y: 145 }],
        approach: { groundPoint: { x: 210, y: 165 }, facing: "back" },
        noun: narrationNoun,
      }, {
        target: { kind: "character", character: "guide" },
        area: [{ x: 300, y: 85 }, { x: 365, y: 85 }, { x: 365, y: 190 }, { x: 300, y: 190 }],
        approach: { groundPoint: { x: 285, y: 170 }, facing: "right" },
      }],
    } satisfies SceneDefinition),
  },
  characters: {
    player: ({
      initialScene: sceneFamily,
      initialGroundPoint: { x: 210, y: 175 },
      initialFacing: "front",
      initialAppearance: "idle",
      appearances: { idle: { animations: { idle: { sheets: { left: { image: "/src/characters/brother-elia/idle.png", frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, right: { image: "/src/characters/brother-elia/idle.png", frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, front: { image: "/src/characters/brother-elia/idle.png", frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, back: { image: "/src/characters/brother-elia/idle.png", frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) } }, timing: { framesPerSecond: 1, loop: true } } }, roles: { default: "idle", walking: "idle" } } },
      movementSpeed: 900,
    } satisfies CharacterDefinition),
    guide: ({
      initialScene: sceneFamily,
      initialGroundPoint: { x: 334, y: 178 },
      initialFacing: "front",
      initialAppearance: "idle",
      appearances: { idle: { animations: { idle: { sheets: { left: { image: "/src/characters/raffaele/idle.png", frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, right: { image: "/src/characters/raffaele/idle.png", frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, front: { image: "/src/characters/raffaele/idle.png", frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, back: { image: "/src/characters/raffaele/idle.png", frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) } }, timing: { framesPerSecond: 1, loop: true } } }, roles: { default: "idle" } } },
      movementSpeed: 60,
      noun: guideNoun,
    } satisfies CharacterDefinition),
  },
  sequences: {
    memory: ({
      steps: [{ type: "narration", text: "Il vento porta il sale fin dentro i vicoli dell'isola." }, {
        type: "choice",
        alternatives: [{ text: "Seguiamo la luce.", steps: [] }, { text: "Restiamo ancora un momento.", steps: [] }],
        fallback: { text: "Andiamo via.", spoken: false, steps: [] },
      }],
    } satisfies SequenceDefinition),
  },
  commandLexicon: italianCommandLexicon,
  commandFallbacks: italianCommandFallbacks,
  hudTheme,
} satisfies GameProject);

await startGame(project, { target: document.querySelector<HTMLElement>("#game")! });
