import { expect, test } from "@playwright/test";

import {
  type NounDefinition,
  type CommandLexicon,
  type InventoryPresentation,
  validateNounDefinition,
} from "../interaction";
import {
  createHUD,
  validateHUDTheme,
  type HUDPresentationContext,
  type HUDTheme,
} from "./index";
import { validateTestDefinition } from "../../../test/definition-support";

function validateTestNounDefinition<T extends NounDefinition>(value: T): T {
  return validateTestDefinition(value, validateNounDefinition);
}

function validateTestHUDTheme<T extends HUDTheme>(value: T): T {
  return validateTestDefinition(value, validateHUDTheme);
}

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

const door = (validateTestNounDefinition({
  labels: [{ text: "Door" }],
  preferredVerbs: [{ verb: "look-at" }],
  secondaryVerbs: [{ verb: "talk-to" }],
  objectVerbs: [{ verb: "use" }],
  cases: [],
} satisfies NounDefinition));

const passage = (validateTestNounDefinition({
  labels: [{ text: "Outside" }],
  preferredVerbs: [{ verb: "walk-to" }],
  cases: [],
} satisfies NounDefinition));

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

test("HUD validates its complete local Theme contract with a rooted path", () => {
  const diagnostics = validateHUDTheme({
    font: { family: "", source: "" },
    colors: { text: "turquoise" },
    opacity: 2,
    maxSpeechWidth: 0,
    cursors: { left: "", right: "", up: "", down: "", enter: "" },
    speechColors: { "": "invalid" },
  } as unknown as HUDTheme, "hudTheme");

  expect(diagnostics).toEqual(expect.arrayContaining([
    expect.objectContaining({ code: "definition.hud-theme.font", path: "hudTheme.font" }),
    expect.objectContaining({ code: "definition.hud-theme.color", path: "hudTheme.colors.text" }),
    expect.objectContaining({ code: "definition.hud-theme.opacity", path: "hudTheme.opacity" }),
    expect.objectContaining({ code: "definition.hud-theme.speech-width", path: "hudTheme.maxSpeechWidth" }),
    expect.objectContaining({ code: "definition.hud-theme.cursor", path: "hudTheme.cursors.enter" }),
    expect.objectContaining({ code: "definition.hud-theme.speech-color", path: "hudTheme.speechColors." }),
  ]));
  expect(diagnostics.every(({ owner }) => owner === "hud")).toBe(true);
});

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

test("HUD prepares narrative presentation and interaction intentions from capability facts", () => {
  const hud = createHUD({
    logicalResolution: { width: 426, height: 240 },
    playerCharacter: "player",
    theme: {
      font: { family: "Fondale", source: "fondale.woff2" },
      colors: {
        text: "#f4dfb4",
        preferred: "#f2ad62",
        selected: "#58d6d2",
        backing: "#071016",
        border: "#5c7182",
        inventoryWell: "#211b2d",
      },
      opacity: 0.9,
      maxSpeechWidth: 150,
      cursors: {
        left: "left.png",
        right: "right.png",
        up: "up.png",
        down: "down.png",
        enter: "enter.png",
      },
      speechColors: { host: "#ffffff", player: "#f2ad62" },
    },
  });
  const narrativeContext = {
    ...context,
    camera: { directed: false, origin: { x: 100, y: 20 } },
    world: {
      scene: "hall",
      background: "hall.png",
      size: { width: 640, height: 360 },
      scenery: [],
      objects: [],
      characters: [{
        id: "host",
        appearanceName: "default",
        groundPoint: { x: 315, y: 150 },
        scale: 0.75,
        facing: "front" as const,
      }],
    },
    narrative: {
      kind: "line" as const,
      source: "sequence" as const,
      character: "host",
      text: "Welcome.",
      audio: "welcome.ogg",
    },
  };

  expect(hud.presentation(narrativeContext).narrative).toEqual({
    kind: "line",
    text: "Welcome.",
    speaker: "host",
    audio: "welcome.ogg",
    visible: true,
    color: "#ffffff",
    durationMilliseconds: 4_000,
    layout: {
      kind: "speech",
      anchor: { x: 215, y: 112 },
      maxWidth: 150,
      safeArea: { left: 2, top: 4, right: 424, bottom: 236 },
    },
    focus: "frame",
  });
  expect(hud.input({ type: "advance-activity" }, narrativeContext)).toEqual({
    focus: null,
    session: { type: "advance-sequence" },
  });

  const unavailableSpeakerContext = {
    ...narrativeContext,
    world: { ...narrativeContext.world, characters: [] },
  };
  expect(hud.presentation(unavailableSpeakerContext).narrative).toMatchObject({
    kind: "line",
    visible: false,
    layout: null,
  });
  expect(hud.input({ type: "advance-activity" }, unavailableSpeakerContext)).toEqual({
    focus: null,
    session: { type: "advance-sequence" },
  });

  const narrationContext = {
    ...narrativeContext,
    sequenceActive: true,
    narrative: { kind: "narration" as const, text: "Night falls." },
  };
  expect(hud.presentation(narrationContext).narrative).toMatchObject({
    kind: "narration",
    text: "Night falls.",
    layout: { kind: "lower", maxWidth: 240, availableRight: 426, bottom: 4 },
  });
  expect(hud.input({ type: "skip-sequence" }, narrationContext)).toEqual({
    focus: null,
    session: { type: "skip-sequence" },
  });

  const choiceContext = {
    ...narrativeContext,
    narrative: {
      kind: "choice" as const,
      alternatives: [
        { index: 4, text: "Yes" },
        { index: 7, text: "Not now" },
      ],
    },
  };
  expect(hud.presentation(choiceContext).narrative).toMatchObject({
    kind: "choice",
    color: "#f2ad62",
    focus: "first-choice",
    alternatives: [
      { index: 4, number: 1, label: "1. Yes" },
      { index: 7, number: 2, label: "2. Not now" },
    ],
  });
  expect(hud.input({ type: "choose", alternative: 7 }, choiceContext)).toEqual({
    focus: null,
    session: { type: "choose", alternative: 7 },
  });
});

test("HUD owns Command Response, Player Preference, and system overlay policy", () => {
  const hud = createHUD({
    logicalResolution: { width: 426, height: 240 },
    theme: {
      font: { family: "Fondale", source: "fondale.woff2" },
      colors: {
        text: "#f4dfb4",
        preferred: "#f2ad62",
        selected: "#58d6d2",
        backing: "#071016",
        border: "#5c7182",
        inventoryWell: "#211b2d",
      },
      opacity: 0.9,
      maxSpeechWidth: 150,
      cursors: {
        left: "left.png",
        right: "right.png",
        up: "up.png",
        down: "down.png",
        enter: "enter.png",
      },
      speechColors: {},
    },
  });
  const systemContext = {
    ...context,
    audioAvailable: true,
    saveSlots: [{
      name: "Before the gate",
      savedAt: "2026-08-11T10:00:00.000Z",
      compatible: false,
      diagnostics: [{
        code: "save.project.version",
        family: "save" as const,
        owner: "save" as const,
        path: "snapshot",
        message: "Save Snapshot uses another Project Version.",
      }],
    }, {
      name: "At the harbour",
      savedAt: "2026-08-11T11:00:00.000Z",
      compatible: true,
      diagnostics: [],
    }],
  };

  hud.notify({ type: "command-response", text: "The gate is locked." });
  expect(hud.presentation(systemContext).commandResponse).toMatchObject({
    id: 1,
    text: "The gate is locked.",
    visible: true,
    durationMilliseconds: 4_000,
    layout: { kind: "lower", maxWidth: 150, availableRight: 426, bottom: 4 },
  });
  hud.notify({ type: "command-response", text: "The gate is locked." });
  expect(hud.presentation(systemContext).commandResponse).toMatchObject({ id: 2 });

  expect(hud.input({
    type: "restore-preferences",
    value: { textSpeed: "fast", speechText: false, audioVolume: 0.5 },
  }, systemContext)).toEqual({
    focus: null,
    preferences: { textSpeed: "fast", speechText: false, audioVolume: 0.5 },
  });
  expect(hud.presentation(systemContext).commandResponse).toMatchObject({
    visible: false,
    durationMilliseconds: 600,
  });

  expect(hud.input({ type: "open-modal", modal: "options" }, systemContext))
    .toEqual({ focus: "modal" });
  expect(hud.presentation(systemContext).system.modal).toEqual({
    kind: "options",
    title: "Options",
    focus: "first-control",
    audioAvailable: true,
  });
  hud.input({ type: "open-modal", modal: "help" }, systemContext);
  expect(hud.presentation(systemContext).system.modal).toMatchObject({
    kind: "help",
    title: "Help",
  });
  hud.input({ type: "open-modal", modal: "save" }, systemContext);
  expect(hud.input({ type: "save-slot", name: "At the gate" }, systemContext)).toEqual({
    focus: "restore",
    adapter: { type: "save", name: "At the gate" },
  });
  expect(hud.presentation(systemContext).system.modal).toBeNull();

  expect(hud.input({ type: "open-modal", modal: "load" }, systemContext))
    .toEqual({ focus: "modal" });
  expect(hud.presentation(systemContext).system).toEqual({
    blocksWorldInput: true,
    preferences: { textSpeed: "fast", speechText: false, audioVolume: 0.5 },
    modal: {
      kind: "load",
      title: "Load",
      focus: "first-control",
      slots: [{
        index: 0,
        label: "Before the gate — incompatible",
        enabled: false,
        diagnostics: ["Save Snapshot uses another Project Version."],
      }, {
        index: 1,
        label: "At the harbour",
        enabled: true,
        diagnostics: [],
      }],
      emptyText: "No Save Slots.",
    },
  });
  expect(hud.input({ type: "load-slot", index: 0 }, systemContext)).toEqual({
    focus: null,
  });
  expect(hud.input({ type: "load-slot", index: 1 }, systemContext)).toEqual({
    focus: null,
    adapter: { type: "load", index: 1 },
  });
  expect(hud.input({ type: "close-modal" }, systemContext)).toEqual({
    focus: "restore",
  });
});
