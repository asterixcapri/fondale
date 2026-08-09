import { expect, test } from "@playwright/test";

import { createTestSession } from "../src/internal/core";
import { isInside } from "../src/internal/geometry";
import { defineCharacter, defineGame, defineScene } from "../src/index";

const scene = defineScene({
  background: "scene.png",
  walkableRegion: [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 100 },
    { x: 0, y: 100 },
  ],
});
const player = defineCharacter({
  initialScene: "opening",
  initialGroundPoint: { x: 10, y: 10 },
  initialFacing: "front",
  initialAppearance: "idle",
  appearances: { idle: { kind: "static", image: "player.png" } },
  movementSpeed: 60,
});
const project = defineGame({
  identity: "test.core",
  version: "1",
  logicalResolution: { width: 100, height: 100 },
  scenes: { opening: scene },
  characters: { player },
  playerCharacter: "player",
  initialScene: "opening",
});

test("the deterministic core clamps a world destination and never teleports", () => {
  const session = createTestSession(project);
  session.input({ type: "move", point: { x: 200, y: 50 } });

  session.steps(1);
  expect(session.snapshot().characters.player!.groundPoint).not.toEqual({ x: 100, y: 50 });

  session.steps(120);
  expect(session.snapshot().characters.player!.groundPoint).toEqual({ x: 100, y: 50 });
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

test("a new Player Intent replaces movement already in progress", () => {
  const session = createTestSession(project);
  session.input({ type: "move", point: { x: 90, y: 10 } });
  session.steps(10);
  session.input({ type: "move", point: { x: 10, y: 90 } });
  session.steps(120);

  expect(session.snapshot().characters.player!.groundPoint).toEqual({ x: 10, y: 90 });
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
  const concaveScene = defineScene({ background: "scene.png", walkableRegion: region });
  const concavePlayer = defineCharacter({
    initialScene: "opening",
    initialGroundPoint: { x: 10, y: 10 },
    initialFacing: "front",
    initialAppearance: "idle",
    appearances: { idle: { kind: "static", image: "player.png" } },
    movementSpeed: 60,
  });
  const concaveProject = defineGame({
    identity: "test.concave-navigation",
    version: "1",
    logicalResolution: { width: 100, height: 100 },
    scenes: { opening: concaveScene },
    characters: { player: concavePlayer },
    playerCharacter: "player",
    initialScene: "opening",
  });
  const session = createTestSession(concaveProject);
  session.input({ type: "move", point: { x: 90, y: 90 } });

  for (let step = 0; step < 160; step += 1) {
    session.steps();
    const point = session.snapshot().characters.player!.groundPoint;
    const onBoundary = region.some((start, index) => {
      const end = region[(index + 1) % region.length]!;
      const cross = (point.x - start.x) * (end.y - start.y) - (point.y - start.y) * (end.x - start.x);
      return Math.abs(cross) < 1e-8 && point.x >= Math.min(start.x, end.x) &&
        point.x <= Math.max(start.x, end.x) && point.y >= Math.min(start.y, end.y) &&
        point.y <= Math.max(start.y, end.y);
    });
    expect(isInside(region, point) || onBoundary).toBe(true);
  }
  expect(session.snapshot().characters.player!.groundPoint).toEqual({ x: 90, y: 90 });
});
