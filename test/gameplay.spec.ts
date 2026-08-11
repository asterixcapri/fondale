import { expect, test } from "@playwright/test";

import { createTestSession } from "../src/capabilities/game-session";
import {
  defineCharacter,
  defineCommandLexicon,
  defineGame,
  defineNoun,
  defineObject,
  defineScene,
  defineSequence,
  validateSaveSnapshot,
  type ValidatedSaveSnapshot,
} from "../src/index";

function projectFixture(
  consumeSelectedObject = false,
  duplicateCollection = false,
  includeSecondObject = false,
  identity = "test.gameplay",
) {
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
        noun: defineNoun({
          labels: [{ text: "Gate" }],
          preferredVerbs: [{ verb: "look-at" }],
          cases: [{
            verb: "look-at",
            response: { text: "A locked gate." },
          }, {
            verb: "use",
            firstNoun: "key",
            response: { text: "The lock opens." },
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
          }],
        }),
      },
    },
    hotspots: [
      {
        target: { kind: "character", character: "player" },
        area: square,
        approach: { groundPoint: { x: 20, y: 20 }, facing: "front" },
      },
      {
        target: { kind: "object", object: "key" },
        area: square,
        approach: { groundPoint: { x: 40, y: 40 }, facing: "right" },
      },
      {
        target: { kind: "scenery", scenery: "gate" },
        area: square,
        approach: { groundPoint: { x: 70, y: 70 }, facing: "back" },
      },
    ],
    entrances: { start: { groundPoint: { x: 10, y: 10 }, facing: "front" } },
    passages: [
      {
        area: square,
        approach: { groundPoint: { x: 90, y: 90 }, facing: "back" },
        when: { variable: "gateOpen", equals: true },
        noun: defineNoun({
          labels: [{ text: "Ending" }],
          preferredVerbs: [{ verb: "walk-to" }],
          cases: [],
        }),
        direction: "right",
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
      normal: { animations: { idle: { frames: ["normal.png"], framesPerSecond: 1, loop: true } }, roles: { default: "idle", walking: "idle" } },
      happy: { animations: { idle: { frames: ["happy.png"], framesPerSecond: 1, loop: true } }, roles: { default: "idle", walking: "idle" } },
    },
    movementSpeed: 600,
    noun: defineNoun({
      labels: [{ text: "Player" }],
      preferredVerbs: [{ verb: "talk-to" }],
      cases: [{
        verb: "talk-to",
        when: { variable: "gateOpen", equals: true },
        line: { character: "player", text: "The way is open." },
        operations: [{ type: "set-variable", variable: "behaviorRan", value: true }],
      }, {
        verb: "talk-to",
        sequence: "conversation",
      }],
    }),
  });
  const key = defineObject({
    initialScene: "opening",
    initialGroundPoint: { x: 40, y: 40 },
    initialAppearance: "new",
    appearances: {
      new: { animations: { idle: { frames: ["key.png"], framesPerSecond: 1, loop: true } }, roles: { default: "idle" } },
      used: { animations: { idle: { frames: ["used-key.png"], framesPerSecond: 1, loop: true } }, roles: { default: "idle" } },
    },
    inventoryAppearance: "key-inventory.png",
    noun: defineNoun({
      labels: [
        { when: { variable: "keyCleaned", equals: true }, text: "Clean key" },
        { text: "Dirty key" },
      ],
      preferredVerbs: [
        { when: { hasObject: "key" }, verb: "use" },
        { verb: "pick-up" },
      ],
      secondaryVerbs: [{ verb: "look-at" }],
      cases: [{
        verb: "pick-up",
        response: { text: "You take the key." },
        operations: [
          { type: "collect-target-object" },
          ...(duplicateCollection ? [{ type: "collect-target-object" } as const] : []),
        ],
      }, {
        verb: "look-at",
        response: { text: "A small key." },
        operations: [{ type: "set-variable", variable: "keyCleaned", value: true }],
      }],
    }),
  });
  const coin = defineObject({
    initialScene: "opening",
    initialGroundPoint: { x: 30, y: 30 },
    initialAppearance: "new",
    appearances: {
      new: { animations: { idle: { frames: ["coin.png"], framesPerSecond: 1, loop: true } }, roles: { default: "idle" } },
      polished: { animations: { idle: { frames: ["polished-coin.png"], framesPerSecond: 1, loop: true } }, roles: { default: "idle" } },
    },
    inventoryAppearance: "coin-inventory.png",
    noun: defineNoun({
      labels: [{ text: "Coin" }],
      preferredVerbs: [{ verb: "pick-up" }],
      cases: [{
        verb: "pick-up",
        response: { text: "You take the coin." },
        operations: [{ type: "collect-target-object" }],
      }],
    }),
  });
  const conversation = defineSequence({
    skippable: true,
    skipOutcome: [],
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
              { type: "narration", text: "The committed branch continues." },
            ],
          },
        ],
        fallback: { text: "Again", steps: [] },
      },
      { type: "narration", text: "The road still waits." },
      { type: "line", character: "player", text: "The conversation ends." },
    ],
  });

  return defineGame({
    identity,
    version: "1",
    logicalResolution: { width: 100, height: 200 },
    inventoryAppearanceSize: 32,
    scenes: { opening, ending },
    characters: { player },
    playerCharacter: "player",
    objects: { key, ...(includeSecondObject ? { coin } : {}) },
    sequences: { conversation },
    variables: { met: false, gateOpen: false, behaviorRan: false, keyCleaned: false },
    commandLexicon: defineCommandLexicon({
      inventory: { select: "Hold {noun}", deselect: "Put back {noun}" },
      verbs: {
        open: "Open", "pick-up": "Pick up", push: "Push", close: "Close",
        "look-at": "Look at", pull: "Pull", give: "Give", "talk-to": "Talk to", use: "Use",
      },
      patterns: {
        unary: "{verb} {noun}", give: "{verb} {first} to {second}", use: "{verb} {first} with {second}",
      },
    }),
    commandFallbacks: Object.fromEntries([
      "open", "pick-up", "push", "close", "look-at", "pull", "give", "talk-to", "use",
    ].map((verb) => [verb, { text: "That does not help." }])) as never,
    initialScene: "opening",
  });
}

function interact(session: ReturnType<typeof createTestSession>, hotspot: number) {
  const verbs = ["talk-to", "pick-up", "look-at"] as const;
  session.input({ type: "select-verb", verb: verbs[hotspot]! });
  session.input({ type: "activate-hotspot", hotspot });
  session.steps(20);
}

function useKeyOn(session: ReturnType<typeof createTestSession>, hotspot: number) {
  session.input({ type: "select-verb", verb: "use" });
  session.input({ type: "activate-object", object: "key" });
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
  expect(session.snapshot().activity).toMatchObject({
    type: "sequence",
    active: { kind: "line", choiceText: "Yes" },
  });
  expect(session.snapshot().variables.met).toBe(false);
  session.input({ type: "advance-sequence" });
  session.steps();
  expect(session.snapshot().activity).toMatchObject({ type: "sequence", active: { kind: "narration" } });
  expect(session.snapshot().variables.met).toBe(true);
  expect(session.snapshot().characters.player!.appearance).toBe("happy");

  const validation = validateSaveSnapshot(
    projectFixture(),
    JSON.parse(JSON.stringify(session.createSaveSnapshot())) as unknown,
  );
  expect(validation.ok).toBe(true);
  if (!validation.ok) return;
  expect(createTestSession(projectFixture(), validation.snapshot).snapshot().activity)
    .toMatchObject({ type: "sequence", active: { kind: "narration" } });

  session.input({ type: "advance-sequence" });
  session.steps();
  expect(session.snapshot().activity).toMatchObject({ type: "sequence", active: { kind: "narration" } });
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

test("Save round trip preserves Inventory order, Object location, selection, and Appearance", () => {
  const project = projectFixture(false, false, true);
  const source = createTestSession(project).createSaveSnapshot();
  const raw = {
    ...source,
    state: {
      ...source.state,
      objects: {
        ...source.state.objects,
        coin: {
          ...source.state.objects.coin!,
          location: { kind: "inventory" as const },
          appearance: "polished",
        },
        key: {
          ...source.state.objects.key!,
          location: { kind: "inventory" as const },
          appearance: "used",
        },
      },
      inventory: { objects: ["coin", "key"] },
      command: {
        verb: "use" as const,
        firstNoun: { kind: "object" as const, object: "key" },
      },
    },
  };

  const validation = validateSaveSnapshot(project, raw);
  expect(validation.ok).toBe(true);
  if (!validation.ok) throw new Error("Expected the Inventory Save Snapshot to be valid.");
  const restored = createTestSession(project, validation.snapshot);
  expect(restored.createSaveSnapshot().state).toEqual(raw.state);
});

test("a skippable Sequence can dismiss active Narration", () => {
  const session = createTestSession(projectFixture());
  interact(session, 0);
  session.input({ type: "advance-sequence" });
  session.steps();
  session.input({ type: "choose", alternative: 0 });
  session.steps();
  session.input({ type: "advance-sequence" });
  session.steps();
  expect(session.snapshot().activity).toMatchObject({
    type: "sequence",
    active: { kind: "narration" },
  });

  session.input({ type: "skip-sequence" });
  session.steps();
  expect(session.snapshot().activity).toBeNull();
});

test("Save Snapshot validation restores a Command while it approaches its Noun", () => {
  const project = projectFixture();
  const uninterrupted = createTestSession(project);
  uninterrupted.input({ type: "select-verb", verb: "talk-to" });
  uninterrupted.input({ type: "activate-hotspot", hotspot: 0 });
  uninterrupted.steps();

  const validation = validateSaveSnapshot(
    project,
    JSON.parse(JSON.stringify(uninterrupted.createSaveSnapshot())) as unknown,
  );
  expect(validation.ok).toBe(true);
  if (!validation.ok) return;
  const restored = createTestSession(project, validation.snapshot);
  for (const session of [uninterrupted, restored]) session.steps(20);
  expect(restored.snapshot()).toEqual(uninterrupted.snapshot());
});

test("Save Snapshot validation rejects an impossible Player Intent destination", () => {
  const project = projectFixture();
  const session = createTestSession(project);
  session.input({ type: "move", point: { x: 80, y: 80 } });
  session.steps();
  const snapshot = session.createSaveSnapshot();
  const activity = snapshot.state.activity;
  if (activity?.type !== "player-intent") {
    throw new Error("Expected a Player Intent to be active.");
  }

  const result = validateSaveSnapshot(project, {
    ...snapshot,
    state: {
      ...snapshot.state,
      activity: { ...activity, destination: { x: 1_000, y: 1_000 } },
    },
  });

  expect(result.ok).toBe(false);
});

test("Save Snapshot validation binds a Player Intent to its Approach Point", () => {
  const project = projectFixture();
  const session = createTestSession(project);
  session.input({ type: "select-verb", verb: "talk-to" });
  session.input({ type: "activate-hotspot", hotspot: 0 });
  session.steps();
  const snapshot = session.createSaveSnapshot();
  const activity = snapshot.state.activity;
  if (activity?.type !== "player-intent") {
    throw new Error("Expected a Player Intent to be active.");
  }

  const result = validateSaveSnapshot(project, {
    ...snapshot,
    state: {
      ...snapshot.state,
      activity: {
        ...activity,
        destination: { x: 50, y: 50 },
        finalFacing: "left",
      },
    },
  });

  expect(result.ok).toBe(false);
});

test("Save Snapshot validation requires the Player Character for an active Player Intent", () => {
  const project = projectFixture();
  const session = createTestSession(project);
  session.input({ type: "move", point: { x: 80, y: 80 } });
  session.steps();
  const snapshot = session.createSaveSnapshot();
  if (snapshot.state.activity?.type !== "player-intent") {
    throw new Error("Expected a Player Intent to be active.");
  }

  const result = validateSaveSnapshot(project, {
    ...snapshot,
    state: {
      ...snapshot.state,
      characters: {
        ...snapshot.state.characters,
        player: { ...snapshot.state.characters.player, scene: "ending" },
      },
    },
  });

  expect(result.ok).toBe(false);
});

test("selecting a Verb cancels a Player Intent that is still approaching its Noun", () => {
  const session = createTestSession(projectFixture());
  session.input({ type: "select-verb", verb: "talk-to" });
  session.input({ type: "activate-hotspot", hotspot: 0 });
  session.steps();
  expect(session.snapshot().activity).toMatchObject({ type: "player-intent" });

  session.input({ type: "select-verb", verb: "look-at" });
  session.steps();

  expect(session.snapshot().activity).toBeNull();
  expect(session.snapshot().command).toEqual({ verb: "look-at", firstNoun: null });
});

test("Save Snapshot validation rejects malformed or unavailable Command Nouns", () => {
  const project = projectFixture();
  const snapshot = createTestSession(project).createSaveSnapshot();
  const result = validateSaveSnapshot(project, {
    ...snapshot,
    state: {
      ...snapshot.state,
      command: { verb: "use", firstNoun: { kind: "object", object: "key" } },
    },
  });
  expect(result.ok).toBe(false);
  if (!result.ok) {
    expect(result.diagnostics).toContainEqual(expect.objectContaining({
      code: "save.state.command-noun",
      path: "Save Snapshot.state.command.firstNoun.object",
    }));
  }
});

test("Save Snapshot validation identifies an unavailable pending Command Noun", () => {
  const project = projectFixture();
  const session = createTestSession(project);
  interact(session, 1);
  session.input({ type: "select-verb", verb: "use" });
  session.input({ type: "activate-object", object: "key" });
  session.input({ type: "activate-hotspot", hotspot: 2 });
  session.steps();
  const snapshot = session.createSaveSnapshot();
  const activity = structuredClone(snapshot.state.activity) as unknown as Record<string, unknown>;
  const intent = activity.intent as Record<string, unknown>;
  intent.command = { ...(intent.command as object), firstNoun: "missing" };
  const result = validateSaveSnapshot(project, {
    ...snapshot,
    state: { ...snapshot.state, activity },
  });

  expect(result.ok).toBe(false);
  if (!result.ok) {
    expect(result.diagnostics).toContainEqual(expect.objectContaining({
      code: "save.state.intent-command-noun",
      path: "Save Snapshot.state.activity.intent.command.firstNoun",
    }));
  }
});

test("Save Snapshot validation identifies malformed pending Command metadata", () => {
  const project = projectFixture();
  const session = createTestSession(project);
  session.input({ type: "select-verb", verb: "look-at" });
  session.input({ type: "activate-hotspot", hotspot: 0 });
  session.steps();
  const snapshot = session.createSaveSnapshot();
  const activity = structuredClone(snapshot.state.activity) as unknown as Record<string, unknown>;
  const intent = activity.intent as Record<string, unknown>;
  intent.command = { ...(intent.command as object), preserveState: "yes" };
  const result = validateSaveSnapshot(project, {
    ...snapshot,
    state: { ...snapshot.state, activity },
  });

  expect(result.ok).toBe(false);
  if (!result.ok) expect(result.diagnostics).toContainEqual(expect.objectContaining({
    code: "save.state.intent-command",
    path: "Save Snapshot.state.activity.intent.command",
  }));
});

test("a binary Use preserves its first Noun on failure and relocates it atomically on success", () => {
  const session = createTestSession(projectFixture());
  interact(session, 1);
  expect(session.snapshot().inventory.objects).toEqual(["key"]);
  expect(session.snapshot().inventory).toEqual({ objects: ["key"] });

  session.input({ type: "select-verb", verb: "use" });
  session.input({ type: "activate-object", object: "key" });
  session.input({ type: "activate-hotspot", hotspot: 0 });
  session.steps(20);
  expect(session.snapshot().command).toEqual({ verb: "walk-to", firstNoun: null });
  expect(session.snapshot().inventory.objects).toEqual(["key"]);
  expect(session.takeEffects()).toContainEqual({
    type: "interaction-response",
    text: "That does not help.",
    response: { text: "That does not help." },
  });

  useKeyOn(session, 2);
  expect(session.snapshot().inventory).toEqual({ objects: [] });
  expect(session.snapshot().objects.key).toMatchObject({
    location: { kind: "scene", scene: "opening", groundPoint: { x: 75, y: 75 } },
    appearance: "used",
  });
  expect(session.snapshot().variables.gateOpen).toBe(true);
  expect(session.snapshot().scenery.opening!.gate).toBe("open");
});

test("a failed Command operation leaves Game State uncommitted and emits no response", () => {
  const session = createTestSession(projectFixture(false, true));
  session.input({ type: "select-verb", verb: "pick-up" });
  session.input({ type: "activate-hotspot", hotspot: 1 });
  session.steps(20);

  expect(session.lifecycle()).toBe("failed");
  expect(session.snapshot().objects.key!.location).toEqual({
    kind: "scene",
    scene: "opening",
    groundPoint: { x: 40, y: 40 },
  });
  expect(session.snapshot().inventory.objects).toEqual([]);
  expect(session.snapshot().command).toEqual({ verb: "pick-up", firstNoun: null });
  expect(session.effects()).not.toContainEqual(expect.objectContaining({
    type: "interaction-response",
  }));
  expect(session.diagnostics()).toContainEqual(expect.objectContaining({
    code: "state.operation.invalid",
    owner: "game-session",
  }));
});

test("a successful binary Use can consume its first Object terminally", () => {
  const session = createTestSession(projectFixture(true));
  interact(session, 1);
  useKeyOn(session, 2);

  expect(session.snapshot().inventory).toEqual({ objects: [] });
  expect(session.snapshot().objects.key!.location).toEqual({ kind: "consumed" });
  session.steps(10);
  expect(session.snapshot().objects.key!.location).toEqual({ kind: "consumed" });
});

test("contextual input resolves an Object selection queued in the same step", () => {
  const session = createTestSession(projectFixture());
  interact(session, 1);

  session.input({ type: "select-object", object: "key" });
  session.input({ type: "contextual-hotspot", hotspot: 2, action: "primary" });
  session.steps(20);

  expect(session.snapshot().variables.gateOpen).toBe(true);
  expect(session.snapshot().inventory.objects).toEqual([]);
  expect(session.snapshot().command).toEqual({ verb: "walk-to", firstNoun: null });
});

test("Inventory contextual input selects an Object or executes its secondary Verb", () => {
  const session = createTestSession(projectFixture());
  interact(session, 1);

  session.input({ type: "contextual-object", object: "key", action: "secondary" });
  session.steps();
  expect(session.takeEffects()).toContainEqual({
    type: "interaction-response",
    text: "A small key.",
    response: { text: "A small key." },
  });
  expect(session.snapshot().command).toEqual({ verb: "walk-to", firstNoun: null });

  session.input({ type: "contextual-object", object: "key", action: "primary" });
  session.steps();
  expect(session.snapshot().command).toEqual({
    verb: "use",
    firstNoun: { kind: "object", object: "key" },
  });
});

test("one Object Noun updates its conditional label in the world and Inventory", () => {
  const session = createTestSession(projectFixture());
  expect(session.hud().nouns.find(({ target }) =>
    target.kind === "hotspot" && target.index === 1
  )?.label).toBe("Dirty key");

  interact(session, 1);
  expect(session.hud().inventory.entries).toContainEqual(expect.objectContaining({
    object: "key",
    label: "Dirty key",
  }));

  session.input({ type: "contextual-object", object: "key", action: "secondary" });
  session.steps();
  expect(session.snapshot().variables.keyCleaned).toBe(true);
  expect(session.hud().inventory.entries).toContainEqual(expect.objectContaining({
    object: "key",
    label: "Clean key",
  }));

  useKeyOn(session, 2);
  expect(session.hud().nouns.find(({ target }) =>
    target.kind === "hotspot" && target.index === 1
  )?.label).toBe("Clean key");
});

test("a declarative Command commits operations and an enabled passage transitions atomically", () => {
  const session = createTestSession(projectFixture());
  interact(session, 1);
  useKeyOn(session, 2);
  interact(session, 0);
  expect(session.snapshot().variables.behaviorRan).toBe(true);
  expect(session.snapshot().activity).toMatchObject({
    type: "line",
    line: { character: "player", text: "The way is open." },
  });
  const lineSave = validateSaveSnapshot(
    projectFixture(),
    JSON.parse(JSON.stringify(session.createSaveSnapshot())) as unknown,
  );
  expect(lineSave.ok).toBe(true);
  if (lineSave.ok) {
    const restored = createTestSession(projectFixture(), lineSave.snapshot);
    expect(restored.snapshot().activity).toEqual(session.snapshot().activity);
  }
  session.input({ type: "advance-line" });
  session.steps();
  expect(session.snapshot().activity).toBeNull();

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

test("a 0.3 Save Snapshot receives explicit incompatibility diagnostics", () => {
  const project = projectFixture();
  const current = createTestSession(project).createSaveSnapshot();
  const result = validateSaveSnapshot(project, {
    ...current,
    formatVersion: 0,
    projectVersion: "0.3",
  });

  expect(result.ok).toBe(false);
  if (!result.ok) {
    expect(result.diagnostics.map(({ code }) => code)).toEqual(
      expect.arrayContaining(["save.format.version", "save.project.version"]),
    );
  }
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

test("Save Snapshot validation rejects a Character outside its Scene Space", () => {
  const project = projectFixture();
  const snapshot = createTestSession(project).createSaveSnapshot();
  const result = validateSaveSnapshot(project, {
    ...snapshot,
    state: {
      ...snapshot.state,
      characters: {
        ...snapshot.state.characters,
        player: {
          ...snapshot.state.characters.player,
          groundPoint: { x: 1_000, y: 1_000 },
        },
      },
    },
  });

  expect(result.ok).toBe(false);
  if (!result.ok) {
    expect(result.diagnostics).toContainEqual(expect.objectContaining({
      code: "save.state.invalid",
      owner: "save",
    }));
  }
});

test("Save Snapshot validation rejects an unavailable Line Animation", () => {
  const project = projectFixture();
  const snapshot = createTestSession(project).createSaveSnapshot();
  const result = validateSaveSnapshot(project, {
    ...snapshot,
    state: {
      ...snapshot.state,
      activity: {
        type: "line",
        animationStartedTick: 0,
        line: {
          character: "player",
          text: "This state could not have been committed.",
          animation: "missing",
        },
      },
    },
  });

  expect(result.ok).toBe(false);
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

test("a Save Snapshot validated for one Game Project cannot restore another", () => {
  const sourceProject = projectFixture();
  const validation = validateSaveSnapshot(
    sourceProject,
    createTestSession(sourceProject).createSaveSnapshot(),
  );
  expect(validation.ok).toBe(true);
  if (!validation.ok) return;

  const otherProject = projectFixture(false, false, false, "test.other-game");
  expect(() => createTestSession(otherProject, validation.snapshot)).toThrow(
    /validated for another Game Project/,
  );
});

test("restore revalidates a Save Snapshot against the destination Game Project", () => {
  const sourceProject = projectFixture(false, false, true);
  const validation = validateSaveSnapshot(
    sourceProject,
    createTestSession(sourceProject).createSaveSnapshot(),
  );
  expect(validation.ok).toBe(true);
  if (!validation.ok) return;

  const incompatibleProject = projectFixture();
  expect(() => createTestSession(incompatibleProject, validation.snapshot)).toThrow(
    /invalid Game State/,
  );
});

test("successful validation isolates restoration from later stored-data mutation", () => {
  const project = projectFixture();
  const raw = structuredClone(createTestSession(project).createSaveSnapshot());
  const validation = validateSaveSnapshot(project, raw);
  expect(validation.ok).toBe(true);
  if (!validation.ok) return;

  raw.state.variables.met = true;
  const restored = createTestSession(project, validation.snapshot);
  expect(restored.snapshot().variables.met).toBe(false);
});
