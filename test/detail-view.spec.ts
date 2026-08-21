import { expect, test } from "@playwright/test";

import { createTestSession, validateTestSaveSnapshot } from "./support";
import { AuthoringError } from "../src/capabilities/game-project";
import { type CoreEffect } from "../src/capabilities/game-session";
import {
  type CharacterDefinition,
  type CommandCase,
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
const upperRight = [
  { x: 60, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 40 },
  { x: 60, y: 40 },
];
const lowerLeft = [
  { x: 0, y: 60 },
  { x: 40, y: 60 },
  { x: 40, y: 100 },
  { x: 0, y: 100 },
];
const centre = [
  { x: 45, y: 45 },
  { x: 55, y: 45 },
  { x: 55, y: 55 },
  { x: 45, y: 55 },
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

const coin = {
  initialScene: "boat",
  initialGroundPoint: { x: 90, y: 10 },
  initialAppearance: "new",
  appearances: {
    new: {
      animations: {
        idle: { sheet: { image: "coin.png", frames: [{ x: 0, y: 0, width: 1, height: 1 }] }, timing: { framesPerSecond: 1, loop: true } },
      },
      roles: { default: "idle" },
    },
  },
  inventoryAppearance: "coin-inventory.png",
  noun: {
    labels: [{ text: "Coin" }],
    preferredVerbs: [{ verb: "look-at" }],
    cases: [{ verb: "look-at", response: { text: "A worn coin." } }],
  } satisfies NounDefinition,
} satisfies ObjectDefinition;

const sailor = {
  initialScene: "boat",
  initialGroundPoint: { x: 90, y: 90 },
  initialFacing: "front",
  initialAppearance: "normal",
  appearances: {
    normal: {
      animations: {
        idle: { sheets: { left: { image: "sailor.png", frames: [{ x: 0, y: 0, width: 1, height: 1 }] }, right: { image: "sailor.png", frames: [{ x: 0, y: 0, width: 1, height: 1 }] }, front: { image: "sailor.png", frames: [{ x: 0, y: 0, width: 1, height: 1 }] }, back: { image: "sailor.png", frames: [{ x: 0, y: 0, width: 1, height: 1 }] } }, timing: { framesPerSecond: 1, loop: true } },
      },
      roles: { default: "idle", walking: "idle" },
    },
  },
  movementSpeed: 600,
  noun: {
    labels: [{ text: "Sailor" }],
    preferredVerbs: [{ verb: "talk-to" }],
    cases: [{ verb: "talk-to", line: { character: "sailor", text: "Speak, then." } }],
  } satisfies NounDefinition,
  dialogue: {
    knowledge: [],
    alternatives: [{ text: "What was in the bundle?", response: "A name I will not say." }],
  },
} satisfies CharacterDefinition;

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
  hotspots: [
    {
      area: upperLeft,
      noun: {
        labels: [{ text: "Ledger line" }],
        preferredVerbs: [{ verb: "look-at" }],
        cases: [{ verb: "look-at", response: { text: "A name I know." } }],
      } satisfies NounDefinition,
    },
    {
      area: lowerRight,
      when: { variable: "confided", equals: true },
      noun: {
        labels: [{ text: "Signature" }],
        preferredVerbs: [{ verb: "look-at" }],
        cases: [
          {
            verb: "look-at",
            when: { variable: "coinTaken", equals: true },
            operations: [{ type: "end-game", detailView: "harbour" }],
          },
          { verb: "look-at", operations: [{ type: "end-game", detailView: "farewell" }] },
          { verb: "pull", sequence: "closeTheBook" },
        ],
      } satisfies NounDefinition,
    },
  ],
} satisfies DetailViewDefinition;

/** Ends the game halfway through, so its last beat must never be directed. */
const closeTheBook = {
  steps: [
    { type: "narration", text: "I close the book." },
    { type: "operations", operations: [{ type: "end-game", detailView: "farewell" }] },
    { type: "narration", text: "This narration belongs to a game that has ended." },
  ],
} satisfies SequenceDefinition;

/** The closing image of the poorer Ending, with one detail still worth clicking. */
const farewell = {
  image: "farewell.png",
  hotspots: [{
    area: upperLeft,
    noun: {
      labels: [{ text: "Dedication" }],
      preferredVerbs: [{ verb: "look-at" }],
      cases: [{ verb: "look-at", response: { text: "For those who never came back." } }],
    } satisfies NounDefinition,
  }],
} satisfies DetailViewDefinition;

/** The closing image of the other Ending, proving one Game Project may author several. */
const harbour = {
  image: "harbour.png",
} satisfies DetailViewDefinition;

/**
 * The one Command Case authored identically on a Scene Hotspot and on a Detail
 * View area, so both routes can be compared against each other.
 */
const unlockWithTheKnife = {
  verb: "use",
  firstNoun: "knife",
  response: { text: "The blade turns the lock." },
  operations: [{ type: "set-variable", variable: "mechanismOpen", value: true }],
} satisfies CommandCase;

const mechanism = {
  image: "mechanism.png",
  hotspots: [
    {
      area: upperLeft,
      noun: {
        labels: [{ text: "Lock" }],
        preferredVerbs: [{ verb: "look-at" }],
        cases: [{ verb: "look-at", response: { text: "A brass lock." } }, unlockWithTheKnife],
      } satisfies NounDefinition,
    },
    {
      area: upperRight,
      when: { variable: "mechanismOpen", equals: false },
      noun: {
        labels: [{ text: "Plate" }],
        preferredVerbs: [{ verb: "look-at" }],
        cases: [{ verb: "look-at", response: { text: "A plate covers the hollow." } }],
      } satisfies NounDefinition,
    },
    {
      area: lowerRight,
      when: { variable: "mechanismOpen", equals: true },
      noun: {
        labels: [{ text: "Hollow" }],
        preferredVerbs: [{ verb: "look-at" }],
        cases: [
          {
            verb: "look-at",
            when: { variable: "coinTaken", equals: false },
            response: { text: "I pocket the coin." },
            operations: [
              { type: "give-object-to-player", object: "coin" },
              { type: "set-variable", variable: "coinTaken", value: true },
            ],
          },
          { verb: "look-at", response: { text: "The hollow is empty." } },
        ],
      } satisfies NounDefinition,
    },
    {
      area: lowerLeft,
      noun: {
        labels: [{ text: "Cord" }],
        preferredVerbs: [{ verb: "look-at" }],
        cases: [
          { verb: "look-at", line: { character: "player", text: "Waxed cord, cut clean." } },
          { verb: "pull", sequence: "confide" },
        ],
      } satisfies NounDefinition,
    },
    {
      area: centre,
      noun: {
        labels: [{ text: "Ring" }],
        preferredVerbs: [{ verb: "look-at" }],
        cases: [{ verb: "look-at", sequence: "callTheSailor" }],
      } satisfies NounDefinition,
    },
  ],
} satisfies DetailViewDefinition;

/** Presents a second Detail View at its end, and again through its Skip Outcome. */
const confide = {
  skippable: true,
  skipOutcome: [
    { type: "set-variable", variable: "confided", value: true },
    { type: "present-detail-view", detailView: "registry" },
  ],
  steps: [
    { type: "operations", operations: [{ type: "set-variable", variable: "confided", value: true }] },
    { type: "narration", text: "The cord unwinds." },
    { type: "operations", operations: [{ type: "present-detail-view", detailView: "registry" }] },
  ],
} satisfies SequenceDefinition;

const callTheSailor = {
  steps: [
    { type: "narration", text: "A shadow falls across the page." },
    { type: "operations", operations: [{ type: "dismiss-detail-view" }] },
  ],
} satisfies SequenceDefinition;

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

const mechanismHotspotNoun = {
  labels: [{ text: "Mechanism" }],
  preferredVerbs: [{ verb: "look-at" }],
  cases: [
    {
      verb: "look-at",
      operations: [{ type: "present-detail-view", detailView: "mechanism" }],
    },
    unlockWithTheKnife,
  ],
} satisfies NounDefinition;

/** Arriving in the hold opens a close-up, so a restore can prove it is no Scene Opening. */
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
    { target: { kind: "background" }, area: upperRight, approach: { groundPoint: { x: 70, y: 20 }, facing: "front" }, noun: mechanismHotspotNoun },
    { target: { kind: "character", character: "sailor" }, area: lowerLeft, approach: { groundPoint: { x: 20, y: 80 }, facing: "front" } },
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
  cases: [{ entrance: "fromBoat", sequence: "descend" }],
} satisfies SceneDefinition;

const project = {
  identity: "test.detail-view",
  version: "1",
  logicalResolution: { width: 100, height: 100 },
  narrativeContext: "A wounded sailor's bundle, opened aboard a boat off Capri in 1535.",
  scenes: { boat, hold },
  characters: { player, sailor },
  playerCharacter: "player",
  objects: { knife, coin },
  detailViews: { seal, registry, mechanism, farewell, harbour },
  sequences: { descend, examine, confide, callTheSailor, closeTheBook },
  variables: { sealRead: false, mechanismOpen: false, coinTaken: false, confided: false },
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

/** The authored order of the Scene Hotspots of `boat`. */
const sceneHotspot = { bundle: 0, knife: 1, hatch: 2, mechanism: 3, sailor: 4 } as const;

/** The authored order of the Hotspots of the `mechanism` Detail View. */
const area = { lock: 0, plate: 1, hollow: 2, cord: 3, ring: 4 } as const;

/** Walks to the Scene Hotspot whose Command Case presents the mechanism close-up. */
function presentTheMechanism(session: ReturnType<typeof createTestSession>) {
  session.input({ type: "select-verb", verb: "look-at" });
  session.input({ type: "activate-hotspot", hotspot: sceneHotspot.mechanism });
  session.steps(20);
}

/** Collects the knife from the Scene, so it can be used on what is examined. */
function pickUpTheKnife(session: ReturnType<typeof createTestSession>) {
  session.input({ type: "select-verb", verb: "pick-up" });
  session.input({ type: "activate-hotspot", hotspot: sceneHotspot.knife });
  session.steps(20);
}

/** Every Command Response the Session answered with since the last reading. */
function responses(effects: readonly CoreEffect[]): readonly string[] {
  return effects.flatMap((effect) =>
    effect.type === "interaction-response" ? [effect.text] : []);
}

/** The committed Game State, without the tick two routes cannot share. */
function committed(session: ReturnType<typeof createTestSession>) {
  const { tick: _tick, ...rest } = session.snapshot();
  return rest;
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
  expect(session.hud().nouns.map(({ label }) => label)).toEqual(["Bundle", "Knife", "Hatch", "Mechanism", "Sailor", "Ladder"]);
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
            boat.hotspots[3]!,
            boat.hotspots[4]!,
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

test("a Detail View Hotspot answers with a Line, without a movement stage", () => {
  const session = createTestSession(project);
  presentTheMechanism(session);
  session.takeEffects();

  examineDetail(session, area.cord);

  expect(session.snapshot().activity).toMatchObject({
    type: "line",
    line: { character: "player", text: "Waxed cord, cut clean." },
  });
  expect(session.snapshot().detailView).toBe("mechanism");
  expect(session.takeEffects().some(({ type }) => type === "movement-started")).toBe(false);

  session.input({ type: "advance-line" });
  session.steps();
  expect(session.snapshot().activity).toBeNull();
});

test("a Detail View Hotspot runs its Game Operations, and they commit exactly once", () => {
  const session = createTestSession(project);
  pickUpTheKnife(session);
  presentTheMechanism(session);
  session.input({ type: "select-object", object: "knife" });
  session.steps();
  session.input({ type: "activate-hotspot", hotspot: area.lock });
  session.steps();
  session.takeEffects();

  examineDetail(session, area.hollow);

  // Committing these operations twice would either duplicate the coin in the
  // Inventory or fail the Session, the Object no longer being in the Scene.
  expect(responses(session.takeEffects())).toEqual(["I pocket the coin."]);
  expect(session.snapshot().inventory.objects).toEqual(["knife", "coin"]);
  expect(session.snapshot().objects.coin!.location).toEqual({ kind: "inventory" });
  expect(session.snapshot().variables.coinTaken).toBe(true);
  expect(session.lifecycle()).toBe("running");

  examineDetail(session, area.hollow);

  expect(responses(session.takeEffects())).toEqual(["The hollow is empty."]);
  expect(session.snapshot().inventory.objects).toEqual(["knife", "coin"]);
  expect(session.lifecycle()).toBe("running");
});

test("a Detail View Hotspot starts a Sequence, which returns a world that still talks", () => {
  const session = createTestSession(project);
  presentTheMechanism(session);

  examineDetail(session, area.ring);

  expect(session.sequence()).toMatchObject({
    kind: "narration",
    text: "A shadow falls across the page.",
  });
  expect(session.snapshot().detailView).toBe("mechanism");

  session.input({ type: "advance-sequence" });
  session.steps();
  expect(session.snapshot().detailView).toBeUndefined();
  expect(session.snapshot().activity).toBeNull();

  session.input({ type: "select-verb", verb: "talk-to" });
  session.input({ type: "activate-hotspot", hotspot: sceneHotspot.sailor });
  session.steps(20);

  expect(session.snapshot().activity).toMatchObject({ type: "conversation", character: "sailor" });
  expect(session.conversation()?.alternatives.map(({ text }) => text))
    .toEqual(["What was in the bundle?"]);
});

test("a Detail View Hotspot withdraws when Game State stops matching its condition", () => {
  const session = createTestSession(project);
  pickUpTheKnife(session);
  presentTheMechanism(session);
  expect(session.hud().nouns.map(({ label }) => label))
    .toEqual(["Lock", "Plate", "Cord", "Ring"]);
  expect(session.hitTest({ x: 80, y: 20 })).toEqual({ kind: "detail-hotspot", index: area.plate });

  session.input({ type: "select-object", object: "knife" });
  session.steps();
  session.input({ type: "activate-hotspot", hotspot: area.lock });
  session.steps();

  expect(session.snapshot().variables.mechanismOpen).toBe(true);
  expect(session.hud().nouns.map(({ label }) => label))
    .toEqual(["Lock", "Hollow", "Cord", "Ring"]);
  expect(session.hitTest({ x: 80, y: 20 })).toBeNull();
  expect(session.hitTest({ x: 80, y: 80 })).toEqual({ kind: "detail-hotspot", index: area.hollow });
});

test("a selected Inventory Object resolves on a Detail View Hotspot as on a Scene Hotspot", () => {
  const inTheWorld = createTestSession(project);
  pickUpTheKnife(inTheWorld);
  inTheWorld.input({ type: "select-object", object: "knife" });
  inTheWorld.steps();
  inTheWorld.takeEffects();
  inTheWorld.input({ type: "activate-hotspot", hotspot: sceneHotspot.mechanism });
  inTheWorld.steps(20);
  const worldEffects = inTheWorld.takeEffects();

  const inTheDetailView = createTestSession(project);
  pickUpTheKnife(inTheDetailView);
  presentTheMechanism(inTheDetailView);
  inTheDetailView.input({ type: "select-object", object: "knife" });
  inTheDetailView.steps();
  inTheDetailView.takeEffects();
  const advertised = inTheDetailView.hud().nouns[0]!.primary.text;
  inTheDetailView.input({ type: "activate-hotspot", hotspot: area.lock });
  inTheDetailView.steps();
  const detailEffects = inTheDetailView.takeEffects();

  expect(advertised).toBe("Use Knife with Lock");
  expect(responses(detailEffects)).toEqual(["The blade turns the lock."]);
  expect(responses(detailEffects)).toEqual(responses(worldEffects));
  expect(detailEffects.some(({ type }) => type === "movement-started")).toBe(false);
  expect(worldEffects.some(({ type }) => type === "movement-started")).toBe(true);
  expect(inTheDetailView.snapshot().command).toEqual(inTheWorld.snapshot().command);
  expect(inTheDetailView.snapshot().variables).toEqual(inTheWorld.snapshot().variables);
  expect(inTheDetailView.snapshot().inventory).toEqual(inTheWorld.snapshot().inventory);
});

test("an unsupported combination answers authored feedback and mutates no Game State", () => {
  const session = createTestSession(project);
  pickUpTheKnife(session);
  presentTheMechanism(session);
  session.takeEffects();
  const before = committed(session);

  session.input({ type: "select-verb", verb: "push" });
  session.input({ type: "activate-hotspot", hotspot: area.lock });
  session.steps();

  expect(responses(session.takeEffects())).toEqual(["It will not move."]);
  expect(committed(session)).toEqual({
    ...before,
    command: { verb: "walk-to", firstNoun: null },
  });

  session.input({ type: "select-object", object: "knife" });
  session.steps();
  const selected = committed(session);
  session.input({ type: "activate-hotspot", hotspot: area.cord });
  session.steps();

  expect(responses(session.takeEffects())).toEqual(["That does nothing."]);
  expect(committed(session)).toEqual({
    ...selected,
    command: { verb: "walk-to", firstNoun: null },
  });
});

test("a Command Case in the world presents a Detail View after its Approach Point walk", () => {
  const session = createTestSession(project);
  session.input({ type: "select-verb", verb: "look-at" });
  session.input({ type: "activate-hotspot", hotspot: sceneHotspot.mechanism });
  session.steps();

  expect(session.takeEffects()).toContainEqual(expect.objectContaining({
    type: "movement-started",
    destination: { x: 70, y: 20 },
  }));
  expect(session.snapshot().detailView).toBeUndefined();

  session.steps(20);

  expect(session.takeEffects()).toContainEqual(expect.objectContaining({
    type: "movement-finished",
    destination: { x: 70, y: 20 },
  }));
  expect(session.snapshot().detailView).toBe("mechanism");
  expect(session.snapshot().characters.player!.facing).toBe("front");
});

test("a Skip Outcome presents a Detail View and commits what ordinary playback commits", () => {
  const pullTheCord = (session: ReturnType<typeof createTestSession>) => {
    presentTheMechanism(session);
    session.input({ type: "select-verb", verb: "pull" });
    session.input({ type: "activate-hotspot", hotspot: area.cord });
    session.steps();
  };

  const played = createTestSession(project);
  pullTheCord(played);
  expect(played.sequence()).toMatchObject({ kind: "narration", text: "The cord unwinds." });
  played.input({ type: "advance-sequence" });
  played.steps();

  const skipped = createTestSession(project);
  pullTheCord(skipped);
  skipped.input({ type: "skip-sequence" });
  skipped.steps();

  expect(skipped.snapshot().detailView).toBe("registry");
  expect(skipped.snapshot().variables.confided).toBe(true);
  expect(skipped.snapshot().activity).toBeNull();
  expect(committed(skipped)).toEqual(committed(played));
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

test("restoring into a presented Detail View is not a Scene Opening and starts no Sequence", () => {
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

/**
 * Pulls the cord of the presented mechanism, whose Sequence confides and leaves
 * the registry open on the Signature that ends the game.
 */
function confideByPullingTheCord(session: ReturnType<typeof createTestSession>) {
  session.input({ type: "select-verb", verb: "pull" });
  session.input({ type: "activate-hotspot", hotspot: area.cord });
  session.steps();
  session.input({ type: "advance-sequence" });
  session.steps();
}

/** Reaches the registry Signature from the world, through the mechanism close-up. */
function confideAndOpenTheRegistry(session: ReturnType<typeof createTestSession>) {
  presentTheMechanism(session);
  confideByPullingTheCord(session);
}

/** The authored order of the Hotspots of the `registry` Detail View. */
const registryArea = { ledgerLine: 0, signature: 1 } as const;

test("a Game Operation ends the Game Session on a named Detail View", () => {
  const session = createTestSession(project);
  confideAndOpenTheRegistry(session);
  const world = session.snapshot();

  examineDetail(session, registryArea.signature);

  const state = session.snapshot();
  expect(state.ended).toBe(true);
  expect(state.detailView).toBe("farewell");
  expect(session.detailView()).toEqual({ detailView: "farewell", image: "farewell.png" });
  expect(state.currentScene).toBe(world.currentScene);
  expect(state.characters.player).toEqual(world.characters.player);
  expect(session.lifecycle()).toBe("running");
});

test("the HUD withdraws at the Ending", () => {
  const session = createTestSession(project);
  pickUpTheKnife(session);
  confideAndOpenTheRegistry(session);
  expect(session.hud().withdrawn).toBe(false);
  expect(session.hud().inventory.entries).toHaveLength(1);

  examineDetail(session, registryArea.signature);

  const hud = session.hud();
  expect(hud.withdrawn).toBe(true);
  expect(hud.nouns).toEqual([]);
  expect(hud.inventory.entries).toEqual([]);
  expect(hud.inventory.triggerVisible).toBe(false);
  expect(hud.inventory.open).toBe(false);
  expect(hud.narrative).toBeNull();
  expect(hud.commandResponse).toBeNull();
});

test("after the Ending no Command is accepted", () => {
  const session = createTestSession(project);
  confideAndOpenTheRegistry(session);
  examineDetail(session, registryArea.signature);
  session.takeEffects();
  const ended = committed(session);

  session.input({ type: "select-verb", verb: "look-at" });
  session.input({ type: "contextual-hotspot", hotspot: 0, action: "primary" });
  session.input({ type: "activate-hotspot", hotspot: 0 });
  session.input({ type: "move", point: { x: 10, y: 10 } });
  session.steps(20);

  expect(committed(session)).toEqual(ended);
  expect(session.takeEffects()).toEqual([]);
  expect(session.hud().withdrawn).toBe(true);
});

test("the Ending carries no image of its own, so what remains is an ordinary Detail View", () => {
  const session = createTestSession(project);
  confideAndOpenTheRegistry(session);
  examineDetail(session, registryArea.signature);

  // The closing image is an ordinary Detail View, with its own Hotspot the
  // Engine still hit-tests, so a later feature could let the Ending be read.
  expect(session.detailView()).toEqual({ detailView: "farewell", image: "farewell.png" });
  expect(session.hitTest({ x: 5, y: 5 })).toEqual({ kind: "detail-hotspot", index: 0 });
});

test("a Game Project may author more than one Ending, closing on different Detail Views", () => {
  const session = createTestSession(project);
  pickUpTheKnife(session);
  presentTheMechanism(session);
  session.input({ type: "select-object", object: "knife" });
  session.steps();
  session.input({ type: "activate-hotspot", hotspot: area.lock });
  session.steps();
  examineDetail(session, area.hollow);
  expect(session.snapshot().variables.coinTaken).toBe(true);

  confideByPullingTheCord(session);
  examineDetail(session, registryArea.signature);

  expect(session.snapshot().detailView).toBe("harbour");
  expect(session.snapshot().ended).toBe(true);
});

test("a Sequence that ends the game directs nothing after its last beat", () => {
  const session = createTestSession(project);
  confideAndOpenTheRegistry(session);
  session.input({ type: "select-verb", verb: "pull" });
  session.input({ type: "activate-hotspot", hotspot: registryArea.signature });
  session.steps();
  expect(session.sequence()).toMatchObject({ kind: "narration", text: "I close the book." });

  session.input({ type: "advance-sequence" });
  session.steps();

  expect(session.snapshot().ended).toBe(true);
  expect(session.snapshot().detailView).toBe("farewell");
  expect(session.snapshot().activity).toBeNull();
  expect(session.sequence()).toBeNull();

  session.input({ type: "advance-sequence" });
  session.steps(20);

  expect(session.sequence()).toBeNull();
  expect(session.hud().withdrawn).toBe(true);
});

test("a restored Save Snapshot resumes at the Ending rather than in the world", () => {
  const session = createTestSession(project);
  confideAndOpenTheRegistry(session);
  examineDetail(session, registryArea.signature);
  const ended = session.snapshot();
  const snapshot = JSON.parse(JSON.stringify(session.createSaveSnapshot())) as unknown;

  const restored = createTestSession(project, snapshot);

  expect(restored.snapshot().ended).toBe(true);
  expect(restored.snapshot().detailView).toBe("farewell");
  expect(restored.detailView()).toEqual({ detailView: "farewell", image: "farewell.png" });
  expect(restored.snapshot().characters.player).toEqual(ended.characters.player);
  expect(restored.hud().withdrawn).toBe(true);

  restored.input({ type: "contextual-hotspot", hotspot: 0, action: "primary" });
  restored.steps();
  expect(restored.takeEffects()).toEqual([]);
});

test("a Save Snapshot ending on nothing presented is refused with a clear message", () => {
  const session = createTestSession(project);
  confideAndOpenTheRegistry(session);
  examineDetail(session, registryArea.signature);
  const snapshot = session.createSaveSnapshot();
  const { detailView: _detailView, ...withoutDetailView } = snapshot.state;

  const result = validateTestSaveSnapshot(project, { ...snapshot, state: withoutDetailView });

  expect(result.ok).toBe(false);
  if (result.ok) return;
  expect(result.diagnostics).toContainEqual(expect.objectContaining({
    code: "save.state.ending",
    path: "Save Snapshot.state.ended",
    message: "Save Snapshot ends the Game Session without a presented Detail View.",
  }));
});

test("a Save Snapshot carrying a malformed Ending is refused", () => {
  const session = createTestSession(project);
  confideAndOpenTheRegistry(session);
  examineDetail(session, registryArea.signature);
  const snapshot = session.createSaveSnapshot();

  const result = validateTestSaveSnapshot(project, {
    ...snapshot,
    state: { ...snapshot.state, ended: "yes" },
  });

  expect(result.ok).toBe(false);
  if (result.ok) return;
  expect(result.diagnostics).toContainEqual(expect.objectContaining({
    code: "save.state.ending",
    path: "Save Snapshot.state.ended",
    message: "Save Snapshot contains a malformed Ending.",
  }));
});

test("starting a new game leaves the Ending behind", () => {
  const finished = createTestSession(project);
  confideAndOpenTheRegistry(finished);
  examineDetail(finished, registryArea.signature);
  expect(finished.snapshot().ended).toBe(true);

  const started = createTestSession(project);

  expect(started.snapshot().ended).toBeUndefined();
  expect(started.snapshot().detailView).toBeUndefined();
  expect(started.hud().withdrawn).toBe(false);
  expect(started.hud().nouns.map(({ label }) => label))
    .toEqual(["Bundle", "Knife", "Hatch", "Mechanism", "Sailor", "Ladder"]);
  expect(started.snapshot()).toEqual(createTestSession(project).snapshot());
});
