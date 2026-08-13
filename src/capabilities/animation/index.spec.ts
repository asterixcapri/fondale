import { expect, test } from "@playwright/test";

import {
  animationCueTick,
  animationDurationTicks,
  animationFrameIndex,
  animationNameForRole,
  animationPresentationForSubject,
  validateCharacterAppearance,
  validateAppearance,
  validateAppearanceSet,
  validateInitialAppearance,
  type AnimationProjectView,
  type Appearance,
  type CharacterAppearance,
} from "./index";
import type { GameState } from "../game-session";
import { interpretDirectionStep, type DirectionStep } from "../sequence";

test("Animation owns complete local Appearance validation", () => {
  const appearance = {
    animations: {
      broken: {
        frames: [""],
        framesPerSecond: Number.NaN,
        loop: "yes",
        cues: { "": -1 },
      },
    },
    roles: { default: "missing" },
    visualAnchor: { x: Number.POSITIVE_INFINITY, y: 4 },
  } as unknown as Appearance;

  expect(validateAppearance(appearance, "appearances.broken")).toEqual(expect.arrayContaining([
    expect.objectContaining({
      code: "definition.animation.frame-source",
      owner: "animation",
      path: "appearances.broken.animations.broken.frames[0]",
    }),
    expect.objectContaining({ code: "definition.animation.frames-per-second", owner: "animation" }),
    expect.objectContaining({ code: "definition.animation.loop", owner: "animation" }),
    expect.objectContaining({ code: "definition.animation.cue", owner: "animation" }),
    expect.objectContaining({ code: "reference.animation.role", owner: "animation" }),
    expect.objectContaining({
      code: "definition.animation.visual-anchor",
      owner: "animation",
      path: "appearances.broken.visualAnchor",
    }),
  ]));
});

test("Character Appearance validation requires four synchronized authored Facing presentations", () => {
  const appearance = {
    animations: {
      idle: {
        frames: {
          left: { image: "left.png", count: 2 },
          right: { image: "right.png", count: 3 },
          front: { image: "front.png", count: 2 },
        },
        framesPerSecond: 6,
      },
    },
    roles: { default: "idle" },
  } as unknown as CharacterAppearance;

  expect(validateCharacterAppearance(appearance, "characters.actor.appearances.normal")).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        code: "definition.animation.facing-presentation",
        path: "characters.actor.appearances.normal.animations.idle.frames.back",
      }),
      expect.objectContaining({
        code: "definition.animation.directional-frame-count",
        path: "characters.actor.appearances.normal.animations.idle.frames",
      }),
    ]),
  );
});

test("Animation owns finite duration, Cue timing, and frame progression", () => {
  const animation = {
    frames: ["one.png", "two.png", "three.png"],
    framesPerSecond: 6,
    cues: { start: 0, middle: 0.25 },
  };

  expect(animationDurationTicks(animation)).toBe(30);
  expect(animationCueTick(animation, "middle")).toBe(15);
  expect(animationCueTick(animation, "start")).toBe(0);
  expect(animationFrameIndex(animation, 0)).toBe(0);
  expect(animationFrameIndex(animation, 10)).toBe(1);
  expect(animationFrameIndex(animation, 30)).toBe(2);
  expect(animationFrameIndex({ ...animation, loop: true }, 30)).toBe(0);

  const directional = {
    frames: {
      left: { image: "left.png", count: 4 },
      right: { image: "right.png", count: 4 },
      front: { image: "front.png", count: 4 },
      back: { image: "back.png", count: 4 },
    },
    framesPerSecond: 6,
    loop: true,
  };
  expect(animationDurationTicks(directional)).toBe(40);
  expect(animationFrameIndex(directional, 40)).toBe(0);
});

test("an unavailable speaking Role falls back to the Default Animation", () => {
  const appearance: Appearance = {
    animations: { idle: { frames: ["idle.png"], framesPerSecond: 1, loop: true } },
    roles: { default: "idle" },
  };

  expect(animationNameForRole(appearance, "speaking")).toBe("idle");
});

test("Animation derives directed presentation facts from immutable session input", () => {
  const appearance: Appearance = {
    animations: {
      idle: { frames: ["idle.png"], framesPerSecond: 1, loop: true },
      gesture: { frames: ["one.png", "two.png", "three.png"], framesPerSecond: 6 },
      walk: { frames: ["walk-one.png", "walk-two.png"], framesPerSecond: 6, loop: true },
    },
    roles: { default: "idle", walking: "walk" },
    visualAnchor: { x: 4, y: 12 },
  };
  const data = {
    playerCharacter: "actor",
    characters: { actor: { appearances: { normal: appearance } } },
    objects: {},
    scenes: {},
  } as unknown as AnimationProjectView;
  const state = {
    currentScene: "room",
    characters: { actor: { scene: "room", appearance: "normal" } },
    objects: {},
    scenery: {},
    activity: null,
  } as unknown as GameState;
  const step: DirectionStep = {
    type: "direction",
    directions: [{
      type: "animation",
      subject: { kind: "character", character: "actor" },
      animation: "gesture",
    }],
  };
  const direction = {
    kind: "direction" as const,
    elapsedTicks: 10,
    complete: false,
    directions: step.directions.map((direction, index) => ({
      direction,
      timing: interpretDirectionStep(
      step,
      10,
      () => appearance.animations.gesture,
      ).directions[index]!,
    })),
  };

  expect(animationPresentationForSubject(
    data,
    state,
    { kind: "character", character: "actor" },
    { direction },
  )).toMatchObject({
    appearanceName: "normal",
    animationName: "gesture",
    frameIndex: 1,
    loop: false,
    visualAnchor: { x: 4, y: 12 },
  });
});

test("Animation derives default frame progression from the logical session tick", () => {
  const appearance: Appearance = {
    animations: {
      idle: { frames: ["one.png", "two.png"], framesPerSecond: 2, loop: true },
    },
    roles: { default: "idle" },
  };
  const data = {
    characters: { actor: { appearances: { normal: appearance } } },
    objects: {},
    scenes: {},
  } as unknown as AnimationProjectView;
  const state = {
    tick: 30,
    currentScene: "room",
    characters: { actor: { scene: "room", appearance: "normal" } },
    objects: {},
    scenery: {},
    activity: null,
  } as unknown as GameState;

  expect(animationPresentationForSubject(
    data,
    state,
    { kind: "character", character: "actor" },
  )).toMatchObject({
    animationName: "idle",
    elapsedTicks: 30,
    frameIndex: 1,
    loop: true,
  });
});

test("Animation starts Line frame progression from the activity-local tick", () => {
  const appearance: Appearance = {
    animations: {
      idle: { frames: ["idle.png"], framesPerSecond: 1, loop: true },
      speaking: { frames: ["one.png", "two.png"], framesPerSecond: 2 },
    },
    roles: { default: "idle", speaking: "speaking" },
  };
  const data = {
    characters: { actor: { appearances: { normal: appearance } } },
    objects: {},
    scenes: {},
  } as unknown as AnimationProjectView;
  const state = {
    tick: 100,
    currentScene: "room",
    characters: { actor: { scene: "room", appearance: "normal" } },
    objects: {},
    scenery: {},
    activity: {
      type: "line",
      animationStartedTick: 100,
      line: { character: "actor", text: "Hello." },
    },
  } as unknown as GameState;
  const subject = { kind: "character", character: "actor" } as const;
  const context = { line: { character: "actor" } };

  expect(animationPresentationForSubject(data, state, subject, context)).toMatchObject({
    animationName: "speaking",
    elapsedTicks: 0,
    frameIndex: 0,
  });
});

test("Animation validates Appearance selection and required Roles for a subject", () => {
  const appearance: Appearance = {
    animations: { idle: { frames: ["idle.png"], framesPerSecond: 1, loop: true } },
    roles: { default: "idle" },
  };

  expect(validateAppearanceSet(
    { normal: appearance },
    { path: "characters.actor.appearances", initialAppearance: "missing", subject: "Character", requireWalking: true },
  )).toEqual(expect.arrayContaining([
    expect.objectContaining({
      code: "reference.appearance.initial",
      owner: "animation",
      path: "characters.actor.initialAppearance",
    }),
    expect.objectContaining({
      code: "reference.animation.walking-role",
      owner: "animation",
      path: "characters.actor.appearances.normal.roles.walking",
    }),
  ]));

  expect(validateInitialAppearance(
    { visible: { kind: "background-region" } },
    "missing",
    "scenes.opening.scenery.mist.initialAppearance",
    "Scenery",
  )).toEqual([expect.objectContaining({
    code: "reference.appearance.initial",
    owner: "animation",
    path: "scenes.opening.scenery.mist.initialAppearance",
  })]);
});
