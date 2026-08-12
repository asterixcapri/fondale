import { expect, test } from "@playwright/test";

import { createTestSession, validateTestSaveSnapshot } from "./support";
import {
  type CharacterDefinition,
  type CharacterKnowledgeDefinition,
  type CommandLexicon,
  type DialogueProvider,
  FakeDialogueProvider,
  type GameOperation,
  type GameProject,
  type NounDefinition,
  type SceneDefinition,
} from "../src/index";
import { compileGameProject } from "../src/capabilities/game-project";

const square = [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 100 },
  { x: 0, y: 100 },
];

const appearance = {
  animations: {
    idle: { frames: ["idle.png"], framesPerSecond: 1, loop: true },
  },
  roles: { default: "idle", walking: "idle" },
};

const commandLexicon = {
  inventory: { select: "Hold {noun}", deselect: "Put back {noun}" },
  verbs: {
    open: "Open", "pick-up": "Pick up", push: "Push", close: "Close",
    "look-at": "Look at", pull: "Pull", give: "Give", "talk-to": "Talk to", use: "Use",
  },
  patterns: {
    unary: "{verb} {noun}",
    give: "{verb} {first} to {second}",
    use: "{verb} {first} with {second}",
  },
} satisfies CommandLexicon;

const commandFallbacks = Object.fromEntries([
  "open", "pick-up", "push", "close", "look-at", "pull", "give", "talk-to", "use",
].map((verb) => [verb, { text: "That does not help." }])) as never;

function character(dialogue: CharacterDefinition["dialogue"]): CharacterDefinition {
  return {
    initialScene: "opening",
    initialGroundPoint: { x: 10, y: 10 },
    initialFacing: "front",
    initialAppearance: "normal",
    appearances: { normal: appearance },
    movementSpeed: 60,
    ...(dialogue ? { dialogue } : {}),
  };
}

function knowledgeProject(): GameProject {
  const learn = {
    labels: [{ text: "Chain" }],
    preferredVerbs: [{ verb: "look-at" }],
    cases: [{
      verb: "look-at",
      response: { text: "You understand what happened." },
      operations: [{
        type: "learn-narrative-fact",
        character: "player",
        factId: "harbour-chain-cut",
      }],
    }],
  } satisfies NounDefinition;
  const opening = {
    background: "opening.png",
    walkableRegion: square,
    hotspots: [{
      target: { kind: "background" },
      area: square,
      approach: { groundPoint: { x: 10, y: 10 }, facing: "front" },
      noun: learn,
    }],
  } satisfies SceneDefinition;

  return {
    identity: "test.knowledge-driven-dialogue",
    version: "1",
    logicalResolution: { width: 100, height: 100 },
    scenes: { opening },
    narrativeFacts: {
      "harbour-chain-cut": { proposition: "The harbour chain was cut." },
      lighthouse: { proposition: "The lighthouse is unlit." },
    },
    characters: {
      player: character({ knowledge: [] }),
      antonio: character({
        knowledge: [{
          factId: "harbour-chain-cut",
          disclosure: { level: "open" },
        }],
      }),
      bystander: character(undefined),
    },
    playerCharacter: "player",
    commandLexicon,
    commandFallbacks,
    initialScene: "opening",
  } satisfies GameProject;
}

function rollbackProject(operations: readonly GameOperation[]): GameProject {
  const noun = {
    labels: [{ text: "Key" }],
    preferredVerbs: [{ verb: "pick-up" }],
    cases: [{
      verb: "pick-up",
      response: { text: "You take the key." },
      operations,
    }],
  } satisfies NounDefinition;
  const opening = {
    background: "opening.png",
    walkableRegion: square,
    hotspots: [{
      target: { kind: "object", object: "key" },
      area: square,
      approach: { groundPoint: { x: 10, y: 10 }, facing: "front" },
    }],
  } satisfies SceneDefinition;
  return {
    identity: "test.knowledge-rollback",
    version: "1",
    logicalResolution: { width: 100, height: 100 },
    scenes: { opening },
    narrativeFacts: {
      "harbour-chain-cut": { proposition: "The harbour chain was cut." },
    },
    characters: { player: character({ knowledge: [] }) },
    playerCharacter: "player",
    objects: {
      key: {
        initialScene: "opening",
        initialGroundPoint: { x: 10, y: 10 },
        initialAppearance: "normal",
        appearances: { normal: appearance },
        inventoryAppearance: "key.png",
        noun,
      },
    },
    commandLexicon,
    commandFallbacks,
    initialScene: "opening",
  } satisfies GameProject;
}

function relationshipProject(operations: readonly GameOperation[]): GameProject {
  const base = knowledgeProject();
  const opening = base.scenes.opening!;
  const hotspot = opening.hotspots![0]!;
  if (hotspot.target.kind !== "background" || !hotspot.noun) {
    throw new Error("Expected the knowledge hotspot.");
  }
  const knowledgeNoun = hotspot.noun;
  return {
    ...base,
    characters: {
      ...base.characters,
      antonio: character({
        knowledge: [{ factId: "harbour-chain-cut", disclosure: { level: "open" } }],
        relationships: { player: { trust: "low" } },
        state: "afraid",
      }),
    },
    scenes: {
      opening: {
        ...opening,
        hotspots: [{
          target: { kind: "background" },
          area: hotspot.area,
          approach: hotspot.approach,
          ...(hotspot.when ? { when: hotspot.when } : {}),
          noun: {
            ...knowledgeNoun,
            cases: [{
              verb: "look-at",
              response: { text: "Antonio steadies himself." },
              operations,
            }],
          },
        }],
      },
    },
  } satisfies GameProject;
}

function dialogueRollbackProject(operations: readonly GameOperation[]): GameProject {
  const base = rollbackProject(operations);
  return {
    ...base,
    characters: {
      ...base.characters,
      antonio: character({
        knowledge: [],
        relationships: { player: { trust: "low" } },
        state: "afraid",
      }),
    },
  } satisfies GameProject;
}

function coverStoryProject(): GameProject {
  const base = knowledgeProject();
  return {
    ...base,
    narrativeFacts: {
      ...base.narrativeFacts,
      "santa-lucia": { proposition: "Antonio was aboard the Santa Lucia." },
    },
    claims: {
      denial: { proposition: "Antonio was never aboard the Santa Lucia." },
    },
    variables: { confessionUnlocked: false },
    scenes: {
      opening: {
        ...base.scenes.opening!,
        hotspots: [{
          target: { kind: "character", character: "antonio" },
          area: square,
          approach: { groundPoint: { x: 10, y: 10 }, facing: "front" },
        }],
      },
    },
    characters: {
      ...base.characters,
      antonio: {
        ...base.characters!.antonio!,
        dialogue: {
          knowledge: [{
            factId: "santa-lucia",
            disclosure: {
              level: "secret",
              when: { variable: "confessionUnlocked", equals: true },
            },
          }],
          coverStories: [{ concealsFactId: "santa-lucia", claimId: "denial" }],
        },
        noun: {
          labels: [{ text: "Antonio" }],
          preferredVerbs: [{ verb: "talk-to" }],
          cases: [{
            verb: "talk-to",
            line: { character: "antonio", text: "Authored fallback." },
          }],
        },
      },
    },
  } satisfies GameProject;
}

function openAntonioConversation(session: ReturnType<typeof createTestSession>): void {
  session.input({ type: "select-verb", verb: "talk-to" });
  session.input({ type: "activate-hotspot", hotspot: 0 });
  session.steps(2);
}

test("Game Session copies initial Character Knowledge and learns idempotently", () => {
  const project = knowledgeProject();
  const session = createTestSession(project);

  (project.characters!.antonio!.dialogue!.knowledge as CharacterKnowledgeDefinition[]).push({
    factId: "lighthouse",
    disclosure: { level: "open" },
  });

  expect(session.snapshot().characterKnowledge).toEqual({
    player: [],
    antonio: ["harbour-chain-cut"],
    bystander: [],
  });

  for (let attempt = 0; attempt < 2; attempt += 1) {
    session.input({ type: "select-verb", verb: "look-at" });
    session.input({ type: "activate-hotspot", hotspot: 0 });
    session.steps(2);
  }

  expect(session.snapshot().characterKnowledge).toEqual({
    player: ["harbour-chain-cut"],
    antonio: ["harbour-chain-cut"],
    bystander: [],
  });
});

test("Save Snapshot validates and exactly restores Character Knowledge", () => {
  const project = knowledgeProject();
  const session = createTestSession(project);
  session.input({ type: "select-verb", verb: "look-at" });
  session.input({ type: "activate-hotspot", hotspot: 0 });
  session.steps(2);

  const raw = JSON.parse(JSON.stringify(session.createSaveSnapshot())) as unknown;
  const validation = validateTestSaveSnapshot(project, raw);

  expect(validation.ok).toBe(true);
  if (!validation.ok) return;
  const restored = createTestSession(project, validation.snapshot);
  expect(restored.snapshot()).toEqual(session.snapshot());
  expect(restored.snapshot().characterKnowledge).toEqual({
    player: ["harbour-chain-cut"],
    antonio: ["harbour-chain-cut"],
    bystander: [],
  });
});

test("Game Operations change directional Trust and Dialogue State atomically and Save restores them", () => {
  const project = relationshipProject([
    {
      type: "set-trust",
      character: "antonio",
      towards: "player",
      trust: "high",
    },
    {
      type: "set-dialogue-state",
      character: "antonio",
      state: "calm",
    },
  ]);
  const session = createTestSession(project);

  expect(session.snapshot().relationships).toEqual({
    player: {},
    antonio: { player: { trust: "low" } },
    bystander: {},
  });
  expect(session.snapshot().dialogueStates).toEqual({
    player: null,
    antonio: "afraid",
    bystander: null,
  });

  session.input({ type: "select-verb", verb: "look-at" });
  session.input({ type: "activate-hotspot", hotspot: 0 });
  session.steps(2);

  expect(session.snapshot().relationships.antonio!.player).toEqual({ trust: "high" });
  expect(session.snapshot().relationships.player!.antonio).toBeUndefined();
  expect(session.snapshot().dialogueStates.antonio).toBe("calm");

  const validation = validateTestSaveSnapshot(
    project,
    JSON.parse(JSON.stringify(session.createSaveSnapshot())) as unknown,
  );
  expect(validation.ok).toBe(true);
  if (!validation.ok) return;
  expect(createTestSession(project, validation.snapshot).snapshot()).toEqual(session.snapshot());
});

test("invalid Character Knowledge operation references reject project startup", () => {
  const result = compileGameProject(rollbackProject([{
    type: "learn-narrative-fact",
    character: "missing",
    factId: "missing",
  }]));

  expect(result).toMatchObject({
    ok: false,
    diagnostics: [
      expect.objectContaining({
        code: "reference.character-knowledge.character",
        owner: "dialogue",
      }),
      expect.objectContaining({
        code: "reference.character-knowledge.fact",
        owner: "dialogue",
      }),
    ],
  });
});

test("a later operation failure rolls back Character Knowledge with the complete batch", () => {
  const session = createTestSession(rollbackProject([
    {
      type: "learn-narrative-fact",
      character: "player",
      factId: "harbour-chain-cut",
    },
    { type: "collect-target-object" },
    { type: "collect-target-object" },
  ]));

  session.input({ type: "select-verb", verb: "pick-up" });
  session.input({ type: "activate-hotspot", hotspot: 0 });
  session.steps(2);

  expect(session.lifecycle()).toBe("failed");
  expect(session.snapshot().characterKnowledge).toEqual({ player: [] });
  expect(session.snapshot().inventory.objects).toEqual([]);
  expect(session.snapshot().objects.key!.location).toEqual({
    kind: "scene",
    scene: "opening",
    groundPoint: { x: 10, y: 10 },
  });
});

test("a later operation failure rolls back Trust and Dialogue State with the complete batch", () => {
  const session = createTestSession(dialogueRollbackProject([
    { type: "set-trust", character: "antonio", towards: "player", trust: "high" },
    { type: "set-dialogue-state", character: "antonio", state: "calm" },
    { type: "collect-target-object" },
    { type: "collect-target-object" },
  ]));

  session.input({ type: "select-verb", verb: "pick-up" });
  session.input({ type: "activate-hotspot", hotspot: 0 });
  session.steps(2);

  expect(session.lifecycle()).toBe("failed");
  expect(session.snapshot().relationships.antonio!.player).toEqual({ trust: "low" });
  expect(session.snapshot().dialogueStates.antonio).toBe("afraid");
  expect(session.snapshot().inventory.objects).toEqual([]);
});

test("Save Snapshot rejects incomplete, duplicate or unknown Character Knowledge", () => {
  const project = knowledgeProject();
  const snapshot = createTestSession(project).createSaveSnapshot();
  const variants = [
    { ...snapshot.state.characterKnowledge, antonio: ["harbour-chain-cut", "harbour-chain-cut"] },
    { ...snapshot.state.characterKnowledge, antonio: ["missing"] },
    { ...snapshot.state.characterKnowledge, antonio: [] },
    { player: [], antonio: ["harbour-chain-cut"] },
  ];

  for (const characterKnowledge of variants) {
    const result = validateTestSaveSnapshot(project, {
      ...snapshot,
      state: { ...snapshot.state, characterKnowledge },
    });
    expect(result.ok).toBe(false);
  }
});

test("Save Snapshot rejects malformed Relationships and Dialogue State", () => {
  const project = relationshipProject([]);
  const snapshot = createTestSession(project).createSaveSnapshot();
  const stateVariants = [
    {
      ...snapshot.state,
      relationships: {
        ...snapshot.state.relationships,
        antonio: { player: { trust: 50 } },
      },
    },
    {
      ...snapshot.state,
      relationships: { ...snapshot.state.relationships, antonio: {} },
    },
    {
      ...snapshot.state,
      dialogueStates: { ...snapshot.state.dialogueStates, antonio: 0.75 },
    },
  ];

  for (const state of stateVariants) {
    expect(validateTestSaveSnapshot(project, { ...snapshot, state }).ok).toBe(false);
  }
});

test("a Narrative Fact may use __proto__ as its stable registry identity", () => {
  const base = knowledgeProject();
  const project = {
    ...base,
    narrativeFacts: {
      ...base.narrativeFacts,
      ["__proto__"]: { proposition: "The old chart is authentic." },
    },
    characters: {
      ...base.characters,
      player: character({
        knowledge: [{ factId: "__proto__", disclosure: { level: "open" } }],
      }),
    },
  } satisfies GameProject;
  const session = createTestSession(project);
  const validation = validateTestSaveSnapshot(project, session.createSaveSnapshot());

  expect(session.snapshot().characterKnowledge.player).toEqual(["__proto__"]);
  expect(validation.ok).toBe(true);
});

test("Talk To completes an open-fact Conversation through the Dialogue Provider", async () => {
  const base = knowledgeProject();
  const project = {
    ...base,
    scenes: {
      opening: {
        ...base.scenes.opening!,
        hotspots: [{
          target: { kind: "character", character: "antonio" },
          area: square,
          approach: { groundPoint: { x: 10, y: 10 }, facing: "front" },
        }],
      },
    },
    characters: {
      ...base.characters,
      antonio: {
        ...base.characters!.antonio!,
        noun: {
          labels: [{ text: "Antonio" }],
          preferredVerbs: [{ verb: "talk-to" }],
          cases: [{
            verb: "talk-to",
            line: { character: "antonio", text: "Authored fallback." },
          }],
        },
      },
    },
  } satisfies GameProject;
  const provider = new FakeDialogueProvider({
    interpretations: {
      "Who cut the harbour chain?": "harbour-chain-cut",
      "What happened to the chain?": "harbour-chain-cut",
    },
    verbalizations: {
      "harbour-chain-cut": "I saw the harbour chain being cut.",
    },
  });
  const session = createTestSession(project, undefined, provider);

  session.input({ type: "select-verb", verb: "talk-to" });
  session.input({ type: "activate-hotspot", hotspot: 0 });
  session.steps(2);

  expect(session.conversation()).toMatchObject({
    character: "antonio",
    status: "ready",
  });

  for (const playerInput of [
    "Who cut the harbour chain?",
    "What happened to the chain?",
  ]) {
    await expect(session.submitDialogue(playerInput)).resolves.toEqual({ ok: true });
    expect(session.snapshot().characterKnowledge.player).toEqual(
      playerInput === "Who cut the harbour chain?" ? [] : ["harbour-chain-cut"],
    );
    session.steps();
    expect(session.snapshot().characterKnowledge.player).toEqual(["harbour-chain-cut"]);
    expect(session.hud().narrative).toMatchObject({
      kind: "line",
      speaker: "player",
      text: playerInput,
    });

    session.input({ type: "advance-conversation-line" });
    session.steps();
    expect(session.hud().narrative).toMatchObject({
      kind: "line",
      speaker: "antonio",
      text: "I saw the harbour chain being cut.",
    });

    session.input({ type: "advance-conversation-line" });
    session.steps();
    expect(session.conversation()).toMatchObject({ status: "ready" });
  }
});

test("a successful Cover Story commits one idempotent Testimony and Save restores it exactly", async () => {
  const project = coverStoryProject();
  const provider = new FakeDialogueProvider({
    interpretations: { "Were you aboard?": "santa-lucia" },
    verbalizations: { denial: "I was never aboard that ship." },
  });
  const session = createTestSession(project, undefined, provider);
  openAntonioConversation(session);

  await expect(session.submitDialogue("Were you aboard?")).resolves.toEqual({ ok: true });
  expect(session.snapshot().testimonies).toEqual([]);
  session.steps();
  const rememberedTestimony = [{
    speaker: "antonio",
    listener: "player",
    claimId: "denial",
  }];
  expect(session.snapshot().testimonies).toEqual(rememberedTestimony);
  expect(session.snapshot().characterKnowledge.player).toEqual([]);

  for (let turn = 0; turn < 2; turn += 1) {
    session.input({ type: "advance-conversation-line" });
    session.steps();
    session.input({ type: "advance-conversation-line" });
    session.steps();
    if (turn === 0) {
      await expect(session.submitDialogue("Were you aboard?")).resolves.toEqual({ ok: true });
      expect(session.snapshot().testimonies).toEqual(rememberedTestimony);
      session.steps();
      expect(session.snapshot().testimonies).toEqual(rememberedTestimony);
    }
  }

  const snapshot = session.createSaveSnapshot();
  expect(JSON.stringify(snapshot)).not.toContain("I was never aboard that ship.");
  const validation = validateTestSaveSnapshot(
    project,
    JSON.parse(JSON.stringify(snapshot)) as unknown,
  );
  expect(validation.ok).toBe(true);
  if (!validation.ok) return;
  expect(createTestSession(project, validation.snapshot, provider).snapshot()).toEqual(
    session.snapshot(),
  );
});

test("failed or stopped Cover Story turns discard staged Testimony", async () => {
  const project = coverStoryProject();
  const failedProvider: DialogueProvider = {
    interpret: () => Promise.resolve({ factId: "santa-lucia" }),
    verbalize: () => Promise.reject(new Error("Provider unavailable.")),
    reset: () => Promise.resolve(),
  };
  const failedSession = createTestSession(project, undefined, failedProvider);
  openAntonioConversation(failedSession);

  await expect(failedSession.submitDialogue("Were you aboard?")).resolves.toEqual({
    ok: false,
    message: "Provider unavailable.",
  });
  failedSession.steps();
  expect(failedSession.snapshot().testimonies).toEqual([]);

  let finishVerbalization!: (response: string) => void;
  let stoppedTurnContext: Parameters<DialogueProvider["verbalize"]>[1] | undefined;
  const pendingProvider: DialogueProvider = {
    interpret: () => Promise.resolve({ factId: "santa-lucia" }),
    verbalize: (_request, context) => new Promise((resolve) => {
      stoppedTurnContext = context;
      finishVerbalization = resolve;
    }),
    reset: () => Promise.resolve(),
  };
  const stoppedSession = createTestSession(project, undefined, pendingProvider);
  openAntonioConversation(stoppedSession);
  const pendingTurn = stoppedSession.submitDialogue("Were you aboard?");
  await Promise.resolve();
  stoppedSession.stop();
  await expect(pendingTurn).resolves.toEqual({
    ok: false,
    message: "Dialogue Turn was cancelled.",
  });
  expect(stoppedTurnContext?.signal.aborted).toBe(true);
  finishVerbalization("I was never aboard that ship.");
  await Promise.resolve();

  expect(stoppedSession.snapshot().testimonies).toEqual([]);
});

test("leaving a pending Conversation cancels its unique turn and ignores a late result", async () => {
  const project = coverStoryProject();
  let context: Parameters<DialogueProvider["interpret"]>[1] | undefined;
  let finishInterpretation!: (value: { readonly factId: string }) => void;
  const provider: DialogueProvider = {
    interpret: (_request, turnContext) => {
      context = turnContext;
      return new Promise((resolve) => {
        finishInterpretation = resolve;
      });
    },
    verbalize: () => Promise.resolve("I was never aboard that ship."),
    reset: () => Promise.resolve(),
  };
  const session = createTestSession(project, undefined, provider);
  openAntonioConversation(session);
  const before = session.snapshot();

  const pending = session.submitDialogue("Were you aboard?");
  await Promise.resolve();
  expect(session.conversation()).toMatchObject({ status: "pending" });
  await expect(session.submitDialogue("Tell me now.")).resolves.toEqual({
    ok: false,
    message: "The Conversation is not ready for Player speech.",
  });
  expect(context?.turnId).toMatch(/^dialogue-turn-/);

  session.input({ type: "escape" });
  expect(context?.signal.aborted).toBe(true);
  finishInterpretation({ factId: "santa-lucia" });

  await expect(pending).resolves.toEqual({
    ok: false,
    message: "Dialogue Turn was cancelled.",
  });
  session.steps();
  expect(session.conversation()).toBeNull();

  await Promise.resolve();
  session.steps();
  expect(session.snapshot()).toEqual({ ...before, activity: null, tick: before.tick + 2 });
});

test("Save cancels a pending Dialogue Turn without persisting provider-owned data", async () => {
  const project = coverStoryProject();
  const provider = new FakeDialogueProvider({
    interpretations: {
      "Were you aboard?": {
        outcome: "pending",
        value: "santa-lucia",
        ignoreCancellation: true,
      },
    },
    verbalizations: { denial: "I was never aboard that ship." },
  });
  const session = createTestSession(project, undefined, provider);
  openAntonioConversation(session);
  const pending = session.submitDialogue("Were you aboard?");
  await Promise.resolve();
  const [turnId] = provider.pendingTurnIds();

  const snapshot = session.createSaveSnapshot();

  await expect(pending).resolves.toEqual({
    ok: false,
    message: "Dialogue Turn was cancelled.",
  });
  expect(session.conversation()).toMatchObject({ status: "ready" });
  expect(snapshot.state.activity).toEqual({ type: "conversation", character: "antonio" });
  expect(JSON.stringify(snapshot)).not.toContain("Were you aboard?");
  expect(JSON.stringify(snapshot)).not.toContain(turnId);
  expect(JSON.stringify(snapshot)).not.toMatch(/transcript|summary|thread|provider|model|token/i);

  expect(turnId && provider.release(turnId)).toBe(true);
  await Promise.resolve();
  session.steps();
  expect(session.snapshot().testimonies).toEqual([]);
});

test("Save discards a completed Dialogue Turn before its logical commit", async () => {
  const project = coverStoryProject();
  const provider = new FakeDialogueProvider({
    interpretations: { "Were you aboard?": "santa-lucia" },
    verbalizations: { denial: "I was never aboard that ship." },
  });
  const session = createTestSession(project, undefined, provider);
  openAntonioConversation(session);

  await expect(session.submitDialogue("Were you aboard?")).resolves.toEqual({ ok: true });
  const snapshot = session.createSaveSnapshot();
  session.steps();

  expect(snapshot.state.testimonies).toEqual([]);
  expect(session.snapshot().testimonies).toEqual([]);
  expect(session.hud().narrative).toBeNull();
  expect(session.conversation()).toMatchObject({ status: "ready" });
});

test("Leave and stop discard a completed Dialogue Turn before its logical commit", async () => {
  for (const lifecycle of ["leave", "stop"] as const) {
    const project = coverStoryProject();
    const provider = new FakeDialogueProvider({
      interpretations: { "Were you aboard?": "santa-lucia" },
      verbalizations: { denial: "I was never aboard that ship." },
    });
    const session = createTestSession(project, undefined, provider);
    openAntonioConversation(session);
    await expect(session.submitDialogue("Were you aboard?")).resolves.toEqual({ ok: true });

    if (lifecycle === "leave") {
      session.input({ type: "escape" });
      session.steps();
      expect(session.conversation()).toBeNull();
    } else {
      session.stop();
      expect(session.lifecycle()).toBe("stopped");
    }

    expect(session.snapshot().testimonies).toEqual([]);
    expect(session.hud().narrative).toBeNull();
  }
});

test("failed Dialogue Turn phases leave Game State unchanged and allow a retry", async () => {
  const provider: DialogueProvider = {
    interpret: ({ playerInput }) => {
      if (playerInput === "timeout") {
        return Promise.reject(new Error("Dialogue Provider timed out."));
      }
      if (playerInput === "invalid") {
        return Promise.resolve({ factId: 42 } as never);
      }
      return Promise.resolve({ factId: "harbour-chain-cut" });
    },
    verbalize: ({ playerInput }) => Promise.resolve(
      playerInput === "empty" ? "   " : "I saw the harbour chain being cut.",
    ),
    reset: () => Promise.resolve(),
  };
  const base = knowledgeProject();
  const session = createTestSession({
    ...base,
    characters: {
      ...base.characters,
      antonio: {
        ...base.characters!.antonio!,
        noun: {
          labels: [{ text: "Antonio" }],
          preferredVerbs: [{ verb: "talk-to" }],
          cases: [{ verb: "talk-to", response: { text: "Authored fallback." } }],
        },
      },
    },
    scenes: {
      opening: {
        ...base.scenes.opening!,
        hotspots: [{
          target: { kind: "character", character: "antonio" },
          area: square,
          approach: { groundPoint: { x: 10, y: 10 }, facing: "front" },
        }],
      },
    },
  }, undefined, provider);
  openAntonioConversation(session);
  const before = session.snapshot();

  for (const [input, message] of [
    ["timeout", "Dialogue Provider timed out."],
    ["invalid", "Dialogue Provider selected an unknown Narrative Fact."],
    ["empty", "Dialogue Provider returned an empty Line."],
  ] as const) {
    await expect(session.submitDialogue(input)).resolves.toEqual({ ok: false, message });
    expect(session.snapshot()).toEqual(before);
    expect(session.conversation()).toMatchObject({ status: "error", error: message });
  }

  await expect(session.submitDialogue("retry")).resolves.toEqual({ ok: true });
  expect(session.snapshot()).toEqual(before);
  session.steps();
  expect(session.snapshot().characterKnowledge.player).toEqual(["harbour-chain-cut"]);
  expect(session.hud().narrative).toMatchObject({
    kind: "line",
    speaker: "player",
    text: "retry",
  });
});

test("Save Snapshot rejects malformed, duplicate or unknown Testimony", () => {
  const project = coverStoryProject();
  const snapshot = createTestSession(
    project,
    undefined,
    new FakeDialogueProvider({ interpretations: {}, verbalizations: {} }),
  ).createSaveSnapshot();
  const remembered = { speaker: "antonio", listener: "player", claimId: "denial" };
  const variants = [
    [remembered, remembered],
    [{ ...remembered, speaker: "missing" }],
    [{ ...remembered, listener: "missing" }],
    [{ ...remembered, claimId: "missing" }],
    [{ ...remembered, speaker: "player" }],
    [{ ...remembered, generatedWording: "This must not be saved." }],
  ];

  for (const testimonies of variants) {
    expect(validateTestSaveSnapshot(project, {
      ...snapshot,
      state: { ...snapshot.state, testimonies },
    }).ok).toBe(false);
  }
});

test("Talk To preserves authored dialogue for a Character without a Dialogue Profile", () => {
  const base = knowledgeProject();
  const project = {
    ...base,
    scenes: {
      opening: {
        ...base.scenes.opening!,
        hotspots: [{
          target: { kind: "character", character: "bystander" },
          area: square,
          approach: { groundPoint: { x: 10, y: 10 }, facing: "front" },
        }],
      },
    },
    characters: {
      ...base.characters,
      bystander: {
        ...base.characters!.bystander!,
        noun: {
          labels: [{ text: "Bystander" }],
          preferredVerbs: [{ verb: "talk-to" }],
          cases: [{
            verb: "talk-to",
            line: { character: "bystander", text: "An authored answer." },
          }],
        },
      },
    },
  } satisfies GameProject;
  const session = createTestSession(project);

  session.input({ type: "select-verb", verb: "talk-to" });
  session.input({ type: "activate-hotspot", hotspot: 0 });
  session.steps(2);

  expect(session.conversation()).toBeNull();
  expect(session.hud().narrative).toMatchObject({
    kind: "line",
    speaker: "bystander",
    text: "An authored answer.",
  });
});
