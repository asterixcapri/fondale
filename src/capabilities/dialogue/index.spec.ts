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
    reset: () => Promise.resolve(),
  };

  await expect(dialogue.respond({ ...dialogue.initialState(), variables: {} }, {
    speaker: "antonio",
    listener: "player",
    playerInput: "What happened?",
  }, provider)).rejects.toThrow("selected an unknown Narrative Fact");
  expect(verbalized).toBe(false);
});
