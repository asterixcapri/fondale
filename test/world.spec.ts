import { expect, test } from "@playwright/test";

import {
  createWorld,
  isInside,
  navigationPath,
  validateWorldProject,
} from "../src/capabilities/world";
import { defineCharacter, defineObject, defineScene } from "../src/index";

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
