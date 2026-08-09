import { expect, test } from "@playwright/test";

import { createTestSession } from "../src/internal/core";
import {
  defineCharacter,
  defineGame,
  defineObject,
  defineScene,
  defineSequence,
  validateSaveSnapshot,
  type ValidatedSaveSnapshot,
} from "../src/index";

function projectFixture(throwFromBehavior = false, consumeSelectedObject = false) {
  const square = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 100 },
    { x: 0, y: 100 },
  ];
  const opening = defineScene({
    background: "opening.png",
    walkableRegion: square,
    scenery: {
      gate: {
        baseline: 70,
        initialAppearance: "closed",
        appearances: {
          closed: { kind: "background-region", area: square },
          open: { kind: "background-region", area: square },
        },
      },
    },
    hotspots: [
      {
        target: { kind: "character", character: "player" },
        area: square,
        approach: { groundPoint: { x: 20, y: 20 }, facing: "front" },
        primaryAction: {
          cases: [
            {
              when: { variable: "gateOpen", equals: true },
              label: "Thank",
              response: "The way is open.",
              behavior(context) {
                if (throwFromBehavior) throw new Error("behavior exploded");
                context.operations.setVariable("behaviorRan", true);
              },
            },
          ],
          fallback: {
            label: "Talk",
            response: "A conversation begins.",
            operations: [{ type: "start-sequence", sequence: "conversation" }],
          },
        },
        inventoryUse: {
          cases: [],
          fallback: { outcome: "failure", response: "That does not help.", operations: [] },
        },
      },
      {
        target: { kind: "object", object: "key" },
        area: square,
        approach: { groundPoint: { x: 40, y: 40 }, facing: "right" },
        primaryAction: {
          cases: [],
          fallback: {
            label: "Take",
            response: "You take the key.",
            operations: [{ type: "collect-target-object" }],
          },
        },
      },
      {
        target: { kind: "scenery", scenery: "gate" },
        area: square,
        approach: { groundPoint: { x: 70, y: 70 }, facing: "back" },
        primaryAction: {
          cases: [],
          fallback: { label: "Look", response: "A locked gate.", operations: [] },
        },
        inventoryUse: {
          cases: [
            {
              object: "key",
              outcome: "success",
              response: "The lock opens.",
              operations: [
                { type: "set-variable", variable: "gateOpen", value: true },
                {
                  type: "set-appearance",
                  target: { kind: "scenery", scene: "opening", scenery: "gate" },
                  appearance: "open",
                },
                ...(consumeSelectedObject
                  ? [{ type: "consume-selected-object" } as const]
                  : [{
                      type: "place-selected-object",
                      groundPoint: { x: 75, y: 75 },
                      appearance: "used",
                    } as const]),
              ],
            },
          ],
          fallback: { outcome: "failure", response: "It does not fit.", operations: [] },
        },
      },
    ],
    entrances: { start: { groundPoint: { x: 10, y: 10 }, facing: "front" } },
    passages: [
      {
        area: square,
        approach: { groundPoint: { x: 90, y: 90 }, facing: "back" },
        when: { variable: "gateOpen", equals: true },
        destination: { scene: "ending", entrance: "fromOpening" },
      },
    ],
  });
  const ending = defineScene({
    background: "ending.png",
    walkableRegion: square,
    entrances: { fromOpening: { groundPoint: { x: 5, y: 5 }, facing: "right" } },
  });
  const player = defineCharacter({
    initialScene: "opening",
    initialGroundPoint: { x: 10, y: 10 },
    initialFacing: "front",
    initialAppearance: "normal",
    appearances: {
      normal: { kind: "static", image: "normal.png" },
      happy: { kind: "static", image: "happy.png" },
    },
    movementSpeed: 600,
  });
  const key = defineObject({
    initialScene: "opening",
    initialGroundPoint: { x: 40, y: 40 },
    initialAppearance: "new",
    appearances: {
      new: { kind: "static", image: "key.png" },
      used: { kind: "static", image: "used-key.png" },
    },
    inventoryAppearance: "key-inventory.png",
  });
  const conversation = defineSequence({
    steps: [
      { type: "line", character: "player", text: "Can you help me?" },
      {
        type: "choice",
        alternatives: [
          {
            text: "Yes",
            when: { variable: "met", equals: false },
            steps: [
              {
                type: "operations",
                operations: [
                  { type: "set-variable", variable: "met", value: true },
                  {
                    type: "set-appearance",
                    target: { kind: "character", character: "player" },
                    appearance: "happy",
                  },
                ],
              },
              { type: "line", text: "The committed branch continues." },
            ],
          },
        ],
        fallback: { text: "Again", steps: [] },
      },
      { type: "line", text: "The road still waits." },
      { type: "line", text: "The conversation ends." },
    ],
  });

  return defineGame({
    identity: "test.gameplay",
    version: "1",
    logicalResolution: { width: 100, height: 100 },
    inventoryAppearanceSize: 32,
    scenes: { opening, ending },
    characters: { player },
    playerCharacter: "player",
    objects: { key },
    sequences: { conversation },
    variables: { met: false, gateOpen: false, behaviorRan: false },
    initialScene: "opening",
  });
}

function interact(session: ReturnType<typeof createTestSession>, hotspot: number) {
  session.input({ type: "activate-hotspot", hotspot });
  session.steps(20);
}

test("a modal Sequence exposes a resumable Line and Choice, then commits its branch", () => {
  const session = createTestSession(projectFixture());
  interact(session, 0);
  expect(session.snapshot().activity).toMatchObject({ type: "sequence", active: { kind: "line" } });

  session.input({ type: "move", point: { x: 99, y: 99 } });
  session.input({ type: "advance-sequence" });
  session.steps();
  expect(session.snapshot().activity).toMatchObject({
    type: "sequence",
    active: { kind: "choice", eligibleAlternatives: [0] },
  });

  session.input({ type: "choose", alternative: 0 });
  session.steps();
  expect(session.snapshot().activity).toMatchObject({ type: "sequence", active: { kind: "line" } });
  expect(session.snapshot().variables.met).toBe(true);
  expect(session.snapshot().characters.player!.appearance).toBe("happy");
  session.input({ type: "advance-sequence" });
  session.steps();
  expect(session.snapshot().activity).toMatchObject({ type: "sequence", active: { kind: "line" } });
  session.input({ type: "advance-sequence" });
  session.steps();
  expect(session.snapshot().activity).toMatchObject({ type: "sequence", active: { kind: "line" } });
  session.input({ type: "advance-sequence" });
  session.steps();
  expect(session.snapshot().activity).toBeNull();
});

test("Save Snapshot validation restores the exact active Choice", () => {
  const project = projectFixture();
  const uninterrupted = createTestSession(project);
  interact(uninterrupted, 0);
  uninterrupted.input({ type: "advance-sequence" });
  uninterrupted.steps();

  const raw = JSON.parse(JSON.stringify(uninterrupted.createSaveSnapshot())) as unknown;
  const validation = validateSaveSnapshot(project, raw);
  expect(validation.ok).toBe(true);
  if (!validation.ok) return;
  const restored = createTestSession(project, validation.snapshot);
  expect(restored.snapshot()).toEqual(uninterrupted.snapshot());

  for (const session of [uninterrupted, restored]) {
    session.input({ type: "choose", alternative: 0 });
    session.steps();
  }
  expect(restored.snapshot()).toEqual(uninterrupted.snapshot());
});

test("Inventory Use preserves selection on failure and relocates it atomically on success", () => {
  const session = createTestSession(projectFixture());
  interact(session, 1);
  expect(session.snapshot().inventory.objects).toEqual(["key"]);
  expect(session.snapshot().inventory.selected).toBeNull();

  session.input({ type: "select-object", object: "key" });
  session.steps();
  interact(session, 0);
  expect(session.snapshot().inventory.selected).toBe("key");

  interact(session, 2);
  expect(session.snapshot().inventory).toEqual({ objects: [], selected: null });
  expect(session.snapshot().objects.key).toMatchObject({
    location: { kind: "scene", scene: "opening", groundPoint: { x: 75, y: 75 } },
    appearance: "used",
  });
  expect(session.snapshot().variables.gateOpen).toBe(true);
  expect(session.snapshot().scenery.opening!.gate).toBe("open");
});

test("a successful Inventory Use can consume the selected Object terminally", () => {
  const session = createTestSession(projectFixture(false, true));
  interact(session, 1);
  session.input({ type: "select-object", object: "key" });
  session.steps();
  interact(session, 2);

  expect(session.snapshot().inventory).toEqual({ objects: [], selected: null });
  expect(session.snapshot().objects.key!.location).toEqual({ kind: "consumed" });
  session.steps(10);
  expect(session.snapshot().objects.key!.location).toEqual({ kind: "consumed" });
});

test("a controlled Game Behavior commits operations and an enabled passage transitions atomically", () => {
  const session = createTestSession(projectFixture());
  interact(session, 1);
  session.input({ type: "select-object", object: "key" });
  session.steps();
  interact(session, 2);
  interact(session, 0);
  expect(session.snapshot().variables.behaviorRan).toBe(true);

  session.input({ type: "activate-passage", passage: 0 });
  session.steps(20);
  expect(session.snapshot().currentScene).toBe("ending");
  expect(session.snapshot().characters.player).toMatchObject({
    scene: "ending",
    groundPoint: { x: 5, y: 5 },
    facing: "right",
  });
});

test("incompatible external save data returns diagnostics instead of throwing", () => {
  const result = validateSaveSnapshot(projectFixture(), {
    formatVersion: 1,
    projectIdentity: "another.game",
  });
  expect(result.ok).toBe(false);
  if (result.ok) return;
  expect(result.diagnostics.map(({ code }) => code)).toContain("save.project.identity");
});

test("a contradictory or unexpectedly extended Save Snapshot is rejected", () => {
  const project = projectFixture();
  const session = createTestSession(project);
  const snapshot = session.createSaveSnapshot();
  const corrupted = {
    ...snapshot,
    unexpected: true,
    state: {
      ...snapshot.state,
      inventory: { objects: ["key"], selected: "key" },
    },
  };

  const result = validateSaveSnapshot(project, corrupted);
  expect(result.ok).toBe(false);
  if (result.ok) return;
  expect(result.diagnostics.map(({ code }) => code)).toEqual(
    expect.arrayContaining(["save.fields.unexpected", "save.state.invalid"]),
  );
});

test("Save Snapshot validation rejects impossible Sequence control state", () => {
  const project = projectFixture();
  const session = createTestSession(project);
  interact(session, 0);
  session.input({ type: "advance-sequence" });
  session.steps();
  const snapshot = session.createSaveSnapshot();
  const activity = snapshot.state.activity;
  expect(activity).toMatchObject({ type: "sequence", active: { kind: "choice" } });
  if (activity?.type !== "sequence" || activity.active?.kind !== "choice") return;

  const result = validateSaveSnapshot(project, {
    ...snapshot,
    state: {
      ...snapshot.state,
      activity: {
        ...activity,
        active: { ...activity.active, path: "steps/999", eligibleAlternatives: [42] },
      },
    },
  });
  expect(result.ok).toBe(false);
  if (!result.ok) expect(result.diagnostics.map(({ code }) => code)).toContain("save.state.invalid");
});

test("Save Snapshot validation rejects a structurally real but rewound Sequence queue", () => {
  const project = projectFixture();
  const session = createTestSession(project);
  interact(session, 0);
  session.input({ type: "advance-sequence" });
  session.steps();
  const snapshot = session.createSaveSnapshot();
  const activity = snapshot.state.activity;
  if (activity?.type !== "sequence" || activity.active?.kind !== "choice") return;

  const result = validateSaveSnapshot(project, {
    ...snapshot,
    state: {
      ...snapshot.state,
      activity: { ...activity, pendingPaths: [...activity.pendingPaths].reverse() },
    },
  });
  expect(result.ok).toBe(false);
  if (!result.ok) expect(result.diagnostics.map(({ code }) => code)).toContain("save.state.invalid");
});

test("a structurally valid but unvalidated snapshot cannot restore a session", () => {
  const project = projectFixture();
  const raw = createTestSession(project).createSaveSnapshot() as ValidatedSaveSnapshot;
  expect(() => createTestSession(project, raw)).toThrow(/validateSaveSnapshot/);
});

test("a throwing Game Behavior keeps the preceding commit and fails with its cause", () => {
  const session = createTestSession(projectFixture(true));
  interact(session, 1);
  session.input({ type: "select-object", object: "key" });
  session.steps();
  interact(session, 2);
  const beforeBehavior = session.snapshot();

  interact(session, 0);
  expect(session.lifecycle()).toBe("failed");
  const afterBehavior = session.snapshot();
  expect(afterBehavior.variables).toEqual(beforeBehavior.variables);
  expect(afterBehavior.inventory).toEqual(beforeBehavior.inventory);
  expect(afterBehavior.objects).toEqual(beforeBehavior.objects);
  expect(afterBehavior.scenery).toEqual(beforeBehavior.scenery);
  expect(afterBehavior.characters.player!.appearance).toBe(
    beforeBehavior.characters.player!.appearance,
  );
  expect(session.diagnostics()[0]).toMatchObject({
    code: "behavior.threw",
    family: "behavior",
    cause: new Error("behavior exploded"),
  });
});
