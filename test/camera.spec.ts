import { expect, test } from "@playwright/test";

import { Camera } from "../src/capabilities/camera";
import { AuthoringError, defineSequence } from "../src";

test("Camera derives a clamped Player-following presentation from logical facts", () => {
  const camera = new Camera();

  expect(camera.update({
    tick: 0,
    scene: "room",
    viewport: { width: 100, height: 80 },
    sceneSize: { width: 300, height: 200 },
    player: { x: 290, y: 190 },
    directions: [],
    pointForSubject: () => undefined,
  })).toEqual({
    directed: false,
    focus: { x: 290, y: 190 },
    origin: { x: 200, y: 120 },
  });
});

test("Camera derives a directed move from Sequence-local time", () => {
  const camera = new Camera();

  expect(camera.update({
    tick: 30,
    scene: "room",
    viewport: { width: 100, height: 80 },
    sceneSize: { width: 300, height: 200 },
    player: { x: 20, y: 20 },
    directions: [{
      direction: {
        type: "camera",
        mode: "move",
        from: { x: 50, y: 40 },
        to: { x: 250, y: 160 },
        duration: 1,
      },
      localTick: 30,
      presented: true,
      durationTicks: 60,
    }],
    pointForSubject: () => undefined,
  })).toEqual({
    directed: true,
    focus: { x: 150, y: 100 },
    origin: { x: 100, y: 60 },
  });
});

test("Camera cuts immediately to an authored focus", () => {
  const camera = new Camera();

  expect(camera.update({
    tick: 0,
    scene: "room",
    viewport: { width: 100, height: 80 },
    sceneSize: { width: 300, height: 200 },
    player: { x: 20, y: 20 },
    directions: [{
      direction: { type: "camera", mode: "cut", point: { x: 250, y: 160 } },
      localTick: 0,
      presented: true,
    }],
    pointForSubject: () => undefined,
  })).toEqual({
    directed: true,
    focus: { x: 250, y: 160 },
    origin: { x: 200, y: 120 },
  });
});

test("Camera holds an authored focus for its interpreted lifetime", () => {
  const camera = new Camera();

  expect(camera.update({
    tick: 45,
    scene: "room",
    viewport: { width: 100, height: 80 },
    sceneSize: { width: 300, height: 200 },
    player: { x: 20, y: 20 },
    directions: [{
      direction: { type: "camera", mode: "hold", point: { x: 170, y: 90 }, duration: 1 },
      localTick: 45,
      presented: true,
    }],
    pointForSubject: () => undefined,
  })).toEqual({
    directed: true,
    focus: { x: 170, y: 90 },
    origin: { x: 120, y: 50 },
  });
});

test("the last presented Camera direction follows its subject before the Player", () => {
  const camera = new Camera();

  expect(camera.update({
    tick: 10,
    scene: "room",
    viewport: { width: 100, height: 80 },
    sceneSize: { width: 300, height: 200 },
    player: { x: 20, y: 20 },
    directions: [
      {
        direction: { type: "camera", mode: "hold", point: { x: 120, y: 80 } },
        localTick: 10,
        presented: true,
      },
      {
        direction: {
          type: "camera",
          mode: "follow",
          subject: { kind: "character", character: "guide" },
        },
        localTick: 5,
        presented: true,
      },
    ],
    pointForSubject: (subject) => subject.kind === "character" && subject.character === "guide"
      ? { x: 240, y: 150 }
      : undefined,
  })).toEqual({
    directed: true,
    focus: { x: 240, y: 150 },
    origin: { x: 190, y: 110 },
  });
});

test("Player following advances once per logical tick", () => {
  const camera = new Camera();
  const input = {
    scene: "room",
    viewport: { width: 100, height: 80 },
    sceneSize: { width: 300, height: 200 },
    directions: [],
    pointForSubject: () => undefined,
  } as const;

  camera.update({ ...input, tick: 0, player: { x: 50, y: 40 } });
  const advanced = camera.update({ ...input, tick: 1, player: { x: 200, y: 40 } });

  expect(advanced.origin).toEqual({ x: 8, y: 0 });
  expect(camera.update({ ...input, tick: 1, player: { x: 200, y: 40 } })).toEqual(advanced);
});

test("Camera snaps Player following on Scene transitions", () => {
  const camera = new Camera();
  const common = {
    viewport: { width: 100, height: 80 },
    sceneSize: { width: 300, height: 200 },
    directions: [],
    pointForSubject: () => undefined,
  } as const;
  camera.update({ ...common, tick: 0, scene: "harbour", player: { x: 50, y: 40 } });
  camera.update({ ...common, tick: 1, scene: "harbour", player: { x: 200, y: 40 } });

  expect(camera.update({
    ...common,
    tick: 2,
    scene: "alley",
    player: { x: 250, y: 160 },
  }).origin).toEqual({ x: 200, y: 120 });
});

test("Camera owns diagnostics for its authored points", () => {
  try {
    defineSequence({
      scene: "room",
      steps: [{
        type: "direction",
        directions: [
          {
            type: "camera",
            mode: "cut",
            point: { x: Number.NaN, y: 40 },
          },
          {
            type: "camera",
            mode: "hold",
            point: { x: 20, y: 40 },
            duration: 0,
          },
        ],
      }],
    });
    throw new Error("Expected Camera authoring to be rejected.");
  } catch (error) {
    expect(error).toBeInstanceOf(AuthoringError);
    expect((error as AuthoringError).diagnostics).toContainEqual(expect.objectContaining({
      code: "definition.camera.point.finite",
      owner: "camera",
      path: "steps[0].directions[0].point",
    }));
    expect((error as AuthoringError).diagnostics).toContainEqual(expect.objectContaining({
      code: "definition.camera.duration",
      owner: "camera",
      path: "steps[0].directions[1].duration",
    }));
  }
});
