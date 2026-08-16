import { expect, test } from "@playwright/test";

import { type CharacterDefinition, type SceneDefinition } from "../world";
import {
  compileGameProject,
  getBrowserProjectView,
  getGameSessionCompositionView,
  getSaveCompositionView,
  type GameProject,
} from ".";

const opening = {
  background: "opening.png",
  walkableRegion: [
    { x: 0, y: 0 },
    { x: 320, y: 0 },
    { x: 320, y: 180 },
    { x: 0, y: 180 },
  ],
} satisfies SceneDefinition;

test("Game Project compilation returns ordered diagnostics without throwing", () => {
  const result = compileGameProject({
    identity: " ",
    version: " ",
    logicalResolution: { width: 0, height: 180 },
    scenes: {
      opening: {
        background: "opening.png",
        walkableRegion: [
          { x: 0, y: 0 },
          { x: 320, y: 0 },
          { x: 320, y: 180 },
          { x: 0, y: 180 },
        ],
      },
    },
    initialScene: "missing",
  });

  expect(result).toMatchObject({
    ok: false,
    diagnostics: [
      expect.objectContaining({ owner: "game-project", path: "identity" }),
      expect.objectContaining({ owner: "world", path: "initialScene" }),
      expect.objectContaining({
        owner: "game-project",
        path: "logicalResolution.width",
      }),
      expect.objectContaining({ owner: "game-project", path: "version" }),
    ],
  });
  if (result.ok) return;
  expect(Object.isFrozen(result)).toBe(true);
  expect(Object.isFrozen(result.diagnostics)).toBe(true);
  expect(result.diagnostics.every(Object.isFrozen)).toBe(true);
  expect(result).not.toHaveProperty("project");
});

test("Game Project compilation suppresses checks derived from an invalid Scene Size", () => {
  const result = compileGameProject({
    identity: "example.invalid-scene-size",
    version: "1",
    logicalResolution: { width: 100, height: 100 },
    scenes: {
      opening: {
        background: "opening.png",
        size: { width: 0, height: 100 },
        walkableRegion: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 0, y: 100 },
        ],
      },
    },
    initialScene: "opening",
  });

  expect(result).toMatchObject({
    ok: false,
    diagnostics: [
      expect.objectContaining({
        code: "definition.scene-size.positive-integer",
        path: "scenes.opening.size.width",
      }),
    ],
  });
});

test("Game Project compilation resolves defaults into a deeply isolated snapshot", () => {
  const background = new URL("https://example.test/opening.png?stable=true");
  const logicalResolution = { width: 320, height: 180 };
  const walkableRegion = [
    { x: 0, y: 0 },
    { x: 320, y: 0 },
    { x: 320, y: 180 },
    { x: 0, y: 180 },
  ];
  const variables = { gateOpen: false };
  const input = {
    identity: "example.isolated-project",
    version: "1",
    logicalResolution,
    scenes: { opening: { background, walkableRegion } },
    variables,
    initialScene: "opening",
  };

  const compilation = compileGameProject(input);

  expect(compilation.ok).toBe(true);
  if (!compilation.ok) return;
  const session = getGameSessionCompositionView(compilation.project);
  const browser = getBrowserProjectView(compilation.project);
  expect(browser.startup.letterboxColor).toBe("#000000");
  expect(session.world.scenes.opening?.size).toEqual(logicalResolution);
  expect(session.world.scenes.opening?.background).toBeInstanceOf(URL);
  expect(session.world.scenes.opening?.background).not.toBe(background);
  expect(Object.isFrozen(session.world.scenes.opening?.walkableRegion)).toBe(
    true,
  );
  expect(Object.isFrozen(session.world.scenes.opening?.walkableRegion[0])).toBe(
    true,
  );

  expect(Object.isFrozen(input)).toBe(false);
  expect(Object.isFrozen(logicalResolution)).toBe(false);
  expect(Object.isFrozen(walkableRegion)).toBe(false);
  expect(Object.isFrozen(walkableRegion[0])).toBe(false);
  expect(Object.isFrozen(variables)).toBe(false);

  variables.gateOpen = true;
  walkableRegion[0]!.x = 40;
  background.pathname = "/changed.png";

  expect(session.gameProject.variables.gateOpen).toBe(false);
  expect(session.world.scenes.opening?.walkableRegion[0]?.x).toBe(0);
  const compiledBackground = session.world.scenes.opening?.background as URL;
  expect(compiledBackground.pathname).toBe("/opening.png");
  expect(new URL(compiledBackground).href).toBe(
    "https://example.test/opening.png?stable=true",
  );
  expect(() => {
    compiledBackground.pathname = "/tampered.png";
  }).toThrow(TypeError);
  expect(() => {
    compiledBackground.searchParams.set("tampered", "true");
  }).toThrow(TypeError);
  expect(() => {
    compiledBackground.searchParams.forEach((_value, _key, leaked) => {
      leaked.set("tampered", "true");
    });
  }).toThrow(TypeError);
  expect(compiledBackground.href).toBe(
    "https://example.test/opening.png?stable=true",
  );
});

test("Game Project compilation severs every supported authored alias", () => {
  const frame = new URL("https://example.test/player.png");
  const inventory = new URL("https://example.test/key.png");
  const font = new URL("https://example.test/font.ttf");
  const cursor = new URL("https://example.test/cursor.png");
  const input = {
    identity: "example.complete-snapshot",
    version: "1",
    logicalResolution: { width: 100, height: 100 },
    initialScene: "opening",
    playerCharacter: "player",
    variables: { remembered: false },
    scenes: {
      opening: {
        background: new URL("https://example.test/background.png"),
        walkableRegion: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
          { x: 0, y: 100 },
        ],
        scenery: {
          curtain: {
            baseline: 50,
            position: { x: 25, y: 50 },
            initialAppearance: "closed",
            appearances: {
              closed: {
                kind: "background-region",
                area: [
                  { x: 10, y: 10 },
                  { x: 20, y: 10 },
                  { x: 20, y: 20 },
                ],
              },
            },
          },
        },
      },
    },
    characters: {
      player: {
        initialScene: "opening",
        initialGroundPoint: { x: 50, y: 50 },
        initialFacing: "front",
        initialAppearance: "normal",
        movementSpeed: 60,
        appearances: {
          normal: {
            animations: {
              idle: { sheets: { left: { image: frame, frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, right: { image: frame, frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, front: { image: frame, frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, back: { image: frame, frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) } }, timing: { framesPerSecond: 1, loop: true, cues: { ready: 0 } } },
              walk: { sheets: { left: { image: frame, frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, right: { image: frame, frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, front: { image: frame, frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, back: { image: frame, frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) } }, timing: { framesPerSecond: 1, loop: true } },
            },
            roles: { default: "idle", walking: "walk" },
            visualAnchor: { x: 1, y: 2 },
          },
        },
      },
    },
    objects: {
      key: {
        initialScene: "opening",
        initialGroundPoint: { x: 20, y: 20 },
        initialAppearance: "normal",
        inventoryAppearance: inventory,
        appearances: {
          normal: {
            animations: {
              idle: { sheet: { image: inventory, frames: [{ x: 0, y: 0, width: 1, height: 1 }] }, timing: { framesPerSecond: 1, loop: true } },
            },
            roles: { default: "idle" },
          },
        },
        noun: {
          labels: [{ text: "Key" }],
          preferredVerbs: [{ verb: "look-at" }],
          cases: [{ verb: "look-at", response: { text: "A small key." } }],
        },
      },
    },
    sequences: {
      memory: {
        steps: [
          {
            type: "branch",
            cases: [
              {
                when: { variable: "remembered", equals: true },
                steps: [{ type: "narration", text: "Remembered." }],
              },
            ],
            fallback: [{ type: "narration", text: "Forgotten." }],
          },
        ],
      },
    },
    commandLexicon: {
      inventory: { select: "Hold {noun}", deselect: "Put away {noun}" },
      verbs: {
        open: "Open",
        "pick-up": "Pick up",
        push: "Push",
        close: "Close",
        "look-at": "Look at",
        pull: "Pull",
        give: "Give",
        "talk-to": "Talk to",
        use: "Use",
      },
      patterns: {
        unary: "{verb} {noun}",
        give: "{verb} {first} to {second}",
        use: "{verb} {first} with {second}",
      },
    },
    commandFallbacks: {
      open: { text: "Nothing happens." },
      "pick-up": { text: "Nothing happens." },
      push: { text: "Nothing happens." },
      close: { text: "Nothing happens." },
      "look-at": { text: "Nothing happens." },
      pull: { text: "Nothing happens." },
      give: { text: "Nothing happens." },
      "talk-to": { text: "Nothing happens." },
      use: { text: "Nothing happens." },
    },
    hudTheme: {
      font: { family: "Fondale Test", source: font },
      colors: {
        text: "#fff",
        preferred: "#f90",
        selected: "#0cc",
        backing: "#123456",
        border: "#abc",
        inventoryWell: "#012",
      },
      opacity: 0.7,
      maxSpeechWidth: 80,
      cursors: {
        left: cursor,
        right: cursor,
        up: cursor,
        down: cursor,
        enter: cursor,
      },
      speechColors: { player: "#fff" },
    },
  } satisfies GameProject;

  const compilation = compileGameProject(input);

  expect(compilation.ok).toBe(true);
  if (!compilation.ok) return;
  const session = getGameSessionCompositionView(compilation.project);
  const browser = getBrowserProjectView(compilation.project);
  const compiledAppearance =
    session.world.characters.player!.appearances.normal!;
  const compiledSequence = session.sequences.memory!;
  const compiledNoun = session.world.objects.key!.noun!;
  const compiledTheme = session.hud.theme!;
  expect(compiledAppearance).not.toBe(
    input.characters.player.appearances.normal,
  );
  expect(compiledAppearance.animations.idle!.sheets).not.toBe(
    input.characters.player.appearances.normal.animations.idle.sheets,
  );
  expect(
    compiledAppearance.animations.idle!.sheets.left.image,
  ).not.toBe(frame);
  expect(compiledSequence.steps).not.toBe(input.sequences.memory.steps);
  expect(compiledNoun.labels).not.toBe(input.objects.key.noun.labels);
  expect(compiledTheme).not.toBe(input.hudTheme);
  expect(compiledTheme.font.source).not.toBe(font);
  expect(browser.assets.objects.key!.inventoryAppearance).not.toBe(inventory);
  expect(
    [
      compiledAppearance,
      compiledAppearance.animations,
      compiledAppearance.animations.idle,
      compiledAppearance.animations.idle!.sheets,
      compiledAppearance.animations.idle!.sheets.left.image,
      compiledSequence.steps,
      compiledNoun.labels,
      compiledTheme,
      compiledTheme.colors,
      compiledTheme.font.source,
    ].every(Object.isFrozen),
  ).toBe(true);
  expect(
    [
      input.characters.player.appearances.normal,
      input.characters.player.appearances.normal.animations,
      input.characters.player.appearances.normal.animations.idle.sheets,
      input.sequences.memory.steps,
      input.objects.key.noun.labels,
      input.hudTheme,
      input.hudTheme.colors,
      frame,
      font,
    ].every((value) => !Object.isFrozen(value)),
  ).toBe(true);
});

test("Game Project compilation creates independent snapshots from each call", () => {
  const input = {
    identity: "example.recompiled-project",
    version: "1",
    logicalResolution: { width: 100, height: 100 },
    scenes: {
      opening: {
        background: "opening.png",
        walkableRegion: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 0, y: 100 },
        ],
      },
    },
    variables: { gateOpen: false },
    initialScene: "opening",
  };

  const first = compileGameProject(input);
  input.variables.gateOpen = true;
  const second = compileGameProject(input);

  expect(first.ok).toBe(true);
  expect(second.ok).toBe(true);
  if (!first.ok || !second.ok) return;
  expect(first.project).not.toBe(second.project);
  expect(
    getGameSessionCompositionView(first.project).gameProject.variables.gateOpen,
  ).toBe(false);
  expect(
    getGameSessionCompositionView(second.project).gameProject.variables
      .gateOpen,
  ).toBe(true);
});

test("Game Project supplies immutable consumer-specific composition views", () => {
  const variables = { gateOpen: false };
  const scenes = { opening };
  const player = {
    initialScene: "opening",
    initialGroundPoint: { x: 160, y: 90 },
    initialFacing: "front",
    initialAppearance: "normal",
    appearances: {
      normal: {
        animations: {
          idle: { sheets: { left: { image: "idle.png", frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, right: { image: "idle.png", frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, front: { image: "idle.png", frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, back: { image: "idle.png", frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) } }, timing: { framesPerSecond: 1, loop: true } },
          walk: { sheets: { left: { image: "walk.png", frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, right: { image: "walk.png", frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, front: { image: "walk.png", frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, back: { image: "walk.png", frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) } }, timing: { framesPerSecond: 1, loop: true } },
        },
        roles: { default: "idle", walking: "walk" },
      },
    },
    movementSpeed: 60,
  } satisfies CharacterDefinition;
  const authoredProject = {
    identity: "example.composed-project",
    version: "2",
    logicalResolution: { width: 320, height: 180 },
    scenes,
    characters: { player },
    playerCharacter: "player",
    variables,
    initialScene: "opening",
  } satisfies GameProject;
  const compilation = compileGameProject(authoredProject);
  expect(compilation.ok).toBe(true);
  if (!compilation.ok) return;
  const project = compilation.project;

  variables.gateOpen = true;
  delete (scenes as Partial<typeof scenes>).opening;

  const session = getGameSessionCompositionView(project);
  const browser = getBrowserProjectView(project);
  const save = getSaveCompositionView(project);

  expect(session.gameProject.variables).toEqual({ gateOpen: false });
  expect(session.world.scenes.opening).toBeDefined();
  expect(session.animation.playerCharacter).toBe("player");
  expect(browser.startup.identity).toBe("example.composed-project");
  expect(Object.keys(browser.presentation).sort()).toEqual([
    "identity",
    "logicalResolution",
  ]);
  expect(browser.assets.scenes.opening).toBeDefined();
  expect(save.gameProject.version).toBe("2");
  expect(
    [
      session,
      session.gameProject,
      session.world,
      browser,
      browser.startup,
      browser.assets,
      browser.presentation,
      save,
      save.gameProject,
      save.world,
      save.animation,
    ].every(Object.isFrozen),
  ).toBe(true);
});

test("Game Project delegates every local definition to capability validators", () => {
  const result = compileGameProject({
    identity: "example.invalid-local-definition",
    version: "1",
    logicalResolution: { width: 320, height: 180 },
    initialScene: "opening",
    scenes: {
      opening: {
        background: "opening.png",
        walkableRegion: [
          { x: Number.NaN, y: 0 },
          { x: 1, y: 1 },
        ],
      },
    },
    characters: {
      player: {
        initialScene: "opening",
        initialGroundPoint: { x: 0, y: 0 },
        initialFacing: "front",
        initialAppearance: "missing",
        appearances: {},
        movementSpeed: 0,
      },
    },
    sequences: {
      opening: { steps: [{ type: "narration", text: "" }] },
    },
  });
  expect(result.ok).toBe(false);
  if (!result.ok) {
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          owner: "world",
          path: "scenes.opening.walkableRegion[0]",
        }),
        expect.objectContaining({
          owner: "world",
          path: "characters.player.movementSpeed",
        }),
        expect.objectContaining({
          owner: "animation",
          path: "characters.player.initialAppearance",
        }),
        expect.objectContaining({
          owner: "sequence",
          path: "sequences.opening.steps[0].text",
        }),
      ]),
    );
  }
});

test("Game Project aggregates Knowledge-Driven Dialogue diagnostics at startup", () => {
  const result = compileGameProject({
    identity: "example.dialogue-diagnostics",
    version: "1",
    narrativeContext: "A historical mystery in the harbour of Capri in 1535.",
    logicalResolution: { width: 320, height: 180 },
    scenes: { opening },
    narrativeFacts: {
      empty: { proposition: " " },
    },
    characters: {
      antonio: {
        initialScene: "opening",
        initialGroundPoint: { x: 160, y: 90 },
        initialFacing: "front",
        initialAppearance: "normal",
        appearances: {
          normal: {
            animations: {
              idle: { sheets: { left: { image: "antonio.png", frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, right: { image: "antonio.png", frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, front: { image: "antonio.png", frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, back: { image: "antonio.png", frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) } }, timing: { framesPerSecond: 1 } },
            },
            roles: { default: "idle" },
          },
        },
        movementSpeed: 60,
        dialogue: {
          knowledge: [{ factId: "missing", disclosure: { level: "open" } }],
        },
      },
    },
    initialScene: "opening",
  });

  expect(result).toMatchObject({
    ok: false,
    diagnostics: [
      expect.objectContaining({
        code: "reference.character-knowledge.fact",
        owner: "dialogue",
        path: "characters.antonio.dialogue.knowledge[0].factId",
      }),
      expect.objectContaining({
        code: "definition.narrative-fact.proposition",
        owner: "dialogue",
        path: "narrativeFacts.empty.proposition",
      }),
    ],
  });
});
