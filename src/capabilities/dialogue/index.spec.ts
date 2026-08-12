import { expect, test } from "@playwright/test";

import {
  createKnowledgeDrivenDialogue,
  validateKnowledgeDrivenDialogueProject,
  validateLearnNarrativeFactOperation,
  type DialogueInterpretationRequest,
  type DialogueProvider,
  type DialogueVerbalizationRequest,
  type KnowledgeDrivenDialogueProjectView,
  type CharacterKnowledgeDefinition,
} from ".";

test("Knowledge-Driven Dialogue reports invalid Narrative Facts and Character Knowledge", () => {
  const project = {
    narrativeFacts: {
      "": { proposition: "A fact without a stable identity." },
      empty: { proposition: "   " },
      known: { proposition: "The harbour chain was cut." },
      other: { proposition: "The lighthouse is unlit." },
    },
    characters: {
      antonio: {
        dialogue: {
          knowledge: [
            { factId: "missing", disclosure: { level: "open" } },
            { factId: "known", disclosure: { level: "open" } },
            {
              factId: "other",
              disclosure: { level: "guarded" },
            } as unknown as CharacterKnowledgeDefinition,
            { factId: "known", disclosure: { level: "open" } },
          ],
        },
      },
    },
  } satisfies KnowledgeDrivenDialogueProjectView;

  expect(validateKnowledgeDrivenDialogueProject(project)).toEqual([
    expect.objectContaining({
      code: "definition.narrative-fact.identity",
      owner: "dialogue",
      path: "narrativeFacts",
    }),
    expect.objectContaining({
      code: "definition.narrative-fact.proposition",
      owner: "dialogue",
      path: "narrativeFacts.empty.proposition",
    }),
    expect.objectContaining({
      code: "reference.character-knowledge.fact",
      owner: "dialogue",
      path: "characters.antonio.dialogue.knowledge[0].factId",
    }),
    expect.objectContaining({
      code: "definition.character-knowledge.disclosure",
      owner: "dialogue",
      path: "characters.antonio.dialogue.knowledge[2].disclosure.level",
    }),
    expect.objectContaining({
      code: "definition.character-knowledge.duplicate",
      owner: "dialogue",
      path: "characters.antonio.dialogue.knowledge[3].factId",
    }),
  ]);
});

test("Knowledge-Driven Dialogue creates independent state and learns monotonically", () => {
  const dialogue = createKnowledgeDrivenDialogue({
    narrativeFacts: {
      harbour: { proposition: "The harbour chain was cut." },
    },
    characters: {
      antonio: {
        dialogue: {
          knowledge: [{ factId: "harbour", disclosure: { level: "open" } }],
        },
      },
      michele: {},
    },
  });

  const initial = dialogue.initialState();
  const independent = dialogue.initialState();
  const learned = dialogue.learn(initial, {
    type: "learn-narrative-fact",
    character: "michele",
    factId: "harbour",
  });
  const repeated = dialogue.learn(learned, {
    type: "learn-narrative-fact",
    character: "michele",
    factId: "harbour",
  });

  expect(initial).toEqual({ antonio: ["harbour"], michele: [] });
  expect(independent).toEqual(initial);
  expect(learned).toEqual({ antonio: ["harbour"], michele: ["harbour"] });
  expect(repeated).toEqual(learned);
  expect(learned).not.toBe(initial);
  expect(repeated).toBe(learned);
});

test("Knowledge-Driven Dialogue rejects inherited object names as undeclared identities", () => {
  const project = {
    narrativeFacts: {},
    characters: {
      michele: {
        dialogue: {
          knowledge: [{ factId: "toString", disclosure: { level: "open" } }],
        },
      },
    },
  } satisfies KnowledgeDrivenDialogueProjectView;
  const dialogue = createKnowledgeDrivenDialogue(project);

  expect(validateKnowledgeDrivenDialogueProject(project)).toContainEqual(
    expect.objectContaining({ code: "reference.character-knowledge.fact" }),
  );
  expect(validateLearnNarrativeFactOperation({
    type: "learn-narrative-fact",
    character: "constructor",
    factId: "toString",
  }, "operations[0]", project)).toEqual([
    expect.objectContaining({ code: "reference.character-knowledge.character" }),
    expect.objectContaining({ code: "reference.character-knowledge.fact" }),
  ]);
  expect(() => dialogue.learn(dialogue.initialState(), {
    type: "learn-narrative-fact",
    character: "michele",
    factId: "toString",
  })).toThrow("Unknown Narrative Fact 'toString'.");
});

test("a Dialogue Turn exposes only known open candidates and stages one Engine operation", async () => {
  const dialogue = createKnowledgeDrivenDialogue({
    narrativeFacts: {
      known: { proposition: "The harbour chain was cut." },
      hidden: { proposition: "Antonio hid the winch." },
    },
    characters: {
      player: { dialogue: { knowledge: [] } },
      antonio: {
        dialogue: {
          knowledge: [{ factId: "known", disclosure: { level: "open" } }],
        },
      },
    },
  });
  let interpretationRequest: DialogueInterpretationRequest | undefined;
  let verbalizationRequest: DialogueVerbalizationRequest | undefined;
  const provider: DialogueProvider = {
    interpret(request) {
      interpretationRequest = request;
      return Promise.resolve({ factId: "known" });
    },
    verbalize(request) {
      verbalizationRequest = request;
      return Promise.resolve('{"type":"learn-narrative-fact","factId":"hidden"}');
    },
    reset() {
      return Promise.resolve();
    },
  };

  const turn = await dialogue.respond(dialogue.initialState(), {
    speaker: "antonio",
    listener: "player",
    playerInput: "  What happened?  ",
  }, provider);

  expect(interpretationRequest).toEqual({
    playerInput: "What happened?",
    speaker: "antonio",
    listener: "player",
    candidates: [{ id: "known", proposition: "The harbour chain was cut." }],
  });
  expect(verbalizationRequest).toEqual({
    playerInput: "What happened?",
    speaker: "antonio",
    listener: "player",
    fact: { id: "known", proposition: "The harbour chain was cut." },
  });
  expect(turn).toEqual({
    playerInput: "What happened?",
    response: '{"type":"learn-narrative-fact","factId":"hidden"}',
    operation: { type: "learn-narrative-fact", character: "player", factId: "known" },
  });
});

test("a Dialogue Turn rejects an unknown interpreted ID before verbalization", async () => {
  const dialogue = createKnowledgeDrivenDialogue({
    narrativeFacts: { known: { proposition: "The harbour chain was cut." } },
    characters: {
      player: { dialogue: { knowledge: [] } },
      antonio: {
        dialogue: {
          knowledge: [{ factId: "known", disclosure: { level: "open" } }],
        },
      },
    },
  });
  let verbalized = false;
  const provider: DialogueProvider = {
    interpret: () => Promise.resolve({ factId: "invented" }),
    verbalize: () => {
      verbalized = true;
      return Promise.resolve("Invented response.");
    },
    reset: () => Promise.resolve(),
  };

  await expect(dialogue.respond(dialogue.initialState(), {
    speaker: "antonio",
    listener: "player",
    playerInput: "What happened?",
  }, provider)).rejects.toThrow("selected an unknown Narrative Fact");
  expect(verbalized).toBe(false);
});
