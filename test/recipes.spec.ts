import { expect, test } from "@playwright/test";
import { defineCharacter, defineGame, defineNoun, defineScene } from "@asterixcapri/fondale";

import { player } from "../docs/public/recipes/character-walking";
import {
  englishCommandFallbacks,
  englishCommandLexicon,
  firstProject,
  firstScene,
} from "../docs/public/recipes/first-scene";
import { openWhenReady } from "../docs/public/recipes/command-case";
import { interactionScene } from "../docs/public/recipes/interaction";
import { key, successfulUse } from "../docs/public/recipes/inventory";
import { restoreStoredProject } from "../docs/public/recipes/save-snapshot";
import { greeting } from "../docs/public/recipes/sequence";

const sequencePlayer = defineCharacter({
  initialScene: "opening",
  initialGroundPoint: { x: 10, y: 10 },
  initialFacing: "front",
  initialAppearance: "idle",
  movementSpeed: 60,
  appearances: { idle: { kind: "static", image: "player.png" } },
});

test("every public recipe executes against the built package root", () => {
  expect(Object.isFrozen(firstScene)).toBe(true);
  expect(Object.isFrozen(firstProject)).toBe(true);
  expect(Object.isFrozen(player)).toBe(true);
  expect(Object.isFrozen(interactionScene)).toBe(true);
  expect(Object.isFrozen(key)).toBe(true);
  expect(Object.isFrozen(greeting)).toBe(true);
  expect(successfulUse.verb).toBe("use");
  expect(restoreStoredProject).toBeInstanceOf(Function);

  expect(openWhenReady.operations).toEqual([
    { type: "set-variable", variable: "doorOpen", value: true },
  ]);
});

test("the Interaction, Sequence, and Inventory recipes compose as validated projects", () => {
  const plainScene = defineScene({
    background: "scene.png",
    walkableRegion: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 40 }, { x: 0, y: 40 }],
    hotspots: [{
      target: { kind: "background" },
      area: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 0, y: 10 }],
      approach: { groundPoint: { x: 5, y: 5 }, facing: "front" },
      noun: defineNoun({
        labels: [{ text: "Plain room" }],
        preferredVerbs: [{ verb: "look-at" }],
        cases: [{ verb: "look-at", response: { text: "A plain room." } }, successfulUse],
      }),
    }],
  });
  const projects = [
    defineGame({
      identity: "recipe.interaction",
      version: "1",
      logicalResolution: { width: 100, height: 100 },
      scenes: { opening: interactionScene },
      variables: { doorOpen: false },
      commandLexicon: englishCommandLexicon,
      commandFallbacks: englishCommandFallbacks,
      initialScene: "opening",
    }),
    defineGame({
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
    }),
    defineGame({
      identity: "recipe.inventory",
      version: "1",
      logicalResolution: { width: 100, height: 100 },
      scenes: { opening: plainScene },
      objects: { key },
      commandLexicon: englishCommandLexicon,
      commandFallbacks: englishCommandFallbacks,
      initialScene: "opening",
    }),
  ];
  expect(projects.every(Object.isFrozen)).toBe(true);
});

test("the Save recipe executes its invalid-data result path", async () => {
  const result = await restoreStoredProject(firstProject, null!, {});
  expect(result.ok).toBe(false);
  if (!result.ok) expect(result.diagnostics.length).toBeGreaterThan(0);
});
