import {
  defineCharacter,
  defineGame,
  defineNoun,
  defineScene,
  startGame,
  validateSaveSnapshot,
  type GameSession,
} from "@asterixcapri/fondale";

import {
  interactionHost,
  interactionKey,
  interactionScene,
} from "../../docs/public/recipes/interaction";
import {
  englishCommandFallbacks,
  englishCommandLexicon,
} from "../../docs/public/recipes/first-scene";
import { key, successfulUse } from "../../docs/public/recipes/inventory";
import { greeting } from "../../docs/public/recipes/sequence";

const sceneUrl = new URL("../../docs/public/recipes/scene.png", import.meta.url);
const player = defineCharacter({
  initialScene: "opening",
  initialGroundPoint: { x: 50, y: 35 },
  initialFacing: "front",
  initialAppearance: "idle",
  movementSpeed: 600,
  appearances: { idle: { kind: "static", image: new URL("../../docs/public/recipes/key.png", import.meta.url) } },
});

const interactionProject = defineGame({
  identity: "recipes.interaction",
  version: "1",
  logicalResolution: { width: 100, height: 100 },
  scenes: { opening: interactionScene },
  characters: { player, host: interactionHost },
  playerCharacter: "player",
  objects: { key: interactionKey },
  variables: { doorOpen: false },
  commandLexicon: englishCommandLexicon,
  commandFallbacks: englishCommandFallbacks,
  initialScene: "opening",
});

const sequenceInventoryScene = defineScene({
  background: sceneUrl,
  walkableRegion: [
    { x: 0, y: 0 }, { x: 100, y: 0 },
    { x: 100, y: 40 }, { x: 0, y: 40 },
  ],
  hotspots: [
    {
      target: { kind: "background" },
      area: [{ x: 10, y: 10 }, { x: 30, y: 10 }, { x: 30, y: 30 }, { x: 10, y: 30 }],
      approach: { groundPoint: { x: 20, y: 35 }, facing: "back" },
      noun: defineNoun({
        labels: [{ text: "Greeting" }],
        preferredVerbs: [{ verb: "talk-to" }],
        cases: [{ verb: "talk-to", sequence: "greeting" }],
      }),
    },
    {
      target: { kind: "object", object: "key" },
      area: [{ x: 30, y: 20 }, { x: 50, y: 20 }, { x: 50, y: 38 }, { x: 30, y: 38 }],
      approach: { groundPoint: { x: 40, y: 35 }, facing: "front" },
    },
    {
      target: { kind: "background" },
      area: [{ x: 70, y: 20 }, { x: 90, y: 20 }, { x: 90, y: 38 }, { x: 70, y: 38 }],
      approach: { groundPoint: { x: 70, y: 35 }, facing: "front" },
      noun: defineNoun({
        labels: [{ text: "Receptacle" }],
        preferredVerbs: [{ verb: "look-at" }],
        cases: [{ verb: "look-at", response: { text: "An empty receptacle." } }, successfulUse],
      }),
    },
  ],
});

const sequenceInventoryProject = defineGame({
  identity: "recipes.sequence-inventory",
  version: "1",
  logicalResolution: { width: 100, height: 100 },
  scenes: { opening: sequenceInventoryScene },
  characters: { player },
  playerCharacter: "player",
  objects: { key },
  sequences: { greeting },
  variables: { ready: true },
  commandLexicon: englishCommandLexicon,
  commandFallbacks: englishCommandFallbacks,
  initialScene: "opening",
});

const interactionTarget = document.querySelector<HTMLElement>('[data-recipe-target="interaction"]')!;
const sequenceInventoryTarget = document.querySelector<HTMLElement>('[data-recipe-target="sequence-inventory"]')!;
await startGame(interactionProject, { target: interactionTarget });
let sequenceInventorySession: GameSession = await startGame(sequenceInventoryProject, {
  target: sequenceInventoryTarget,
});

document.querySelector<HTMLButtonElement>("#restore-choice")!.addEventListener("click", async () => {
  const raw: unknown = JSON.parse(JSON.stringify(sequenceInventorySession.createSaveSnapshot()));
  const validation = validateSaveSnapshot(sequenceInventoryProject, raw);
  if (!validation.ok) throw new Error("Recipe snapshot did not validate.");
  sequenceInventorySession.stop();
  sequenceInventorySession = await startGame(sequenceInventoryProject, {
    target: sequenceInventoryTarget,
    snapshot: validation.snapshot,
  });
});
