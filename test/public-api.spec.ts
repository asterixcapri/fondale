import { expect, test } from "@playwright/test";

import {
  AuthoringError,
  defineCharacter,
  defineGame,
  defineScene,
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
      primaryAction: {
        cases: [],
        fallback: { label: "Look", response: "Nothing.", operations: [] },
      },
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
        primaryAction: {
          cases: [],
          fallback: {
            label: "Act",
            response: "Response",
            operations: [{ type: "start-sequence", sequence: "missing" }],
          },
        },
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
      primaryAction: {
        cases: [],
        fallback: {
          label: "Place",
          response: "Placed.",
          operations: [{
            type: "place-selected-object",
            groundPoint: { x: Number.NaN, y: 5 },
          }],
        },
      },
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
