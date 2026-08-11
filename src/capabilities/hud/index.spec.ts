import { expect, test } from "@playwright/test";

import {
  defineNoun,
  type CommandLexicon,
  type InventoryPresentation,
} from "../interaction";
import {
  createHUD,
  type HUDPresentationContext,
} from "./index";

const lexicon: CommandLexicon = {
  verbs: {
    open: "Open",
    "pick-up": "Take",
    push: "Push",
    close: "Close",
    "look-at": "Look at",
    pull: "Pull",
    give: "Give",
    "talk-to": "Talk to",
    use: "Use",
  },
  inventory: {
    select: "Select {noun}",
    deselect: "Put away {noun}",
  },
  patterns: {
    unary: "{noun} / {verb}",
    give: "{verb} {first} to {second}",
    use: "{verb} {first} with {second}",
  },
};

const inventory: InventoryPresentation = {
  entries: [{
    object: "key",
    label: "Key",
    inventoryAppearance: "key.png",
    preferredVerb: "use",
    secondaryVerb: "look-at",
    selected: true,
  }],
};

const door = defineNoun({
  labels: [{ text: "Door" }],
  preferredVerbs: [{ verb: "look-at" }],
  secondaryVerbs: [{ verb: "talk-to" }],
  objectVerbs: [{ verb: "use" }],
  cases: [],
});

const passage = defineNoun({
  labels: [{ text: "Outside" }],
  preferredVerbs: [{ verb: "walk-to" }],
  cases: [],
});

const context: HUDPresentationContext = {
  state: {
    currentScene: "hall",
    variables: {},
    inventory: { objects: ["key"] },
    command: {
      verb: "use",
      firstNoun: { kind: "object", object: "key" },
    },
  },
  inventory,
  nouns: [{
    target: { kind: "hotspot", index: 2 },
    area: [{ x: 0, y: 0 }, { x: 8, y: 0 }, { x: 8, y: 8 }],
    noun: door,
  }, {
    target: { kind: "passage", index: 1 },
    area: [{ x: 10, y: 0 }, { x: 18, y: 0 }, { x: 18, y: 8 }],
    noun: passage,
    direction: "right",
  }],
};

test("HUD prepares contextual Command phrases once for browser presentation", () => {
  const hud = createHUD({ commandLexicon: lexicon });

  const presentation = hud.presentation(context);

  expect(presentation.nouns).toEqual([{
    target: { kind: "hotspot", index: 2 },
    area: context.nouns[0]!.area,
    label: "Door",
    primary: { text: "Use Key with Door" },
    secondary: { text: "Door / Look at" },
  }, {
    target: { kind: "passage", index: 1 },
    area: context.nouns[1]!.area,
    label: "Outside",
    direction: "right",
    primary: { text: "Use Key with Outside" },
    secondary: { text: "Outside" },
  }]);
  expect(Object.isFrozen(presentation)).toBe(true);
  expect(Object.isFrozen(presentation.nouns)).toBe(true);
});

test("HUD owns Inventory pagination, reveal state, and focus intentions", () => {
  const hud = createHUD({ commandLexicon: lexicon, inventoryPageSize: 2 });
  const entries = Array.from({ length: 5 }, (_, index) => ({
    object: `item-${index}`,
    label: `Item ${index}`,
    inventoryAppearance: `${index}.png`,
    preferredVerb: "use" as const,
    selected: false,
  }));
  const manyItems = {
    ...context,
    state: {
      ...context.state,
      inventory: { objects: entries.map(({ object }) => object) },
      command: { verb: "walk-to" as const, firstNoun: null },
    },
    inventory: { entries },
  };

  expect(hud.presentation(manyItems).inventory).toMatchObject({
    open: false,
    page: 2,
    pageCount: 3,
    canGoPrevious: true,
    canGoNext: false,
    emptySlots: 1,
  });
  expect(hud.input({ type: "open-inventory" }, manyItems)).toEqual({ focus: "inventory" });
  expect(hud.input({ type: "change-inventory-page", amount: -1 }, manyItems)).toEqual({ focus: null });
  expect(hud.presentation(manyItems).inventory.entries.map(({ object }) => object))
    .toEqual(["item-2", "item-3"]);
  expect(hud.input({ type: "set-nouns-revealed", revealed: true }, manyItems))
    .toEqual({ focus: null });
  expect(hud.presentation(manyItems).nounsRevealed).toBe(true);
  expect(hud.presentation({ ...manyItems, inventorySuspended: true }).inventory).toMatchObject({
    open: false,
    triggerVisible: false,
  });
  expect(hud.input({ type: "close-inventory" }, manyItems)).toEqual({ focus: "frame" });
});

test("HUD turns prepared actions into Interaction input and owns drawer closing", () => {
  const hud = createHUD({ commandLexicon: lexicon });
  hud.presentation(context);
  hud.input({ type: "open-inventory" }, context);

  expect(hud.input({
    type: "activate-noun",
    target: { kind: "hotspot", index: 2 },
    action: "secondary",
  }, context)).toEqual({
    focus: null,
    interaction: { type: "contextual-hotspot", hotspot: 2, action: "secondary" },
  });
  expect(hud.input({
    type: "activate-inventory",
    object: "key",
    action: "primary",
  }, context)).toEqual({
    focus: "frame",
    interaction: { type: "contextual-object", object: "key", action: "primary" },
  });
  expect(hud.presentation(context).inventory.open).toBe(false);
});

test("HUD preserves pointer Inventory access without a Command Lexicon", () => {
  const hud = createHUD({});

  expect(hud.presentation(context)).toMatchObject({
    nounRevealControl: "button",
    inventory: {
      keyboardShortcutAvailable: false,
      fillEmptySlots: false,
      triggerVisible: true,
      open: false,
    },
  });
  expect(hud.input({ type: "toggle-inventory" }, context)).toEqual({ focus: "inventory" });
  expect(hud.presentation(context).inventory.open).toBe(true);
});
