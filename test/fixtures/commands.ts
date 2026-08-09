import backgroundUrl from "./background.png";
import keyInventoryUrl from "../../docs/public/recipes/key-inventory-32.png";
import keyUrl from "../../docs/public/recipes/key.png";
import {
  defineCharacter,
  defineCommandLexicon,
  defineGame,
  defineNoun,
  defineObject,
  defineScene,
  startGame,
} from "../../src/index";

const door = defineNoun({
  labels: [{ text: "Portone" }],
  preferredVerbs: [{ verb: "look-at" }],
  cases: [{
    verb: "look-at",
    response: { text: "Un vecchio portone.", presentation: "narration" },
  }, {
    verb: "use",
    firstNoun: "key",
    response: { text: "La chiave gira nella serratura." },
  }],
});
const keyNoun = defineNoun({
  labels: [{ text: "Chiave" }],
  preferredVerbs: [{ verb: "pick-up" }],
  cases: [{
    verb: "pick-up",
    response: { text: "Raccolgo la chiave." },
    operations: [{ type: "collect-target-object" }],
  }],
});
const exitNoun = defineNoun({
  labels: [{ text: "Verso l'uscita" }],
  preferredVerbs: [{ verb: "walk-to" }],
  cases: [],
});
const returnNoun = defineNoun({
  labels: [{ text: "Verso il portone" }],
  preferredVerbs: [{ verb: "walk-to" }],
  cases: [],
});
const globalResponse = { text: "Non succede nulla." };
const project = defineGame({
  identity: "test.commands",
  version: "1",
  logicalResolution: { width: 426, height: 240 },
  initialScene: "opening",
  playerCharacter: "player",
  inventoryAppearanceSize: 32,
  objects: {
    key: defineObject({
      initialScene: "opening",
      initialGroundPoint: { x: 120, y: 150 },
      initialAppearance: "scene",
      appearances: { scene: { kind: "static", image: keyUrl } },
      inventoryAppearance: keyInventoryUrl,
      noun: keyNoun,
    }),
  },
  characters: {
    player: defineCharacter({
      initialScene: "opening",
      initialGroundPoint: { x: 180, y: 175 },
      initialFacing: "front",
      initialAppearance: "idle",
      appearances: { idle: { kind: "static", image: backgroundUrl } },
      movementSpeed: 600,
    }),
  },
  commandLexicon: defineCommandLexicon({
    verbs: {
      open: "Apri", "pick-up": "Raccogli", push: "Spingi",
      close: "Chiudi", "look-at": "Guarda", pull: "Tira",
      give: "Dai", "talk-to": "Parla con", use: "Usa",
    },
    patterns: {
      unary: "{verb} {noun}",
      give: "{verb} {first} a {second}",
      use: "{verb} {first} con {second}",
    },
  }),
  commandFallbacks: {
    open: globalResponse, "pick-up": globalResponse, push: globalResponse,
    close: globalResponse, "look-at": globalResponse, pull: globalResponse,
    give: globalResponse, "talk-to": globalResponse, use: globalResponse,
  },
  scenes: {
    opening: defineScene({
      background: backgroundUrl,
      walkableRegion: [
        { x: 0, y: 100 }, { x: 426, y: 100 }, { x: 426, y: 180 }, { x: 0, y: 180 },
      ],
      entrances: { fromHall: { groundPoint: { x: 380, y: 150 }, facing: "left" } },
      passages: [{
        area: [{ x: 380, y: 100 }, { x: 426, y: 100 }, { x: 426, y: 170 }, { x: 380, y: 170 }],
        approach: { groundPoint: { x: 390, y: 150 }, facing: "right" },
        noun: exitNoun,
        direction: "right",
        destination: { scene: "hall", entrance: "fromOpening" },
      }],
      hotspots: [{
        target: { kind: "background" },
        area: [{ x: 200, y: 80 }, { x: 260, y: 80 }, { x: 260, y: 150 }, { x: 200, y: 150 }],
        approach: { groundPoint: { x: 220, y: 150 }, facing: "back" },
        noun: door,
        primaryAction: {
          cases: [],
          fallback: { label: "Portone", response: "Legacy.", operations: [] },
        },
      }, {
        target: { kind: "object", object: "key" },
        area: [{ x: 100, y: 125 }, { x: 140, y: 125 }, { x: 140, y: 165 }, { x: 100, y: 165 }],
        approach: { groundPoint: { x: 120, y: 150 }, facing: "front" },
        noun: keyNoun,
        primaryAction: {
          cases: [],
          fallback: { label: "Chiave", response: "Legacy.", operations: [] },
        },
      }],
    }),
    hall: defineScene({
      background: backgroundUrl,
      walkableRegion: [
        { x: 0, y: 100 }, { x: 426, y: 100 }, { x: 426, y: 180 }, { x: 0, y: 180 },
      ],
      entrances: { fromOpening: { groundPoint: { x: 40, y: 150 }, facing: "right" } },
      passages: [{
        area: [{ x: 0, y: 100 }, { x: 46, y: 100 }, { x: 46, y: 170 }, { x: 0, y: 170 }],
        approach: { groundPoint: { x: 36, y: 150 }, facing: "left" },
        noun: returnNoun,
        direction: "left",
        destination: { scene: "opening", entrance: "fromHall" },
      }],
    }),
  },
});

await startGame(project, { target: document.querySelector<HTMLElement>("#game")! });
