import backgroundUrl from "./background.png";
import keyInventoryUrl from "../../docs/public/recipes/key-inventory-32.png";
import keyUrl from "../../docs/public/recipes/key.png";
import {
  type CharacterDefinition,
  type CommandLexicon,
  type GameProject,
  type NounDefinition,
  type ObjectDefinition,
  type SceneDefinition,
  type SequenceDefinition,
  startGame,
} from "../../src/index";

const silenceAudio =
  "data:audio/wav;base64,UklGRnQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVAAAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==";

const door = {
  labels: [{ text: "Portone" }],
  preferredVerbs: [{ verb: "look-at" }],
  secondaryVerbs: [{ verb: "talk-to" }],
  cases: [
    {
      verb: "look-at",
      response: { text: "Un vecchio portone." },
    },
    {
      verb: "talk-to",
      line: {
        text: "Il vecchio portone non risponde, anche se continuo a rivolgergli una domanda molto lunga e inutilmente cerimoniosa.",
        character: "host",
      },
    },
    {
      verb: "use",
      firstNoun: "key",
      response: { text: "La chiave gira nella serratura." },
    },
  ],
} satisfies NounDefinition;
const keyNoun = {
  labels: [{ text: "Chiave" }],
  preferredVerbs: [{ verb: "pick-up" }],
  secondaryVerbs: [{ verb: "look-at" }],
  cases: [
    {
      verb: "pick-up",
      response: { text: "Raccolgo la chiave." },
      operations: [{ type: "collect-target-object" }],
    },
    {
      verb: "look-at",
      response: { text: "Una piccola chiave da inventario." },
    },
  ],
} satisfies NounDefinition;
const extraNouns = Array.from(
  { length: 8 },
  (_, index) =>
    ({
      labels: [{ text: `Oggetto ${index + 1}` }],
      preferredVerbs: [{ verb: "pick-up" }],
      secondaryVerbs: [{ verb: "look-at" }],
      cases: [
        {
          verb: "pick-up",
          response: { text: `Raccolgo Oggetto ${index + 1}.` },
          operations: [{ type: "collect-target-object" }],
        },
        ...(index === 0
          ? [
              {
                verb: "use" as const,
                response: { text: "Uso Oggetto 1 da solo." },
              },
            ]
          : []),
        ...(index === 2
          ? [
              {
                verb: "use" as const,
                firstNoun: "item2",
                response: { text: "Uso Oggetto 2 con Oggetto 3." },
              },
            ]
          : []),
      ],
    }) satisfies NounDefinition,
);
const extraObjects = Object.fromEntries(
  extraNouns.map((noun, index) => [
    `item${index + 1}`,
    {
      initialScene: "opening",
      initialGroundPoint: { x: 20 + index * 22, y: 110 },
      initialAppearance: "scene",
      appearances: {
        scene: {
          animations: {
            idle: { frames: [keyUrl], framesPerSecond: 1, loop: true },
          },
          roles: { default: "idle" },
        },
      },
      inventoryAppearance: keyInventoryUrl,
      noun,
    } satisfies ObjectDefinition,
  ]),
);
const exitNoun = {
  labels: [{ text: "Verso l'uscita" }],
  preferredVerbs: [{ verb: "walk-to" }],
  cases: [],
} satisfies NounDefinition;
const returnNoun = {
  labels: [{ text: "Verso il portone" }],
  preferredVerbs: [{ verb: "walk-to" }],
  cases: [],
} satisfies NounDefinition;
const hostNoun = {
  labels: [{ text: "Oste" }],
  preferredVerbs: [{ verb: "talk-to" }],
  secondaryVerbs: [{ verb: "look-at" }],
  objectVerbs: [{ verb: "give" }],
  cases: [
    { verb: "talk-to", sequence: "hostGreeting" },
    {
      verb: "give",
      firstNoun: "key",
      response: { text: "L'oste rifiuta la chiave." },
    },
  ],
} satisfies NounDefinition;
const globalResponse = { text: "Non succede nulla." };
const project = {
  identity: "test.commands",
  version: "1",
  logicalResolution: { width: 426, height: 240 },
  initialScene: "opening",
  playerCharacter: "player",
  inventoryAppearanceSize: 32,
  objects: {
    key: {
      initialScene: "opening",
      initialGroundPoint: { x: 120, y: 150 },
      initialAppearance: "scene",
      appearances: {
        scene: {
          animations: {
            idle: { frames: [keyUrl], framesPerSecond: 1, loop: true },
          },
          roles: { default: "idle" },
        },
      },
      inventoryAppearance: keyInventoryUrl,
      noun: keyNoun,
    } satisfies ObjectDefinition,
    ...extraObjects,
  },
  characters: {
    player: {
      initialScene: "opening",
      initialGroundPoint: { x: 180, y: 175 },
      initialFacing: "front",
      initialAppearance: "idle",
      appearances: {
        idle: {
          animations: {
            idle: {
              frames: {
                left: { image: keyUrl, count: 1 },
                right: { image: keyUrl, count: 1 },
                front: { image: keyUrl, count: 1 },
                back: { image: keyUrl, count: 1 },
              },
              framesPerSecond: 1,
              loop: true,
            },
          },
          roles: { default: "idle", walking: "idle" },
        },
      },
      movementSpeed: 600,
    } satisfies CharacterDefinition,
    host: {
      initialScene: "opening",
      initialGroundPoint: { x: 315, y: 150 },
      initialFacing: "front",
      initialAppearance: "idle",
      appearances: {
        idle: {
          animations: {
            idle: {
              frames: {
                left: { image: keyUrl, count: 1 },
                right: { image: keyUrl, count: 1 },
                front: { image: keyUrl, count: 1 },
                back: { image: keyUrl, count: 1 },
              },
              framesPerSecond: 1,
              loop: true,
            },
          },
          roles: { default: "idle" },
        },
      },
      movementSpeed: 60,
      noun: hostNoun,
    } satisfies CharacterDefinition,
  },
  sequences: {
    hostGreeting: {
      skippable: true,
      skipOutcome: [],
      steps: [
        {
          type: "line",
          character: "host",
          text: "Benvenuto.",
          audio: silenceAudio,
        },
        { type: "narration", text: "La sera scende lentamente sul porto." },
        {
          type: "choice",
          alternatives: [
            {
              text: "Grazie!",
              steps: [{ type: "line", character: "host", text: "A te." }],
            },
            {
              text: "Non ora.",
              spoken: false,
              steps: [{ type: "line", character: "host", text: "Come vuoi." }],
            },
          ],
          fallback: { text: "Arrivederci.", spoken: false, steps: [] },
        },
      ],
    } satisfies SequenceDefinition,
  },
  commandLexicon: {
    inventory: { select: "Prendi {noun}", deselect: "Riponi {noun}" },
    verbs: {
      open: "Apri",
      "pick-up": "Raccogli",
      push: "Spingi",
      close: "Chiudi",
      "look-at": "Guarda",
      pull: "Tira",
      give: "Dai",
      "talk-to": "Parla con",
      use: "Usa",
    },
    patterns: {
      unary: "{noun} / {verb}",
      give: "{verb} {first} a {second}",
      use: "{verb} {first} con {second}",
    },
  } satisfies CommandLexicon,
  commandFallbacks: {
    open: globalResponse,
    "pick-up": globalResponse,
    push: globalResponse,
    close: globalResponse,
    "look-at": globalResponse,
    pull: globalResponse,
    give: globalResponse,
    "talk-to": globalResponse,
    use: globalResponse,
  },
  scenes: {
    opening: {
      background: backgroundUrl,
      walkableRegion: [
        { x: 0, y: 100 },
        { x: 426, y: 100 },
        { x: 426, y: 180 },
        { x: 0, y: 180 },
      ],
      entrances: {
        fromHall: { groundPoint: { x: 380, y: 150 }, facing: "left" },
      },
      passages: [
        {
          area: [
            { x: 380, y: 100 },
            { x: 426, y: 100 },
            { x: 426, y: 170 },
            { x: 380, y: 170 },
          ],
          approach: { groundPoint: { x: 390, y: 150 }, facing: "right" },
          noun: exitNoun,
          direction: "right",
          destination: { scene: "hall", entrance: "fromOpening" },
        },
        ...(["up", "down", "enter"] as const).map((direction, index) => ({
          area: [
            { x: 10 + index * 55, y: 70 },
            { x: 45 + index * 55, y: 70 },
            { x: 45 + index * 55, y: 95 },
            { x: 10 + index * 55, y: 95 },
          ],
          approach: {
            groundPoint: { x: 28 + index * 55, y: 110 },
            facing: "back" as const,
          },
          noun: exitNoun,
          direction,
          destination: { scene: "hall", entrance: "fromOpening" },
        })),
      ],
      hotspots: [
        {
          target: { kind: "background" },
          area: [
            { x: 200, y: 80 },
            { x: 260, y: 80 },
            { x: 260, y: 150 },
            { x: 200, y: 150 },
          ],
          approach: { groundPoint: { x: 220, y: 150 }, facing: "back" },
          noun: door,
        },
        {
          target: { kind: "object", object: "key" },
          area: [
            { x: 100, y: 125 },
            { x: 140, y: 125 },
            { x: 140, y: 165 },
            { x: 100, y: 165 },
          ],
          approach: { groundPoint: { x: 120, y: 150 }, facing: "front" },
        },
        {
          target: { kind: "character", character: "host" },
          area: [
            { x: 290, y: 110 },
            { x: 340, y: 110 },
            { x: 340, y: 165 },
            { x: 290, y: 165 },
          ],
          approach: { groundPoint: { x: 285, y: 150 }, facing: "right" },
        },
        ...extraNouns.map((noun, index) => ({
          target: { kind: "object" as const, object: `item${index + 1}` },
          area: [
            { x: 10 + index * 22, y: 100 },
            { x: 30 + index * 22, y: 100 },
            { x: 30 + index * 22, y: 120 },
            { x: 10 + index * 22, y: 120 },
          ],
          approach: {
            groundPoint: { x: 20 + index * 22, y: 130 },
            facing: "back" as const,
          },
        })),
      ],
    } satisfies SceneDefinition,
    hall: {
      background: backgroundUrl,
      walkableRegion: [
        { x: 0, y: 100 },
        { x: 426, y: 100 },
        { x: 426, y: 180 },
        { x: 0, y: 180 },
      ],
      entrances: {
        fromOpening: { groundPoint: { x: 40, y: 150 }, facing: "right" },
      },
      passages: [
        {
          area: [
            { x: 0, y: 100 },
            { x: 46, y: 100 },
            { x: 46, y: 170 },
            { x: 0, y: 170 },
          ],
          approach: { groundPoint: { x: 36, y: 150 }, facing: "left" },
          noun: returnNoun,
          direction: "left",
          destination: { scene: "opening", entrance: "fromHall" },
        },
      ],
    } satisfies SceneDefinition,
  },
} satisfies GameProject;

await startGame(project, {
  target: document.querySelector<HTMLElement>("#game")!,
});
