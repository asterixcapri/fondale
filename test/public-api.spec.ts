import { expect, test } from "@playwright/test";

import {
  AuthoringError,
  defineCommandLexicon,
  defineCharacter,
  defineGame,
  defineHUDTheme,
  defineNoun,
  defineScene,
  defineSequence,
} from "../src/index";

test("an Author defines an immutable one-Scene Game Project through the root API", () => {
  const opening = defineScene({
    background: new URL("https://example.test/opening.png"),
    walkableRegion: [
      { x: 0, y: 0 },
      { x: 320, y: 0 },
      { x: 320, y: 180 },
      { x: 0, y: 180 },
    ],
  });

  const project = defineGame({
    identity: "example.adventure",
    version: "1",
    logicalResolution: { width: 320, height: 180 },
    scenes: { opening },
    initialScene: "opening",
  });

  expect(Object.isFrozen(project)).toBe(true);
  expect(Object.isFrozen(opening)).toBe(true);
});

test("an Author defines immutable Noun and Command Lexicon definitions through the root API", () => {
  const noun = defineNoun({
    labels: [
      { when: { variable: "doorOpen", equals: true }, text: "Porta aperta" },
      { text: "Porta" },
    ],
    preferredVerbs: [{ verb: "open" }],
    cases: [{
      verb: "look-at",
      response: { text: "Una porta molto antica.", presentation: "narration" },
    }],
    fallbacks: {
      open: { response: { text: "Non si apre." } },
    },
  });
  const lexicon = defineCommandLexicon({
    verbs: {
      open: "Apri",
      "pick-up": "Raccogli",
      push: "Spingi",
      close: "Chiudi",
      "look-at": "Guarda",
      pull: "Tira",
      give: "Dai",
      "talk-to": "Parla con",
      use: "Usa",
    },
    patterns: {
      unary: "{verb} {noun}",
      give: "{verb} {first} a {second}",
      use: "{verb} {first} con {second}",
    },
  });

  expect(Object.isFrozen(noun)).toBe(true);
  expect(Object.isFrozen(noun.labels)).toBe(true);
  expect(Object.isFrozen(lexicon.verbs)).toBe(true);
  expect(lexicon.verbs["look-at"]).toBe("Guarda");
});

test("Noun and Command Lexicon helpers aggregate independent local diagnostics", () => {
  expect(() => defineNoun({
    labels: [{ when: { variable: "known", equals: true }, text: "Porta" }],
    preferredVerbs: [{ when: { variable: "open", equals: true }, verb: "open" }],
    cases: [],
  })).toThrow(AuthoringError);

  try {
    defineCommandLexicon({
      verbs: {
        open: "",
        "pick-up": "Raccogli",
        push: "Spingi",
        close: "Chiudi",
        "look-at": "Guarda",
        pull: "Tira",
        give: "Dai",
        "talk-to": "Parla con",
        use: "Usa",
      },
      patterns: {
        unary: "{noun}",
        give: "{verb} {first}",
        use: "{verb} {second}",
      },
    });
    throw new Error("expected invalid Command Lexicon to be rejected");
  } catch (error) {
    expect(error).toBeInstanceOf(AuthoringError);
    expect((error as AuthoringError).diagnostics.map(({ code }) => code)).toEqual([
      "definition.command-lexicon.pattern",
      "definition.command-lexicon.pattern",
      "definition.command-lexicon.pattern",
      "definition.command-lexicon.label",
    ]);
  }
});

test("HUD Theme is immutable and aggregates incomplete visual assets", () => {
  const cursor = new URL("https://example.test/cursor.png");
  const theme = defineHUDTheme({
    font: { family: "Fondale Test", source: new URL("https://example.test/font.ttf") },
    colors: {
      text: "#fff", preferred: "#f90", selected: "#0cc", backing: "#123456",
      border: "#abc", inventoryWell: "#012",
    },
    opacity: 0.7,
    maxSpeechWidth: 180,
    cursors: { left: cursor, right: cursor, up: cursor, down: cursor, enter: cursor },
    speechColors: { player: "#fff" },
  });
  expect(Object.isFrozen(theme)).toBe(true);
  expect(Object.isFrozen(theme.colors)).toBe(true);

  expect(() => defineHUDTheme({
    ...theme,
    font: { family: "", source: "" },
    colors: { ...theme.colors, selected: "turquoise" },
    opacity: 2,
    maxSpeechWidth: 0,
    cursors: { ...theme.cursors, enter: "" },
  })).toThrow(AuthoringError);
});

test("a Choice cannot expose more than six alternatives", () => {
  expect(() => defineSequence({
    steps: [{
      type: "choice",
      alternatives: Array.from({ length: 7 }, (_, index) => ({
        text: `Alternative ${index + 1}`,
        steps: [],
      })),
      fallback: { text: "Leave", steps: [] },
    }],
  })).toThrow(/at most six/i);
});

test("a Choice may declare more than six mutually exclusive alternatives", () => {
  const sequence = defineSequence({
    steps: [{
      type: "choice",
      alternatives: [
        ...Array.from({ length: 4 }, (_, index) => ({
          text: `Open ${index + 1}`,
          when: { variable: "doorOpen", equals: true } as const,
          steps: [],
        })),
        ...Array.from({ length: 3 }, (_, index) => ({
          text: `Closed ${index + 1}`,
          when: { variable: "doorOpen", equals: false } as const,
          steps: [],
        })),
      ],
      fallback: { text: "Leave", steps: [] },
    }],
  });

  expect(sequence.steps).toHaveLength(1);
});

test("an Object-moving Command Case must provide player feedback", () => {
  expect(() => defineNoun({
    labels: [{ text: "Key" }],
    preferredVerbs: [{ verb: "pick-up" }],
    cases: [{
      verb: "pick-up",
      operations: [{ type: "collect-target-object" }],
    }],
  })).toThrow(/must provide a Command Response or Sequence/i);
});

test("defineGame composes Command authoring and aggregates Noun reference failures", () => {
  const noun = defineNoun({
    labels: [{ when: { variable: "missingVariable", equals: true }, text: "Antica porta" }, { text: "Porta" }],
    preferredVerbs: [{ verb: "look-at" }],
    cases: [{
      verb: "use",
      firstNoun: "missingObject",
      sequence: "missingSequence",
      response: { text: "Non succede nulla.", speaker: "missingCharacter" },
    }],
  });
  const scene = defineScene({
    background: "scene.png",
    walkableRegion: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 0, y: 100 }],
    hotspots: [{
      target: { kind: "background" },
      area: [{ x: 1, y: 1 }, { x: 10, y: 1 }, { x: 1, y: 10 }],
      approach: { groundPoint: { x: 2, y: 2 }, facing: "front" },
      noun,
    }],
  });

  try {
    defineGame({
      identity: "commands.invalid",
      version: "1",
      logicalResolution: { width: 100, height: 100 },
      scenes: { opening: scene },
      initialScene: "opening",
      commandLexicon: defineCommandLexicon({
        verbs: {
          open: "Apri", "pick-up": "Raccogli", push: "Spingi",
          close: "Chiudi", "look-at": "Guarda", pull: "Tira",
          give: "Dai", "talk-to": "Parla con", use: "Usa",
        },
        patterns: {
          unary: "{verb} {noun}",
          give: "{verb} {first} a {second}",
          use: "{verb} {first} con {second}",
        },
      }),
    });
    throw new Error("expected invalid Command references to be rejected");
  } catch (error) {
    expect(error).toBeInstanceOf(AuthoringError);
    expect((error as AuthoringError).diagnostics.map(({ code }) => code)).toEqual(expect.arrayContaining([
      "definition.command.silent",
      "reference.character",
      "reference.object",
      "reference.sequence",
      "reference.variable",
    ]));
  }
});

test("a definition reports all independent local problems as Authoring Diagnostics", () => {
  expect(() =>
    defineScene({
      background: new URL("https://example.test/opening.png"),
      walkableRegion: [
        { x: Number.NaN, y: 0 },
        { x: 1, y: 1 },
      ],
    }),
  ).toThrow(AuthoringError);

  try {
    defineScene({
      background: new URL("https://example.test/opening.png"),
      walkableRegion: [
        { x: Number.NaN, y: 0 },
        { x: 1, y: 1 },
      ],
    });
  } catch (error) {
    expect(error).toBeInstanceOf(AuthoringError);
    expect((error as AuthoringError).diagnostics.map(({ code }) => code)).toEqual([
      "definition.point.finite",
      "definition.polygon.vertices",
    ]);
  }
});

test("a self-intersecting Walkable Region is rejected at the Scene helper", () => {
  expect(() =>
    defineScene({
      background: "scene.png",
      walkableRegion: [
        { x: 0, y: 0 },
        { x: 20, y: 20 },
        { x: 0, y: 20 },
        { x: 20, y: 0 },
      ],
    }),
  ).toThrow(/polygon cannot cross itself/i);
});

test("local helpers reject invalid walking rates and interaction polygons", () => {
  expect(() => defineCharacter({
    initialScene: "opening",
    initialGroundPoint: { x: 0, y: 0 },
    initialFacing: "front",
    initialAppearance: "walk",
    movementSpeed: 10,
    appearances: {
      walk: {
        kind: "walking",
        side: { image: "side.png", frames: 0 },
        front: { image: "front.png", frames: 1 },
        back: { image: "back.png", frames: 1 },
        framesPerSecond: Number.NaN,
      },
    },
  })).toThrow(/frames per second/i);

  expect(() => defineScene({
    background: "scene.png",
    walkableRegion: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 0, y: 100 }],
    hotspots: [{
      target: { kind: "background" },
      area: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
      approach: { groundPoint: { x: 1, y: 1 }, facing: "front" },
      noun: defineNoun({
        labels: [{ text: "Nothing" }],
        preferredVerbs: [{ verb: "look-at" }],
        cases: [],
      }),
    }],
  })).toThrow(/at least three vertices/i);
});

test("defineGame aggregates independent cross-definition reference failures", () => {
  const scene = defineScene({
    background: "scene.png",
    walkableRegion: [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
    ],
    hotspots: [
      {
        target: { kind: "character", character: "missing" },
        area: [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
          { x: 10, y: 10 },
        ],
        approach: { groundPoint: { x: 120, y: 120 }, facing: "front" },
        when: { variable: "missing", equals: true },
        noun: defineNoun({
          labels: [{ text: "Missing" }],
          preferredVerbs: [{ verb: "talk-to" }],
          cases: [{ verb: "talk-to", sequence: "missing", response: { text: "Response" } }],
        }),
      },
    ],
    passages: [
      {
        area: [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
          { x: 10, y: 10 },
        ],
        approach: { groundPoint: { x: 5, y: 5 }, facing: "front" },
        noun: defineNoun({
          labels: [{ text: "Missing destination" }],
          preferredVerbs: [{ verb: "walk-to" }],
          cases: [],
        }),
        direction: "right",
        destination: { scene: "missing", entrance: "missing" },
      },
    ],
  });

  try {
    defineGame({
      identity: "invalid.references",
      version: "1",
      logicalResolution: { width: 50, height: 50 },
      scenes: { opening: scene },
      initialScene: "opening",
    });
    throw new Error("expected defineGame to reject invalid references");
  } catch (error) {
    expect(error).toBeInstanceOf(AuthoringError);
    const codes = (error as AuthoringError).diagnostics.map(({ code }) => code);
    expect(codes).toEqual(expect.arrayContaining([
      "definition.approach.bounds",
      "definition.scene-space.bounds",
      "reference.hotspot.target",
      "reference.passage.scene",
      "reference.sequence",
      "reference.variable",
    ]));
  }
});

test("defineGame rejects a non-finite Object placement operation", () => {
  const scene = defineScene({
    background: "scene.png",
    walkableRegion: [{ x: 0, y: 0 }, { x: 50, y: 0 }, { x: 0, y: 50 }],
    hotspots: [{
      target: { kind: "background" },
      area: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 0, y: 10 }],
      approach: { groundPoint: { x: 5, y: 5 }, facing: "front" },
      noun: defineNoun({
        labels: [{ text: "Receptacle" }],
        preferredVerbs: [{ verb: "use" }],
        cases: [{
          verb: "use",
          response: { text: "Placed." },
          operations: [{
            type: "place-selected-object",
            groundPoint: { x: Number.NaN, y: 5 },
          }],
        }],
      }),
    }],
  });
  expect(() => defineGame({
    identity: "invalid.placement",
    version: "1",
    logicalResolution: { width: 50, height: 50 },
    scenes: { opening: scene },
    initialScene: "opening",
  })).toThrow(/placed Object Ground Point/i);
});
