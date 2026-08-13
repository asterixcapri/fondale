import { expect, test } from "@playwright/test";
import { type CharacterDefinition, type GameProject, type NounDefinition, type SceneDefinition } from "@asterixcapri/fondale";

import { player } from "../docs/public/recipes/character-walking";
import {
  englishCommandFallbacks,
  englishCommandLexicon,
  firstProject,
  firstScene,
} from "../docs/public/recipes/first-scene";
import { openWhenReady } from "../docs/public/recipes/command-case";
import {
  interactionHost,
  interactionKey,
  interactionScene,
} from "../docs/public/recipes/interaction";
import { exampleHUDTheme } from "../docs/public/recipes/hud-theme";
import { key, successfulUse } from "../docs/public/recipes/inventory";
import { restoreStoredProject } from "../docs/public/recipes/save-snapshot";
import { greeting } from "../docs/public/recipes/sequence";

const sequencePlayer = ({
  initialScene: "opening",
  initialGroundPoint: { x: 10, y: 10 },
  initialFacing: "front",
  initialAppearance: "idle",
  movementSpeed: 60,
  appearances: { idle: { animations: { idle: { frames: {
    left: { image: "player.png", count: 1 },
    right: { image: "player.png", count: 1 },
    front: { image: "player.png", count: 1 },
    back: { image: "player.png", count: 1 },
  }, framesPerSecond: 1, loop: true } }, roles: { default: "idle", walking: "idle" } } },
} satisfies CharacterDefinition);

test("every public recipe exposes ordinary author-owned data from the built package root", () => {
  expect(Object.isFrozen(firstScene)).toBe(false);
  expect(Object.isFrozen(firstProject)).toBe(false);
  expect(Object.isFrozen(player)).toBe(false);
  expect(Object.isFrozen(interactionScene)).toBe(false);
  expect(Object.isFrozen(exampleHUDTheme)).toBe(false);
  expect(Object.isFrozen(key)).toBe(false);
  expect(Object.isFrozen(greeting)).toBe(false);
  expect(successfulUse.verb).toBe("use");
  expect(restoreStoredProject).toBeInstanceOf(Function);

  expect(openWhenReady.operations).toEqual([
    { type: "set-variable", variable: "doorOpen", value: true },
  ]);
});

test("the Interaction, Sequence, and Inventory recipes compose as typed projects", () => {
  const plainScene = ({
    background: "scene.png",
    walkableRegion: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 40 }, { x: 0, y: 40 }],
    hotspots: [{
      target: { kind: "background" },
      area: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 0, y: 10 }],
      approach: { groundPoint: { x: 5, y: 5 }, facing: "front" },
      noun: ({
        labels: [{ text: "Plain room" }],
        preferredVerbs: [{ verb: "look-at" }],
        cases: [{ verb: "look-at", response: { text: "A plain room." } }, successfulUse],
      } satisfies NounDefinition),
    }],
  } satisfies SceneDefinition);
  const projects = [
    ({
      identity: "recipe.interaction",
      version: "1",
      logicalResolution: { width: 100, height: 100 },
      scenes: { opening: interactionScene },
      characters: { host: interactionHost },
      objects: { key: interactionKey },
      variables: { doorOpen: false },
      hudTheme: exampleHUDTheme,
      commandLexicon: englishCommandLexicon,
      commandFallbacks: englishCommandFallbacks,
      initialScene: "opening",
    } satisfies GameProject),
    ({
      identity: "recipe.sequence",
      version: "1",
      logicalResolution: { width: 100, height: 100 },
      scenes: { opening: plainScene },
      characters: { player: sequencePlayer },
      playerCharacter: "player",
      sequences: { greeting },
      variables: { ready: true },
      objects: { key },
      commandLexicon: englishCommandLexicon,
      commandFallbacks: englishCommandFallbacks,
      initialScene: "opening",
    } satisfies GameProject),
    ({
      identity: "recipe.inventory",
      version: "1",
      logicalResolution: { width: 100, height: 100 },
      scenes: { opening: plainScene },
      objects: { key },
      commandLexicon: englishCommandLexicon,
      commandFallbacks: englishCommandFallbacks,
      initialScene: "opening",
    } satisfies GameProject),
  ];
  expect(projects.every((project) => !Object.isFrozen(project))).toBe(true);
});

test("the Save recipe executes its invalid-data result path", async () => {
  const result = await restoreStoredProject(firstProject, null!, {});
  expect(result.ok).toBe(false);
  if (!result.ok) expect(result.diagnostics.length).toBeGreaterThan(0);
});
