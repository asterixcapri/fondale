import { expect, test } from "@playwright/test";

import {
  createKnowledgeDrivenDialogue,
  validateKnowledgeDrivenDialogueProject,
  validateLearnNarrativeFactOperation,
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
