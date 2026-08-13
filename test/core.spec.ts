import { expect, test } from "@playwright/test";

import { createTestSession, validateTestSaveSnapshot } from "./support";
import { isInside } from "../src/capabilities/world";
import {
  type CharacterDefinition,
  type GameProject,
  type SceneDefinition,
} from "../src/index";

const scene = {
  background: "scene.png",
  walkableRegion: [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 100 },
    { x: 0, y: 100 },
  ],
} satisfies SceneDefinition;
const player = {
  initialScene: "opening",
  initialGroundPoint: { x: 10, y: 10 },
  initialFacing: "front",
  initialAppearance: "idle",
  appearances: {
    idle: {
      animations: {
        idle: {
          frames: {
            left: { image: "player.png", count: 1 },
            right: { image: "player.png", count: 1 },
            front: { image: "player.png", count: 1 },
            back: { image: "player.png", count: 1 },
          },
          framesPerSecond: 1,
          loop: true,
        },
      },
      roles: { default: "idle", walking: "idle" },
    },
  },
  movementSpeed: 60,
} satisfies CharacterDefinition;
const project = {
  identity: "test.core",
  version: "1",
  logicalResolution: { width: 100, height: 100 },
  scenes: { opening: scene },
  characters: { player },
  playerCharacter: "player",
  initialScene: "opening",
} satisfies GameProject;

test("the deterministic core clamps a world destination and never teleports", () => {
  const session = createTestSession(project);
  session.input({ type: "move", point: { x: 200, y: 50 } });

  session.steps(1);
  expect(session.snapshot().characters.player!.groundPoint).not.toEqual({
    x: 100,
    y: 50,
  });

  session.steps(120);
  expect(session.snapshot().characters.player!.groundPoint).toEqual({
    x: 100,
    y: 50,
  });
  expect(session.snapshot().activity).toBeNull();
});

test("equal inputs and logical steps produce equal snapshots and effects", () => {
  const first = createTestSession(project);
  const second = createTestSession(project);

  for (const session of [first, second]) {
    session.input({ type: "move", point: { x: 80, y: 70 } });
    session.steps(13);
  }

  expect(first.snapshot()).toEqual(second.snapshot());
  expect(first.effects()).toEqual(second.effects());
});

test("CoreSession validates step counts and has an explicit lifecycle", () => {
  const session = createTestSession(project);
  const initial = session.snapshot();

  for (const count of [-1, 0.5, Number.NaN, Number.POSITIVE_INFINITY]) {
    expect(() => session.steps(count)).toThrow(RangeError);
  }
  expect(session.snapshot()).toEqual(initial);
  expect(session.lifecycle()).toBe("running");

  session.input({ type: "move", point: { x: 80, y: 80 } });
  session.stop();
  expect(session.lifecycle()).toBe("stopped");
  expect(() => session.steps()).toThrow("Game Session is stopped.");
  expect(session.snapshot()).toEqual(initial);
});

test("CoreSession consumes cloned inputs in queue order and preserves effect order", () => {
  const session = createTestSession(project);
  const firstPoint = { x: 80, y: 10 };
  session.input({ type: "move", point: firstPoint });
  firstPoint.x = 20;
  session.input({ type: "move", point: { x: 10, y: 80 }, fast: true });

  session.steps();

  expect(session.snapshot().activity).toMatchObject({
    type: "player-intent",
    destination: { x: 10, y: 80 },
    fast: true,
  });
  expect(session.effects()).toEqual([
    { type: "movement-started", destination: { x: 80, y: 10 } },
    { type: "movement-started", destination: { x: 10, y: 80 }, fast: true },
  ]);
});

test("restored CoreSession replays the same future inputs exactly", () => {
  const uninterrupted = createTestSession(project);
  uninterrupted.input({ type: "move", point: { x: 80, y: 70 } });
  uninterrupted.steps(13);
  uninterrupted.takeEffects();

  const validation = validateTestSaveSnapshot(
    project,
    structuredClone(uninterrupted.createSaveSnapshot()),
  );
  expect(validation.ok).toBe(true);
  if (!validation.ok) return;
  const restored = createTestSession(project, validation.snapshot);

  for (const session of [uninterrupted, restored]) {
    session.input({ type: "move", point: { x: 20, y: 90 }, fast: true });
    session.steps(20);
  }

  expect(restored.snapshot()).toEqual(uninterrupted.snapshot());
  expect(restored.effects()).toEqual(uninterrupted.effects());
});

test("CoreSession exposes defensive World presentation facts", () => {
  const session = createTestSession(project);
  const presentation = session.world();
  const exposedPoint = presentation.characters[0]!.groundPoint as { x: number };
  exposedPoint.x = 99;

  expect(session.world()).toMatchObject({
    scene: "opening",
    size: { width: 100, height: 100 },
    characters: [{ id: "player", groundPoint: { x: 10, y: 10 }, scale: 1 }],
  });
  expect(session.snapshot().characters.player!.groundPoint).toEqual({
    x: 10,
    y: 10,
  });
});

test("CoreSession exposes defensive Camera presentation facts", () => {
  const session = createTestSession(project);
  const presentation = session.camera();
  const exposedOrigin = presentation.origin as { x: number };

  expect(() => {
    exposedOrigin.x = 99;
  }).toThrow(TypeError);

  expect(session.camera().origin).toEqual({ x: 0, y: 0 });
  expect(session.snapshot().characters.player!.groundPoint).toEqual({
    x: 10,
    y: 10,
  });
});

test("CoreSession exposes Animation presentation facts without browser interpretation", () => {
  const animatedPlayer = {
    ...player,
    appearances: {
      idle: {
        animations: {
          idle: {
            frames: {
              left: { image: "idle.png", count: 1 },
              right: { image: "idle.png", count: 1 },
              front: { image: "idle.png", count: 1 },
              back: { image: "idle.png", count: 1 },
            },
            framesPerSecond: 1,
            loop: true,
          },
          walking: {
            frames: {
              left: { image: "walk-1.png", count: 2 },
              right: { image: "walk-1.png", count: 2 },
              front: { image: "walk-1.png", count: 2 },
              back: { image: "walk-1.png", count: 2 },
            },
            framesPerSecond: 2,
            loop: true,
          },
        },
        roles: { default: "idle", walking: "walking" },
      },
    },
  } satisfies CharacterDefinition;
  const animatedProject = {
    identity: "test.core-animation-presentation",
    version: "1",
    logicalResolution: { width: 100, height: 100 },
    scenes: { opening: scene },
    characters: { player: animatedPlayer },
    playerCharacter: "player",
    initialScene: "opening",
  } satisfies GameProject;
  const session = createTestSession(animatedProject);
  const subject = { kind: "character", character: "player" } as const;

  expect(session.animation(subject)).toMatchObject({
    appearanceName: "idle",
    animationName: "idle",
    elapsedTicks: 0,
    frameIndex: 0,
  });

  session.input({ type: "move", point: { x: 80, y: 10 } });
  session.steps();

  expect(session.animation(subject)).toMatchObject({
    appearanceName: "idle",
    animationName: "walking",
    elapsedTicks: 0,
    frameIndex: 0,
    loop: true,
  });
});

test("Camera facts do not depend on how often a consumer reads them", () => {
  const panoramicScene = {
    background: "panorama.png",
    size: { width: 300, height: 100 },
    walkableRegion: [
      { x: 0, y: 0 },
      { x: 300, y: 0 },
      { x: 300, y: 100 },
      { x: 0, y: 100 },
    ],
  } satisfies SceneDefinition;
  const panoramicPlayer = {
    ...player,
    initialGroundPoint: { x: 50, y: 50 },
  } satisfies CharacterDefinition;
  const panoramicProject = {
    identity: "test.core-camera-polling",
    version: "1",
    logicalResolution: { width: 100, height: 100 },
    scenes: { opening: panoramicScene },
    characters: { player: panoramicPlayer },
    playerCharacter: "player",
    initialScene: "opening",
  } satisfies GameProject;
  const eager = createTestSession(panoramicProject);
  const lazy = createTestSession(panoramicProject);

  for (const session of [eager, lazy]) {
    session.input({ type: "move", point: { x: 250, y: 50 } });
  }
  for (let tick = 0; tick < 20; tick += 1) {
    eager.steps();
    eager.camera();
  }
  lazy.steps(20);

  expect(lazy.snapshot()).toEqual(eager.snapshot());
  expect(lazy.camera()).toEqual(eager.camera());
});

test("a new Player Intent replaces movement already in progress", () => {
  const session = createTestSession(project);
  session.input({ type: "move", point: { x: 90, y: 10 } });
  session.steps(10);
  session.input({ type: "move", point: { x: 10, y: 90 } });
  session.steps(120);

  expect(session.snapshot().characters.player!.groundPoint).toEqual({
    x: 10,
    y: 90,
  });
});

test("movement follows a route inside a concave Walkable Region", () => {
  const region = [
    { x: 0, y: 0 },
    { x: 40, y: 0 },
    { x: 40, y: 60 },
    { x: 100, y: 60 },
    { x: 100, y: 100 },
    { x: 0, y: 100 },
  ];
  const concaveScene = {
    background: "scene.png",
    walkableRegion: region,
  } satisfies SceneDefinition;
  const concavePlayer = {
    initialScene: "opening",
    initialGroundPoint: { x: 10, y: 10 },
    initialFacing: "front",
    initialAppearance: "idle",
    appearances: {
      idle: {
        animations: {
          idle: {
            frames: {
              left: { image: "player.png", count: 1 },
              right: { image: "player.png", count: 1 },
              front: { image: "player.png", count: 1 },
              back: { image: "player.png", count: 1 },
            },
            framesPerSecond: 1,
            loop: true,
          },
        },
        roles: { default: "idle", walking: "idle" },
      },
    },
    movementSpeed: 60,
  } satisfies CharacterDefinition;
  const concaveProject = {
    identity: "test.concave-navigation",
    version: "1",
    logicalResolution: { width: 100, height: 100 },
    scenes: { opening: concaveScene },
    characters: { player: concavePlayer },
    playerCharacter: "player",
    initialScene: "opening",
  } satisfies GameProject;
  const session = createTestSession(concaveProject);
  session.input({ type: "move", point: { x: 90, y: 90 } });

  for (let step = 0; step < 160; step += 1) {
    session.steps();
    const point = session.snapshot().characters.player!.groundPoint;
    const onBoundary = region.some((start, index) => {
      const end = region[(index + 1) % region.length]!;
      const cross =
        (point.x - start.x) * (end.y - start.y) -
        (point.y - start.y) * (end.x - start.x);
      return (
        Math.abs(cross) < 1e-8 &&
        point.x >= Math.min(start.x, end.x) &&
        point.x <= Math.max(start.x, end.x) &&
        point.y >= Math.min(start.y, end.y) &&
        point.y <= Math.max(start.y, end.y)
      );
    });
    expect(isInside(region, point) || onBoundary).toBe(true);
  }
  expect(session.snapshot().characters.player!.groundPoint).toEqual({
    x: 90,
    y: 90,
  });
});
