import { expect, test } from "@playwright/test";

import {
  createInteraction,
  defineNoun,
  type InteractionStateView,
} from "./index";

const state: InteractionStateView = {
  currentScene: "courtyard",
  variables: {},
  inventory: { objects: ["key"] },
  command: {
    verb: "use",
    firstNoun: { kind: "object", object: "key" },
  },
};

test("a selected Object Contextual Action requests an approach with one Player Intent", () => {
  const door = defineNoun({
    labels: [{ text: "Door" }],
    preferredVerbs: [{ verb: "look-at" }],
    objectVerbs: [{ verb: "use" }],
    cases: [{
      verb: "use",
      firstNoun: "key",
      response: { text: "The door opens." },
    }],
  });
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
  const key = defineNoun({
    labels: [{ text: "Key" }],
    preferredVerbs: [{ verb: "use" }],
    secondaryVerbs: [{ verb: "look-at" }],
    cases: [{ verb: "look-at", response: { text: "A brass key." } }],
  });
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
  const door = defineNoun({
    labels: [{ text: "Door" }],
    preferredVerbs: [{ verb: "look-at" }],
    cases: [{
      verb: "look-at",
      when: { variable: "opened", equals: true },
      response: { text: "The door is open." },
    }],
  });
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
  const exit = defineNoun({
    labels: [{ text: "Exit" }],
    preferredVerbs: [{ verb: "walk-to" }],
    cases: [],
  });
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
