import { expect, test } from "@playwright/test";

import {
  createKnowledgeDrivenDialogue,
  FakeDialogueProvider,
  validateDialogueGameOperation,
  validateKnowledgeDrivenDialogueProject,
  validateLearnNarrativeFactOperation,
  type DialogueInterpretationRequest,
  type DialogueProvider,
  type DialogueVerbalizationRequest,
  type KnowledgeDrivenDialogueProjectView,
  type CharacterKnowledgeDefinition,
} from ".";

const unusedReflection = () => Promise.reject(new Error("Reflection is not used by this test."));

function dialogueTurnLifecycleFixture() {
  return createKnowledgeDrivenDialogue({
    narrativeFacts: { chain: { proposition: "The harbour chain was cut." } },
    variables: {},
    characters: {
      player: { dialogue: { knowledge: [] } },
      antonio: {
        dialogue: {
          knowledge: [{ factId: "chain", disclosure: { level: "open" } }],
        },
      },
    },
  });
}

test("Knowledge-Driven Dialogue reports invalid Narrative Facts and Character Knowledge", () => {
  const project = {
    narrativeFacts: {
      "": { proposition: "A fact without a stable identity." },
      empty: { proposition: "   " },
      known: { proposition: "The harbour chain was cut." },
      other: { proposition: "The lighthouse is unlit." },
    },
    variables: {},
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
      path: "characters.antonio.dialogue.knowledge[2].disclosure",
    }),
    expect.objectContaining({
      code: "definition.character-knowledge.duplicate",
      owner: "dialogue",
      path: "characters.antonio.dialogue.knowledge[3].factId",
    }),
  ]);
});

test("Knowledge-Driven Dialogue reports invalid Claims and Cover Stories", () => {
  const project = {
    narrativeFacts: {
      open: { proposition: "Antonio was seen at the harbour." },
      secret: { proposition: "Antonio was aboard the Santa Lucia." },
    },
    claims: {
      "": { proposition: "A Claim without a stable identity." },
      empty: { proposition: "   " },
      malformed: null,
      denial: { proposition: "Antonio was never aboard the Santa Lucia." },
    },
    variables: { confessionUnlocked: false },
    characters: {
      antonio: {
        dialogue: {
          knowledge: [
            { factId: "open", disclosure: { level: "open" } },
            {
              factId: "secret",
              disclosure: {
                level: "secret",
                when: { variable: "confessionUnlocked", equals: true },
              },
            },
          ],
          coverStories: [
            { concealsFactId: "missing", claimId: "denial" },
            { concealsFactId: "secret", claimId: "missing" },
            { concealsFactId: "open", claimId: "denial" },
            { concealsFactId: "secret", claimId: "denial" },
            { concealsFactId: "secret", claimId: "denial" },
          ],
        },
      },
    },
  } as unknown as KnowledgeDrivenDialogueProjectView;

  expect(validateKnowledgeDrivenDialogueProject(project)).toEqual(expect.arrayContaining([
    expect.objectContaining({ code: "definition.claim.identity", path: "claims" }),
    expect.objectContaining({
      code: "definition.claim.proposition",
      path: "claims.empty.proposition",
    }),
    expect.objectContaining({
      code: "definition.claim.proposition",
      path: "claims.malformed.proposition",
    }),
    expect.objectContaining({
      code: "reference.cover-story.fact",
      path: "characters.antonio.dialogue.coverStories[0].concealsFactId",
    }),
    expect.objectContaining({
      code: "reference.cover-story.claim",
      path: "characters.antonio.dialogue.coverStories[1].claimId",
    }),
    expect.objectContaining({
      code: "definition.cover-story.disclosure",
      path: "characters.antonio.dialogue.coverStories[2].concealsFactId",
    }),
    expect.objectContaining({
      code: "definition.cover-story.duplicate",
      path: "characters.antonio.dialogue.coverStories[4].concealsFactId",
    }),
  ]));
});

test("Knowledge-Driven Dialogue rejects a Cover Story for an unknown-to-character fact", () => {
  const project = {
    narrativeFacts: {
      secret: { proposition: "Antonio was aboard the Santa Lucia." },
    },
    claims: {
      denial: { proposition: "Antonio was never aboard the Santa Lucia." },
    },
    variables: { confessionUnlocked: false },
    characters: {
      antonio: {
        dialogue: {
          knowledge: [],
          coverStories: [{ concealsFactId: "secret", claimId: "denial" }],
        },
      },
    },
  } satisfies KnowledgeDrivenDialogueProjectView;

  expect(validateKnowledgeDrivenDialogueProject(project)).toContainEqual(
    expect.objectContaining({
      code: "reference.cover-story.knowledge",
      path: "characters.antonio.dialogue.coverStories[0].concealsFactId",
    }),
  );
});

test("Knowledge-Driven Dialogue accepts guarded, secret and qualitative authoring", () => {
  const project = {
    narrativeFacts: {
      guarded: { proposition: "Antonio saw who cut the chain." },
      secret: { proposition: "Antonio cut the chain himself." },
    },
    variables: { confessionUnlocked: false },
    characters: {
      player: { dialogue: { knowledge: [] } },
      antonio: {
        dialogue: {
          biography: "A guarded former sailor.",
          personality: {
            talkativeness: "low",
            honesty: "medium",
            discretion: "high",
            suspiciousness: "high",
          },
          behavior: { withholding: "evade" },
          voice: { verbosity: "short", tone: "dry", vocabulary: "simple" },
          state: "afraid",
          knowledge: [
            { factId: "guarded", disclosure: { level: "guarded", when: { trustAtLeast: "medium" } } },
            { factId: "secret", disclosure: { level: "secret", when: { variable: "confessionUnlocked", equals: true } } },
          ],
          relationships: { player: { trust: "medium" } },
        },
      },
    },
  } as unknown as KnowledgeDrivenDialogueProjectView;

  expect(validateKnowledgeDrivenDialogueProject(project)).toEqual([]);
});

test("Knowledge-Driven Dialogue rejects incoherent Disclosure, Relationships and numeric profiles", () => {
  const project = {
    narrativeFacts: { known: { proposition: "The harbour chain was cut." } },
    variables: { declared: false },
    characters: {
      antonio: {
        dialogue: {
          knowledge: [
            { factId: "known", disclosure: { level: "guarded" } },
            { factId: "known", disclosure: { level: "secret", when: { trustAtLeast: "high" } } },
          ],
          personality: {
            talkativeness: 0.2, honesty: "medium", discretion: "high", suspiciousness: "high",
          },
          behavior: { withholding: "random" },
          voice: { verbosity: 20, tone: "dry", vocabulary: "simple" },
          state: 0.8,
          relationships: { missing: { trust: 50 } },
        },
      },
    },
  } as unknown as KnowledgeDrivenDialogueProjectView;

  expect(validateKnowledgeDrivenDialogueProject(project)).toEqual(expect.arrayContaining([
    expect.objectContaining({ code: "definition.character-knowledge.disclosure" }),
    expect.objectContaining({ code: "definition.dialogue.personality" }),
    expect.objectContaining({ code: "definition.dialogue.behavior" }),
    expect.objectContaining({ code: "definition.dialogue.voice" }),
    expect.objectContaining({ code: "definition.dialogue.state" }),
    expect.objectContaining({ code: "reference.relationship.character" }),
    expect.objectContaining({ code: "definition.relationship.trust" }),
  ]));
});

test("Knowledge-Driven Dialogue accepts authored Conversation alternatives", () => {
  const project = {
    narrativeFacts: {},
    variables: { winchFound: false },
    characters: {
      player: { dialogue: { knowledge: [] } },
      antonio: {
        dialogue: {
          knowledge: [],
          alternatives: [
            { text: "Who cut the chain?", response: "I never saw who cut it." },
            {
              text: "Where is the winch handle?",
              when: { variable: "winchFound", equals: true },
              spoken: false,
              response: "Behind the customs house.",
              operations: [{ type: "set-variable", variable: "winchFound", value: true }],
            },
          ],
        },
      },
    },
  } as unknown as KnowledgeDrivenDialogueProjectView;

  expect(validateKnowledgeDrivenDialogueProject(project)).toEqual([]);
});

test("Knowledge-Driven Dialogue rejects invalid Conversation alternatives", () => {
  const project = {
    narrativeFacts: {},
    variables: { declared: false },
    characters: {
      antonio: {
        dialogue: {
          knowledge: [],
          alternatives: [
            { text: "   ", response: "An answer without a question." },
            { text: "An unanswered question?", response: "" },
            { text: "A silent question?", response: "An answer.", spoken: "yes" },
            { text: "An unknown shape?", response: "An answer.", sequence: "elsewhere" },
            { text: "A malformed condition?", response: "An answer.", when: "winchFound" },
          ],
        },
      },
      bystander: { dialogue: { knowledge: [], alternatives: "many" } },
    },
  } as unknown as KnowledgeDrivenDialogueProjectView;

  expect(validateKnowledgeDrivenDialogueProject(project)).toEqual([
    ...[0, 1, 2, 3].map((index) => expect.objectContaining({
      code: "definition.conversation-alternative.item",
      owner: "dialogue",
      path: `characters.antonio.dialogue.alternatives[${index}]`,
    })),
    expect.objectContaining({
      code: "definition.conversation-alternative.condition",
      owner: "dialogue",
      path: "characters.antonio.dialogue.alternatives[4].when",
    }),
    expect.objectContaining({
      code: "definition.conversation-alternative.collection",
      owner: "dialogue",
      path: "characters.bystander.dialogue.alternatives",
    }),
  ]);
});

function consumableAlternativesProject(): KnowledgeDrivenDialogueProjectView {
  return {
    narrativeFacts: {},
    variables: {},
    characters: {
      antonio: {
        dialogue: {
          knowledge: [],
          alternatives: [
            { text: "Asked once?", response: "Once answered.", once: true },
            { text: "Asked how often?", response: "As often as you like.", once: "yes" },
          ],
        },
      },
    },
  } as unknown as KnowledgeDrivenDialogueProjectView;
}

test("Knowledge-Driven Dialogue rejects a consumption flag that is not a boolean", () => {
  expect(validateKnowledgeDrivenDialogueProject(consumableAlternativesProject())).toEqual([
    expect.objectContaining({
      code: "definition.conversation-alternative.item",
      owner: "dialogue",
      path: "characters.antonio.dialogue.alternatives[1]",
    }),
  ]);
});

test("Knowledge-Driven Dialogue rejects consuming an alternative a Character does not offer", () => {
  const project = consumableAlternativesProject();
  const path = "sequences.exactAccount.steps[0].operations[0]";

  expect(validateDialogueGameOperation(
    { type: "consume-conversation-alternative", character: "antonio", alternative: 0 },
    path,
    project,
  )).toEqual([]);
  expect(validateDialogueGameOperation(
    { type: "consume-conversation-alternative", character: "antonio", alternative: 2 },
    path,
    project,
  )).toEqual([
    expect.objectContaining({
      code: "reference.conversation-alternative.index",
      owner: "dialogue",
      path: `${path}.alternative`,
    }),
  ]);
  expect(validateDialogueGameOperation(
    { type: "consume-conversation-alternative", character: "nobody", alternative: 0 },
    path,
    project,
  )).toEqual([
    expect.objectContaining({
      code: "reference.dialogue-operation.character",
      owner: "dialogue",
      path: `${path}.character`,
    }),
  ]);
});

test("Knowledge-Driven Dialogue rejects an alternative that starts a Sequence", () => {
  const project = {
    narrativeFacts: {},
    variables: {},
    characters: {
      antonio: {
        dialogue: {
          knowledge: [],
          alternatives: [{
            text: "Tell me the whole account.",
            response: "Very well.",
            operations: [{ type: "start-sequence", sequence: "exactAccount" }],
          }],
        },
      },
    },
  } as unknown as KnowledgeDrivenDialogueProjectView;

  expect(validateKnowledgeDrivenDialogueProject(project)).toEqual([
    expect.objectContaining({
      code: "definition.conversation-alternative.sequence",
      owner: "dialogue",
      path: "characters.antonio.dialogue.alternatives[0].operations[0]",
    }),
  ]);
});

test("Knowledge-Driven Dialogue rejects more than six simultaneously eligible alternatives", () => {
  const alternative = (index: number) => ({
    text: `Question ${index}?`,
    response: `Answer ${index}.`,
  });
  const project = {
    narrativeFacts: {},
    variables: { winchFound: false },
    characters: {
      antonio: {
        dialogue: {
          knowledge: [],
          alternatives: [
            ...[1, 2, 3, 4, 5, 6].map(alternative),
            { ...alternative(7), when: { variable: "winchFound", equals: true } },
          ],
        },
      },
      bystander: {
        dialogue: {
          knowledge: [],
          alternatives: [
            ...[1, 2, 3, 4, 5].map(alternative),
            { ...alternative(6), when: { variable: "winchFound", equals: true } },
            { ...alternative(7), when: { variable: "winchFound", equals: false } },
          ],
        },
      },
    },
  } as unknown as KnowledgeDrivenDialogueProjectView;

  expect(validateKnowledgeDrivenDialogueProject(project)).toEqual([
    expect.objectContaining({
      code: "definition.conversation-alternative.limit",
      owner: "dialogue",
      path: "characters.antonio.dialogue.alternatives",
      message: "A Conversation can present at most six eligible alternatives.",
    }),
  ]);
});

test("Knowledge-Driven Dialogue reports malformed profile collections without throwing", () => {
  const project = {
    narrativeFacts: {},
    variables: {},
    characters: {
      antonio: {
        dialogue: {
          knowledge: 12,
          relationships: "everyone",
        },
      },
    },
  } as unknown as KnowledgeDrivenDialogueProjectView;

  expect(validateKnowledgeDrivenDialogueProject(project)).toEqual(expect.arrayContaining([
    expect.objectContaining({ code: "definition.character-knowledge.collection" }),
    expect.objectContaining({ code: "definition.relationship.collection" }),
  ]));
});

test("Knowledge-Driven Dialogue creates independent state and learns monotonically", () => {
  const dialogue = createKnowledgeDrivenDialogue({
    narrativeFacts: {
      harbour: { proposition: "The harbour chain was cut." },
    },
    variables: {},
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

  expect(initial).toEqual({
    characterKnowledge: { antonio: ["harbour"], michele: [] },
    relationships: { antonio: {}, michele: {} },
    dialogueStates: { antonio: null, michele: null },
    consumedAlternatives: { antonio: [], michele: [] },
    testimonies: [],
  });
  expect(independent).toEqual(initial);
  expect(learned).toEqual({
    ...initial,
    characterKnowledge: { antonio: ["harbour"], michele: ["harbour"] },
  });
  expect(repeated).toEqual(learned);
  expect(learned).not.toBe(initial);
  expect(repeated).toBe(learned);
});

test("Testimony has a canonical order independent of communication order", () => {
  const dialogue = createKnowledgeDrivenDialogue({
    narrativeFacts: {
      firstFact: { proposition: "The first concealed truth." },
      secondFact: { proposition: "The second concealed truth." },
    },
    claims: {
      firstClaim: { proposition: "The first controlled false account." },
      secondClaim: { proposition: "The second controlled false account." },
    },
    variables: {},
    characters: {
      player: { dialogue: { knowledge: [] } },
      antonio: {
        dialogue: {
          knowledge: [
            { factId: "firstFact", disclosure: { level: "guarded", when: { trustAtLeast: "high" } } },
            { factId: "secondFact", disclosure: { level: "guarded", when: { trustAtLeast: "high" } } },
          ],
          coverStories: [
            { concealsFactId: "firstFact", claimId: "firstClaim" },
            { concealsFactId: "secondFact", claimId: "secondClaim" },
          ],
        },
      },
    },
  });
  const first = {
    type: "record-testimony" as const,
    speaker: "antonio",
    listener: "player",
    concealsFactId: "firstFact",
    claimId: "firstClaim",
  };
  const second = {
    type: "record-testimony" as const,
    speaker: "antonio",
    listener: "player",
    concealsFactId: "secondFact",
    claimId: "secondClaim",
  };

  const forward = dialogue.applyOperation(
    dialogue.applyOperation(dialogue.initialState(), second),
    first,
  );
  const reverse = dialogue.applyOperation(
    dialogue.applyOperation(dialogue.initialState(), first),
    second,
  );

  expect(forward.testimonies).toEqual(reverse.testimonies);
  expect(forward.testimonies).toEqual([
    { speaker: "antonio", listener: "player", claimId: "firstClaim" },
    { speaker: "antonio", listener: "player", claimId: "secondClaim" },
  ]);
});

test("Knowledge-Driven Dialogue rejects inherited object names as undeclared identities", () => {
  const project = {
    narrativeFacts: {},
    variables: {},
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
    variables: {},
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
    reflect: unusedReflection,
    reset() {
      return Promise.resolve();
    },
  };

  const turn = await dialogue.respond({ ...dialogue.initialState(), variables: {} }, {
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
    strategy: "answer",
    fact: { id: "known", proposition: "The harbour chain was cut." },
    profile: {},
  });
  expect(turn).toEqual({
    playerInput: "What happened?",
    response: '{"type":"learn-narrative-fact","factId":"hidden"}',
    operation: { type: "learn-narrative-fact", character: "player", factId: "known" },
  });
});

test("Dialogue policy deterministically authorises answer, withholding and clarification", async () => {
  const dialogue = createKnowledgeDrivenDialogue({
    narrativeFacts: {
      open: { proposition: "The chain was cut." },
      guarded: { proposition: "Raffaele carried the saw." },
      guardedByVariable: { proposition: "Raffaele borrowed the saw." },
      secret: { proposition: "Antonio ordered the sabotage." },
    },
    variables: { confessionUnlocked: false },
    characters: {
      player: { dialogue: { knowledge: [] } },
      antonio: {
        dialogue: {
          biography: "A guarded former sailor.",
          personality: {
            talkativeness: "low", honesty: "medium", discretion: "high", suspiciousness: "high",
          },
          behavior: { withholding: "evade" },
          voice: { verbosity: "short", tone: "dry", vocabulary: "simple" },
          state: "afraid",
          relationships: { player: { trust: "medium" } },
          knowledge: [
            { factId: "open", disclosure: { level: "open" } },
            { factId: "guarded", disclosure: { level: "guarded", when: { trustAtLeast: "medium" } } },
            { factId: "guardedByVariable", disclosure: { level: "guarded", when: { variable: "confessionUnlocked", equals: true } } },
            { factId: "secret", disclosure: { level: "secret", when: { variable: "confessionUnlocked", equals: true } } },
          ],
        },
      },
    },
  });
  const verbalizationRequests: Array<DialogueVerbalizationRequest & {
    readonly strategy: string;
    readonly profile?: unknown;
  }> = [];
  const provider: DialogueProvider = {
    interpret: ({ playerInput }) => Promise.resolve(
      playerInput === "ambiguous"
        ? { factId: null, reason: "ambiguous" as const }
        : playerInput === "noRelevant"
          ? { factId: null, reason: "no-relevant-fact" as const }
          : { factId: playerInput },
    ),
    verbalize: (request) => {
      const policyRequest = request as typeof verbalizationRequests[number];
      verbalizationRequests.push(policyRequest);
      return Promise.resolve(`${policyRequest.strategy}:${request.fact?.id ?? "none"}`);
    },
    reflect: unusedReflection,
    reset: () => Promise.resolve(),
  };
  const state = {
    ...dialogue.initialState(),
    variables: { confessionUnlocked: false },
  };

  const open = await dialogue.respond(state, {
    speaker: "antonio", listener: "player", playerInput: "open",
  }, provider);
  const guarded = await dialogue.respond(state, {
    speaker: "antonio", listener: "player", playerInput: "guarded",
  }, provider);
  const secret = await dialogue.respond(state, {
    speaker: "antonio", listener: "player", playerInput: "secret",
  }, provider);
  const ambiguous = await dialogue.respond(state, {
    speaker: "antonio", listener: "player", playerInput: "ambiguous",
  }, provider);
  const noRelevant = await dialogue.respond(state, {
    speaker: "antonio", listener: "player", playerInput: "noRelevant",
  }, provider);
  const lowTrust = await dialogue.respond({
    ...state,
    relationships: {
      ...state.relationships,
      antonio: { player: { trust: "low" } },
    },
  }, {
    speaker: "antonio", listener: "player", playerInput: "guarded",
  }, provider);
  const guardedByFalseVariable = await dialogue.respond(state, {
    speaker: "antonio", listener: "player", playerInput: "guardedByVariable",
  }, provider);
  const unlockedState = {
    ...state,
    variables: { confessionUnlocked: true },
  };
  const guardedByVariable = await dialogue.respond(unlockedState, {
    speaker: "antonio", listener: "player", playerInput: "guardedByVariable",
  }, provider);
  const secretUnlocked = await dialogue.respond(unlockedState, {
    speaker: "antonio", listener: "player", playerInput: "secret",
  }, provider);
  const highTrustWithoutUnlock = await dialogue.respond({
    ...state,
    relationships: {
      ...state.relationships,
      antonio: { player: { trust: "high" } },
    },
  }, {
    speaker: "antonio", listener: "player", playerInput: "secret",
  }, provider);

  expect(open).toMatchObject({
    response: "answer:open",
    operation: { type: "learn-narrative-fact", character: "player", factId: "open" },
  });
  expect(guarded).toMatchObject({ response: "answer:guarded" });
  expect(secret).toEqual({ playerInput: "secret", response: "evade:none" });
  expect(ambiguous).toEqual({ playerInput: "ambiguous", response: "clarify:none" });
  expect(noRelevant).toEqual({ playerInput: "noRelevant", response: "evade:none" });
  expect(lowTrust).toEqual({ playerInput: "guarded", response: "evade:none" });
  expect(guardedByFalseVariable).toEqual({
    playerInput: "guardedByVariable",
    response: "evade:none",
  });
  expect(guardedByVariable).toMatchObject({ response: "answer:guardedByVariable" });
  expect(secretUnlocked).toMatchObject({ response: "answer:secret" });
  expect(highTrustWithoutUnlock).toEqual({ playerInput: "secret", response: "evade:none" });
  expect(verbalizationRequests[0]).toMatchObject({
    strategy: "answer",
    fact: { id: "open", proposition: "The chain was cut." },
    profile: {
      biography: "A guarded former sailor.",
      personality: { talkativeness: "low" },
      voice: { verbosity: "short" },
      state: "afraid",
    },
  });
  expect(verbalizationRequests[2]).toEqual(expect.objectContaining({ strategy: "evade" }));
  expect(verbalizationRequests[2]).not.toHaveProperty("fact");
  expect(verbalizationRequests[3]).toEqual(expect.objectContaining({ strategy: "clarify" }));
  expect(verbalizationRequests[3]).not.toHaveProperty("fact");
});

test("Dialogue policy authorises only a declared Cover Story for a concealed fact", async () => {
  const dialogue = createKnowledgeDrivenDialogue({
    narrativeFacts: {
      secret: { proposition: "Antonio was aboard the Santa Lucia." },
    },
    claims: {
      denial: { proposition: "Antonio was never aboard the Santa Lucia." },
    },
    variables: { confessionUnlocked: false },
    characters: {
      player: { dialogue: { knowledge: [] } },
      antonio: {
        dialogue: {
          knowledge: [{
            factId: "secret",
            disclosure: {
              level: "secret",
              when: { variable: "confessionUnlocked", equals: true },
            },
          }],
          coverStories: [{ concealsFactId: "secret", claimId: "denial" }],
        },
      },
    },
  });
  let verbalizationRequest: unknown;
  const provider: DialogueProvider = {
    interpret: () => Promise.resolve({ factId: "secret" }),
    verbalize: (request) => {
      verbalizationRequest = request;
      return Promise.resolve("I was never aboard that ship.");
    },
    reflect: unusedReflection,
    reset: () => Promise.resolve(),
  };

  const turn = await dialogue.respond({
    ...dialogue.initialState(),
    variables: { confessionUnlocked: false },
  }, {
    speaker: "antonio",
    listener: "player",
    playerInput: "Were you aboard?",
  }, provider);

  expect(verbalizationRequest).toEqual({
    playerInput: "Were you aboard?",
    speaker: "antonio",
    listener: "player",
    strategy: "cover-story",
    claim: { id: "denial", proposition: "Antonio was never aboard the Santa Lucia." },
    profile: {},
  });
  expect(verbalizationRequest).not.toHaveProperty("fact");
  expect(turn).toEqual({
    playerInput: "Were you aboard?",
    response: "I was never aboard that ship.",
    operation: {
      type: "record-testimony",
      speaker: "antonio",
      listener: "player",
      concealsFactId: "secret",
      claimId: "denial",
    },
  });

  const truthState = {
    ...dialogue.initialState(),
    variables: { confessionUnlocked: true },
    testimonies: [{ speaker: "antonio", listener: "player", claimId: "denial" }],
  };
  const truth = await dialogue.respond(truthState, {
    speaker: "antonio",
    listener: "player",
    playerInput: "Were you aboard?",
  }, provider);

  expect(verbalizationRequest).toEqual({
    playerInput: "Were you aboard?",
    speaker: "antonio",
    listener: "player",
    strategy: "answer",
    fact: { id: "secret", proposition: "Antonio was aboard the Santa Lucia." },
    profile: {},
  });
  expect(verbalizationRequest).not.toHaveProperty("claim");
  expect(truth.operation).toEqual({
    type: "learn-narrative-fact",
    character: "player",
    factId: "secret",
  });
  if (!truth.operation) throw new Error("Expected a staged truth operation.");
  expect(dialogue.applyOperation(truthState, truth.operation)).toMatchObject({
    characterKnowledge: { player: ["secret"] },
    testimonies: [{ speaker: "antonio", listener: "player", claimId: "denial" }],
  });
});

test("a Dialogue Provider cannot improvise an undeclared Claim", async () => {
  const dialogue = createKnowledgeDrivenDialogue({
    narrativeFacts: {},
    claims: {},
    variables: {},
    characters: {
      player: { dialogue: { knowledge: [] } },
      antonio: { dialogue: { knowledge: [] } },
    },
  });
  let verbalized = false;
  const provider: DialogueProvider = {
    interpret: () => Promise.resolve({ claimId: "invented" } as never),
    verbalize: () => {
      verbalized = true;
      return Promise.resolve("An improvised factual lie.");
    },
    reflect: unusedReflection,
    reset: () => Promise.resolve(),
  };

  await expect(dialogue.respond({ ...dialogue.initialState(), variables: {} }, {
    speaker: "antonio",
    listener: "player",
    playerInput: "Make something up.",
  }, provider)).rejects.toThrow("selected an unknown Narrative Fact");
  expect(verbalized).toBe(false);
});

test("a Dialogue Turn rejects an unknown interpreted ID before verbalization", async () => {
  const dialogue = createKnowledgeDrivenDialogue({
    narrativeFacts: { known: { proposition: "The harbour chain was cut." } },
    variables: {},
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
    reflect: unusedReflection,
    reset: () => Promise.resolve(),
  };

  await expect(dialogue.respond({ ...dialogue.initialState(), variables: {} }, {
    speaker: "antonio",
    listener: "player",
    playerInput: "What happened?",
  }, provider)).rejects.toThrow("selected an unknown Narrative Fact");
  expect(verbalized).toBe(false);
});

test("a Dialogue Turn shares one transient identity and cancellation across provider phases", async () => {
  const dialogue = dialogueTurnLifecycleFixture();
  let finishInterpretation!: (value: { readonly factId: string }) => void;
  const contexts: Array<{ readonly turnId: string; readonly signal: AbortSignal }> = [];
  let verbalized = false;
  const provider: DialogueProvider = {
    interpret: (_request, context) => {
      contexts.push(context);
      return new Promise((resolve) => {
        finishInterpretation = resolve;
      });
    },
    verbalize: (_request, context) => {
      contexts.push(context);
      verbalized = true;
      return Promise.resolve("I saw it happen.");
    },
    reflect: unusedReflection,
    reset: () => Promise.resolve(),
  };
  const cancellation = new AbortController();
  const pending = dialogue.respond({ ...dialogue.initialState(), variables: {} }, {
    speaker: "antonio",
    listener: "player",
    playerInput: "Who cut the chain?",
  }, provider, {
    turnId: "dialogue-turn-test",
    signal: cancellation.signal,
  });

  await Promise.resolve();
  expect(contexts).toHaveLength(1);
  expect(contexts[0]?.turnId).toBe("dialogue-turn-test");
  expect(contexts[0]?.signal).toBe(cancellation.signal);

  cancellation.abort();
  await expect(pending).rejects.toThrow("Dialogue Turn was cancelled.");
  finishInterpretation({ factId: "chain" });
  await Promise.resolve();

  expect(verbalized).toBe(false);
});

test("FakeDialogueProvider deterministically controls pending, late, failed and reset outcomes", async () => {
  const dialogue = dialogueTurnLifecycleFixture();
  const provider = new FakeDialogueProvider({
    interpretations: {
      pending: {
        outcome: "pending",
        value: "chain",
        ignoreCancellation: true,
      },
      timeout: { outcome: "failure", message: "Dialogue Provider timed out." },
    },
    verbalizations: { chain: "I saw it happen." },
  });
  const cancellation = new AbortController();
  const pending = dialogue.respond({ ...dialogue.initialState(), variables: {} }, {
    speaker: "antonio",
    listener: "player",
    playerInput: "pending",
  }, provider, {
    turnId: "dialogue-turn-pending",
    signal: cancellation.signal,
  });

  await Promise.resolve();
  expect(provider.pendingTurnIds()).toEqual(["dialogue-turn-pending"]);
  cancellation.abort();
  await expect(pending).rejects.toThrow("Dialogue Turn was cancelled.");
  expect(provider.release("dialogue-turn-pending")).toBe(true);
  await Promise.resolve();

  await expect(dialogue.respond({ ...dialogue.initialState(), variables: {} }, {
    speaker: "antonio",
    listener: "player",
    playerInput: "timeout",
  }, provider, {
    turnId: "dialogue-turn-timeout",
    signal: new AbortController().signal,
  })).rejects.toThrow("Dialogue Provider timed out.");
  await provider.reset();
  expect(provider.resetCount()).toBe(1);
});

test("Reflection exposes only the Player Character's committed understanding", async () => {
  const dialogue = createKnowledgeDrivenDialogue({
    narrativeFacts: {
      known: { proposition: "The harbour chain was cut." },
      hidden: { proposition: "Antonio ordered the sabotage." },
    },
    claims: {
      denial: { proposition: "Antonio was never aboard the Santa Lucia." },
    },
    variables: {},
    characters: {
      player: {
        dialogue: {
          knowledge: [{ factId: "known", disclosure: { level: "open" } }],
          relationships: { antonio: { trust: "low" } },
        },
      },
      antonio: {
        dialogue: {
          knowledge: [{
            factId: "hidden",
            disclosure: { level: "secret", when: { variable: "unlocked", equals: true } },
          }],
          coverStories: [{ concealsFactId: "hidden", claimId: "denial" }],
        },
      },
    },
  });
  const state = dialogue.initialState();
  state.testimonies.push({ speaker: "antonio", listener: "player", claimId: "denial" });
  let reflectionRequest: Parameters<DialogueProvider["reflect"]>[0] | undefined;
  const provider: DialogueProvider = {
    interpret: () => Promise.resolve({ factId: null, reason: "no-relevant-fact" }),
    verbalize: () => Promise.resolve("Not used by Reflection."),
    reflect(request) {
      reflectionRequest = request;
      return Promise.resolve({
        summary: "I know the harbour chain was cut, and Antonio denied being aboard.",
        hypotheses: ["Antonio may know more than he said."],
        suggestions: ["Ask who benefited from the sabotage."],
      });
    },
    reset: () => Promise.resolve(),
  };

  const result = await dialogue.reflect(state, {
    character: "player",
    playerInput: "What do I know?",
  }, provider);

  expect(reflectionRequest).toEqual({
    playerInput: "What do I know?",
    character: "player",
    facts: [{ id: "known", proposition: "The harbour chain was cut." }],
    testimonies: [{
      speaker: "antonio",
      claim: { id: "denial", proposition: "Antonio was never aboard the Santa Lucia." },
    }],
    relationships: [{ towards: "antonio", trust: "low" }],
  });
  expect(JSON.stringify(reflectionRequest)).not.toContain("Antonio ordered the sabotage.");
  expect(result).toEqual({
    playerInput: "What do I know?",
    response: "I know the harbour chain was cut, and Antonio denied being aboard. " +
      "Uncertain hypothesis: Antonio may know more than he said. " +
      "Possible investigation: Ask who benefited from the sabotage.",
  });
  expect(state.characterKnowledge.player).toEqual(["known"]);
  expect(state.testimonies).toEqual([{
    speaker: "antonio", listener: "player", claimId: "denial",
  }]);
});

test("Reflection gives an honest limited response when the Character knows nothing", async () => {
  const dialogue = createKnowledgeDrivenDialogue({
    narrativeFacts: { hidden: { proposition: "Antonio ordered the sabotage." } },
    variables: {},
    characters: {
      player: { dialogue: { knowledge: [] } },
      antonio: {
        dialogue: { knowledge: [{ factId: "hidden", disclosure: { level: "open" } }] },
      },
    },
  });
  let providerWasAsked = false;
  const provider: DialogueProvider = {
    interpret: () => Promise.resolve({ factId: null, reason: "no-relevant-fact" }),
    verbalize: () => Promise.resolve("Not used by Reflection."),
    reflect: () => {
      providerWasAsked = true;
      return Promise.resolve({ summary: "An invented answer." });
    },
    reset: () => Promise.resolve(),
  };

  await expect(dialogue.reflect(dialogue.initialState(), {
    character: "player",
    playerInput: "What do I know?",
  }, provider)).resolves.toEqual({
    playerInput: "What do I know?",
    response: "I do not know enough to reflect on that yet.",
  });
  expect(providerWasAsked).toBe(false);
});
