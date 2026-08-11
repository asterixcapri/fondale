import { expect, test } from "@playwright/test";

import {
  AuthoringError,
  defineCommandLexicon,
  defineCharacter,
  defineGame,
  defineHUDTheme,
  defineNoun,
  defineObject,
  defineScene,
  defineSequence,
  type DirectionStep,
  type GameInput,
  type HotspotDefinition,
} from "../src/index";

const coordinatedDirectionStep = {
  type: "direction",
  directions: [],
  duration: 1,
} satisfies DirectionStep;

void coordinatedDirectionStep;

const minimalGameInput = {
  identity: "example.typed-project",
  version: "1",
  logicalResolution: { width: 320, height: 180 },
  scenes: {},
  initialScene: "opening",
} satisfies GameInput;

void minimalGameInput;

test("defineSequence diagnoses a Cue dependency on a non-Animation direction", () => {
  try {
    defineSequence({
      steps: [{
        type: "direction",
        directions: [{
          type: "motion",
          subject: { kind: "scenery", scenery: "boat" },
          path: [{ x: 10, y: 10 }],
          duration: 1,
        }, {
          type: "camera",
          mode: "cut",
          point: { x: 10, y: 10 },
          startAfter: { direction: 0, cue: "arrival" },
        }],
      }],
    });
    throw new Error("expected defineSequence to reject the Cue dependency");
  } catch (error) {
    expect(error).toBeInstanceOf(AuthoringError);
    expect((error as AuthoringError).diagnostics).toContainEqual(expect.objectContaining({
      code: "definition.sequence.cue-source",
      owner: "sequence",
      path: "steps[0].directions[1].startAfter.direction",
    }));
  }
});

function assertHotspotTypeContract(noun: ReturnType<typeof defineNoun>) {
  const area = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 0, y: 10 }];
  const approach = { groundPoint: { x: 5, y: 5 }, facing: "front" as const };

  // @ts-expect-error Background Hotspots own and require a Noun Definition.
  const backgroundWithoutNoun: HotspotDefinition = {
    target: { kind: "background" }, area, approach,
  };
  const objectWithNoun: HotspotDefinition = {
    // @ts-expect-error Object Hotspots resolve their Noun from the Object.
    target: { kind: "object", object: "key" }, area, approach, noun,
  };
  const characterWithNoun: HotspotDefinition = {
    // @ts-expect-error Character Hotspots resolve their Noun from the Character.
    target: { kind: "character", character: "host" }, area, approach, noun,
  };
  const sceneryWithNoun: HotspotDefinition = {
    // @ts-expect-error Scenery Hotspots resolve their Noun from the owning Scene.
    target: { kind: "scenery", scenery: "gate" }, area, approach, noun,
  };

  return { backgroundWithoutNoun, objectWithNoun, characterWithNoun, sceneryWithNoun };
}

void assertHotspotTypeContract;

test("defineGame reports one owner Noun diagnostic for repeated Object Hotspots", () => {
  const object = defineObject({
    initialScene: "opening",
    initialGroundPoint: { x: 20, y: 20 },
    initialAppearance: "present",
    appearances: { present: { animations: { idle: { frames: ["object.png"], framesPerSecond: 1, loop: true } }, roles: { default: "idle" } } },
    inventoryAppearance: "object-inventory.png",
  });
  const hotspot = {
    target: { kind: "object", object: "key" } as const,
    area: [{ x: 10, y: 10 }, { x: 30, y: 10 }, { x: 20, y: 30 }],
    approach: { groundPoint: { x: 20, y: 20 }, facing: "front" as const },
  };
  const opening = defineScene({
    background: "opening.png",
    walkableRegion: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 0, y: 100 }],
    hotspots: [hotspot, hotspot] as never,
  });

  try {
    defineGame({
      identity: "missing.owner-noun",
      version: "1",
      logicalResolution: { width: 100, height: 100 },
      scenes: { opening },
      objects: { key: object },
      initialScene: "opening",
    });
    throw new Error("expected defineGame to reject the missing owner Noun");
  } catch (error) {
    expect(error).toBeInstanceOf(AuthoringError);
    expect((error as AuthoringError).diagnostics).toEqual([
      expect.objectContaining({
        code: "definition.hotspot.target-noun.required",
        owner: "interaction",
        path: "objects.key.noun",
      }),
    ]);
  }
});

test("defineGame aggregates missing Character, Object, and Scenery owner Nouns", () => {
  const area = [{ x: 10, y: 10 }, { x: 30, y: 10 }, { x: 20, y: 30 }];
  const approach = { groundPoint: { x: 20, y: 20 }, facing: "front" as const };
  const opening = defineScene({
    background: "opening.png",
    walkableRegion: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 0, y: 100 }],
    scenery: {
      gate: {
        baseline: 30,
        initialAppearance: "closed",
        appearances: { closed: { kind: "background-region", area } },
      },
    },
    hotspots: [
      { target: { kind: "character", character: "host" }, area, approach },
      { target: { kind: "object", object: "key" }, area, approach },
      {
        target: { kind: "scenery", scenery: "gate" }, area, approach,
        when: { variable: "missing", equals: true },
      },
    ],
  });
  const host = defineCharacter({
    initialScene: "opening",
    initialGroundPoint: { x: 20, y: 20 },
    initialFacing: "front",
    initialAppearance: "idle",
    appearances: { idle: { animations: { idle: { frames: ["host.png"], framesPerSecond: 1, loop: true } }, roles: { default: "idle" } } },
    movementSpeed: 60,
  });
  const key = defineObject({
    initialScene: "opening",
    initialGroundPoint: { x: 20, y: 20 },
    initialAppearance: "present",
    appearances: { present: { animations: { idle: { frames: ["key.png"], framesPerSecond: 1, loop: true } }, roles: { default: "idle" } } },
    inventoryAppearance: "key-inventory.png",
  });

  try {
    defineGame({
      identity: "missing.owner-nouns",
      version: "1",
      logicalResolution: { width: 100, height: 100 },
      scenes: { opening },
      characters: { host },
      objects: { key },
      initialScene: "opening",
    });
    throw new Error("expected defineGame to reject missing owner Nouns");
  } catch (error) {
    expect(error).toBeInstanceOf(AuthoringError);
    expect((error as AuthoringError).diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({ path: "characters.host.noun" }),
      expect.objectContaining({ path: "objects.key.noun" }),
      expect.objectContaining({ path: "scenes.opening.scenery.gate.noun" }),
      expect.objectContaining({ code: "reference.variable" }),
    ]));
    expect((error as AuthoringError).diagnostics).toHaveLength(4);
  }
});

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

test("defineGame aggregates Project Identity, Project Version, and capability diagnostics", () => {
  const opening = defineScene({
    background: "opening.png",
    walkableRegion: [
      { x: 0, y: 0 },
      { x: 320, y: 0 },
      { x: 320, y: 180 },
      { x: 0, y: 180 },
    ],
  });
  const hudTheme = defineHUDTheme({
    font: { family: "Fondale", source: "fondale.woff2" },
    colors: {
      backing: "#000000",
      border: "#111111",
      text: "#ffffff",
      preferred: "#eeeeee",
      selected: "#dddddd",
      inventoryWell: "#222222",
    },
    opacity: 1,
    maxSpeechWidth: 160,
    cursors: {
      left: "left.png",
      right: "right.png",
      up: "up.png",
      down: "down.png",
      enter: "enter.png",
    },
    speechColors: { missingCharacter: "#abcdef" },
  });

  try {
    defineGame({
      identity: " ",
      version: "",
      logicalResolution: { width: 320, height: 180 },
      scenes: { opening },
      initialScene: "opening",
      hudTheme,
    });
    throw new Error("expected invalid project composition");
  } catch (error) {
    expect(error).toBeInstanceOf(AuthoringError);
    expect((error as AuthoringError).diagnostics).toEqual([
      expect.objectContaining({
        code: "reference.character",
        owner: "hud",
        path: "hudTheme.speechColors.missingCharacter",
      }),
      expect.objectContaining({
        code: "definition.project.identity",
        owner: "game-project",
        path: "identity",
      }),
      expect.objectContaining({
        code: "definition.project.version",
        owner: "game-project",
        path: "version",
      }),
    ]);
  }
});

test("defineScene accepts and freezes a Scene Size independently of the viewport", () => {
  const panoramic = defineScene({
    background: "panoramic.png",
    size: { width: 640, height: 360 },
    walkableRegion: [
      { x: 0, y: 0 },
      { x: 640, y: 0 },
      { x: 640, y: 360 },
      { x: 0, y: 360 },
    ],
  });

  expect(panoramic.size).toEqual({ width: 640, height: 360 });
  expect(Object.isFrozen(panoramic.size)).toBe(true);
  expect(() => defineGame({
    identity: "example.panoramic",
    version: "1",
    logicalResolution: { width: 320, height: 180 },
    scenes: { panoramic },
    initialScene: "panoramic",
  })).not.toThrow();
});

test("defineScene rejects Scene Size dimensions that are not positive integers", () => {
  for (const size of [
    { width: 0, height: 180 },
    { width: 320.5, height: 180 },
    { width: 320, height: Number.POSITIVE_INFINITY },
    { width: 320 } as never,
  ]) {
    expect(() => defineScene({
      background: "invalid.png",
      size,
      walkableRegion: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 0, y: 10 },
      ],
    })).toThrow(AuthoringError);
  }
});

test("defineGame rejects a Scene Size axis smaller than its Logical Resolution", () => {
  const tooNarrow = defineScene({
    background: "narrow.png",
    size: { width: 319, height: 240 },
    walkableRegion: [
      { x: 0, y: 0 },
      { x: 319, y: 0 },
      { x: 0, y: 240 },
    ],
  });

  try {
    defineGame({
      identity: "example.too-narrow",
      version: "1",
      logicalResolution: { width: 320, height: 180 },
      scenes: { tooNarrow },
      initialScene: "tooNarrow",
    });
    throw new Error("expected the Scene Size to be rejected");
  } catch (error) {
    expect(error).toBeInstanceOf(AuthoringError);
    expect((error as AuthoringError).diagnostics).toContainEqual(expect.objectContaining({
      code: "definition.scene-size.viewport-minimum",
      path: "scenes.tooNarrow.size.width",
    }));
  }
});

test("defineGame validates every Scene geometry family against Scene Size", () => {
  const square = [
    { x: 0, y: 0 }, { x: 200, y: 0 }, { x: 200, y: 200 }, { x: 0, y: 200 },
  ];
  const noun = defineNoun({
    labels: [{ text: "Far landmark" }],
    preferredVerbs: [{ verb: "walk-to" }],
    cases: [{
      verb: "use",
      response: { text: "Placed in the panoramic Scene." },
      operations: [{ type: "place-selected-object", groundPoint: { x: 180, y: 180 } }],
    }],
  });
  const panoramic = defineScene({
    background: "panoramic.png",
    size: { width: 200, height: 200 },
    walkableRegion: square,
    perspectiveScale: [{ y: 150, scale: 0.8 }],
    scenery: {
      tower: {
        baseline: 180,
        position: { x: 170, y: 180 },
        initialAppearance: "visible",
        appearances: {
          visible: {
            kind: "background-region",
            area: [{ x: 140, y: 140 }, { x: 190, y: 140 }, { x: 190, y: 190 }],
          },
        },
      },
    },
    hotspots: [{
      target: { kind: "background" },
      area: [{ x: 140, y: 140 }, { x: 190, y: 140 }, { x: 190, y: 190 }],
      approach: { groundPoint: { x: 160, y: 170 }, facing: "back" },
      noun,
    }],
    entrances: { far: { groundPoint: { x: 180, y: 180 }, facing: "left" } },
    passages: [{
      area: [{ x: 150, y: 150 }, { x: 200, y: 150 }, { x: 200, y: 200 }],
      approach: { groundPoint: { x: 175, y: 175 }, facing: "right" },
      noun,
      direction: "right",
      destination: { scene: "fixed", entrance: "fromPanoramic" },
    }],
  });
  const fixed = defineScene({
    background: "fixed.png",
    walkableRegion: [
      { x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 },
    ],
    entrances: { fromPanoramic: { groundPoint: { x: 50, y: 50 }, facing: "left" } },
  });
  const player = defineCharacter({
    initialScene: "panoramic",
    initialGroundPoint: { x: 180, y: 180 },
    initialFacing: "front",
    initialAppearance: "idle",
    appearances: { idle: { animations: { idle: { frames: ["player.png"], framesPerSecond: 1, loop: true } }, roles: { default: "idle", walking: "idle" } } },
    movementSpeed: 60,
  });
  const object = defineObject({
    initialScene: "panoramic",
    initialGroundPoint: { x: 175, y: 175 },
    initialAppearance: "present",
    appearances: { present: { animations: { idle: { frames: ["object.png"], framesPerSecond: 1, loop: true } }, roles: { default: "idle" } } },
    inventoryAppearance: "object-inventory.png",
  });

  expect(() => defineGame({
    identity: "example.scene-size-geometry",
    version: "1",
    logicalResolution: { width: 100, height: 100 },
    scenes: { panoramic, fixed },
    characters: { player },
    playerCharacter: "player",
    objects: { object },
    commandLexicon: defineCommandLexicon({
      inventory: { select: "Hold {noun}", deselect: "Put away {noun}" },
      verbs: {
        open: "Open", "pick-up": "Pick up", push: "Push", close: "Close",
        "look-at": "Look at", pull: "Pull", give: "Give", "talk-to": "Talk to", use: "Use",
      },
      patterns: {
        unary: "{verb} {noun}", give: "{verb} {first} to {second}", use: "{verb} {first} with {second}",
      },
    }),
    commandFallbacks: Object.fromEntries([
      "open", "pick-up", "push", "close", "look-at", "pull", "give", "talk-to", "use",
    ].map((verb) => [verb, { text: "Nothing happens." }])) as never,
    initialScene: "panoramic",
  })).not.toThrow();
});

test("an Author defines immutable Noun and Command Lexicon definitions through the root API", () => {
  const noun = defineNoun({
    labels: [
      { when: { variable: "doorOpen", equals: true }, text: "Porta aperta" },
      { text: "Porta" },
    ],
    preferredVerbs: [{ verb: "open" }],
    secondaryVerbs: [{ verb: "look-at" }],
    objectVerbs: [{ verb: "use" }],
    cases: [{
      verb: "look-at",
      response: { text: "Una porta molto antica." },
    }],
    fallbacks: {
      open: { response: { text: "Non si apre." } },
    },
  });
  const lexicon = defineCommandLexicon({
    inventory: { select: "Prendi {noun}", deselect: "Riponi {noun}" },
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
  expect(Object.isFrozen(noun.secondaryVerbs)).toBe(true);
  expect(Object.isFrozen(noun.objectVerbs)).toBe(true);
  expect(Object.isFrozen(lexicon.verbs)).toBe(true);
  expect(Object.isFrozen(lexicon.inventory)).toBe(true);
  expect(lexicon.verbs["look-at"]).toBe("Guarda");
});

test("Noun and Command Lexicon helpers aggregate independent local diagnostics", () => {
  expect(() => defineNoun({
    labels: [{ when: { variable: "known", equals: true }, text: "Porta" }],
    preferredVerbs: [{ when: { variable: "open", equals: true }, verb: "open" }],
    secondaryVerbs: [{ when: { variable: "known", equals: true }, verb: "look-at" }],
    objectVerbs: [{ when: { variable: "known", equals: true }, verb: "use" }],
    cases: [],
  })).toThrow(AuthoringError);

  try {
    defineCommandLexicon({
      inventory: { select: "Prendi", deselect: "Riponi {noun}" },
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

test("an Author defines explicit non-empty Narration throughout a Sequence", () => {
  const sequence = defineSequence({
    steps: [{
      type: "branch",
      cases: [{
        when: { variable: "remembered", equals: true },
        steps: [{ type: "narration", text: "The harbour remembers." }],
      }],
      fallback: [{
        type: "choice",
        alternatives: [{
          text: "Wait",
          steps: [{ type: "narration", text: "Night settles over the quay." }],
        }],
        fallback: { text: "Leave", steps: [] },
      }],
    }],
  });

  expect(sequence.steps[0]).toMatchObject({ type: "branch" });
  expect(Object.isFrozen(sequence.steps)).toBe(true);
  expect(() => defineSequence({
    steps: [{ type: "narration", text: "  " }],
  })).toThrow(AuthoringError);
});

test("a Sequence preserves a URL Line audio reference immutably", () => {
  const audio = new URL("https://example.test/line.ogg");
  const sequence = defineSequence({
    steps: [{ type: "line", character: "guide", text: "Listen.", audio }],
  });
  const line = sequence.steps[0];

  expect(line?.type).toBe("line");
  if (line?.type !== "line") return;
  expect(line.audio).toBeInstanceOf(URL);
  expect((line.audio as URL).href).toBe(audio.href);
  expect(line.audio).not.toBe(audio);
  expect(Object.isFrozen(line)).toBe(true);
});

test("a Line requires an explicit Character", () => {
  expect(() => defineSequence({
    steps: [{ type: "line", text: "Nobody says this." } as never],
  })).toThrow(/Line requires a Character/i);
});

test("a Command Case exposes one semantic textual outcome", () => {
  const noun = defineNoun({
    labels: [{ text: "Host" }],
    preferredVerbs: [{ verb: "talk-to" }],
    cases: [{
      verb: "talk-to",
      line: { character: "host", text: "Welcome." },
    }],
  });

  expect(noun.cases[0]?.line).toEqual({ character: "host", text: "Welcome." });
  expect(Object.isFrozen(noun.cases[0]?.line)).toBe(true);

  expect(() => defineNoun({
    labels: [{ text: "Door" }],
    preferredVerbs: [{ verb: "look-at" }],
    cases: [{
      verb: "look-at",
      response: { text: "Neutral feedback.", speaker: "host" },
    } as never],
  })).toThrow(/Command Response cannot declare a speaker or presentation/i);

  expect(() => defineNoun({
    labels: [{ text: "Door" }],
    preferredVerbs: [{ verb: "look-at" }],
    cases: [{
      verb: "look-at",
      response: { text: "Neutral feedback." },
      sequence: "inspection",
    }],
  })).toThrow(/one textual outcome/i);

  expect(() => defineNoun({
    labels: [{ text: "Door" }],
    preferredVerbs: [{ verb: "look-at" }],
    cases: [{
      verb: "look-at",
      line: { character: "host", text: "Welcome." },
      operations: [{ type: "start-sequence", sequence: "inspection" }],
    }],
  })).toThrow(/one textual outcome/i);
});

test("a spoken Choice requires a Player Character", () => {
  const opening = defineScene({
    background: "opening.png",
    walkableRegion: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 0, y: 100 }],
  });
  const spokenChoice = defineSequence({
    steps: [{
      type: "choice",
      alternatives: [{ text: "Speak", steps: [] }],
      fallback: { text: "Leave", spoken: false, steps: [] },
    }],
  });

  expect(() => defineGame({
    identity: "choice.without-player",
    version: "1",
    logicalResolution: { width: 100, height: 100 },
    scenes: { opening },
    sequences: { spokenChoice },
    initialScene: "opening",
  })).toThrow(/spoken Choice requires a Player Character/i);
});

test("an Object-moving Command Case must provide player feedback", () => {
  expect(() => defineNoun({
    labels: [{ text: "Key" }],
    preferredVerbs: [{ verb: "pick-up" }],
    cases: [{
      verb: "pick-up",
      operations: [{ type: "collect-target-object" }],
    }],
  })).toThrow(/must provide a Line, Command Response, or Sequence/i);
});

test("defineGame composes Command authoring and aggregates Noun reference failures", () => {
  const noun = defineNoun({
    labels: [{ when: { variable: "missingVariable", equals: true }, text: "Antica porta" }, { text: "Porta" }],
    preferredVerbs: [{ verb: "look-at" }],
    cases: [{
      verb: "use",
      firstNoun: "missingObject",
      sequence: "missingSequence",
    }, {
      verb: "look-at",
      line: { text: "Non succede nulla.", character: "missingCharacter" },
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
        inventory: { select: "Prendi {noun}", deselect: "Riponi {noun}" },
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
    const diagnostics = (error as AuthoringError).diagnostics;
    expect(diagnostics.map(({ code }) => code)).toEqual(expect.arrayContaining([
      "definition.command.silent",
      "reference.character",
      "reference.object",
      "reference.sequence",
      "reference.variable",
    ]));
    expect(diagnostics.filter(({ code }) =>
      code === "definition.command.silent" ||
      code === "reference.object" ||
      code === "reference.sequence" ||
      code === "reference.variable"
    ).every(({ owner }) => owner === "interaction")).toBe(true);
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
        animations: { walking: {
          frames: {
            side: { image: "side.png", count: 0 },
            front: { image: "front.png", count: 1 },
            back: { image: "back.png", count: 1 },
          },
          framesPerSecond: Number.NaN,
        } },
        roles: { default: "walking", walking: "walking" },
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

test("defineGame bounds a Character-owned placement operation to its Scene Size", () => {
  const guide = defineCharacter({
    initialScene: "opening",
    initialGroundPoint: { x: 20, y: 20 },
    initialFacing: "front",
    initialAppearance: "idle",
    appearances: { idle: { animations: { idle: { frames: ["guide.png"], framesPerSecond: 1, loop: true } }, roles: { default: "idle" } } },
    movementSpeed: 60,
    noun: defineNoun({
      labels: [{ text: "Guide" }],
      preferredVerbs: [{ verb: "use" }],
      cases: [{
        verb: "use",
        response: { text: "Placed." },
        operations: [{ type: "place-selected-object", groundPoint: { x: 101, y: 20 } }],
      }],
    }),
  });
  const scene = defineScene({
    background: "scene.png",
    walkableRegion: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 0, y: 100 }],
    hotspots: [{
      target: { kind: "character", character: "guide" },
      area: [{ x: 10, y: 10 }, { x: 30, y: 10 }, { x: 20, y: 30 }],
      approach: { groundPoint: { x: 20, y: 20 }, facing: "front" },
    }],
  });

  expect(() => defineGame({
    identity: "invalid.character-placement",
    version: "1",
    logicalResolution: { width: 100, height: 100 },
    scenes: { opening: scene },
    characters: { guide },
    initialScene: "opening",
  })).toThrow(/placed Object Ground Point/i);
});

test("defineGame bounds portable Object and Sequence placements to every possible destination Scene", () => {
  const portableNoun = defineNoun({
    labels: [{ text: "Portable object" }],
    preferredVerbs: [{ verb: "use" }],
    cases: [{
      verb: "use",
      response: { text: "Placed." },
      operations: [{ type: "place-selected-object", groundPoint: { x: 150, y: 20 } }],
    }],
  });
  const portableObject = defineObject({
    initialScene: "large",
    initialGroundPoint: { x: 150, y: 20 },
    initialAppearance: "idle",
    appearances: { idle: { animations: { idle: { frames: ["object.png"], framesPerSecond: 1, loop: true } }, roles: { default: "idle" } } },
    inventoryAppearance: "inventory.png",
    noun: portableNoun,
  });
  const small = defineScene({
    background: "small.png",
    size: { width: 100, height: 100 },
    walkableRegion: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 0, y: 100 }],
  });
  const large = defineScene({
    background: "large.png",
    size: { width: 200, height: 100 },
    walkableRegion: [{ x: 0, y: 0 }, { x: 200, y: 0 }, { x: 0, y: 100 }],
  });

  const placementCodes = (define: () => unknown) => {
    try {
      define();
      throw new Error("expected defineGame to reject the placement");
    } catch (error) {
      expect(error).toBeInstanceOf(AuthoringError);
      return (error as AuthoringError).diagnostics.map(({ code }) => code);
    }
  };
  expect(placementCodes(() => defineGame({
    identity: "invalid.portable-object-placement",
    version: "1",
    logicalResolution: { width: 100, height: 100 },
    scenes: { small, large },
    objects: { portableObject },
    initialScene: "small",
  }))).toContain("definition.operation.ground-point");

  const placement = defineSequence({
    steps: [{
      type: "operations",
      operations: [{ type: "place-selected-object", groundPoint: { x: 150, y: 20 } }],
    }],
  });
  expect(placementCodes(() => defineGame({
    identity: "invalid.sequence-placement",
    version: "1",
    logicalResolution: { width: 100, height: 100 },
    scenes: { small, large },
    sequences: { placement },
    initialScene: "small",
  }))).toContain("definition.operation.ground-point");
});
