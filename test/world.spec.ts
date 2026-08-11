import { expect, test } from "@playwright/test";

import {
  createWorldDefinitionQueries,
  createWorld,
  isInside,
  navigationPath,
  validateMotionDirection,
  validateWorldProject,
} from "../src/capabilities/world";
import {
  defineCharacter,
  defineObject,
  defineScene,
  type InteractionCondition,
} from "../src/index";

const square = [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 100 },
  { x: 0, y: 100 },
];

const appearance = {
  animations: { idle: { frames: ["idle.png"], framesPerSecond: 1 } },
  roles: { default: "idle" },
} as const;

test("World creates defensive initial spatial state from its project view", () => {
  const scene = defineScene({
    background: "scene.png",
    walkableRegion: square,
    scenery: {
      curtain: {
        baseline: 50,
        initialAppearance: "closed",
        appearances: {
          closed: { kind: "background-region", area: square },
        },
      },
    },
  });
  const character = defineCharacter({
    initialScene: "opening",
    initialGroundPoint: { x: 10, y: 20 },
    initialFacing: "right",
    initialAppearance: "normal",
    appearances: { normal: appearance },
    movementSpeed: 60,
  });
  const object = defineObject({
    initialScene: "opening",
    initialGroundPoint: { x: 30, y: 40 },
    initialAppearance: "normal",
    appearances: { normal: appearance },
    inventoryAppearance: "object.png",
  });
  const world = createWorld({
    initialScene: "opening",
    scenes: { opening: { ...scene, size: { width: 100, height: 100 } } },
    characters: { guide: character },
    objects: { key: object },
  });

  const first = world.initialState();
  const exposedGroundPoint = first.characters.guide!.groundPoint as { x: number };
  exposedGroundPoint.x = 99;
  first.scenery.opening!.curtain = "open";
  const second = world.initialState();

  expect(second).toEqual({
    currentScene: "opening",
    characters: {
      guide: {
        scene: "opening",
        groundPoint: { x: 10, y: 20 },
        facing: "right",
        appearance: "normal",
      },
    },
    scenery: { opening: { curtain: "closed" } },
    objects: {
      key: {
        location: { kind: "scene", scene: "opening", groundPoint: { x: 30, y: 40 } },
        appearance: "normal",
      },
    },
  });
});

test("World hit testing selects the topmost available target from immutable state", () => {
  const scene = defineScene({
    background: "scene.png",
    walkableRegion: square,
    hotspots: [
      {
        target: { kind: "background" },
        noun: { labels: [{ text: "Wall" }], preferredVerbs: [{ verb: "look-at" }], cases: [] },
        area: square,
        approach: { groundPoint: { x: 10, y: 10 }, facing: "front" },
      },
      {
        target: { kind: "object", object: "key" },
        area: square,
        approach: { groundPoint: { x: 20, y: 20 }, facing: "front" },
        when: { variable: "visible", equals: true },
      },
    ],
  });
  const object = defineObject({
    initialScene: "opening",
    initialGroundPoint: { x: 30, y: 40 },
    initialAppearance: "normal",
    appearances: { normal: appearance },
    inventoryAppearance: "object.png",
  });
  const world = createWorld({
    initialScene: "opening",
    scenes: { opening: { ...scene, size: { width: 100, height: 100 } } },
    characters: {},
    objects: { key: object },
  });
  const state = world.initialState();

  expect(world.hitTest(state, { x: 50, y: 50 }, () => true)).toEqual({
    kind: "hotspot",
    index: 1,
  });
  state.objects.key!.location = { kind: "inventory" };
  expect(world.hitTest(state, { x: 50, y: 50 }, () => true)).toEqual({
    kind: "hotspot",
    index: 0,
  });
  expect(world.hitTest(state, { x: 50, y: 50 }, () => false)).toBeNull();

  const hotspots = world.hotspots(state, () => true);
  const exposedPoint = hotspots[0]!.definition.area[0] as { x: number };
  exposedPoint.x = 999;
  expect(world.hotspots(state, () => true)[0]!.definition.area[0]!.x).toBe(0);
});

test("World answers directed-subject presence and position in the current Scene", () => {
  const opening = defineScene({
    background: "opening.png",
    walkableRegion: square,
    scenery: {
      curtain: {
        baseline: 50,
        position: { x: 50, y: 60 },
        initialAppearance: "normal",
        appearances: { normal: { kind: "background-region", area: square } },
      },
    },
  });
  const elsewhere = defineScene({ background: "elsewhere.png", walkableRegion: square });
  const character = defineCharacter({
    initialScene: "opening",
    initialGroundPoint: { x: 10, y: 20 },
    initialFacing: "right",
    initialAppearance: "normal",
    appearances: { normal: appearance },
    movementSpeed: 60,
  });
  const object = defineObject({
    initialScene: "opening",
    initialGroundPoint: { x: 30, y: 40 },
    initialAppearance: "normal",
    appearances: { normal: appearance },
    inventoryAppearance: "object.png",
  });
  const world = createWorld({
    initialScene: "opening",
    scenes: {
      opening: { ...opening, size: { width: 100, height: 100 } },
      elsewhere: { ...elsewhere, size: { width: 100, height: 100 } },
    },
    characters: { guide: character },
    objects: { key: object },
  });
  const state = world.initialState();

  expect(world.hasDirectedSubject(state, { kind: "character", character: "guide" })).toBe(true);
  expect(world.hasDirectedSubject(state, { kind: "object", object: "key" })).toBe(true);
  expect(world.hasDirectedSubject(state, { kind: "scenery", scenery: "curtain" })).toBe(true);
  expect(world.pointForSubject(state, { kind: "scenery", scenery: "curtain" })).toEqual({ x: 50, y: 60 });

  state.characters.guide!.scene = "elsewhere";
  state.objects.key!.location = { kind: "inventory" };
  expect(world.hasDirectedSubject(state, { kind: "character", character: "guide" })).toBe(false);
  expect(world.hasDirectedSubject(state, { kind: "object", object: "key" })).toBe(false);
  expect(world.hasDirectedSubject(state, { kind: "scenery", scenery: "missing" })).toBe(false);
});

test("World derives defensive presentation facts for the current Scene", () => {
  const curtainFrame = new URL("https://example.test/curtain.png");
  const scene = defineScene({
    background: "scene.png",
    walkableRegion: square,
    perspectiveScale: [{ y: 0, scale: 0.5 }, { y: 100, scale: 1 }],
    scenery: {
      curtain: {
        baseline: 50,
        position: { x: 40, y: 50 },
        initialAppearance: "closed",
        appearances: {
          closed: {
            animations: {
              idle: { frames: [curtainFrame], framesPerSecond: 1 },
            },
            roles: { default: "idle" },
          },
        },
      },
    },
  });
  const character = defineCharacter({
    initialScene: "opening",
    initialGroundPoint: { x: 10, y: 20 },
    initialFacing: "left",
    initialAppearance: "normal",
    appearances: { normal: appearance },
    movementSpeed: 60,
  });
  const object = defineObject({
    initialScene: "opening",
    initialGroundPoint: { x: 30, y: 40 },
    initialAppearance: "normal",
    appearances: { normal: appearance },
    inventoryAppearance: "object.png",
  });
  const world = createWorld({
    initialScene: "opening",
    scenes: { opening: { ...scene, size: { width: 100, height: 100 } } },
    characters: { guide: character },
    objects: { key: object },
  });
  const state = world.initialState();

  const presentation = world.presentation(state, (scenery) =>
    scenery === "curtain" ? { x: 60, y: 70 } : undefined,
  );
  expect(presentation).toMatchObject({
    scene: "opening",
    background: "scene.png",
    size: { width: 100, height: 100 },
    scenery: [{ id: "curtain", appearanceName: "closed", baseline: 50, position: { x: 60, y: 70 } }],
    objects: [{ id: "key", appearanceName: "normal", groundPoint: { x: 30, y: 40 }, scale: 0.7 }],
    characters: [{
      id: "guide",
      appearanceName: "normal",
      groundPoint: { x: 10, y: 20 },
      facing: "left",
      scale: 0.6,
    }],
  });

  const exposed = presentation.characters[0]!.groundPoint as { x: number };
  exposed.x = 999;
  const exposedAppearance = presentation.scenery[0]!.appearance;
  expect("animations" in exposedAppearance).toBe(true);
  if (!("animations" in exposedAppearance)) throw new Error("Expected an animated Appearance.");
  const exposedFrame = exposedAppearance.animations.idle!.frames as URL[];
  (exposedFrame[0] as URL).href = "https://example.test/changed.png";
  expect(world.presentation(state).characters[0]!.groundPoint.x).toBe(10);
  const nextAppearance = world.presentation(state).scenery[0]!.appearance;
  if (!("animations" in nextAppearance)) throw new Error("Expected an animated Appearance.");
  expect((nextAppearance.animations.idle!.frames as readonly URL[])[0]!.href).toBe(
    "https://example.test/curtain.png",
  );
});

test("World validates composed Scene geometry and entity membership", () => {
  const invalidScene = defineScene({
    background: "scene.png",
    size: { width: 120, height: 100 },
    walkableRegion: [
      { x: 0, y: 0 },
      { x: 130, y: 0 },
      { x: 0, y: 100 },
    ],
    entrances: { outside: { groundPoint: { x: 110, y: 90 }, facing: "front" } },
  });
  const character = defineCharacter({
    initialScene: "missing",
    initialGroundPoint: { x: 10, y: 20 },
    initialFacing: "right",
    initialAppearance: "normal",
    appearances: { normal: appearance },
    movementSpeed: 60,
  });

  expect(validateWorldProject({
    logicalResolution: { width: 100, height: 100 },
    initialScene: "opening",
    playerCharacter: "guide",
    scenes: { opening: invalidScene },
    characters: { guide: character },
    objects: {},
  })).toEqual(expect.arrayContaining([
    expect.objectContaining({
      owner: "world",
      code: "definition.scene-space.bounds",
      path: "scenes.opening.walkableRegion[1]",
    }),
    expect.objectContaining({
      owner: "world",
      code: "definition.entrance.walkable",
      path: "scenes.opening.entrances.outside.groundPoint",
    }),
    expect.objectContaining({
      owner: "world",
      code: "reference.character.initial-scene",
      path: "characters.guide.initialScene",
    }),
  ]));
});

test("World diagnoses invalid Passage destinations and Arrival rules", () => {
  const passageNoun = {
    labels: [{ text: "Door" }],
    preferredVerbs: [{ verb: "walk-to" as const }],
    cases: [],
  };
  const opening = defineScene({
    background: "opening.png",
    walkableRegion: square,
    entrances: { valid: { groundPoint: { x: 10, y: 10 }, facing: "front" } },
    passages: [{
      area: square,
      approach: { groundPoint: { x: 20, y: 20 }, facing: "right" },
      noun: passageNoun,
      direction: "right",
      destination: { scene: "missing", entrance: "nowhere" },
    }],
    arrivalSequences: [{
      entrance: "missing",
      sequence: "first",
    }, {
      sequence: "second",
    }],
  });

  expect(validateWorldProject({
    logicalResolution: { width: 100, height: 100 },
    initialScene: "opening",
    scenes: { opening },
    characters: {},
    objects: {},
  })).toEqual(expect.arrayContaining([
    expect.objectContaining({
      code: "reference.passage.scene",
      owner: "world",
      path: "scenes.opening.passages[0].destination.scene",
    }),
    expect.objectContaining({
      code: "reference.arrival.entrance",
      owner: "world",
      path: "scenes.opening.arrivalSequences[0].entrance",
    }),
    expect.objectContaining({
      code: "definition.arrival-sequence.ambiguous",
      owner: "world",
      path: "scenes.opening.arrivalSequences[1]",
    }),
  ]));
});

test("World owns local and Scene-specific Motion diagnostics", () => {
  const invalidCharacterMotion = {
    type: "motion" as const,
    subject: { kind: "character" as const, character: "guide" },
    path: [{ x: 10, y: 10 }, { x: 20, y: 20 }],
    duration: 1,
  };
  expect(validateMotionDirection(invalidCharacterMotion, "steps[0].directions[0]")).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ code: "definition.motion.character-path", owner: "world" }),
      expect.objectContaining({ code: "definition.motion.character-duration", owner: "world" }),
    ]),
  );

  const opening = defineScene({
    background: "opening.png",
    walkableRegion: square,
  });
  const world = createWorldDefinitionQueries({
    logicalResolution: { width: 100, height: 100 },
    initialScene: "opening",
    scenes: { opening },
    characters: {},
    objects: {},
  });
  expect(world.validateMotion(
    "opening",
    {
      type: "motion",
      subject: { kind: "character", character: "guide" },
      path: [{ x: 120, y: 50 }],
    },
    "steps[0].directions[0]",
    { subjectBelongsToScene: false },
  )).toEqual(expect.arrayContaining([
    expect.objectContaining({ code: "definition.motion.bounds", owner: "world" }),
    expect.objectContaining({ code: "reference.sequence.subject-scene", owner: "world" }),
  ]));
});

test("World geometry keeps hit testing and navigation inside a concave polygon", () => {
  const concave = [
    { x: 0, y: 0 },
    { x: 40, y: 0 },
    { x: 40, y: 60 },
    { x: 100, y: 60 },
    { x: 100, y: 100 },
    { x: 0, y: 100 },
  ];

  expect(isInside(concave, { x: 20, y: 20 })).toBe(true);
  expect(isInside(concave, { x: 80, y: 20 })).toBe(false);
  expect(navigationPath(concave, { x: 10, y: 10 }, { x: 90, y: 90 })).toEqual([
    { x: 10, y: 10 },
    { x: 40, y: 60 },
    { x: 90, y: 90 },
  ]);
});

test("World plans and advances deterministic Character navigation without mutating its input", () => {
  const concave = [
    { x: 0, y: 0 },
    { x: 40, y: 0 },
    { x: 40, y: 60 },
    { x: 100, y: 60 },
    { x: 100, y: 100 },
    { x: 0, y: 100 },
  ];
  const opening = defineScene({ background: "opening.png", walkableRegion: concave });
  const character = defineCharacter({
    initialScene: "opening",
    initialGroundPoint: { x: 10, y: 10 },
    initialFacing: "front",
    initialAppearance: "normal",
    appearances: { normal: appearance },
    movementSpeed: 60,
  });
  const world = createWorld({
    initialScene: "opening",
    scenes: { opening: { ...opening, size: { width: 100, height: 100 } } },
    characters: { guide: character },
    objects: {},
  });
  const state = world.initialState();
  const before = structuredClone(state);

  const destination = world.navigationDestination(state, { x: 120, y: 90 });
  expect(destination).toEqual({ x: 100, y: 90 });

  const first = world.advanceCharacter(state, {
    character: "guide",
    destination: { x: 90, y: 90 },
  });
  expect(first.complete).toBe(false);
  expect(first.state.characters.guide!.groundPoint.x).toBeCloseTo(10.514495755);
  expect(first.state.characters.guide!.groundPoint.y).toBeCloseTo(10.857492926);
  expect(first.state.characters.guide!.facing).toBe("front");
  expect(state).toEqual(before);

  let progress = first;
  for (let tick = 0; tick < 160 && !progress.complete; tick += 1) {
    progress = world.advanceCharacter(progress.state, {
      character: "guide",
      destination: { x: 90, y: 90 },
      finalFacing: "left",
    });
  }
  expect(progress.complete).toBe(true);
  expect(progress.state.characters.guide).toMatchObject({
    groundPoint: { x: 90, y: 90 },
    facing: "left",
  });
});

test("World derives every Character facing even when movement completes in one tick", () => {
  const opening = defineScene({ background: "opening.png", walkableRegion: square });
  const character = defineCharacter({
    initialScene: "opening",
    initialGroundPoint: { x: 50, y: 50 },
    initialFacing: "front",
    initialAppearance: "normal",
    appearances: { normal: appearance },
    movementSpeed: 60,
  });
  const world = createWorld({
    initialScene: "opening",
    scenes: { opening: { ...opening, size: { width: 100, height: 100 } } },
    characters: { guide: character },
    objects: {},
  });

  for (const [facing, destination] of [
    ["left", { x: 49, y: 50 }],
    ["right", { x: 51, y: 50 }],
    ["front", { x: 50, y: 51 }],
    ["back", { x: 50, y: 49 }],
  ] as const) {
    const progress = world.advanceCharacter(world.initialState(), {
      character: "guide",
      destination,
    });
    expect(progress).toMatchObject({
      complete: true,
      state: { characters: { guide: { groundPoint: destination, facing } } },
    });
  }
});

test("World selects available Approach Points", () => {
  const opening = defineScene({
    background: "opening.png",
    walkableRegion: square,
    hotspots: [{
      target: { kind: "background" },
      noun: { labels: [{ text: "Wall" }], preferredVerbs: [{ verb: "look-at" }], cases: [] },
      area: square,
      approach: { groundPoint: { x: 20, y: 30 }, facing: "right" },
      when: { variable: "visible", equals: true },
    }],
    passages: [{
      area: square,
      approach: { groundPoint: { x: 80, y: 70 }, facing: "left" },
      noun: { labels: [{ text: "Door" }], preferredVerbs: [{ verb: "walk-to" }], cases: [] },
      direction: "right",
      destination: { scene: "opening", entrance: "door" },
    }],
    entrances: { door: { groundPoint: { x: 10, y: 10 }, facing: "front" } },
  });
  const world = createWorld({
    initialScene: "opening",
    scenes: { opening: { ...opening, size: { width: 100, height: 100 } } },
    characters: {},
    objects: {},
  });
  const state = world.initialState();

  expect(world.approach(state, { kind: "hotspot", index: 0 }, () => true)).toEqual({
    groundPoint: { x: 20, y: 30 },
    facing: "right",
  });
  expect(world.approach(state, { kind: "passage", index: 0 }, () => true)).toEqual({
    groundPoint: { x: 80, y: 70 },
    facing: "left",
  });
  expect(world.approach(state, { kind: "hotspot", index: 0 }, () => false)).toBeUndefined();
});

test("World advances Character, Object and Scenery Motion from shared local timing", () => {
  const opening = defineScene({
    background: "opening.png",
    walkableRegion: square,
    scenery: {
      curtain: {
        baseline: 50,
        position: { x: 30, y: 40 },
        initialAppearance: "normal",
        appearances: { normal: { kind: "background-region", area: square } },
      },
    },
  });
  const character = defineCharacter({
    initialScene: "opening",
    initialGroundPoint: { x: 10, y: 10 },
    initialFacing: "front",
    initialAppearance: "normal",
    appearances: { normal: appearance },
    movementSpeed: 60,
  });
  const object = defineObject({
    initialScene: "opening",
    initialGroundPoint: { x: 20, y: 20 },
    initialAppearance: "normal",
    appearances: { normal: appearance },
    inventoryAppearance: "object.png",
  });
  const world = createWorld({
    initialScene: "opening",
    scenes: { opening: { ...opening, size: { width: 100, height: 100 } } },
    characters: { guide: character },
    objects: { key: object },
  });
  const initial = world.initialState();

  const characterProgress = world.advanceMotion(initial, {
    type: "motion",
    subject: { kind: "character", character: "guide" },
    path: [{ x: 12, y: 10 }],
    facing: "left",
  }, { localTick: 1, durationTicks: 0 });
  expect(characterProgress.complete).toBe(false);
  expect(characterProgress.state.characters.guide).toMatchObject({
    groundPoint: { x: 11, y: 10 },
    facing: "right",
  });

  const objectProgress = world.advanceMotion(characterProgress.state, {
    type: "motion",
    subject: { kind: "object", object: "key" },
    path: [{ x: 20, y: 20 }, { x: 40, y: 20 }],
    duration: 2,
  }, { localTick: 60, durationTicks: 120 });
  expect(objectProgress.state.objects.key!.location).toEqual({
    kind: "scene",
    scene: "opening",
    groundPoint: { x: 30, y: 20 },
  });
  expect(objectProgress.point).toEqual({ x: 30, y: 20 });

  const sceneryProgress = world.advanceMotion(objectProgress.state, {
    type: "motion",
    subject: { kind: "scenery", scenery: "curtain" },
    path: [{ x: 10, y: 40 }, { x: 30, y: 40 }],
    duration: 2,
  }, { localTick: 60, durationTicks: 120 });
  expect(sceneryProgress.point).toEqual({ x: 20, y: 40 });
  expect(world.motionPoint({
    type: "motion",
    subject: { kind: "scenery", scenery: "curtain" },
    path: [{ x: 10, y: 40 }, { x: 30, y: 40 }],
    duration: 2,
  }, { localTick: 0, durationTicks: 120 })).toEqual({ x: 10, y: 40 });
  expect(sceneryProgress.state).toEqual(objectProgress.state);
  expect(initial.characters.guide!.groundPoint).toEqual({ x: 10, y: 10 });
  expect(initial.objects.key!.location).toEqual({
    kind: "scene",
    scene: "opening",
    groundPoint: { x: 20, y: 20 },
  });
});

test("World resolves a Passage transition and its Arrival Sequence without mutating its input", () => {
  const passageNoun = {
    labels: [{ text: "Door" }],
    preferredVerbs: [{ verb: "walk-to" as const }],
    cases: [],
  };
  const opening = defineScene({
    background: "opening.png",
    walkableRegion: square,
    passages: [{
      area: square,
      approach: { groundPoint: { x: 90, y: 50 }, facing: "right" },
      noun: passageNoun,
      direction: "right",
      destination: { scene: "tower", entrance: "fromOpening" },
      when: { variable: "doorOpen", equals: true },
    }],
  });
  const tower = defineScene({
    background: "tower.png",
    walkableRegion: square,
    entrances: { fromOpening: { groundPoint: { x: 5, y: 6 }, facing: "left" } },
    arrivalSequences: [{
      entrance: "fromOpening",
      sequence: "arrival",
      when: { variable: "firstVisit", equals: true },
    }],
  });
  const character = defineCharacter({
    initialScene: "opening",
    initialGroundPoint: { x: 10, y: 10 },
    initialFacing: "front",
    initialAppearance: "normal",
    appearances: { normal: appearance },
    movementSpeed: 60,
  });
  const world = createWorld({
    initialScene: "opening",
    scenes: {
      opening: { ...opening, size: { width: 100, height: 100 } },
      tower: { ...tower, size: { width: 100, height: 100 } },
    },
    characters: { guide: character },
    objects: {},
  });
  const state = world.initialState();
  const before = structuredClone(state);
  const matches = (condition: InteractionCondition | undefined) =>
    condition !== undefined && "variable" in condition &&
    (condition.variable === "doorOpen" || condition.variable === "firstVisit");

  const transition = world.transitionPassage(state, {
    passage: 0,
    character: "guide",
  }, matches);

  expect(transition).toEqual({
    status: "transitioned",
    scene: "tower",
    arrivalSequence: "arrival",
    state: {
      ...before,
      currentScene: "tower",
      characters: {
        guide: {
          ...before.characters.guide,
          scene: "tower",
          groundPoint: { x: 5, y: 6 },
          facing: "left",
        },
      },
    },
  });
  expect(state).toEqual(before);
  expect(world.transitionPassage(state, { passage: 0, character: "guide" }, () => false))
    .toEqual({ status: "unavailable" });
});
