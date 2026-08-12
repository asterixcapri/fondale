import {
  type CharacterDefinition,
  type GameProject,
  type NounDefinition,
  type SceneDefinition,
  startGame,
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
const player = ({
  initialScene: "opening",
  initialGroundPoint: { x: 50, y: 35 },
  initialFacing: "front",
  initialAppearance: "idle",
  movementSpeed: 600,
  appearances: { idle: { animations: { idle: { frames: [new URL("../../docs/public/recipes/key.png", import.meta.url)], framesPerSecond: 1, loop: true } }, roles: { default: "idle", walking: "idle" } } },
} satisfies CharacterDefinition);

const interactionProject = ({
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
} satisfies GameProject);

const sequenceInventoryScene = ({
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
      noun: ({
        labels: [{ text: "Greeting" }],
        preferredVerbs: [{ verb: "talk-to" }],
        cases: [{ verb: "talk-to", sequence: "greeting" }],
      } satisfies NounDefinition),
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
      noun: ({
        labels: [{ text: "Receptacle" }],
        preferredVerbs: [{ verb: "look-at" }],
        cases: [{ verb: "look-at", response: { text: "An empty receptacle." } }, successfulUse],
      } satisfies NounDefinition),
    },
  ],
} satisfies SceneDefinition);

const sequenceInventoryProject = ({
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
} satisfies GameProject);

const interactionTarget = document.querySelector<HTMLElement>('[data-recipe-target="interaction"]')!;
const sequenceInventoryTarget = document.querySelector<HTMLElement>('[data-recipe-target="sequence-inventory"]')!;
await startGame(interactionProject, { target: interactionTarget });
let sequenceInventorySession: GameSession = await startGame(sequenceInventoryProject, {
  target: sequenceInventoryTarget,
});

document.querySelector<HTMLButtonElement>("#restore-choice")!.addEventListener("click", async () => {
  const raw: unknown = JSON.parse(JSON.stringify(sequenceInventorySession.createSaveSnapshot()));
  sequenceInventorySession.stop();
  sequenceInventorySession = await startGame(sequenceInventoryProject, {
    target: sequenceInventoryTarget,
    snapshot: raw,
  });
});
