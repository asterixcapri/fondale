import { expect, test } from "@playwright/test";

import {
  animationCueTick,
  animationDurationTicks,
  animationFrameIndex,
  animationNameForRole,
  animationPresentationForSubject,
  uniformGrid,
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

test("uniformGrid returns authored row-major rectangles without validating at import time", () => {
  expect(uniformGrid({ frameWidth: 16, frameHeight: 24, columns: 2, count: 3,
    x: 5, y: 7, columnGap: 2, rowGap: 3 })).toEqual([
    { x: 5, y: 7, width: 16, height: 24 },
    { x: 23, y: 7, width: 16, height: 24 },
    { x: 5, y: 34, width: 16, height: 24 },
  ]);
  expect(() => uniformGrid({ frameWidth: 0, frameHeight: 0, columns: 0, count: -1 })).not.toThrow();
});

test("Animation Sheet validation reports invalid frame geometry at the authored frame", () => {
  const appearance = {
    animations: {
      empty: { sheet: { image: "empty.png", frames: [] }, timing: { framesPerSecond: 1 } },
      invalid: { sheet: { image: "invalid.png", frames: [
        { x: -1, y: 0.5, width: 0, height: 1.5 },
        null,
      ] }, timing: { framesPerSecond: 1 } },
    },
    roles: { default: "invalid" },
  } as unknown as Appearance;

  expect(validateAppearance(appearance, "objects.coin.appearances.normal")).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        code: "definition.animation.frames",
        path: "objects.coin.appearances.normal.animations.empty.sheet.frames",
      }),
      expect.objectContaining({
        code: "definition.animation.frame-coordinate",
        path: "objects.coin.appearances.normal.animations.invalid.sheet.frames[0].x",
      }),
      expect.objectContaining({
        code: "definition.animation.frame-coordinate",
        path: "objects.coin.appearances.normal.animations.invalid.sheet.frames[0].y",
      }),
      expect.objectContaining({
        code: "definition.animation.frame-dimension",
        path: "objects.coin.appearances.normal.animations.invalid.sheet.frames[0].width",
      }),
      expect.objectContaining({
        code: "definition.animation.frame-dimension",
        path: "objects.coin.appearances.normal.animations.invalid.sheet.frames[0].height",
      }),
      expect.objectContaining({
        code: "definition.animation.frame",
        path: "objects.coin.appearances.normal.animations.invalid.sheet.frames[1]",
      }),
    ]),
  );

  const repeated = { x: 0, y: 0, width: 4, height: 4 };
  expect(validateAppearance({
    animations: { idle: { sheet: { image: "valid.png", frames: [
      repeated,
      repeated,
      { x: 2, y: 2, width: 4, height: 4 },
    ] }, timing: { framesPerSecond: 1 } } },
    roles: { default: "idle" },
  }, "objects.coin.appearances.normal")).toEqual([]);
});

test("every Animation Sheet frame in one Appearance uses one Runtime cell size", () => {
  const objectAppearance = {
    animations: {
      idle: { sheet: { image: "coin.png", frames: [
        { x: 0, y: 0, width: 4, height: 4 },
        { x: 4, y: 0, width: 5, height: 4 },
      ] }, timing: { framesPerSecond: 1 } },
    },
    roles: { default: "idle" },
  } satisfies Appearance;
  expect(validateAppearance(objectAppearance, "objects.coin.appearances.normal")).toContainEqual(
    expect.objectContaining({
      code: "definition.animation.cell-dimensions",
      owner: "animation",
      path: "objects.coin.appearances.normal.animations.idle.sheet.frames[1]",
    }),
  );

  const characterAppearance = {
    animations: {
      idle: { sheets: {
        left: { image: "actor.png", frames: [{ x: 0, y: 0, width: 4, height: 4 }] },
        right: { image: "actor.png", frames: [{ x: 4, y: 0, width: 4, height: 4 }] },
        front: { image: "actor.png", frames: [{ x: 8, y: 0, width: 4, height: 4 }] },
        back: { image: "actor.png", frames: [{ x: 12, y: 0, width: 4, height: 5 }] },
      }, timing: { framesPerSecond: 1 } },
    },
    roles: { default: "idle" },
  } satisfies CharacterAppearance;
  expect(validateCharacterAppearance(
    characterAppearance,
    "characters.actor.appearances.normal",
  )).toContainEqual(expect.objectContaining({
    code: "definition.animation.cell-dimensions",
    path: "characters.actor.appearances.normal.animations.idle.sheets.back.frames[0]",
  }));
});

test("Animation Timing rejects invalid playback values and Cues outside its duration", () => {
  const appearance = {
    animations: {
      invalidTiming: { sheet: { image: "coin.png", frames: [
        { x: 0, y: 0, width: 4, height: 4 },
        { x: 4, y: 0, width: 4, height: 4 },
      ] }, timing: { framesPerSecond: 2, loop: "yes", cues: {
        "": 0,
        negative: -0.1,
        infinite: Number.POSITIVE_INFINITY,
        late: 1.1,
        end: 1,
      } } },
    },
    roles: { default: "invalidTiming" },
  } as unknown as Appearance;

  const diagnostics = validateAppearance(appearance, "objects.coin.appearances.normal");
  expect(diagnostics).toEqual(expect.arrayContaining([
    expect.objectContaining({
      code: "definition.animation.loop",
      path: "objects.coin.appearances.normal.animations.invalidTiming.timing.loop",
    }),
    ...["", "negative", "infinite", "late"].map((cue) => expect.objectContaining({
      code: "definition.animation.cue",
      path: `objects.coin.appearances.normal.animations.invalidTiming.timing.cues.${cue}`,
    })),
  ]));
  expect(diagnostics).not.toContainEqual(expect.objectContaining({
    path: "objects.coin.appearances.normal.animations.invalidTiming.timing.cues.end",
  }));
});

test("Animation owns complete local Appearance validation", () => {
  const appearance = {
    animations: {
      broken: { sheet: { image: "", frames: [{ x: 0, y: 0, width: 1, height: 1 }] }, timing: { framesPerSecond: Number.NaN, loop: "yes", cues: { "": -1 } } },
    },
    roles: { default: "missing" },
    visualAnchor: { x: Number.POSITIVE_INFINITY, y: 4 },
  } as unknown as Appearance;

  expect(validateAppearance(appearance, "appearances.broken")).toEqual(expect.arrayContaining([
    expect.objectContaining({
      code: "definition.animation.frame-source",
      owner: "animation",
      path: "appearances.broken.animations.broken.sheet.image",
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
      idle: { sheets: { left: { image: "left.png", frames: Array.from({ length: 2 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, right: { image: "right.png", frames: Array.from({ length: 3 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, front: { image: "front.png", frames: Array.from({ length: 2 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) } }, timing: { framesPerSecond: 6 } },
    },
    roles: { default: "idle" },
  } as unknown as CharacterAppearance;

  expect(validateCharacterAppearance(appearance, "characters.actor.appearances.normal")).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        code: "definition.animation.facing-presentation",
        path: "characters.actor.appearances.normal.animations.idle.sheets.back",
      }),
      expect.objectContaining({
        code: "definition.animation.directional-frame-count",
        path: "characters.actor.appearances.normal.animations.idle.sheets.right.frames[2]",
      }),
    ]),
  );

  const missingFront = {
    animations: {
      idle: { sheets: {
        left: { image: "left.png", frames: Array.from({ length: 2 }, (_, x) => ({ x, y: 0, width: 1, height: 1 })) },
        right: { image: "right.png", frames: Array.from({ length: 3 }, (_, x) => ({ x, y: 0, width: 1, height: 1 })) },
        back: { image: "back.png", frames: Array.from({ length: 2 }, (_, x) => ({ x, y: 0, width: 1, height: 1 })) },
      }, timing: { framesPerSecond: 6 } },
    },
    roles: { default: "idle" },
  } as unknown as CharacterAppearance;
  expect(validateCharacterAppearance(
    missingFront,
    "characters.actor.appearances.normal",
  )).toEqual(expect.arrayContaining([
    expect.objectContaining({
      code: "definition.animation.facing-presentation",
      path: "characters.actor.appearances.normal.animations.idle.sheets.front",
    }),
    expect.objectContaining({
      code: "definition.animation.directional-frame-count",
      path: "characters.actor.appearances.normal.animations.idle.sheets.right.frames[2]",
    }),
  ]));
});

test("Animation owns finite duration, Cue timing, and frame progression", () => {
  const animation = { sheet: { image: "one.png", frames: [{ x: 0, y: 0, width: 1, height: 1 }, { x: 1, y: 0, width: 1, height: 1 }, { x: 2, y: 0, width: 1, height: 1 }] }, timing: { framesPerSecond: 6, cues: { start: 0, middle: 0.25 } } };

  expect(animationDurationTicks(animation)).toBe(30);
  expect(animationCueTick(animation, "middle")).toBe(15);
  expect(animationCueTick(animation, "start")).toBe(0);
  expect(animationFrameIndex(animation, 0)).toBe(0);
  expect(animationFrameIndex(animation, 10)).toBe(1);
  expect(animationFrameIndex(animation, 30)).toBe(2);
  expect(animationFrameIndex({ ...animation, timing: { ...animation.timing, loop: true } }, 30)).toBe(0);

  const directional = { sheets: { left: { image: "left.png", frames: Array.from({ length: 4 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, right: { image: "right.png", frames: Array.from({ length: 4 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, front: { image: "front.png", frames: Array.from({ length: 4 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, back: { image: "back.png", frames: Array.from({ length: 4 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) } }, timing: { framesPerSecond: 6, loop: true } };
  expect(animationDurationTicks(directional)).toBe(40);
  expect(animationFrameIndex(directional, 40)).toBe(0);
});

test("an unavailable speaking Role falls back to the Default Animation", () => {
  const appearance: Appearance = {
    animations: { idle: { sheet: { image: "idle.png", frames: [{ x: 0, y: 0, width: 1, height: 1 }] }, timing: { framesPerSecond: 1, loop: true } } },
    roles: { default: "idle" },
  };

  expect(animationNameForRole(appearance, "speaking")).toBe("idle");
});

test("Animation derives directed presentation facts from immutable session input", () => {
  const appearance: Appearance = {
    animations: {
      idle: { sheet: { image: "idle.png", frames: [{ x: 0, y: 0, width: 1, height: 1 }] }, timing: { framesPerSecond: 1, loop: true } },
      gesture: { sheet: { image: "one.png", frames: [{ x: 0, y: 0, width: 1, height: 1 }, { x: 1, y: 0, width: 1, height: 1 }, { x: 2, y: 0, width: 1, height: 1 }] }, timing: { framesPerSecond: 6 } },
      walk: { sheet: { image: "walk-one.png", frames: [{ x: 0, y: 0, width: 1, height: 1 }, { x: 1, y: 0, width: 1, height: 1 }] }, timing: { framesPerSecond: 6, loop: true } },
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
      idle: { sheet: { image: "one.png", frames: [{ x: 0, y: 0, width: 1, height: 1 }, { x: 1, y: 0, width: 1, height: 1 }] }, timing: { framesPerSecond: 2, loop: true } },
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
      idle: { sheet: { image: "idle.png", frames: [{ x: 0, y: 0, width: 1, height: 1 }] }, timing: { framesPerSecond: 1, loop: true } },
      speaking: { sheet: { image: "one.png", frames: [{ x: 0, y: 0, width: 1, height: 1 }, { x: 1, y: 0, width: 1, height: 1 }] }, timing: { framesPerSecond: 2 } },
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
    animations: { idle: { sheet: { image: "idle.png", frames: [{ x: 0, y: 0, width: 1, height: 1 }] }, timing: { framesPerSecond: 1, loop: true } } },
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
