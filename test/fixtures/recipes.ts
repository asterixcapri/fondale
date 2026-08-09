import {
  defineCharacter,
  defineGame,
  defineScene,
  startGame,
  validateSaveSnapshot,
  type GameSession,
} from "@asterixcapri/fondale";

import { interactionScene } from "../../docs/public/recipes/interaction";
import { key, successfulUse } from "../../docs/public/recipes/inventory";
import { greeting } from "../../docs/public/recipes/sequence";

const sceneUrl = new URL("../../docs/public/recipes/scene.png", import.meta.url);
const player = defineCharacter({
  initialScene: "opening",
  initialGroundPoint: { x: 50, y: 50 },
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
  characters: { player },
  playerCharacter: "player",
  variables: { doorOpen: false },
  initialScene: "opening",
});

const sequenceInventoryScene = defineScene({
  background: sceneUrl,
  walkableRegion: [
    { x: 0, y: 0 }, { x: 100, y: 0 },
    { x: 100, y: 100 }, { x: 0, y: 100 },
  ],
  hotspots: [
    {
      target: { kind: "background" },
      area: [{ x: 10, y: 10 }, { x: 30, y: 10 }, { x: 30, y: 30 }, { x: 10, y: 30 }],
      approach: { groundPoint: { x: 20, y: 35 }, facing: "back" },
      primaryAction: {
        cases: [],
        fallback: {
          label: "Talk",
          response: "The greeting begins.",
          operations: [{ type: "start-sequence", sequence: "greeting" }],
        },
      },
    },
    {
      target: { kind: "object", object: "key" },
      area: [{ x: 30, y: 70 }, { x: 50, y: 70 }, { x: 50, y: 90 }, { x: 30, y: 90 }],
      approach: { groundPoint: { x: 40, y: 65 }, facing: "front" },
      primaryAction: {
        cases: [],
        fallback: {
          label: "Take",
          response: "The recipe key is collected.",
          operations: [{ type: "collect-target-object" }],
        },
      },
    },
    {
      target: { kind: "background" },
      area: [{ x: 70, y: 70 }, { x: 90, y: 70 }, { x: 90, y: 90 }, { x: 70, y: 90 }],
      approach: { groundPoint: { x: 70, y: 65 }, facing: "front" },
      primaryAction: {
        cases: [],
        fallback: { label: "Look", response: "An empty receptacle.", operations: [] },
      },
      inventoryUse: {
        cases: [successfulUse],
        fallback: { outcome: "failure", response: "No effect.", operations: [] },
      },
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
