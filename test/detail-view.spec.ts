import { expect, test } from "@playwright/test";

import { createTestSession, validateTestSaveSnapshot } from "./support";
import { AuthoringError } from "../src/capabilities/game-project";
import {
  type CharacterDefinition,
  type CommandLexicon,
  type DetailViewDefinition,
  type GameProject,
  type NounDefinition,
  type ObjectDefinition,
  type SceneDefinition,
  type SequenceDefinition,
} from "../src/index";

const square = [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 100 },
  { x: 0, y: 100 },
];
const upperLeft = [
  { x: 0, y: 0 },
  { x: 40, y: 0 },
  { x: 40, y: 40 },
  { x: 0, y: 40 },
];
const lowerRight = [
  { x: 60, y: 60 },
  { x: 100, y: 60 },
  { x: 100, y: 100 },
  { x: 60, y: 100 },
];

const commandLexicon = {
  verbs: {
    open: "Open", "pick-up": "Pick up", push: "Push", close: "Close",
    "look-at": "Look at", pull: "Pull", give: "Give", "talk-to": "Talk to", use: "Use",
  },
  inventory: { select: "Select {noun}", deselect: "Deselect {noun}" },
  patterns: { unary: "{verb} {noun}", give: "{verb} {first} to {second}", use: "{verb} {first} with {second}" },
} satisfies CommandLexicon;

const player = {
  initialScene: "boat",
  initialGroundPoint: { x: 10, y: 10 },
  initialFacing: "front",
  initialAppearance: "normal",
  appearances: {
    normal: {
      animations: {
        idle: { sheets: { left: { image: "player.png", frames: [{ x: 0, y: 0, width: 1, height: 1 }] }, right: { image: "player.png", frames: [{ x: 0, y: 0, width: 1, height: 1 }] }, front: { image: "player.png", frames: [{ x: 0, y: 0, width: 1, height: 1 }] }, back: { image: "player.png", frames: [{ x: 0, y: 0, width: 1, height: 1 }] } }, timing: { framesPerSecond: 1, loop: true } },
      },
      roles: { default: "idle", walking: "idle" },
    },
  },
  movementSpeed: 600,
} satisfies CharacterDefinition;

const knife = {
  initialScene: "boat",
  initialGroundPoint: { x: 30, y: 30 },
  initialAppearance: "new",
  appearances: {
    new: {
      animations: {
        idle: { sheet: { image: "knife.png", frames: [{ x: 0, y: 0, width: 1, height: 1 }] }, timing: { framesPerSecond: 1, loop: true } },
      },
      roles: { default: "idle" },
    },
  },
  inventoryAppearance: "knife-inventory.png",
  noun: {
    labels: [{ text: "Knife" }],
    preferredVerbs: [{ verb: "pick-up" }],
    cases: [{
      verb: "pick-up",
      response: { text: "I take the knife." },
      operations: [{ type: "collect-target-object" }],
    }],
  } satisfies NounDefinition,
} satisfies ObjectDefinition;

const bundle = {
  labels: [{ text: "Bundle" }],
  preferredVerbs: [{ verb: "look-at" }],
  cases: [{
    verb: "look-at",
    operations: [{ type: "present-detail-view", detailView: "seal" }],
  }],
} satisfies NounDefinition;

const seal = {
  image: "seal.png",
  hotspots: [
    {
      area: upperLeft,
      noun: {
        labels: [{ text: "Broken seal" }],
        preferredVerbs: [{ verb: "look-at" }],
        cases: [
          {
            verb: "look-at",
            response: { text: "The wax is broken." },
            operations: [{ type: "set-variable", variable: "sealRead", value: true }],
          },
          {
            verb: "use",
            firstNoun: "knife",
            response: { text: "I lift the wax with the knife." },
          },
        ],
      } satisfies NounDefinition,
    },
    {
      area: lowerRight,
      when: { variable: "sealRead", equals: true },
      noun: {
        labels: [{ text: "Registry fragment" }],
        preferredVerbs: [{ verb: "look-at" }],
        cases: [{
          verb: "look-at",
          operations: [{ type: "present-detail-view", detailView: "registry" }],
        }],
      } satisfies NounDefinition,
    },
  ],
} satisfies DetailViewDefinition;

const registry = {
  image: "registry.png",
  hotspots: [{
    area: upperLeft,
    noun: {
      labels: [{ text: "Ledger line" }],
      preferredVerbs: [{ verb: "look-at" }],
      cases: [{ verb: "look-at", response: { text: "A name I know." } }],
    } satisfies NounDefinition,
  }],
} satisfies DetailViewDefinition;

const examine = {
  steps: [
    { type: "operations", operations: [{ type: "present-detail-view", detailView: "seal" }] },
    { type: "narration", text: "The bundle falls open." },
    { type: "operations", operations: [{ type: "dismiss-detail-view" }] },
  ],
} satisfies SequenceDefinition;

const hatch = {
  labels: [{ text: "Hatch" }],
  preferredVerbs: [{ verb: "look-at" }],
  cases: [{ verb: "look-at", sequence: "examine" }],
} satisfies NounDefinition;

/** Arriving in the hold opens a close-up, so a restore can prove it is no arrival. */
const descend = {
  steps: [
    { type: "operations", operations: [{ type: "present-detail-view", detailView: "registry" }] },
    { type: "narration", text: "The hold is dark." },
  ],
} satisfies SequenceDefinition;

const ladder = {
  labels: [{ text: "Ladder" }],
  preferredVerbs: [{ verb: "walk-to" }],
  cases: [],
} satisfies NounDefinition;

const boat = {
  background: "boat.png",
  walkableRegion: square,
  hotspots: [
    { target: { kind: "background" }, area: square, approach: { groundPoint: { x: 50, y: 50 }, facing: "back" }, noun: bundle },
    { target: { kind: "object", object: "knife" }, area: upperLeft, approach: { groundPoint: { x: 30, y: 30 }, facing: "front" } },
    { target: { kind: "background" }, area: lowerRight, approach: { groundPoint: { x: 80, y: 80 }, facing: "front" }, noun: hatch },
  ],
  passages: [{
    area: [{ x: 45, y: 0 }, { x: 55, y: 0 }, { x: 55, y: 40 }, { x: 45, y: 40 }],
    approach: { groundPoint: { x: 50, y: 20 }, facing: "back" },
    noun: ladder,
    direction: "down",
    destination: { scene: "hold", entrance: "fromBoat" },
  }],
} satisfies SceneDefinition;

const hold = {
  background: "hold.png",
  walkableRegion: square,
  entrances: { fromBoat: { groundPoint: { x: 20, y: 20 }, facing: "front" } },
  arrivalSequences: [{ entrance: "fromBoat", sequence: "descend" }],
} satisfies SceneDefinition;

const project = {
  identity: "test.detail-view",
  version: "1",
  logicalResolution: { width: 100, height: 100 },
  scenes: { boat, hold },
  characters: { player },
  playerCharacter: "player",
  objects: { knife },
  detailViews: { seal, registry },
  sequences: { descend, examine },
  variables: { sealRead: false },
  initialScene: "boat",
  commandLexicon,
  commandFallbacks: { "look-at": { text: "Nothing to see." }, open: { text: "It does not open." }, "pick-up": { text: "I cannot take it." }, push: { text: "It will not move." }, close: { text: "It is not open." }, pull: { text: "It will not budge." }, give: { text: "Nobody wants it." }, "talk-to": { text: "It says nothing." }, use: { text: "That does nothing." } },
} satisfies GameProject;

/** Looks at the Scene Hotspot that opens the close-up, walking to it first. */
function openTheBundle(session: ReturnType<typeof createTestSession>) {
  session.input({ type: "select-verb", verb: "look-at" });
  session.input({ type: "activate-hotspot", hotspot: 0 });
  session.steps(20);
}

/** Answers one Detail View Hotspot exactly as the HUD would. */
function examineDetail(
  session: ReturnType<typeof createTestSession>,
  hotspot: number,
) {
  session.input({ type: "contextual-hotspot", hotspot, action: "primary" });
  session.steps();
}

test("a Command Case presents a Detail View, which replaces the world without moving anyone", () => {
  const session = createTestSession(project);
  const before = session.snapshot();

  openTheBundle(session);

  const state = session.snapshot();
  expect(state.detailView).toBe("seal");
  expect(session.detailView()).toEqual({ detailView: "seal", image: "seal.png" });
  expect(state.currentScene).toBe(before.currentScene);
  expect(state.characters.player!.scene).toBe("boat");
  expect(session.hud().nouns.map(({ label }) => label)).toEqual(["Broken seal"]);
  expect(session.hitTest({ x: 5, y: 5 })).toEqual({ kind: "detail-hotspot", index: 0 });
  expect(session.hitTest({ x: 50, y: 50 })).toBeNull();
});

test("a Detail View advertises its phrase and answers a Command with no movement stage", () => {
  const session = createTestSession(project);
  openTheBundle(session);
  session.takeEffects();

  expect(session.hud().nouns[0]!.primary.text).toBe("Look at Broken seal");
  examineDetail(session, 0);

  const effects = session.takeEffects();
  expect(effects).toContainEqual(expect.objectContaining({
    type: "interaction-response",
    text: "The wax is broken.",
  }));
  expect(effects.some(({ type }) => type === "movement-started")).toBe(false);
  expect(session.snapshot().activity).toBeNull();
  expect(session.snapshot().variables.sealRead).toBe(true);
});

test("a Detail View reveals a conditional Hotspot and replaces itself rather than stacking", () => {
  const session = createTestSession(project);
  openTheBundle(session);
  expect(session.hud().nouns).toHaveLength(1);

  examineDetail(session, 0);
  expect(session.hud().nouns.map(({ label }) => label))
    .toEqual(["Broken seal", "Registry fragment"]);

  examineDetail(session, 1);
  expect(session.snapshot().detailView).toBe("registry");
  expect(session.hud().nouns.map(({ label }) => label)).toEqual(["Ledger line"]);
});

test("a selected Inventory Object stays reachable and can be used on a detail", () => {
  const session = createTestSession(project);
  session.input({ type: "select-verb", verb: "pick-up" });
  session.input({ type: "activate-hotspot", hotspot: 1 });
  session.steps(20);
  expect(session.snapshot().inventory.objects).toEqual(["knife"]);

  openTheBundle(session);
  expect(session.hud().inventory.entries).toHaveLength(1);
  session.input({ type: "select-object", object: "knife" });
  session.steps();
  expect(session.snapshot().command.firstNoun).toEqual({ kind: "object", object: "knife" });

  examineDetail(session, 0);
  expect(session.takeEffects()).toContainEqual(expect.objectContaining({
    type: "interaction-response",
    text: "I lift the wax with the knife.",
  }));
});

test("a Sequence keeps running while a Detail View is presented and dismisses it at the end", () => {
  const session = createTestSession(project);
  session.input({ type: "select-verb", verb: "look-at" });
  session.input({ type: "activate-hotspot", hotspot: 2 });
  session.steps(20);
  const presented = session.snapshot();

  expect(presented.detailView).toBe("seal");
  expect(session.sequence()).toMatchObject({ kind: "narration", text: "The bundle falls open." });

  session.input({ type: "advance-sequence" });
  session.steps();
  expect(session.snapshot().detailView).toBeUndefined();
  expect(session.detailView()).toBeNull();
  expect(session.snapshot().characters.player).toEqual(presented.characters.player);
  expect(session.hud().nouns.map(({ label }) => label)).toEqual(["Bundle", "Knife", "Hatch", "Ladder"]);
});

test("a restored Save Snapshot resumes on the presented Detail View", () => {
  const session = createTestSession(project);
  openTheBundle(session);
  const snapshot = JSON.parse(JSON.stringify(session.createSaveSnapshot())) as unknown;

  const restored = createTestSession(project, snapshot);
  expect(restored.snapshot().detailView).toBe("seal");
  expect(restored.hud().nouns.map(({ label }) => label)).toEqual(["Broken seal"]);
});

test("startup rejects a malformed Detail View and names the offending path", () => {
  expect(() => createTestSession({
    ...project,
    detailViews: {
      ...project.detailViews,
      broken: {
        image: "",
        hotspots: [{ area: [{ x: 0, y: 0 }, { x: 10, y: 10 }], noun: registry.hotspots[0]!.noun }],
      },
    },
  })).toThrow(AuthoringError);

  try {
    createTestSession({
      ...project,
      scenes: {
        boat: {
          ...boat,
          hotspots: [
            { target: { kind: "background" }, area: square, approach: { groundPoint: { x: 50, y: 50 }, facing: "back" }, noun: { ...bundle, cases: [{ verb: "look-at", operations: [{ type: "present-detail-view", detailView: "missing" }] }] } },
            boat.hotspots[1]!,
            boat.hotspots[2]!,
          ],
        },
      },
    });
    throw new Error("startup should have rejected the missing Detail View reference.");
  } catch (error) {
    expect(error).toBeInstanceOf(AuthoringError);
    expect((error as AuthoringError).diagnostics).toContainEqual(expect.objectContaining({
      code: "reference.detail-view",
      path: "scenes.boat.hotspots[0].noun.cases[0].operations[0]",
    }));
  }
});

test("a restored Save Snapshot keeps the world and the Player Character beneath the close-up", () => {
  const session = createTestSession(project);
  openTheBundle(session);
  examineDetail(session, 0);
  const saved = session.snapshot();
  const snapshot = JSON.parse(JSON.stringify(session.createSaveSnapshot())) as unknown;

  const restored = createTestSession(project, snapshot);

  const state = restored.snapshot();
  expect(state.detailView).toBe("seal");
  expect(state.currentScene).toBe("boat");
  expect(state.characters.player).toEqual(saved.characters.player);
  expect(state.characters.player).toMatchObject({
    scene: "boat",
    groundPoint: { x: 50, y: 50 },
    facing: "back",
  });
  expect(state.variables.sealRead).toBe(true);
  expect(state.activity).toBeNull();
  expect(restored.sequence()).toBeNull();
  expect(restored.hud().nouns.map(({ label }) => label))
    .toEqual(["Broken seal", "Registry fragment"]);
});

test("a Save Snapshot naming an unknown Detail View is refused with a clear message", () => {
  const session = createTestSession(project);
  openTheBundle(session);
  const snapshot = session.createSaveSnapshot();

  const result = validateTestSaveSnapshot(project, {
    ...snapshot,
    state: { ...snapshot.state, detailView: "missing" },
  });

  expect(result.ok).toBe(false);
  if (result.ok) return;
  expect(result.diagnostics).toContainEqual(expect.objectContaining({
    code: "save.state.detail-view",
    path: "Save Snapshot.state.detailView",
    message: "Save Snapshot refers to a Detail View that is not in this Game Project.",
  }));
});

test("a Save Snapshot carrying a malformed presented Detail View is refused", () => {
  const session = createTestSession(project);
  openTheBundle(session);
  const snapshot = session.createSaveSnapshot();

  const result = validateTestSaveSnapshot(project, {
    ...snapshot,
    state: { ...snapshot.state, detailView: 7 },
  });

  expect(result.ok).toBe(false);
  if (result.ok) return;
  expect(result.diagnostics).toContainEqual(expect.objectContaining({
    code: "save.state.detail-view",
    path: "Save Snapshot.state.detailView",
    message: "Save Snapshot contains a malformed presented Detail View.",
  }));
});

test("restoring into a presented Detail View is not an arrival and starts no arrival Sequence", () => {
  const session = createTestSession(project);
  session.input({ type: "activate-passage", passage: 0 });
  session.steps(20);
  expect(session.snapshot().currentScene).toBe("hold");
  expect(session.snapshot().detailView).toBe("registry");
  session.input({ type: "advance-sequence" });
  session.steps();
  expect(session.snapshot().activity).toBeNull();
  const arrived = session.snapshot();
  const snapshot = JSON.parse(JSON.stringify(session.createSaveSnapshot())) as unknown;

  const restored = createTestSession(project, snapshot);

  expect(restored.snapshot().detailView).toBe("registry");
  expect(restored.snapshot().activity).toBeNull();
  expect(restored.sequence()).toBeNull();
  expect(restored.snapshot().characters.player).toEqual(arrived.characters.player);
  expect(restored.snapshot().currentScene).toBe("hold");
});
