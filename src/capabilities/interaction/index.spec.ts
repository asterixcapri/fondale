import { expect, test } from "@playwright/test";

import {
  commandVerbs,
  conditionMatchesState,
  createInteraction,
  eligibleAlternativeIndexes,
  exceedsEligibleAlternativeLimit,
  maximumEligibleAlternatives,
  type ConditionalAlternative,
  type CommandLexicon,
  type NounDefinition,
  type InteractionStateView,
  validateCommandLexicon,
  validateInventoryOperation,
  validateNounDefinition,
} from "./index";
import { validateTestDefinition } from "../../../test/definition-support";

function validateTestNounDefinition<T extends NounDefinition>(value: T): T {
  return validateTestDefinition(value, validateNounDefinition);
}

function validateTestCommandLexicon<T extends CommandLexicon>(value: T): T {
  return validateTestDefinition(value, validateCommandLexicon);
}

const state: InteractionStateView = {
  currentScene: "courtyard",
  variables: {},
  inventory: { objects: ["key"] },
  command: {
    verb: "use",
    firstNoun: { kind: "object", object: "key" },
  },
};

test("Interaction validates complete local authoring values without throwing", () => {
  const nounDiagnostics = validateNounDefinition({
    labels: [{ when: { variable: "known", equals: true }, text: "" }],
    preferredVerbs: [{ when: { variable: "open", equals: true }, verb: "open" }],
    cases: [{ verb: "give" }],
  }, "objects.key.noun");

  expect(nounDiagnostics).toEqual(expect.arrayContaining([
    expect.objectContaining({ code: "definition.conditional-fallback", path: "objects.key.noun.labels" }),
    expect.objectContaining({ code: "definition.conditional-fallback", path: "objects.key.noun.preferredVerbs" }),
    expect.objectContaining({ code: "definition.noun-label.text", path: "objects.key.noun.labels[0].text" }),
    expect.objectContaining({ code: "definition.command-case.arity", path: "objects.key.noun.cases[0].firstNoun" }),
    expect.objectContaining({ code: "definition.command-case.empty", path: "objects.key.noun.cases[0]" }),
  ]));
  expect(nounDiagnostics.every(({ owner }) => owner === "interaction")).toBe(true);

  const lexicon = {
    inventory: { select: "Select", deselect: "Deselect {noun}" },
    verbs: Object.fromEntries(commandVerbs.map((verb) => [verb, verb === "open" ? "" : verb])),
    patterns: { unary: "{noun}", give: "{verb} {first}", use: "{verb} {second}" },
  } as CommandLexicon;
  expect(validateCommandLexicon(lexicon, "commandLexicon")).toEqual(expect.arrayContaining([
    expect.objectContaining({ code: "definition.command-lexicon.label", path: "commandLexicon.verbs.open" }),
    expect.objectContaining({ code: "definition.command-lexicon.pattern", path: "commandLexicon.inventory.select" }),
    expect.objectContaining({ code: "definition.command-lexicon.pattern", path: "commandLexicon.patterns.unary" }),
    expect.objectContaining({ code: "definition.command-lexicon.pattern", path: "commandLexicon.patterns.give" }),
    expect.objectContaining({ code: "definition.command-lexicon.pattern", path: "commandLexicon.patterns.use" }),
  ]));
});

test("a selected Object Contextual Action requests an approach with one Player Intent", () => {
  const door = (validateTestNounDefinition({
    labels: [{ text: "Door" }],
    preferredVerbs: [{ verb: "look-at" }],
    objectVerbs: [{ verb: "use" }],
    cases: [{
      verb: "use",
      firstNoun: "key",
      response: { text: "The door opens." },
    }],
  } satisfies NounDefinition));
  const interaction = createInteraction({
    objects: {},
    commandFallbacks: {},
  });

  expect(interaction.input(
    { type: "contextual-hotspot", hotspot: 2, action: "primary" },
    state,
    {
      kind: "hotspot",
      scene: "courtyard",
      index: 2,
      noun: door,
      target: { kind: "background" },
    },
  )).toEqual({
    type: "request-approach",
    target: { kind: "hotspot", index: 2 },
    intent: {
      kind: "interaction",
      scene: "courtyard",
      hotspot: 2,
      command: { verb: "use", firstNoun: "key", preserveState: true },
    },
  });
});

test("an Inventory secondary action resolves immediately without a Player Intent", () => {
  const key = (validateTestNounDefinition({
    labels: [{ text: "Key" }],
    preferredVerbs: [{ verb: "use" }],
    secondaryVerbs: [{ verb: "look-at" }],
    cases: [{ verb: "look-at", response: { text: "A brass key." } }],
  } satisfies NounDefinition));
  const interaction = createInteraction({
    objects: { key: { noun: key } },
    commandFallbacks: {},
  });

  expect(interaction.input(
    { type: "contextual-object", object: "key", action: "secondary" },
    state,
  )).toEqual({
    type: "resolve",
    target: { kind: "object", object: "key" },
    commandStateDisposition: "preserve",
    resolution: {
      operations: [],
      response: { text: "A brass key." },
    },
  });
});

test("collecting a present Object appends it to the Inventory in acquisition order", () => {
  const interaction = createInteraction({
    objects: { key: {}, coin: {} },
    commandFallbacks: {},
  });

  expect(interaction.applyInventoryOperation(
    { type: "collect-target-object" },
    {
      currentScene: "courtyard",
      objects: {
        key: {
          appearance: "normal",
          location: { kind: "inventory" },
        },
        coin: {
          appearance: "normal",
          location: {
            kind: "scene",
            scene: "courtyard",
            groundPoint: { x: 12, y: 18 },
          },
        },
      },
      inventory: { objects: ["key"] },
      command: { verb: "walk-to", firstNoun: null },
    },
    { target: { kind: "object", object: "coin" } },
  )).toEqual({
    status: "applied",
    state: {
      objects: {
        key: {
          appearance: "normal",
          location: { kind: "inventory" },
        },
        coin: {
          appearance: "normal",
          location: { kind: "inventory" },
        },
      },
      inventory: { objects: ["key", "coin"] },
      command: { verb: "walk-to", firstNoun: null },
    },
  });
});

test("giving a named Object moves the present Scene Object into Inventory exactly once", () => {
  const interaction = createInteraction({ objects: { letter: {} }, commandFallbacks: {} });
  const state = {
    currentScene: "courtyard",
    objects: {
      letter: {
        appearance: "sealed",
        location: {
          kind: "scene" as const,
          scene: "courtyard",
          groundPoint: { x: 12, y: 18 },
        },
      },
    },
    inventory: { objects: [] as string[] },
    command: { verb: "walk-to" as const, firstNoun: null },
  };

  const result = interaction.applyInventoryOperation(
    { type: "give-object", object: "letter" },
    state,
    { target: { kind: "character", character: "raffaele" } },
  );
  expect(result).toEqual({
    status: "applied",
    state: {
      objects: { letter: { appearance: "sealed", location: { kind: "inventory" } } },
      inventory: { objects: ["letter"] },
      command: { verb: "walk-to", firstNoun: null },
    },
  });
  expect(result.status === "applied" && interaction.applyInventoryOperation(
    { type: "give-object", object: "letter" },
    { currentScene: "courtyard", ...result.state },
    { target: { kind: "character", character: "raffaele" } },
  )).toEqual({ status: "invalid", message: "The given Object is not present in the current Scene." });
});

test("consuming the selected Object clears its invalid Command selection atomically", () => {
  const interaction = createInteraction({ objects: { key: {} } });

  expect(interaction.applyInventoryOperation(
    { type: "consume-selected-object" },
    {
      currentScene: "courtyard",
      objects: {
        key: {
          appearance: "normal",
          location: { kind: "inventory" },
        },
      },
      inventory: { objects: ["key"] },
      command: {
        verb: "use",
        firstNoun: { kind: "object", object: "key" },
      },
    },
    {
      target: { kind: "background" },
      firstNounObject: "key",
    },
  )).toEqual({
    status: "applied",
    state: {
      objects: {
        key: {
          appearance: "normal",
          location: { kind: "consumed" },
        },
      },
      inventory: { objects: [] },
      command: { verb: "walk-to", firstNoun: null },
    },
  });
});

test("placing the selected Object uses World and Animation authority", () => {
  const interaction = createInteraction(
    { objects: { key: {} } },
    {
      canPlaceObject: (scene, point) =>
        scene === "courtyard" && point.x === 24 && point.y === 30,
      objectHasAppearance: (object, appearance) =>
        object === "key" && appearance === "used",
    },
  );

  expect(interaction.applyInventoryOperation(
    {
      type: "place-selected-object",
      groundPoint: { x: 24, y: 30 },
      appearance: "used",
    },
    {
      currentScene: "courtyard",
      objects: {
        key: {
          appearance: "normal",
          location: { kind: "inventory" },
        },
      },
      inventory: { objects: ["key"] },
      command: {
        verb: "use",
        firstNoun: { kind: "object", object: "key" },
      },
    },
    {
      target: { kind: "background" },
      firstNounObject: "key",
    },
  )).toEqual({
    status: "applied",
    state: {
      objects: {
        key: {
          appearance: "used",
          location: {
            kind: "scene",
            scene: "courtyard",
            groundPoint: { x: 24, y: 30 },
          },
        },
      },
      inventory: { objects: [] },
      command: { verb: "walk-to", firstNoun: null },
    },
  });
});

test("placing a named Object removes it from the Inventory wherever it was", () => {
  const interaction = createInteraction(
    { objects: { coin: {} } },
    {
      canPlaceObject: (scene, point) =>
        scene === "vault" && point.x === 8 && point.y === 13,
      objectHasAppearance: () => false,
    },
  );

  expect(interaction.applyInventoryOperation(
    {
      type: "place-object",
      object: "coin",
      scene: "vault",
      groundPoint: { x: 8, y: 13 },
    },
    {
      currentScene: "courtyard",
      objects: {
        coin: {
          appearance: "normal",
          location: { kind: "inventory" },
        },
      },
      inventory: { objects: ["coin"] },
      command: {
        verb: "give",
        firstNoun: { kind: "object", object: "coin" },
      },
    },
    { target: { kind: "background" } },
  )).toEqual({
    status: "applied",
    state: {
      objects: {
        coin: {
          appearance: "normal",
          location: {
            kind: "scene",
            scene: "vault",
            groundPoint: { x: 8, y: 13 },
          },
        },
      },
      inventory: { objects: [] },
      command: { verb: "walk-to", firstNoun: null },
    },
  });
});

test("Inventory presentation is an immutable ordered model of available Nouns for the HUD", () => {
  const key = (validateTestNounDefinition({
    labels: [
      { text: "Used key", when: { variable: "used", equals: true } },
      { text: "Key" },
    ],
    preferredVerbs: [{ verb: "use" }],
    secondaryVerbs: [{ verb: "look-at" }],
    cases: [],
  } satisfies NounDefinition));
  const interaction = createInteraction({
    objects: {
      key: { noun: key, inventoryAppearance: "key-inventory.png" },
      orphan: { inventoryAppearance: "orphan-inventory.png" },
    },
  });

  const presentation = interaction.inventory({
    currentScene: "courtyard",
    variables: { used: true },
    inventory: { objects: ["key", "orphan"] },
    command: {
      verb: "use",
      firstNoun: { kind: "object", object: "key" },
    },
  });

  expect(presentation).toEqual({
    entries: [{
      object: "key",
      label: "Used key",
      inventoryAppearance: "key-inventory.png",
      preferredVerb: "use",
      secondaryVerb: "look-at",
      selected: true,
    }],
  });
  expect(Object.isFrozen(presentation)).toBe(true);
  expect(Object.isFrozen(presentation.entries)).toBe(true);
  expect(Object.isFrozen(presentation.entries[0])).toBe(true);
});

test("Inventory authoring delegates placement and Appearance diagnostics to their owners", () => {
  expect(validateInventoryOperation(
    {
      type: "place-object",
      object: "key",
      scene: "courtyard",
      groundPoint: { x: -1, y: 30 },
      appearance: "missing",
    },
    "cases[0].operations[0]",
    { scenes: ["courtyard"] },
    {
      objects: new Set(["key"]),
      scenes: new Set(["courtyard"]),
      validatePlacement: (_scenes, _point, path) => [{
        code: "definition.operation.ground-point",
        family: "definition",
        owner: "world",
        path,
        message: "The point is outside Scene Space.",
      }],
      validateObjectAppearance: (_object, _appearance, path) => [{
        code: "reference.appearance",
        family: "reference",
        owner: "animation",
        path,
        message: "The Appearance does not exist.",
      }],
    },
  )).toEqual([
    expect.objectContaining({ owner: "world", path: "cases[0].operations[0].groundPoint" }),
    expect.objectContaining({ owner: "animation", path: "cases[0].operations[0].appearance" }),
  ]);
});

test("invalid Inventory consequences are deterministic and leave their input unchanged", () => {
  const interaction = createInteraction(
    { objects: { key: {} } },
    {
      canPlaceObject: (_scene, point) => point.x >= 0,
      objectHasAppearance: () => false,
    },
  );
  const state = {
    currentScene: "courtyard",
    objects: {
      key: {
        appearance: "normal",
        location: { kind: "inventory" as const },
      },
    },
    inventory: { objects: ["key"] },
    command: { verb: "walk-to" as const, firstNoun: null },
  };
  const original = structuredClone(state);

  expect([
    interaction.applyInventoryOperation(
      { type: "collect-target-object" },
      state,
      { target: { kind: "background" } },
    ),
    interaction.applyInventoryOperation(
      { type: "consume-selected-object" },
      state,
      { target: { kind: "background" } },
    ),
    interaction.applyInventoryOperation(
      { type: "place-selected-object", groundPoint: { x: -1, y: 30 } },
      state,
      { target: { kind: "background" }, firstNounObject: "key" },
    ),
    interaction.applyInventoryOperation(
      {
        type: "place-selected-object",
        groundPoint: { x: 10, y: 30 },
        appearance: "missing",
      },
      state,
      { target: { kind: "background" }, firstNounObject: "key" },
    ),
    interaction.applyInventoryOperation(
      {
        type: "place-object",
        object: "missing",
        scene: "courtyard",
        groundPoint: { x: 10, y: 30 },
      },
      state,
      { target: { kind: "background" } },
    ),
  ]).toEqual([
    { status: "invalid", message: "Collect requires an Object target." },
    { status: "invalid", message: "No Object is selected." },
    {
      status: "invalid",
      message: "The placed Object Ground Point is outside the destination Scene Size.",
    },
    {
      status: "invalid",
      message: "Unknown Object Appearance 'missing'.",
    },
    {
      status: "invalid",
      message: "Placed Object or destination Scene does not exist.",
    },
  ]);
  expect(state).toEqual(original);
});

test("an unavailable Noun rejects a resumed Player Intent and resets its Command", () => {
  const interaction = createInteraction({ objects: {}, commandFallbacks: {} });

  expect(interaction.resume({
    kind: "interaction",
    scene: "courtyard",
    hotspot: 2,
    command: { verb: "use", firstNoun: "key" },
  }, state)).toEqual({
    type: "command",
    command: { verb: "walk-to", firstNoun: null },
  });
});

test("a resumed Player Intent resolves its Command against the latest state", () => {
  const door = (validateTestNounDefinition({
    labels: [{ text: "Door" }],
    preferredVerbs: [{ verb: "look-at" }],
    cases: [{
      verb: "look-at",
      when: { variable: "opened", equals: true },
      response: { text: "The door is open." },
    }],
  } satisfies NounDefinition));
  const interaction = createInteraction({ objects: {}, commandFallbacks: {} });

  expect(interaction.resume({
    kind: "interaction",
    scene: "courtyard",
    hotspot: 2,
    command: { verb: "look-at" },
  }, {
    ...state,
    variables: { opened: true },
  }, {
    kind: "hotspot",
    scene: "courtyard",
    index: 2,
    noun: door,
    target: { kind: "background" },
  })).toEqual({
    type: "resolve",
    target: { kind: "background" },
    commandStateDisposition: "reset",
    resolution: {
      operations: [],
      response: { text: "The door is open." },
    },
  });
});

test("selecting a Verb cancels the current Player Intent and starts a fresh Command", () => {
  const interaction = createInteraction({ objects: {}, commandFallbacks: {} });

  expect(interaction.input(
    { type: "select-verb", verb: "talk-to" },
    state,
  )).toEqual({
    type: "command",
    command: { verb: "talk-to", firstNoun: null },
    cancelActivity: true,
  });
});

test("a Passage Walk To action requests an approach before its transition", () => {
  const exit = (validateTestNounDefinition({
    labels: [{ text: "Exit" }],
    preferredVerbs: [{ verb: "walk-to" }],
    cases: [],
  } satisfies NounDefinition));
  const interaction = createInteraction({ objects: {}, commandFallbacks: {} });

  expect(interaction.input(
    { type: "quick-passage", passage: 0 },
    state,
    {
      kind: "passage",
      scene: "courtyard",
      index: 0,
      noun: exit,
      target: { kind: "background" },
    },
  )).toEqual({
    type: "request-approach",
    target: { kind: "passage", index: 0 },
    intent: { kind: "passage", scene: "courtyard", passage: 0 },
  });
});

test("only alternatives whose condition holds in the committed Game State are eligible", () => {
  const alternatives = [
    { when: undefined },
    { when: { variable: "met-raffaele", equals: true } },
    { when: { variable: "met-raffaele", equals: false } },
    { when: { hasObject: "key" } },
    { when: { hasObject: "rope" } },
  ] as const satisfies readonly ConditionalAlternative[];

  expect(eligibleAlternativeIndexes(alternatives, (condition) =>
    conditionMatchesState(condition, {
      variables: { "met-raffaele": true },
      inventory: { objects: ["key"] },
    }),
  )).toEqual([0, 1, 3]);
});

test("the eligibility limit counts the alternatives that can be eligible together", () => {
  const unconditional = Array.from({ length: 5 }, () => ({}));
  const exclusive = [
    { when: { variable: "well-open", equals: true } },
    { when: { variable: "well-open", equals: false } },
  ] as const satisfies readonly ConditionalAlternative[];

  expect(exceedsEligibleAlternativeLimit([...unconditional, ...exclusive])).toBe(false);
  expect(exceedsEligibleAlternativeLimit([...unconditional, {}, ...exclusive])).toBe(true);
  expect(exceedsEligibleAlternativeLimit(
    Array.from({ length: maximumEligibleAlternatives }, () => ({})),
  )).toBe(false);
  expect(exceedsEligibleAlternativeLimit(
    Array.from({ length: maximumEligibleAlternatives + 1 }, () => ({})),
  )).toBe(true);
});

test("an Inventory condition is counted as always eligible by the limit", () => {
  expect(exceedsEligibleAlternativeLimit(
    Array.from({ length: maximumEligibleAlternatives + 1 }, () => ({ when: { hasObject: "key" } })),
  )).toBe(true);
});
