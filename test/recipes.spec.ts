import { expect, test } from "@playwright/test";
import { defineGame, defineScene } from "@asterixcapri/fondale";

import { player } from "../docs/public/recipes/character-walking";
import { firstProject, firstScene } from "../docs/public/recipes/first-scene";
import { openWhenReady } from "../docs/public/recipes/game-behavior";
import { interactionScene } from "../docs/public/recipes/interaction";
import { key, successfulUse } from "../docs/public/recipes/inventory";
import { restoreStoredProject } from "../docs/public/recipes/save-snapshot";
import { greeting } from "../docs/public/recipes/sequence";

test("every public recipe executes against the built package root", () => {
  expect(Object.isFrozen(firstScene)).toBe(true);
  expect(Object.isFrozen(firstProject)).toBe(true);
  expect(Object.isFrozen(player)).toBe(true);
  expect(Object.isFrozen(interactionScene)).toBe(true);
  expect(Object.isFrozen(key)).toBe(true);
  expect(Object.isFrozen(greeting)).toBe(true);
  expect(successfulUse.outcome).toBe("success");
  expect(restoreStoredProject).toBeInstanceOf(Function);

  const writes: string[] = [];
  openWhenReady({
    reads: {
      variable: (name) => name === "ready",
      hasObject: (object) => object === "key",
    },
    operations: {
      setVariable: (name, value) => writes.push(`${name}:${value}`),
      setAppearance: () => writes.push("appearance"),
      startSequence: () => writes.push("sequence"),
    },
    target: { kind: "background" },
  });
  expect(writes).toEqual(["doorOpen:true"]);
});

test("the Interaction, Sequence, and Inventory recipes compose as validated projects", () => {
  const plainScene = defineScene({
    background: "scene.png",
    walkableRegion: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }],
    hotspots: [{
      target: { kind: "background" },
      area: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 0, y: 10 }],
      approach: { groundPoint: { x: 5, y: 5 }, facing: "front" },
      primaryAction: {
        cases: [],
        fallback: { label: "Look", response: "A plain room.", operations: [] },
      },
      inventoryUse: {
        cases: [successfulUse],
        fallback: { outcome: "failure", response: "No effect.", operations: [] },
      },
    }],
  });
  const projects = [
    defineGame({
      identity: "recipe.interaction",
      version: "1",
      logicalResolution: { width: 100, height: 100 },
      scenes: { opening: interactionScene },
      variables: { doorOpen: false },
      initialScene: "opening",
    }),
    defineGame({
      identity: "recipe.sequence",
      version: "1",
      logicalResolution: { width: 100, height: 100 },
      scenes: { opening: plainScene },
      sequences: { greeting },
      variables: { ready: true },
      objects: { key },
      initialScene: "opening",
    }),
    defineGame({
      identity: "recipe.inventory",
      version: "1",
      logicalResolution: { width: 100, height: 100 },
      scenes: { opening: plainScene },
      objects: { key },
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
