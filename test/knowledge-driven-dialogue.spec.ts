import { expect, test } from "@playwright/test";

import { createTestSession, validateTestSaveSnapshot } from "./support";
import {
  type CharacterDefinition,
  type CharacterKnowledgeDefinition,
  type CommandLexicon,
  type DialogueProvider,
  FakeDialogueProvider,
  type FakeDialoguePendingOutcome,
  type GameOperation,
  type GameProject,
  type NounDefinition,
  type SceneDefinition,
  type SequenceDefinition,
} from "../src/index";
import { compileGameProject } from "../src/capabilities/game-project";

const unusedReflection = () => Promise.reject(new Error("Reflection is not used by this test."));

const square = [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 100 },
  { x: 0, y: 100 },
];

const appearance = {
  animations: {
    idle: { sheets: { left: { image: "idle.png", frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, right: { image: "idle.png", frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, front: { image: "idle.png", frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, back: { image: "idle.png", frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) } }, timing: { framesPerSecond: 1, loop: true } },
  },
  roles: { default: "idle", walking: "idle" },
};

const objectAppearance = {
  animations: {
    idle: { sheet: { image: "idle.png", frames: [{ x: 0, y: 0, width: 1, height: 1 }] }, timing: { framesPerSecond: 1, loop: true } },
  },
  roles: { default: "idle" },
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
    narrativeContext: "A historical mystery in the harbour of Capri in 1535.",
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
    narrativeContext: "A historical mystery in the harbour of Capri in 1535.",
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
        appearances: { normal: objectAppearance },
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

function conversationCaseProject(
  after: "close" | "resume",
  caseReady = true,
): GameProject {
  const base = coverStoryProject();
  return {
    ...base,
    variables: { ...base.variables, caseReady },
    sequences: {
      exactAccount: {
        steps: [{
          type: "line",
          character: "antonio",
          text: "This exact account is authored.",
        }],
      } satisfies SequenceDefinition,
    },
    characters: {
      ...base.characters,
      antonio: {
        ...base.characters!.antonio!,
        dialogue: {
          ...base.characters!.antonio!.dialogue!,
          cases: [{
            when: { variable: "caseReady", equals: true },
            sequence: "exactAccount",
            after,
          }],
        },
      },
    },
  } satisfies GameProject;
}

function authoredAlternativesProject(): GameProject {
  const base = coverStoryProject();
  const antonio = base.characters!.antonio!;
  return {
    ...base,
    variables: { ...base.variables, winchFound: false },
    characters: {
      ...base.characters,
      antonio: {
        ...antonio,
        dialogue: {
          ...antonio.dialogue!,
          knowledge: [
            ...antonio.dialogue!.knowledge,
            { factId: "harbour-chain-cut", disclosure: { level: "open" } },
          ],
          alternatives: [
            {
              text: "Who cut the harbour chain?",
              response: "I never saw who cut it.",
            },
            {
              text: "Where is the winch handle?",
              when: { variable: "winchFound", equals: true },
              response: "Behind the customs house.",
            },
            {
              text: "[wait without speaking]",
              spoken: false,
              response: "You are patient, I will give you that.",
              operations: [{ type: "set-variable", variable: "winchFound", value: true }],
            },
          ],
        },
      },
    },
  } satisfies GameProject;
}

function alternativeSequenceProject(after: "close" | "resume" = "resume"): GameProject {
  const base = authoredAlternativesProject();
  const antonio = base.characters!.antonio!;
  return {
    ...base,
    sequences: {
      winchAccount: {
        steps: [
          { type: "line", character: "antonio", text: "This exact account is authored." },
          {
            type: "operations",
            operations: [{ type: "set-variable", variable: "winchFound", value: true }],
          },
        ],
      } satisfies SequenceDefinition,
    },
    characters: {
      ...base.characters,
      antonio: {
        ...antonio,
        dialogue: {
          ...antonio.dialogue!,
          alternatives: [
            {
              text: "Tell me about that night.",
              sequence: "winchAccount",
              after,
            },
            {
              text: "Where is the winch handle?",
              when: { variable: "winchFound", equals: true },
              response: "Behind the customs house.",
            },
            {
              text: "Show me, then.",
              response: "Very well. Watch.",
              sequence: "winchAccount",
              after,
            },
          ],
        },
      },
    },
  } satisfies GameProject;
}

function alternativeAndCaseProject(): GameProject {
  const base = alternativeSequenceProject("resume");
  const antonio = base.characters!.antonio!;
  return {
    ...base,
    variables: { ...base.variables, caseReady: true },
    sequences: {
      ...base.sequences,
      directedAccount: {
        steps: [{
          type: "line",
          character: "antonio",
          text: "This directed account is authored.",
        }],
      } satisfies SequenceDefinition,
    },
    characters: {
      ...base.characters,
      antonio: {
        ...antonio,
        dialogue: {
          ...antonio.dialogue!,
          cases: [{
            when: { variable: "caseReady", equals: true },
            sequence: "directedAccount",
            after: "close",
          }],
        },
      },
    },
  } satisfies GameProject;
}

/**
 * A Game Project whose Narrative Facts declare the Game Variables their
 * learning sets: one disclosed openly, one concealed behind a Cover Story and
 * one withheld outright. A conditional Hotspot and a conditional authored
 * alternative react to the first of them.
 */
function learnedFactVariableProject(): GameProject {
  const base = coverStoryProject();
  const antonio = base.characters!.antonio!;
  return {
    ...base,
    narrativeFacts: {
      "harbour-chain-cut": {
        proposition: "The harbour chain was cut.",
        setsVariable: "chainKnown",
      },
      lighthouse: {
        proposition: "The lighthouse is unlit.",
        setsVariable: "lighthouseKnown",
      },
      "santa-lucia": {
        proposition: "Antonio was aboard the Santa Lucia.",
        setsVariable: "boardingKnown",
      },
    },
    variables: {
      ...base.variables,
      chainKnown: false,
      lighthouseKnown: false,
      boardingKnown: false,
    },
    scenes: {
      opening: {
        ...base.scenes.opening!,
        hotspots: [
          ...base.scenes.opening!.hotspots!,
          {
            target: { kind: "background" },
            area: square,
            approach: { groundPoint: { x: 10, y: 10 }, facing: "front" },
            when: { variable: "chainKnown", equals: true },
            noun: {
              labels: [{ text: "Cut chain" }],
              preferredVerbs: [{ verb: "look-at" }],
              cases: [{ verb: "look-at", response: { text: "The links are severed." } }],
            },
          },
        ],
      },
    },
    characters: {
      ...base.characters,
      antonio: {
        ...antonio,
        dialogue: {
          ...antonio.dialogue!,
          knowledge: [
            ...antonio.dialogue!.knowledge,
            { factId: "harbour-chain-cut", disclosure: { level: "open" } },
            {
              factId: "lighthouse",
              disclosure: {
                level: "secret",
                when: { variable: "confessionUnlocked", equals: true },
              },
            },
          ],
          alternatives: [
            {
              text: "What else can you tell me about the chain?",
              when: { variable: "chainKnown", equals: true },
              response: "More than I could before.",
            },
            {
              text: "[work the chain out for yourself]",
              spoken: false,
              response: "You do not need me for that.",
              operations: [{
                type: "learn-narrative-fact",
                character: "player",
                factId: "harbour-chain-cut",
              }],
            },
          ],
        },
      },
    },
  } satisfies GameProject;
}

function chainVariableProvider(): FakeDialogueProvider {
  return new FakeDialogueProvider({
    interpretations: {
      "What happened to the chain?": "harbour-chain-cut",
      "Were you aboard?": "santa-lucia",
      "Is the lighthouse lit?": "lighthouse",
    },
    verbalizations: {
      "harbour-chain-cut": "I saw the harbour chain being cut.",
      denial: "I was never aboard that ship.",
      withhold: "I have nothing to say about that.",
    },
  });
}

function consumableAlternativesProject(): GameProject {
  const base = authoredAlternativesProject();
  const antonio = base.characters!.antonio!;
  const [asked, winch, wait] = antonio.dialogue!.alternatives!;
  return {
    ...base,
    characters: {
      ...base.characters,
      antonio: {
        ...antonio,
        dialogue: {
          ...antonio.dialogue!,
          alternatives: [
            { ...asked!, once: true },
            { ...winch!, once: true },
            wait!,
            {
              text: "[forget the winch]",
              spoken: false,
              response: "As you like.",
              operations: [{ type: "set-variable", variable: "winchFound", value: false }],
            },
          ],
        },
      },
    },
  } satisfies GameProject;
}

function chainProvider(
  interpretation: string | FakeDialoguePendingOutcome<string>,
): FakeDialogueProvider {
  return new FakeDialogueProvider({
    interpretations: { "What happened to the chain?": interpretation },
    verbalizations: { "harbour-chain-cut": "I saw the harbour chain being cut." },
  });
}

function advanceConversationLine(session: ReturnType<typeof createTestSession>): void {
  session.input({ type: "advance-conversation-line" });
  session.steps();
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

test("Reflection presents a non-canonical Player Character Line in its own activity", async () => {
  const project = knowledgeProject();
  const provider = new FakeDialogueProvider({
    interpretations: {},
    verbalizations: {},
    reflections: {
      "What have I learned?": {
        summary: "I know the harbour chain was cut.",
        hypotheses: ["The cutter may have entered from the sea."],
        suggestions: ["Inspect the harbour gate."],
      },
    },
  });
  const session = createTestSession(project, undefined, provider);
  session.input({ type: "select-verb", verb: "look-at" });
  session.input({ type: "activate-hotspot", hotspot: 0 });
  session.steps(2);
  const canonicalBefore = session.createSaveSnapshot().state;

  expect(session.startReflection()).toBe(true);
  expect(session.snapshot().activity).toEqual({ type: "reflection" });
  expect(session.conversation()).toBeNull();
  expect(session.reflection()).toMatchObject({ status: "ready" });

  await expect(session.submitReflection("What have I learned?")).resolves.toEqual({ ok: true });
  expect(session.reflection()).toMatchObject({ status: "pending" });
  session.steps();

  expect(session.hud().narrative).toMatchObject({
    kind: "line",
    speaker: "player",
    text: "I know the harbour chain was cut. " +
      "Uncertain hypothesis: The cutter may have entered from the sea. " +
      "Possible investigation: Inspect the harbour gate.",
  });
  expect(session.snapshot().characterKnowledge).toEqual(canonicalBefore.characterKnowledge);
  expect(session.snapshot().testimonies).toEqual(canonicalBefore.testimonies);
  expect(JSON.stringify(session.createSaveSnapshot())).not.toMatch(
    /entered from the sea|Inspect the harbour gate/,
  );

  session.input({ type: "advance-reflection-line" });
  session.steps();
  expect(session.reflection()).toMatchObject({ status: "ready" });
});

test("leaving Reflection cancels a pending turn and ignores its late response", async () => {
  const project = knowledgeProject();
  const provider = new FakeDialogueProvider({
    interpretations: {},
    verbalizations: {},
    reflections: {
      "Wait for reflection.": {
        outcome: "pending",
        value: { summary: "This late reflection must stay invisible." },
        ignoreCancellation: true,
      },
    },
  });
  const session = createTestSession(project, undefined, provider);
  session.input({ type: "select-verb", verb: "look-at" });
  session.input({ type: "activate-hotspot", hotspot: 0 });
  session.steps(2);
  expect(session.startReflection()).toBe(true);
  const before = session.snapshot();

  const pending = session.submitReflection("Wait for reflection.");
  await Promise.resolve();
  const [turnId] = provider.pendingTurnIds();
  session.input({ type: "escape" });
  session.steps();

  await expect(pending).resolves.toEqual({
    ok: false,
    message: "Reflection turn was cancelled.",
  });
  expect(turnId && provider.release(turnId)).toBe(true);
  await Promise.resolve();
  session.steps();
  expect(session.snapshot()).toEqual({ ...before, activity: null, tick: before.tick + 2 });
  expect(session.hud().narrative).toBeNull();
});

test("Save validates and restores active Reflection without generated memory", () => {
  const project = knowledgeProject();
  const provider = new FakeDialogueProvider({
    interpretations: {},
    verbalizations: {},
    reflections: {},
  });
  const session = createTestSession(project, undefined, provider);
  expect(session.startReflection()).toBe(true);
  const snapshot = session.createSaveSnapshot();

  expect(snapshot.state.activity).toEqual({ type: "reflection" });
  expect(JSON.stringify(snapshot)).not.toMatch(/summary|hypothesis|suggestion|thread/i);
  const validation = validateTestSaveSnapshot(project, snapshot);
  expect(validation.ok).toBe(true);
  if (!validation.ok) return;
  expect(createTestSession(project, validation.snapshot, provider).reflection()).toMatchObject({
    status: "ready",
  });
});

test("an authored Conversation case runs a Sequence after a Dialogue Turn and resumes the Conversation", async () => {
  const project = conversationCaseProject("resume");
  const provider = new FakeDialogueProvider({
    interpretations: { "Were you aboard?": "santa-lucia" },
    verbalizations: { denial: "I was never aboard that ship." },
  });
  const session = createTestSession(project, undefined, provider);
  openAntonioConversation(session);

  await expect(session.submitDialogue("Were you aboard?")).resolves.toEqual({ ok: true });
  session.steps();
  expect(session.snapshot().testimonies).toEqual([{
    speaker: "antonio",
    listener: "player",
    claimId: "denial",
  }]);

  session.input({ type: "advance-conversation-line" });
  session.steps();
  expect(session.hud().narrative).toMatchObject({
    speaker: "antonio",
    text: "I was never aboard that ship.",
  });

  session.input({ type: "advance-conversation-line" });
  session.steps();
  expect(session.snapshot().activity).toMatchObject({
    type: "sequence",
    sequence: "exactAccount",
  });
  expect(session.hud().narrative).toMatchObject({
    speaker: "antonio",
    text: "This exact account is authored.",
  });

  session.input({ type: "advance-sequence" });
  session.steps();
  expect(session.conversation()).toMatchObject({ character: "antonio", status: "ready" });
});

test("a Conversation reads its cases from the top and falls back to the unconditional one", async () => {
  const base = conversationCaseProject("resume", false);
  const project = {
    ...base,
    sequences: {
      ...base.sequences,
      ordinaryAccount: {
        steps: [{
          type: "line",
          character: "antonio",
          text: "This ordinary account is authored.",
        }],
      } satisfies SequenceDefinition,
    },
    characters: {
      ...base.characters,
      antonio: {
        ...base.characters!.antonio!,
        dialogue: {
          ...base.characters!.antonio!.dialogue!,
          cases: [
            {
              when: { variable: "caseReady", equals: true },
              sequence: "exactAccount",
              after: "resume",
            },
            { sequence: "ordinaryAccount", after: "resume" },
          ],
        },
      },
    },
  } satisfies GameProject;
  const provider = new FakeDialogueProvider({
    interpretations: { "Were you aboard?": "santa-lucia" },
    verbalizations: { denial: "I was never aboard that ship." },
  });
  const session = createTestSession(project, undefined, provider);
  openAntonioConversation(session);
  await session.submitDialogue("Were you aboard?");
  session.steps();
  session.input({ type: "advance-conversation-line" });
  session.steps();
  session.input({ type: "advance-conversation-line" });
  session.steps();

  expect(session.snapshot().activity).toMatchObject({
    type: "sequence",
    sequence: "ordinaryAccount",
  });
});

test("an unconditional Conversation case takes over when the Player leaves", () => {
  const base = conversationCaseProject("close", false);
  const project = {
    ...base,
    characters: {
      ...base.characters,
      antonio: {
        ...base.characters!.antonio!,
        dialogue: {
          ...base.characters!.antonio!.dialogue!,
          cases: [{ sequence: "exactAccount", after: "close" }],
        },
      },
    },
  } satisfies GameProject;
  const session = createTestSession(project);
  openAntonioConversation(session);

  session.input({ type: "escape" });
  session.steps();

  expect(session.snapshot().activity).toMatchObject({
    type: "sequence",
    sequence: "exactAccount",
  });
});

test("Conversation cases reject invalid conditions, Sequence references and outcomes at startup", () => {
  const project = conversationCaseProject("resume");
  const result = compileGameProject({
    ...project,
    characters: {
      ...project.characters,
      antonio: {
        ...project.characters!.antonio!,
        dialogue: {
          ...project.characters!.antonio!.dialogue!,
          cases: [{
            when: { variable: "missing", equals: true },
            sequence: "missing",
            after: "later",
          }],
        },
      },
    },
  } as unknown as GameProject);

  expect(result).toMatchObject({
    ok: false,
    diagnostics: expect.arrayContaining([
      expect.objectContaining({
        code: "definition.dialogue.case",
        owner: "dialogue",
      }),
      expect.objectContaining({ code: "reference.variable" }),
      expect.objectContaining({ code: "reference.sequence" }),
    ]),
  });
});

test("authored alternatives reject unknown condition and operation references at startup", () => {
  const project = authoredAlternativesProject();
  const result = compileGameProject({
    ...project,
    characters: {
      ...project.characters,
      antonio: {
        ...project.characters!.antonio!,
        dialogue: {
          ...project.characters!.antonio!.dialogue!,
          alternatives: [{
            text: "Where is the winch handle?",
            when: { variable: "missing", equals: true },
            response: "Behind the customs house.",
            operations: [{ type: "set-variable", variable: "missing", value: true }],
          }],
        },
      },
    },
  } as unknown as GameProject);

  expect(result).toMatchObject({
    ok: false,
    diagnostics: expect.arrayContaining([
      expect.objectContaining({
        code: "reference.variable",
        path: "characters.antonio.dialogue.alternatives[0].when",
      }),
      expect.objectContaining({
        code: "reference.variable",
        path: "characters.antonio.dialogue.alternatives[0].operations[0]",
      }),
    ]),
  });
});

test("a malformed Conversation case collection produces diagnostics without throwing", () => {
  const project = conversationCaseProject("resume");
  const result = compileGameProject({
    ...project,
    characters: {
      ...project.characters,
      antonio: {
        ...project.characters!.antonio!,
        dialogue: {
          ...project.characters!.antonio!.dialogue!,
          cases: {},
        },
      },
    },
  } as unknown as GameProject);

  expect(result).toMatchObject({
    ok: false,
    diagnostics: [expect.objectContaining({
      code: "definition.dialogue.cases",
      owner: "dialogue",
    })],
  });
});

test("an authored Conversation case can close the Conversation after its Sequence", async () => {
  const project = conversationCaseProject("close");
  const provider = new FakeDialogueProvider({
    interpretations: { "Were you aboard?": "santa-lucia" },
    verbalizations: { denial: "I was never aboard that ship." },
  });
  const session = createTestSession(project, undefined, provider);
  openAntonioConversation(session);
  await session.submitDialogue("Were you aboard?");
  session.steps();

  for (const input of [
    { type: "advance-conversation-line" as const },
    { type: "advance-conversation-line" as const },
    { type: "advance-sequence" as const },
  ]) {
    session.input(input);
    session.steps();
  }

  expect(session.snapshot().activity).toBeNull();
  expect(session.conversation()).toBeNull();
});

test("a Conversation closes normally when no authored case is eligible", async () => {
  const project = conversationCaseProject("resume", false);
  const provider = new FakeDialogueProvider({
    interpretations: { "Were you aboard?": "santa-lucia" },
    verbalizations: { denial: "I was never aboard that ship." },
  });
  const session = createTestSession(project, undefined, provider);
  openAntonioConversation(session);
  await session.submitDialogue("Were you aboard?");
  session.steps();
  session.input({ type: "advance-conversation-line" });
  session.steps();
  session.input({ type: "advance-conversation-line" });
  session.steps();

  expect(session.conversation()).toMatchObject({ status: "ready" });
  session.input({ type: "escape" });
  session.steps();
  expect(session.snapshot().activity).toBeNull();
});

test("leaving for an authored Sequence cancels a pending Dialogue Turn before takeover", async () => {
  const project = conversationCaseProject("resume");
  const provider = new FakeDialogueProvider({
    interpretations: {
      "Wait for me.": {
        outcome: "pending",
        value: "santa-lucia",
        ignoreCancellation: true,
      },
    },
    verbalizations: { denial: "I was never aboard that ship." },
  });
  const session = createTestSession(project, undefined, provider);
  openAntonioConversation(session);
  const pending = session.submitDialogue("Wait for me.");
  await Promise.resolve();
  const [turnId] = provider.pendingTurnIds();

  session.input({ type: "escape" });
  session.steps();

  await expect(pending).resolves.toEqual({
    ok: false,
    message: "Dialogue Turn was cancelled.",
  });
  expect(session.snapshot().activity).toMatchObject({
    type: "sequence",
    sequence: "exactAccount",
  });
  expect(turnId && provider.release(turnId)).toBe(true);
  await Promise.resolve();
  session.steps();
  expect(session.snapshot().testimonies).toEqual([]);
});

test("Save restores an authored Conversation continuation without provider memory", async () => {
  const project = conversationCaseProject("resume");
  const provider = new FakeDialogueProvider({
    interpretations: { "Were you aboard?": "santa-lucia" },
    verbalizations: { denial: "I was never aboard that ship." },
  });
  const session = createTestSession(project, undefined, provider);
  openAntonioConversation(session);
  await session.submitDialogue("Were you aboard?");
  session.steps();
  session.input({ type: "advance-conversation-line" });
  session.steps();
  session.input({ type: "advance-conversation-line" });
  session.steps();

  const raw = JSON.parse(JSON.stringify(session.createSaveSnapshot())) as unknown;
  const validation = validateTestSaveSnapshot(project, raw);
  expect(validation.ok).toBe(true);
  if (!validation.ok) return;
  const restored = createTestSession(project, validation.snapshot, provider);
  restored.input({ type: "advance-sequence" });
  restored.steps();

  expect(restored.conversation()).toMatchObject({ character: "antonio", status: "ready" });
});

test("Save rejects a forged Conversation continuation without an authored resuming Conversation case", async () => {
  const project = conversationCaseProject("resume");
  const provider = new FakeDialogueProvider({
    interpretations: { "Were you aboard?": "santa-lucia" },
    verbalizations: { denial: "I was never aboard that ship." },
  });
  const session = createTestSession(project, undefined, provider);
  openAntonioConversation(session);
  await session.submitDialogue("Were you aboard?");
  session.steps();
  session.input({ type: "advance-conversation-line" });
  session.steps();
  session.input({ type: "advance-conversation-line" });
  session.steps();
  const snapshot = session.createSaveSnapshot();

  const validation = validateTestSaveSnapshot(project, {
    ...snapshot,
    state: {
      ...snapshot.state,
      conversationContinuation: { type: "conversation", character: "player" },
    },
  });

  expect(validation.ok).toBe(false);
});

test("skipping the Sequence of a Conversation case applies its outcome before resuming", async () => {
  const base = conversationCaseProject("resume");
  const project = {
    ...base,
    sequences: {
      exactAccount: {
        ...base.sequences!.exactAccount!,
        skippable: true,
        skipOutcome: [{
          type: "set-variable",
          variable: "confessionUnlocked",
          value: true,
        }],
      },
    },
  } satisfies GameProject;
  const session = createTestSession(project, undefined, new FakeDialogueProvider({
    interpretations: {},
    verbalizations: {},
  }));
  openAntonioConversation(session);
  session.input({ type: "escape" });
  session.steps();

  session.input({ type: "skip-sequence" });
  session.steps();

  expect(session.snapshot().variables.confessionUnlocked).toBe(true);
  expect(session.conversation()).toMatchObject({ character: "antonio", status: "ready" });
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
    reflect: unusedReflection,
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
    reflect: unusedReflection,
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
    reflect: unusedReflection,
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
    reflect: unusedReflection,
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

test("a Conversation presents eligible authored alternatives and answers one without a provider", () => {
  const project = authoredAlternativesProject();
  const provider = new FakeDialogueProvider({ interpretations: {}, verbalizations: {} });
  const session = createTestSession(project, undefined, provider);

  openAntonioConversation(session);

  expect(session.conversation()).toMatchObject({
    character: "antonio",
    status: "ready",
    alternatives: [
      { index: 0, text: "Who cut the harbour chain?" },
      { index: 2, text: "[wait without speaking]" },
    ],
  });

  session.input({ type: "select-alternative", alternative: 0 });
  session.steps();

  expect(session.conversation()).toMatchObject({ status: "line" });
  expect(session.hud().narrative).toMatchObject({
    kind: "line",
    speaker: "player",
    text: "Who cut the harbour chain?",
  });

  advanceConversationLine(session);
  expect(session.hud().narrative).toMatchObject({
    kind: "line",
    speaker: "antonio",
    text: "I never saw who cut it.",
  });

  advanceConversationLine(session);
  expect(session.conversation()).toMatchObject({ status: "ready" });
  expect(provider.threadKeys()).toEqual([]);
  expect(session.snapshot().characterKnowledge.player).toEqual([]);
});

test("an unspoken authored alternative commits its Game Operations atomically", () => {
  const project = authoredAlternativesProject();
  const session = createTestSession(project);

  openAntonioConversation(session);
  session.input({ type: "select-alternative", alternative: 2 });
  session.steps();

  expect(session.snapshot().variables.winchFound).toBe(true);
  expect(session.hud().narrative).toMatchObject({
    kind: "line",
    speaker: "antonio",
    text: "You are patient, I will give you that.",
  });

  advanceConversationLine(session);
  expect(session.conversation()).toMatchObject({
    status: "ready",
    alternatives: [
      { index: 0, text: "Who cut the harbour chain?" },
      { index: 1, text: "Where is the winch handle?" },
      { index: 2, text: "[wait without speaking]" },
    ],
  });
  expect(session.lifecycle()).toBe("running");
});

test("an ineligible authored alternative cannot be selected", () => {
  const session = createTestSession(authoredAlternativesProject());

  openAntonioConversation(session);
  session.input({ type: "select-alternative", alternative: 1 });
  session.steps();

  expect(session.conversation()).toMatchObject({ status: "ready" });
  expect(session.hud().narrative).toBeNull();
});

test("the Player alternates freely between authored alternatives and typed speech", async () => {
  const project = authoredAlternativesProject();
  const provider = chainProvider("harbour-chain-cut");
  const session = createTestSession(project, undefined, provider);

  openAntonioConversation(session);
  session.input({ type: "select-alternative", alternative: 0 });
  session.steps();
  advanceConversationLine(session);
  advanceConversationLine(session);
  expect(session.conversation()).toMatchObject({ status: "ready" });

  await expect(session.submitDialogue("What happened to the chain?")).resolves.toEqual({ ok: true });
  session.steps();
  expect(session.hud().narrative).toMatchObject({ speaker: "player", text: "What happened to the chain?" });
  advanceConversationLine(session);
  advanceConversationLine(session);
  expect(session.snapshot().characterKnowledge.player).toEqual(["harbour-chain-cut"]);

  session.input({ type: "select-alternative", alternative: 0 });
  session.steps();
  expect(session.hud().narrative).toMatchObject({
    speaker: "player",
    text: "Who cut the harbour chain?",
  });
});

test("an authored alternative is refused until a pending Dialogue Turn settles", async () => {
  const project = authoredAlternativesProject();
  const provider = chainProvider({ outcome: "pending", value: "harbour-chain-cut" });
  const session = createTestSession(project, undefined, provider);

  openAntonioConversation(session);
  const submission = session.submitDialogue("What happened to the chain?");
  expect(session.conversation()).toMatchObject({ status: "pending" });

  session.input({ type: "select-alternative", alternative: 0 });
  session.steps();

  expect(session.conversation()).toMatchObject({ status: "pending" });
  expect(session.hud().narrative).toBeNull();

  const [turnId] = provider.pendingTurnIds();
  expect(provider.release(turnId!)).toBe(true);
  await expect(submission).resolves.toEqual({ ok: true });
  session.steps();
  expect(session.hud().narrative).toMatchObject({
    speaker: "player",
    text: "What happened to the chain?",
  });

  advanceConversationLine(session);
  advanceConversationLine(session);
  session.input({ type: "select-alternative", alternative: 0 });
  session.steps();
  expect(session.hud().narrative).toMatchObject({
    speaker: "player",
    text: "Who cut the harbour chain?",
  });
});

test("an authored alternative directs a Sequence and resumes the Conversation with fresh eligibility", () => {
  const session = createTestSession(alternativeSequenceProject("resume"));

  openAntonioConversation(session);
  session.input({ type: "select-alternative", alternative: 0 });
  session.steps();

  expect(session.snapshot().activity).toMatchObject({
    type: "sequence",
    sequence: "winchAccount",
  });
  expect(session.conversation()).toBeNull();
  expect(session.hud().narrative).toMatchObject({
    speaker: "antonio",
    text: "This exact account is authored.",
  });

  session.input({ type: "advance-sequence" });
  session.steps();

  expect(session.snapshot().variables.winchFound).toBe(true);
  expect(session.conversation()).toMatchObject({
    character: "antonio",
    status: "ready",
    alternatives: [
      { index: 0, text: "Tell me about that night." },
      { index: 1, text: "Where is the winch handle?" },
      { index: 2, text: "Show me, then." },
    ],
  });
});

test("an authored alternative answers with its Line before directing its Sequence", () => {
  const session = createTestSession(alternativeSequenceProject("resume"));

  openAntonioConversation(session);
  session.input({ type: "select-alternative", alternative: 2 });
  session.steps();

  expect(session.hud().narrative).toMatchObject({ speaker: "player", text: "Show me, then." });
  expect(session.conversation()).toMatchObject({ status: "line" });

  advanceConversationLine(session);
  expect(session.hud().narrative).toMatchObject({ speaker: "antonio", text: "Very well. Watch." });
  expect(session.snapshot().activity).toMatchObject({ type: "conversation" });

  advanceConversationLine(session);
  expect(session.snapshot().activity).toMatchObject({
    type: "sequence",
    sequence: "winchAccount",
  });
  expect(session.conversation()).toBeNull();
});

test("an authored alternative can close the Conversation after its Sequence", () => {
  const session = createTestSession(alternativeSequenceProject("close"));

  openAntonioConversation(session);
  session.input({ type: "select-alternative", alternative: 0 });
  session.steps();
  session.input({ type: "advance-sequence" });
  session.steps();

  expect(session.snapshot().activity).toBeNull();
  expect(session.conversation()).toBeNull();
});

test("leaving a Conversation before its authored Sequence discards the pending direction", () => {
  const session = createTestSession(alternativeSequenceProject("resume"));

  openAntonioConversation(session);
  session.input({ type: "select-alternative", alternative: 2 });
  session.steps();
  session.input({ type: "escape" });
  session.steps();

  expect(session.snapshot().activity).toBeNull();

  openAntonioConversation(session);
  session.input({ type: "select-alternative", alternative: 0 });
  session.steps();
  session.input({ type: "advance-sequence" });
  session.steps();

  expect(session.conversation()).toMatchObject({ character: "antonio", status: "ready" });
});

test("a Sequence directed by an authored alternative ignores a cancelled turn's late result", async () => {
  const project = alternativeSequenceProject("resume");
  const provider = chainProvider({
    outcome: "pending",
    value: "harbour-chain-cut",
    ignoreCancellation: true,
  });
  const session = createTestSession(project, undefined, provider);

  openAntonioConversation(session);
  const submission = session.submitDialogue("What happened to the chain?");
  await Promise.resolve();
  const [turnId] = provider.pendingTurnIds();
  session.createSaveSnapshot();

  session.input({ type: "select-alternative", alternative: 0 });
  session.steps();
  expect(session.snapshot().activity).toMatchObject({
    type: "sequence",
    sequence: "winchAccount",
  });

  expect(turnId && provider.release(turnId)).toBe(true);
  await expect(submission).resolves.toMatchObject({ ok: false });
  session.steps();

  expect(session.snapshot().activity).toMatchObject({ type: "sequence" });
  expect(session.snapshot().characterKnowledge.player).toEqual([]);
});

test("Save validates and restores a continuation left by an authored alternative", () => {
  const project = alternativeSequenceProject("resume");
  const session = createTestSession(project);

  openAntonioConversation(session);
  session.input({ type: "select-alternative", alternative: 0 });
  session.steps();

  const raw = JSON.parse(JSON.stringify(session.createSaveSnapshot())) as unknown;
  const validation = validateTestSaveSnapshot(project, raw);
  expect(validation.ok).toBe(true);
  if (!validation.ok) return;
  const restored = createTestSession(project, validation.snapshot);
  restored.input({ type: "advance-sequence" });
  restored.steps();

  expect(restored.conversation()).toMatchObject({ character: "antonio", status: "ready" });
});

test("an authored alternative directs its own Sequence while its Character keeps a Conversation case", () => {
  const session = createTestSession(alternativeAndCaseProject());

  openAntonioConversation(session);
  session.input({ type: "select-alternative", alternative: 2 });
  session.steps();
  advanceConversationLine(session);
  advanceConversationLine(session);

  expect(session.snapshot().activity).toMatchObject({
    type: "sequence",
    sequence: "winchAccount",
  });
  session.input({ type: "advance-sequence" });
  session.steps();
  expect(session.conversation()).toMatchObject({ character: "antonio", status: "ready" });

  session.input({ type: "escape" });
  session.steps();
  expect(session.snapshot().activity).toMatchObject({
    type: "sequence",
    sequence: "directedAccount",
  });
});

test("Save during an alternative's Line discards its queued Sequence and keeps it selectable", () => {
  const project = alternativeSequenceProject("resume");
  const session = createTestSession(project);

  openAntonioConversation(session);
  session.input({ type: "select-alternative", alternative: 2 });
  session.steps();

  const raw = JSON.parse(JSON.stringify(session.createSaveSnapshot())) as unknown;
  const validation = validateTestSaveSnapshot(project, raw);
  expect(validation.ok).toBe(true);
  if (!validation.ok) return;
  const restored = createTestSession(project, validation.snapshot);

  expect(restored.conversation()).toMatchObject({
    character: "antonio",
    status: "ready",
    alternatives: [
      { index: 0, text: "Tell me about that night." },
      { index: 2, text: "Show me, then." },
    ],
  });

  restored.input({ type: "select-alternative", alternative: 2 });
  restored.steps();
  advanceConversationLine(restored);
  advanceConversationLine(restored);
  expect(restored.snapshot().activity).toMatchObject({
    type: "sequence",
    sequence: "winchAccount",
  });
});

test("a consumed authored alternative is withdrawn while a repeatable one stays", () => {
  const session = createTestSession(consumableAlternativesProject());

  openAntonioConversation(session);
  expect(session.conversation()).toMatchObject({
    alternatives: [
      { index: 0, text: "Who cut the harbour chain?" },
      { index: 2, text: "[wait without speaking]" },
      { index: 3, text: "[forget the winch]" },
    ],
  });

  session.input({ type: "select-alternative", alternative: 0 });
  session.steps();
  advanceConversationLine(session);
  advanceConversationLine(session);

  expect(session.snapshot().consumedAlternatives).toMatchObject({ antonio: [0] });
  expect(session.conversation()).toMatchObject({
    status: "ready",
    alternatives: [
      { index: 2, text: "[wait without speaking]" },
      { index: 3, text: "[forget the winch]" },
    ],
  });

  session.input({ type: "select-alternative", alternative: 0 });
  session.steps();
  expect(session.conversation()).toMatchObject({ status: "ready" });
  expect(session.hud().narrative).toBeNull();

  for (let repetition = 0; repetition < 2; repetition += 1) {
    session.input({ type: "select-alternative", alternative: 2 });
    session.steps();
    expect(session.hud().narrative).toMatchObject({
      speaker: "antonio",
      text: "You are patient, I will give you that.",
    });
    expect(session.snapshot().variables.winchFound).toBe(true);
    advanceConversationLine(session);
  }
  expect(session.snapshot().consumedAlternatives).toMatchObject({ antonio: [0] });
});

test("consumption and eligibility withdraw an alternative without masking each other", () => {
  const session = createTestSession(consumableAlternativesProject());

  openAntonioConversation(session);
  session.input({ type: "select-alternative", alternative: 2 });
  session.steps();
  advanceConversationLine(session);
  expect(session.conversation()).toMatchObject({
    alternatives: [
      { index: 0, text: "Who cut the harbour chain?" },
      { index: 1, text: "Where is the winch handle?" },
      { index: 2, text: "[wait without speaking]" },
      { index: 3, text: "[forget the winch]" },
    ],
  });

  session.input({ type: "select-alternative", alternative: 1 });
  session.steps();
  advanceConversationLine(session);
  advanceConversationLine(session);
  expect(session.snapshot().consumedAlternatives).toMatchObject({ antonio: [1] });

  session.input({ type: "select-alternative", alternative: 3 });
  session.steps();
  advanceConversationLine(session);
  expect(session.snapshot().variables.winchFound).toBe(false);

  session.input({ type: "select-alternative", alternative: 2 });
  session.steps();
  advanceConversationLine(session);
  expect(session.snapshot().variables.winchFound).toBe(true);
  expect(session.conversation()).toMatchObject({
    alternatives: [
      { index: 0, text: "Who cut the harbour chain?" },
      { index: 2, text: "[wait without speaking]" },
      { index: 3, text: "[forget the winch]" },
    ],
  });
});

test("Save validates and exactly restores which alternatives were consumed", () => {
  const project = consumableAlternativesProject();
  const provider = chainProvider("harbour-chain-cut");
  const session = createTestSession(project, undefined, provider);

  openAntonioConversation(session);
  session.input({ type: "select-alternative", alternative: 0 });
  session.steps();
  advanceConversationLine(session);
  advanceConversationLine(session);

  const raw = JSON.parse(JSON.stringify(session.createSaveSnapshot())) as unknown;
  const validation = validateTestSaveSnapshot(project, raw);
  expect(validation.ok).toBe(true);
  if (!validation.ok) return;
  expect(validation.snapshot.state.consumedAlternatives).toEqual({
    player: [],
    antonio: [0],
    bystander: [],
  });

  const restored = createTestSession(project, validation.snapshot, provider);
  expect(restored.snapshot().consumedAlternatives).toEqual({
    player: [],
    antonio: [0],
    bystander: [],
  });
  expect(restored.conversation()).toMatchObject({
    character: "antonio",
    status: "ready",
    alternatives: [
      { index: 2, text: "[wait without speaking]" },
      { index: 3, text: "[forget the winch]" },
    ],
  });
});

test("Save Snapshot rejects consumption naming an unknown Character or alternative", () => {
  const project = consumableAlternativesProject();
  const session = createTestSession(project);
  openAntonioConversation(session);
  const snapshot = session.createSaveSnapshot();

  const forgeries = [
    { ...snapshot.state.consumedAlternatives, ghost: [] },
    { ...snapshot.state.consumedAlternatives, antonio: [4] },
    { ...snapshot.state.consumedAlternatives, antonio: [-1] },
    { ...snapshot.state.consumedAlternatives, antonio: [0, 0] },
    { ...snapshot.state.consumedAlternatives, antonio: ["0"] },
    { ...snapshot.state.consumedAlternatives, player: [0] },
  ];

  for (const consumedAlternatives of forgeries) {
    expect(validateTestSaveSnapshot(project, {
      ...snapshot,
      state: { ...snapshot.state, consumedAlternatives },
    }).ok).toBe(false);
  }
});

test("an alternative directing a Sequence is consumed when the Player selects it", () => {
  const base = alternativeSequenceProject("resume");
  const antonio = base.characters!.antonio!;
  const [directed, ...rest] = antonio.dialogue!.alternatives!;
  const project = {
    ...base,
    characters: {
      ...base.characters,
      antonio: {
        ...antonio,
        dialogue: {
          ...antonio.dialogue!,
          alternatives: [{ ...directed!, once: true }, ...rest],
        },
      },
    },
  } satisfies GameProject;
  const session = createTestSession(project);

  openAntonioConversation(session);
  session.input({ type: "select-alternative", alternative: 0 });
  session.steps();

  expect(session.snapshot().consumedAlternatives).toMatchObject({ antonio: [0] });
  session.input({ type: "advance-sequence" });
  session.steps();

  expect(session.conversation()).toMatchObject({
    character: "antonio",
    status: "ready",
    alternatives: [
      { index: 1, text: "Where is the winch handle?" },
      { index: 2, text: "Show me, then." },
    ],
  });
});

test("an authored alternative naming an unknown or malformed Sequence is rejected at startup", () => {
  const project = alternativeSequenceProject("resume");
  const result = compileGameProject({
    ...project,
    characters: {
      ...project.characters,
      antonio: {
        ...project.characters!.antonio!,
        dialogue: {
          ...project.characters!.antonio!.dialogue!,
          alternatives: [{
            text: "Tell me about that night.",
            sequence: "missing",
            after: "resume",
          }, {
            text: "Say nothing at all.",
          }, {
            text: "Show me, then.",
            sequence: "winchAccount",
            after: "later",
          }],
        },
      },
    },
  } as unknown as GameProject);

  expect(result).toMatchObject({
    ok: false,
    diagnostics: expect.arrayContaining([
      expect.objectContaining({
        code: "reference.sequence",
        path: "characters.antonio.dialogue.alternatives[0].sequence",
      }),
      expect.objectContaining({
        code: "definition.conversation-alternative.item",
        path: "characters.antonio.dialogue.alternatives[1]",
      }),
      expect.objectContaining({
        code: "definition.conversation-alternative.item",
        path: "characters.antonio.dialogue.alternatives[2]",
      }),
    ]),
  });
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

test("a disclosed Narrative Fact learned by typing sets its Game Variable in the same commit", async () => {
  const project = learnedFactVariableProject();
  const session = createTestSession(project, undefined, chainVariableProvider());
  openAntonioConversation(session);

  expect(session.conversation()!.alternatives).toEqual([
    { index: 1, text: "[work the chain out for yourself]" },
  ]);
  expect(session.hud().nouns.some(({ target }) =>
    target.kind === "hotspot" && target.index === 1
  )).toBe(false);

  await expect(session.submitDialogue("What happened to the chain?")).resolves.toEqual({ ok: true });
  expect(session.snapshot().variables.chainKnown).toBe(false);
  expect(session.snapshot().characterKnowledge.player).toEqual([]);

  session.steps();
  expect(session.snapshot().characterKnowledge.player).toEqual(["harbour-chain-cut"]);
  expect(session.snapshot().variables.chainKnown).toBe(true);
  expect(session.conversation()!.alternatives).toEqual([
    { index: 0, text: "What else can you tell me about the chain?" },
    { index: 1, text: "[work the chain out for yourself]" },
  ]);
  expect(session.hud().nouns.some(({ target }) =>
    target.kind === "hotspot" && target.index === 1
  )).toBe(true);

  advanceConversationLine(session);
  advanceConversationLine(session);
  await expect(session.submitDialogue("What happened to the chain?")).resolves.toEqual({ ok: true });
  session.steps();
  expect(session.snapshot().characterKnowledge.player).toEqual(["harbour-chain-cut"]);
  expect(session.snapshot().variables.chainKnown).toBe(true);

  const validation = validateTestSaveSnapshot(
    project,
    JSON.parse(JSON.stringify(session.createSaveSnapshot())) as unknown,
  );
  expect(validation.ok).toBe(true);
  if (!validation.ok) return;
  const restored = createTestSession(project, validation.snapshot, chainVariableProvider());
  expect(restored.snapshot()).toEqual(session.snapshot());
  expect(restored.snapshot().variables.chainKnown).toBe(true);
});

test("a Cover Story or a withheld Fact leaves the declared Game Variable untouched", async () => {
  const session = createTestSession(
    learnedFactVariableProject(),
    undefined,
    chainVariableProvider(),
  );
  openAntonioConversation(session);

  await expect(session.submitDialogue("Were you aboard?")).resolves.toEqual({ ok: true });
  session.steps();
  expect(session.snapshot().testimonies).toEqual([
    { speaker: "antonio", listener: "player", claimId: "denial" },
  ]);
  expect(session.snapshot().variables.boardingKnown).toBe(false);
  expect(session.snapshot().characterKnowledge.player).toEqual([]);

  advanceConversationLine(session);
  advanceConversationLine(session);
  await expect(session.submitDialogue("Is the lighthouse lit?")).resolves.toEqual({ ok: true });
  session.steps();
  expect(session.snapshot().variables.lighthouseKnown).toBe(false);
  expect(session.snapshot().characterKnowledge.player).toEqual([]);
});

test("a failed or cancelled Dialogue Turn commits neither the learning nor its Game Variable", async () => {
  const project = learnedFactVariableProject();
  const failedProvider: DialogueProvider = {
    interpret: () => Promise.resolve({ factId: "harbour-chain-cut" }),
    verbalize: () => Promise.reject(new Error("Provider unavailable.")),
    reflect: unusedReflection,
    reset: () => Promise.resolve(),
  };
  const failedSession = createTestSession(project, undefined, failedProvider);
  openAntonioConversation(failedSession);

  await expect(failedSession.submitDialogue("What happened to the chain?")).resolves.toEqual({
    ok: false,
    message: "Provider unavailable.",
  });
  failedSession.steps();
  expect(failedSession.snapshot().variables.chainKnown).toBe(false);
  expect(failedSession.snapshot().characterKnowledge.player).toEqual([]);

  const cancelledSession = createTestSession(
    project,
    undefined,
    chainProvider({ outcome: "pending", value: "harbour-chain-cut", ignoreCancellation: true }),
  );
  openAntonioConversation(cancelledSession);
  const pending = cancelledSession.submitDialogue("What happened to the chain?");
  await Promise.resolve();
  cancelledSession.input({ type: "escape" });
  cancelledSession.steps();

  await expect(pending).resolves.toEqual({
    ok: false,
    message: "Dialogue Turn was cancelled.",
  });
  cancelledSession.steps();
  expect(cancelledSession.snapshot().variables.chainKnown).toBe(false);
  expect(cancelledSession.snapshot().characterKnowledge.player).toEqual([]);
  expect(cancelledSession.snapshot().activity).toBeNull();
});

test("an authored path learning a Narrative Fact sets the same Game Variable", () => {
  const session = createTestSession(
    learnedFactVariableProject(),
    undefined,
    chainVariableProvider(),
  );
  openAntonioConversation(session);

  session.input({ type: "select-alternative", alternative: 1 });
  session.steps();

  expect(session.snapshot().characterKnowledge.player).toEqual(["harbour-chain-cut"]);
  expect(session.snapshot().variables.chainKnown).toBe(true);
  expect(session.conversation()!.alternatives).toEqual([
    { index: 0, text: "What else can you tell me about the chain?" },
    { index: 1, text: "[work the chain out for yourself]" },
  ]);
});
