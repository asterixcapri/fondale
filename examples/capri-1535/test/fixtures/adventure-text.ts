import {
  defineCharacter,
  defineGame,
  defineHUDTheme,
  defineNoun,
  defineScene,
  defineSequence,
  startGame,
} from "@asterixcapri/fondale";

import { italianCommandFallbacks, italianCommandLexicon } from "../../src/hud";

const requestedScene = new URLSearchParams(location.search).get("scene");
const sceneFamily = requestedScene === "boffe" ? "boffe" : requestedScene === "harbour" ? "harbour" : "aiano";
const background = await logicalBackground(`/art/scenes/${sceneFamily}/background.png`);
const hudTheme = defineHUDTheme({
  font: { family: "Capri Pixel", source: "/src/hud/capri-pixel.ttf" },
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
});

const responseNoun = defineNoun({
  labels: [{ text: "Panorama" }],
  preferredVerbs: [{ verb: "look-at" }],
  cases: [{ verb: "look-at", response: { text: "La luce cambia ogni pietra senza nascondere la strada." } }],
});
const narrationNoun = defineNoun({
  labels: [{ text: "Ricordo" }],
  preferredVerbs: [{ verb: "look-at" }],
  cases: [{ verb: "look-at", sequence: "memory" }],
});
const guideNoun = defineNoun({
  labels: [{ text: "Guida" }],
  preferredVerbs: [{ verb: "talk-to" }],
  cases: [{
    verb: "talk-to",
    line: { character: "guide", text: "Qui ogni voce deve restare sopra chi la pronuncia." },
  }],
});

const project = defineGame({
  identity: `capri.adventure-text.${sceneFamily}`,
  version: "1",
  logicalResolution: { width: 426, height: 240 },
  initialScene: sceneFamily,
  playerCharacter: "player",
  scenes: {
    [sceneFamily]: defineScene({
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
    }),
  },
  characters: {
    player: defineCharacter({
      initialScene: sceneFamily,
      initialGroundPoint: { x: 210, y: 175 },
      initialFacing: "front",
      initialAppearance: "idle",
      appearances: { idle: { kind: "static", image: "/src/characters/host/idle.png" } },
      movementSpeed: 900,
    }),
    guide: defineCharacter({
      initialScene: sceneFamily,
      initialGroundPoint: { x: 334, y: 178 },
      initialFacing: "front",
      initialAppearance: "idle",
      appearances: { idle: { kind: "static", image: "/src/characters/raffaele/idle.png" } },
      movementSpeed: 60,
      noun: guideNoun,
    }),
  },
  sequences: {
    memory: defineSequence({
      steps: [{ type: "narration", text: "Il vento porta il sale fin dentro i vicoli dell'isola." }, {
        type: "choice",
        alternatives: [{ text: "Seguiamo la luce.", steps: [] }, { text: "Restiamo ancora un momento.", steps: [] }],
        fallback: { text: "Andiamo via.", spoken: false, steps: [] },
      }],
    }),
  },
  commandLexicon: italianCommandLexicon,
  commandFallbacks: italianCommandFallbacks,
  hudTheme,
});

await startGame(project, { target: document.querySelector<HTMLElement>("#game")! });

async function logicalBackground(source: string): Promise<string> {
  const image = new Image();
  image.src = source;
  await image.decode();
  const canvas = document.createElement("canvas");
  canvas.width = 426;
  canvas.height = 240;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D is unavailable");
  const scale = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  context.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
  return canvas.toDataURL("image/png");
}
