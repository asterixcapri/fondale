import { expect, test } from "@playwright/test";

import { createTestSession, validateTestSaveSnapshot } from "./support";
import {
  type CharacterDefinition,
  type CharacterKnowledgeDefinition,
  type CommandLexicon,
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
