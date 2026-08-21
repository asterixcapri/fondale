import { expect, test } from "@playwright/test";

import {
  AuthoringError,
  type CharacterDefinition,
  type CommandLexicon,
  type GameProject,
  type NounDefinition,
  type ObjectDefinition,
  type SceneDefinition,
  type SceneOpeningCase,
  type SequenceDefinition,
  type Appearance,
  type CharacterAppearance,
  type CameraDirection,
} from "../src/index";
import {
  compileTestGameProject,
  createTestSession,
  validateTestSaveSnapshot,
} from "./support";
import { validateSequenceDefinition } from "../src/capabilities/sequence";
import { validateCharacterDefinition } from "../src/capabilities/world";
import { validateTestDefinition } from "./definition-support";

function validateTestGameProject<T extends GameProject>(project: T): T {
  compileTestGameProject(project);
  return project;
}

function validateTestCharacterDefinition<T extends CharacterDefinition>(
  character: T,
): T {
  return validateTestDefinition(character, validateCharacterDefinition);
}

const staticAppearance = (image: string): Appearance => ({
  animations: {
    idle: { sheet: { image: image, frames: [{ x: 0, y: 0, width: 1, height: 1 }] }, timing: { framesPerSecond: 1, loop: true } },
  },
  roles: { default: "idle" },
});

const staticCharacterAppearance = (image: string): CharacterAppearance => ({
  animations: {
    idle: { sheets: { left: { image, frames: [{ x: 0, y: 0, width: 1, height: 1 }] }, right: { image, frames: [{ x: 0, y: 0, width: 1, height: 1 }] }, front: { image, frames: [{ x: 0, y: 0, width: 1, height: 1 }] }, back: { image, frames: [{ x: 0, y: 0, width: 1, height: 1 }] } }, timing: { framesPerSecond: 1, loop: true } },
  },
  roles: { default: "idle" },
});

test("a Character Appearance owns authored Facing presentations and semantic Animation Roles", () => {
  const appearance: CharacterAppearance = {
    animations: {
      idle: { sheets: { left: { image: "idle.png", frames: Array.from({ length: 2 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, right: { image: "idle.png", frames: Array.from({ length: 2 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, front: { image: "idle.png", frames: Array.from({ length: 2 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, back: { image: "idle.png", frames: Array.from({ length: 2 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) } }, timing: { framesPerSecond: 4, loop: true } },
      speaking: { sheets: { left: { image: "speak.png", frames: Array.from({ length: 2 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, right: { image: "speak.png", frames: Array.from({ length: 2 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, front: { image: "speak.png", frames: Array.from({ length: 2 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, back: { image: "speak.png", frames: Array.from({ length: 2 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) } }, timing: { framesPerSecond: 8, loop: true, cues: { syllable: 0.125 } } },
      walking: { sheets: { left: { image: "walk-left.png", frames: Array.from({ length: 4 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, right: { image: "walk-right.png", frames: Array.from({ length: 4 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, front: { image: "walk-front.png", frames: Array.from({ length: 4 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, back: { image: "walk-back.png", frames: Array.from({ length: 4 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) } }, timing: { framesPerSecond: 8, loop: true } },
    },
    roles: { default: "idle", speaking: "speaking", walking: "walking" },
    visualAnchor: { x: 8, y: 16 },
  };

  const character = validateTestCharacterDefinition({
    initialScene: "room",
    initialGroundPoint: { x: 10, y: 10 },
    initialFacing: "front",
    initialAppearance: "normal",
    appearances: { normal: appearance },
    movementSpeed: 60,
  } satisfies CharacterDefinition);

  expect(character.appearances.normal).toEqual(appearance);
  const result = character.appearances.normal;
  expect(Object.isFrozen(result.animations.speaking!.timing.cues)).toBe(false);
  expect(Object.isFrozen(result.roles)).toBe(false);
});

test("Appearance validation aggregates invalid Animation values and Role references", () => {
  expect(() =>
    validateTestCharacterDefinition({
      initialScene: "room",
      initialGroundPoint: { x: 10, y: 10 },
      initialFacing: "front",
      initialAppearance: "normal",
      appearances: {
        normal: {
          animations: {
            idle: { sheets: { left: { image: "", frames: Array.from({ length: 0 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, right: { image: "", frames: Array.from({ length: 0 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, front: { image: "", frames: Array.from({ length: 0 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, back: { image: "", frames: Array.from({ length: 0 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) } }, timing: { framesPerSecond: 0, cues: { late: -1 } } },
          },
          roles: { default: "missing", speaking: "also-missing" },
        },
      },
      movementSpeed: 60,
    } satisfies CharacterDefinition),
  ).toThrow(AuthoringError);

  try {
    validateTestCharacterDefinition({
      initialScene: "room",
      initialGroundPoint: { x: 10, y: 10 },
      initialFacing: "front",
      initialAppearance: "normal",
      appearances: {
        normal: {
          animations: {
            idle: { sheets: { left: { image: "idle.png", frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, right: { image: "idle.png", frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, front: { image: "idle.png", frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, back: { image: "idle.png", frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) } }, timing: { framesPerSecond: 1 } },
          },
          roles: {} as never,
        },
      },
      movementSpeed: 60,
    } satisfies CharacterDefinition);
    throw new Error("Expected Character validation to reject the Appearance.");
  } catch (error) {
    expect(error).toBeInstanceOf(AuthoringError);
    expect((error as AuthoringError).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "definition.appearance.default-role",
        path: "appearances.normal.roles.default",
      }),
    );
  }
});

test("composition validates Command Line overrides and directed subject locality", () => {
  const square = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 100 },
    { x: 0, y: 100 },
  ];
  const actor = validateTestCharacterDefinition({
    initialScene: "elsewhere",
    initialGroundPoint: { x: 10, y: 10 },
    initialFacing: "front",
    initialAppearance: "normal",
    appearances: { normal: staticCharacterAppearance("actor.png") },
    movementSpeed: 60,
    noun: {
      labels: [{ text: "Actor" }],
      preferredVerbs: [{ verb: "look-at" }],
      cases: [
        {
          verb: "look-at",
          line: { character: "actor", animation: "missing", text: "Hello." },
        },
      ],
    } satisfies NounDefinition,
  } satisfies CharacterDefinition);
  const action = {
    scene: "room",
    steps: [
      {
        type: "direction",
        directions: [
          {
            type: "camera",
            mode: "follow",
            subject: { kind: "character", character: "actor" },
            duration: 1,
          },
        ],
      },
    ],
  } satisfies SequenceDefinition;
  const room = {
    background: "room.png",
    walkableRegion: square,
  } satisfies SceneDefinition;
  const elsewhere = {
    background: "elsewhere.png",
    walkableRegion: square,
    hotspots: [
      {
        target: { kind: "character", character: "actor" },
        area: square,
        approach: { groundPoint: { x: 10, y: 10 }, facing: "front" },
      },
    ],
  } satisfies SceneDefinition;

  try {
    validateTestGameProject({
      identity: "test.line-and-subject-references",
      version: "1",
      logicalResolution: { width: 100, height: 100 },
      scenes: { room, elsewhere },
      characters: { actor },
      sequences: { action },
      initialScene: "room",
      commandLexicon: {
        inventory: { select: "Hold {noun}", deselect: "Put back {noun}" },
        verbs: {
          open: "Open",
          "pick-up": "Pick up",
          push: "Push",
          close: "Close",
          "look-at": "Look",
          pull: "Pull",
          give: "Give",
          "talk-to": "Talk",
          use: "Use",
        },
        patterns: {
          unary: "{verb} {noun}",
          give: "{verb} {first} to {second}",
          use: "{verb} {first} with {second}",
        },
      } satisfies CommandLexicon,
      commandFallbacks: Object.fromEntries(
        [
          "open",
          "pick-up",
          "push",
          "close",
          "look-at",
          "pull",
          "give",
          "talk-to",
          "use",
        ].map((verb) => [verb, { text: "No." }]),
      ) as never,
    } satisfies GameProject);
    throw new Error(
      "Expected Game Project compilation to reject invalid references.",
    );
  } catch (error) {
    expect(error).toBeInstanceOf(AuthoringError);
    expect((error as AuthoringError).diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "reference.animation.line",
          owner: "animation",
          path: "characters.actor.noun.cases[0].line.animation",
        }),
        expect.objectContaining({
          code: "reference.camera.subject-scene",
          path: "sequences.action.steps[0].directions[0].subject",
        }),
      ]),
    );
  }
});

test("composition requires the final Scenery Motion to end at its resting position", () => {
  const square = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 100 },
    { x: 0, y: 100 },
  ];
  const room = {
    background: "room.png",
    walkableRegion: square,
    scenery: {
      marker: {
        baseline: 30,
        position: { x: 60, y: 30 },
        initialAppearance: "normal",
        appearances: {
          normal: {
            animations: {
              idle: { sheet: { image: "marker.png", frames: [{ x: 0, y: 0, width: 1, height: 1 }, { x: 1, y: 0, width: 1, height: 1 }] }, timing: { framesPerSecond: 1, loop: true, cues: { later: 1 } } },
            },
            roles: { default: "idle" },
          },
        },
      },
    },
  } satisfies SceneDefinition;
  const action = {
    scene: "room",
    steps: [
      {
        type: "direction",
        directions: [
          {
            type: "motion",
            subject: { kind: "scenery", scenery: "marker" },
            path: [
              { x: 20, y: 20 },
              { x: 50, y: 30 },
            ],
            duration: 1,
          },
        ],
      },
    ],
  } satisfies SequenceDefinition;

  expect(() =>
    validateTestGameProject({
      identity: "test.scenery-motion-rest",
      version: "1",
      logicalResolution: { width: 100, height: 100 },
      scenes: { room },
      sequences: { action },
      initialScene: "room",
    } satisfies GameProject),
  ).toThrow(/resting position/);

  const interrupted = {
    scene: "room",
    steps: [
      action.steps[0]!,
      { type: "narration", text: "A visible pause." },
      {
        type: "direction",
        directions: [
          {
            type: "motion",
            subject: { kind: "scenery", scenery: "marker" },
            path: [
              { x: 50, y: 30 },
              { x: 60, y: 30 },
            ],
            duration: 1,
          },
        ],
      },
    ],
  } satisfies SequenceDefinition;
  expect(() =>
    validateTestGameProject({
      identity: "test.interrupted-scenery-motion",
      version: "1",
      logicalResolution: { width: 100, height: 100 },
      scenes: { room },
      sequences: { interrupted },
      initialScene: "room",
    } satisfies GameProject),
  ).toThrow(/resting position/);

  const delayedContinuation = {
    scene: "room",
    steps: [
      action.steps[0]!,
      {
        type: "direction",
        directions: [
          {
            type: "animation",
            subject: { kind: "scenery", scenery: "marker" },
            animation: "idle",
          },
          {
            type: "motion",
            subject: { kind: "scenery", scenery: "marker" },
            path: [
              { x: 50, y: 30 },
              { x: 60, y: 30 },
            ],
            duration: 1,
            startAfter: { direction: 0, cue: "later" },
          },
        ],
      },
    ],
  } satisfies SequenceDefinition;
  expect(() =>
    validateTestGameProject({
      identity: "test.delayed-scenery-motion",
      version: "1",
      logicalResolution: { width: 100, height: 100 },
      scenes: { room },
      sequences: { delayedContinuation },
      initialScene: "room",
    } satisfies GameProject),
  ).toThrow(/resting position/);
});

test("an Object placed earlier in a Sequence may be directed in its owning Scene", () => {
  const square = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 100 },
    { x: 0, y: 100 },
  ];
  const prop = {
    initialScene: "elsewhere",
    initialGroundPoint: { x: 10, y: 10 },
    initialAppearance: "normal",
    appearances: { normal: staticAppearance("prop.png") },
    inventoryAppearance: "prop-inventory.png",
  } satisfies ObjectDefinition;
  const action = {
    scene: "room",
    steps: [
      {
        type: "operations",
        operations: [
          {
            type: "place-object",
            object: "prop",
            scene: "room",
            groundPoint: { x: 20, y: 20 },
          },
        ],
      },
      {
        type: "direction",
        directions: [
          {
            type: "motion",
            subject: { kind: "object", object: "prop" },
            path: [
              { x: 20, y: 20 },
              { x: 30, y: 20 },
            ],
            duration: 1,
          },
        ],
      },
    ],
  } satisfies SequenceDefinition;

  expect(
    validateTestGameProject({
      identity: "test.placed-directed-object",
      version: "1",
      logicalResolution: { width: 100, height: 100 },
      scenes: {
        room: {
          background: "room.png",
          walkableRegion: square,
        } satisfies SceneDefinition,
        elsewhere: {
          background: "elsewhere.png",
          walkableRegion: square,
        } satisfies SceneDefinition,
      },
      objects: { prop },
      sequences: { action },
      initialScene: "room",
    } satisfies GameProject),
  ).toBeDefined();

  const unavailable = {
    scene: "room",
    steps: action.steps.slice(1),
  } satisfies SequenceDefinition;
  try {
    validateTestGameProject({
      identity: "test.unavailable-directed-object",
      version: "1",
      logicalResolution: { width: 100, height: 100 },
      scenes: {
        room: {
          background: "room.png",
          walkableRegion: square,
        } satisfies SceneDefinition,
        elsewhere: {
          background: "elsewhere.png",
          walkableRegion: square,
        } satisfies SceneDefinition,
      },
      objects: { prop },
      sequences: { unavailable },
      initialScene: "room",
    } satisfies GameProject);
    throw new Error(
      "Expected Game Project compilation to reject the unavailable Object.",
    );
  } catch (error) {
    expect(error).toBeInstanceOf(AuthoringError);
    expect((error as AuthoringError).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "reference.sequence.subject-scene",
        owner: "world",
        path: "sequences.unavailable.steps[0].directions[0].subject",
      }),
    );
  }
});

test("Sequence rejects selected-Object operations from its local outcomes", () => {
  const diagnostics = validateSequenceDefinition(
    {
      skippable: true,
      skipOutcome: [{ type: "consume-selected-object" }],
      steps: [{ type: "narration", text: "Done." }],
    },
    "sequences.invalidOutcome",
  );

  expect(diagnostics).toContainEqual(
    expect.objectContaining({
      code: "definition.sequence.selected-object-operation",
      owner: "sequence",
      path: "sequences.invalidOutcome.skipOutcome[0]",
    }),
  );
});

test("composition diagnoses a movable Player Appearance without a walking Role", () => {
  const scene = {
    background: "room.png",
    walkableRegion: [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
    ],
  } satisfies SceneDefinition;
  const player = validateTestCharacterDefinition({
    initialScene: "room",
    initialGroundPoint: { x: 10, y: 10 },
    initialFacing: "front",
    initialAppearance: "normal",
    appearances: { normal: staticCharacterAppearance("player.png") },
    movementSpeed: 60,
  } satisfies CharacterDefinition);

  try {
    validateTestGameProject({
      identity: "test.missing-walking-role",
      version: "1",
      logicalResolution: { width: 100, height: 100 },
      scenes: { room: scene },
      characters: { player },
      playerCharacter: "player",
      initialScene: "room",
    } satisfies GameProject);
    throw new Error("Expected Game Project compilation to reject the project.");
  } catch (error) {
    expect(error).toBeInstanceOf(AuthoringError);
    expect((error as AuthoringError).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "reference.animation.walking-role",
        owner: "animation",
        path: "characters.player.appearances.normal.roles.walking",
      }),
    );
  }
});

test("composition diagnoses nested directed Sequences and Motion outside their Scene", () => {
  const scene = {
    background: "room.png",
    walkableRegion: [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
    ],
    scenery: {
      marker: {
        baseline: 20,
        initialAppearance: "normal",
        appearances: { normal: staticAppearance("marker.png") },
      },
    },
  } satisfies SceneDefinition;
  const nested = {
    steps: [
      {
        type: "branch",
        cases: [
          {
            when: { variable: "enabled", equals: true },
            steps: [
              {
                type: "direction",
                directions: [
                  {
                    type: "motion",
                    subject: { kind: "scenery", scenery: "marker" },
                    path: [{ x: 101, y: 20 }],
                    duration: 1,
                  },
                ],
              },
            ],
          },
          { steps: [] },
        ],
      },
    ],
  } satisfies SequenceDefinition;

  try {
    validateTestGameProject({
      identity: "test.invalid-directed-scene",
      version: "1",
      logicalResolution: { width: 100, height: 100 },
      scenes: { room: scene },
      sequences: { nested },
      variables: { enabled: true },
      initialScene: "room",
    } satisfies GameProject);
    throw new Error("Expected Game Project compilation to reject the project.");
  } catch (error) {
    expect(error).toBeInstanceOf(AuthoringError);
    expect((error as AuthoringError).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "reference.sequence.scene",
        path: "sequences.nested.scene",
      }),
    );
  }

  const bounded = { ...nested, scene: "room" } satisfies SequenceDefinition;
  expect(() =>
    validateTestGameProject({
      identity: "test.invalid-motion-bounds",
      version: "1",
      logicalResolution: { width: 100, height: 100 },
      scenes: { room: scene },
      sequences: { bounded },
      variables: { enabled: true },
      initialScene: "room",
    } satisfies GameProject),
  ).toThrow(/Motion path point/);
});

export { staticAppearance };

function directedProject(
  skippable = false,
  directionDuration?: number,
  cameraDirections: readonly CameraDirection[] = [
    { type: "camera", mode: "hold", point: { x: 50, y: 50 }, duration: 2 / 60 },
    { type: "camera", mode: "hold", point: { x: 50, y: 50 } },
    {
      type: "camera",
      mode: "follow",
      subject: { kind: "character", character: "actor" },
    },
  ],
) {
  const square = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 100 },
    { x: 0, y: 100 },
  ];
  const actor = validateTestCharacterDefinition({
    initialScene: "room",
    initialGroundPoint: { x: 10, y: 10 },
    initialFacing: "front",
    initialAppearance: "normal",
    appearances: {
      normal: {
        animations: {
          idle: { sheets: { left: { image: "idle.png", frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, right: { image: "idle.png", frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, front: { image: "idle.png", frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, back: { image: "idle.png", frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) } }, timing: { framesPerSecond: 1, loop: true } },
          gesture: { sheets: { left: { image: "gesture-1.png", frames: Array.from({ length: 2 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, right: { image: "gesture-1.png", frames: Array.from({ length: 2 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, front: { image: "gesture-1.png", frames: Array.from({ length: 2 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, back: { image: "gesture-1.png", frames: Array.from({ length: 2 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) } }, timing: { framesPerSecond: 60, cues: { contact: 1 / 60 } } },
          walk: { sheets: { left: { image: "walk-left.png", frames: Array.from({ length: 2 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, right: { image: "walk-right.png", frames: Array.from({ length: 2 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, front: { image: "walk-front.png", frames: Array.from({ length: 2 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, back: { image: "walk-back.png", frames: Array.from({ length: 2 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) } }, timing: { framesPerSecond: 60, loop: true } },
        },
        roles: { default: "idle", walking: "walk" },
      },
    },
    movementSpeed: 60,
  } satisfies CharacterDefinition);
  const action = {
    scene: "room",
    ...(skippable
      ? {
          skippable: true,
          skipOutcome: [
            {
              type: "set-variable" as const,
              variable: "finished",
              value: true,
            },
          ],
        }
      : {}),
    steps: [
      {
        type: "direction",
        ...(directionDuration === undefined
          ? {}
          : { duration: directionDuration }),
        directions: [
          {
            type: "animation",
            subject: { kind: "character", character: "actor" },
            animation: "gesture",
          },
          {
            type: "motion",
            subject: { kind: "scenery", scenery: "marker" },
            path: [
              { x: 20, y: 20 },
              { x: 60, y: 30 },
            ],
            duration: 2 / 60,
          },
          {
            type: "animation",
            subject: { kind: "scenery", scenery: "marker" },
            animation: "react",
            startAfter: { direction: 0, cue: "contact" },
          },
          ...cameraDirections,
          {
            type: "animation",
            subject: { kind: "scenery", scenery: "marker" },
            animation: "idle",
          },
        ],
      },
      {
        type: "operations",
        operations: [
          { type: "set-variable", variable: "finished", value: true },
        ],
      },
    ],
  } satisfies SequenceDefinition;
  const scene = {
    background: "room.png",
    walkableRegion: square,
    scenery: {
      marker: {
        baseline: 30,
        position: { x: 60, y: 30 },
        initialAppearance: "normal",
        appearances: {
          normal: {
            animations: {
              idle: { sheet: { image: "marker.png", frames: [{ x: 0, y: 0, width: 1, height: 1 }] }, timing: { framesPerSecond: 1, loop: true } },
              react: { sheet: { image: "react-1.png", frames: [{ x: 0, y: 0, width: 1, height: 1 }, { x: 1, y: 0, width: 1, height: 1 }] }, timing: { framesPerSecond: 60 } },
            },
            roles: { default: "idle" },
          },
        },
      },
    },
    hotspots: [
      {
        target: { kind: "background" },
        area: square,
        approach: { groundPoint: { x: 10, y: 10 }, facing: "front" },
        noun: {
          labels: [{ text: "Action" }],
          preferredVerbs: [{ verb: "use" }],
          cases: [{ verb: "use", sequence: "action" }],
        } satisfies NounDefinition,
      },
    ],
  } satisfies SceneDefinition;
  return validateTestGameProject({
    identity: "test.animated-sequences",
    version: "1",
    logicalResolution: { width: 100, height: 100 },
    scenes: { room: scene },
    characters: { actor },
    playerCharacter: "actor",
    sequences: { action },
    variables: { finished: false },
    initialScene: "room",
    commandLexicon: {
      inventory: { select: "Hold {noun}", deselect: "Put back {noun}" },
      verbs: {
        open: "Open",
        "pick-up": "Pick up",
        push: "Push",
        close: "Close",
        "look-at": "Look",
        pull: "Pull",
        give: "Give",
        "talk-to": "Talk",
        use: "Use",
      },
      patterns: {
        unary: "{verb} {noun}",
        give: "{verb} {first} to {second}",
        use: "{verb} {first} with {second}",
      },
    } satisfies CommandLexicon,
    commandFallbacks: Object.fromEntries(
      [
        "open",
        "pick-up",
        "push",
        "close",
        "look-at",
        "pull",
        "give",
        "talk-to",
        "use",
      ].map((verb) => [verb, { text: "No." }]),
    ) as never,
  } satisfies GameProject);
}

function startDirectedSequence(
  session: ReturnType<typeof createTestSession>,
): void {
  session.input({ type: "quick-hotspot", hotspot: 0, verb: "use" });
  session.steps();
}

test("CoreSession exposes Camera facts from the shared Direction Step interpretation", () => {
  const session = createTestSession(directedProject());
  startDirectedSequence(session);

  expect(session.camera()).toEqual({
    directed: true,
    focus: { x: 10, y: 10 },
    origin: { x: 0, y: 0 },
  });
});

test("CoreSession gives Camera the Cue-local time interpreted by Sequence", () => {
  const session = createTestSession(
    directedProject(false, undefined, [
      {
        type: "camera",
        mode: "move",
        from: { x: 50, y: 50 },
        to: { x: 90, y: 90 },
        duration: 2 / 60,
        startAfter: { direction: 0, cue: "contact" },
      },
    ]),
  );
  startDirectedSequence(session);

  expect(session.camera()).toMatchObject({
    directed: false,
    focus: { x: 10, y: 10 },
  });
  session.steps();
  expect(session.camera()).toMatchObject({
    directed: true,
    focus: { x: 50, y: 50 },
  });
  session.steps();
  expect(session.camera()).toMatchObject({
    directed: true,
    focus: { x: 70, y: 70 },
  });
});

test("a directed Sequence completes mixed finite, looping, held, and following directions", () => {
  const session = createTestSession(directedProject());
  startDirectedSequence(session);
  expect(session.snapshot().activity).toMatchObject({
    type: "sequence",
    active: { kind: "direction", elapsedTicks: 0 },
  });

  session.input({ type: "move", point: { x: 90, y: 90 } });
  session.steps(2);
  expect(session.snapshot().activity).toMatchObject({
    type: "sequence",
    active: { kind: "direction", elapsedTicks: 2 },
  });
  expect(session.snapshot().variables.finished).toBe(false);

  session.steps();
  expect(session.snapshot().activity).toBeNull();
  expect(session.snapshot().variables.finished).toBe(true);
  expect(session.snapshot().characters.actor!.groundPoint).toEqual({
    x: 10,
    y: 10,
  });
});

test("an authored Direction Step duration completes before longer finite directions", () => {
  const session = createTestSession(directedProject(false, 1 / 60));
  startDirectedSequence(session);

  session.steps();

  expect(session.snapshot().activity).toBeNull();
  expect(session.snapshot().variables.finished).toBe(true);
});

test("directed Sequence progress survives Save and restore", () => {
  const project = directedProject();
  const uninterrupted = createTestSession(project);
  startDirectedSequence(uninterrupted);
  uninterrupted.steps();
  const validation = validateTestSaveSnapshot(
    project,
    JSON.parse(JSON.stringify(uninterrupted.createSaveSnapshot())) as unknown,
  );
  expect(validation.ok).toBe(true);
  if (!validation.ok) return;
  const restored = createTestSession(project, validation.snapshot);

  uninterrupted.steps(2);
  restored.steps(2);
  expect(restored.snapshot()).toEqual(uninterrupted.snapshot());
  expect(restored.snapshot().variables.finished).toBe(true);
});

test("Save Snapshot validation rejects Direction progress beyond the logical tick", () => {
  const project = directedProject();
  const session = createTestSession(project);
  startDirectedSequence(session);
  session.steps();
  const snapshot = session.createSaveSnapshot();
  const activity = snapshot.state.activity;
  if (activity?.type !== "sequence" || activity.active?.kind !== "direction") {
    throw new Error("Expected an active Direction Step.");
  }

  const result = validateTestSaveSnapshot(project, {
    ...snapshot,
    state: {
      ...snapshot.state,
      activity: {
        ...activity,
        active: { ...activity.active, elapsedTicks: snapshot.state.tick + 1 },
      },
    },
  });

  expect(result.ok).toBe(false);
});

test("skip before and after a Cue applies the explicit Skip Outcome exactly once", () => {
  for (const progress of [0, 1, 2]) {
    const session = createTestSession(directedProject(true));
    startDirectedSequence(session);
    session.steps(progress);
    session.input({ type: "skip-sequence" });
    session.steps();

    expect(session.snapshot().activity).toBeNull();
    expect(session.snapshot().variables.finished).toBe(true);
    const skipped = session.snapshot();
    session.input({ type: "skip-sequence" });
    session.steps();
    expect(session.snapshot().variables).toEqual(skipped.variables);
  }
});

test("directed Character navigation and Object Motion commit their canonical destinations", () => {
  const square = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 100 },
    { x: 0, y: 100 },
  ];
  const actor = validateTestCharacterDefinition({
    initialScene: "room",
    initialGroundPoint: { x: 10, y: 10 },
    initialFacing: "front",
    initialAppearance: "normal",
    appearances: {
      normal: {
        animations: {
          idle: { sheets: { left: { image: "actor.png", frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, right: { image: "actor.png", frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, front: { image: "actor.png", frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, back: { image: "actor.png", frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) } }, timing: { framesPerSecond: 1, loop: true } },
        },
        roles: { default: "idle", walking: "idle" },
      },
    },
    movementSpeed: 60,
  } satisfies CharacterDefinition);
  const prop = {
    initialScene: "room",
    initialGroundPoint: { x: 20, y: 20 },
    initialAppearance: "normal",
    appearances: { normal: staticAppearance("prop.png") },
    inventoryAppearance: "prop-inventory.png",
  } satisfies ObjectDefinition;
  const action = {
    scene: "room",
    steps: [
      {
        type: "direction",
        directions: [
          {
            type: "motion",
            subject: { kind: "character", character: "actor" },
            path: [{ x: 12, y: 10 }],
            facing: "left",
          },
          {
            type: "motion",
            subject: { kind: "object", object: "prop" },
            path: [
              { x: 20, y: 20 },
              { x: 30, y: 20 },
            ],
            duration: 2 / 60,
          },
        ],
      },
    ],
  } satisfies SequenceDefinition;
  const scene = {
    background: "room.png",
    walkableRegion: square,
    hotspots: [
      {
        target: { kind: "background" },
        area: square,
        approach: { groundPoint: { x: 10, y: 10 }, facing: "front" },
        noun: {
          labels: [{ text: "Action" }],
          preferredVerbs: [{ verb: "use" }],
          cases: [{ verb: "use", sequence: "action" }],
        } satisfies NounDefinition,
      },
    ],
  } satisfies SceneDefinition;
  const project = validateTestGameProject({
    identity: "test.directed-motion",
    version: "1",
    logicalResolution: { width: 100, height: 100 },
    scenes: { room: scene },
    characters: { actor },
    playerCharacter: "actor",
    objects: { prop },
    sequences: { action },
    initialScene: "room",
    commandLexicon: {
      inventory: { select: "Hold {noun}", deselect: "Put back {noun}" },
      verbs: {
        open: "Open",
        "pick-up": "Pick up",
        push: "Push",
        close: "Close",
        "look-at": "Look",
        pull: "Pull",
        give: "Give",
        "talk-to": "Talk",
        use: "Use",
      },
      patterns: {
        unary: "{verb} {noun}",
        give: "{verb} {first} to {second}",
        use: "{verb} {first} with {second}",
      },
    } satisfies CommandLexicon,
    commandFallbacks: Object.fromEntries(
      [
        "open",
        "pick-up",
        "push",
        "close",
        "look-at",
        "pull",
        "give",
        "talk-to",
        "use",
      ].map((verb) => [verb, { text: "No." }]),
    ) as never,
  } satisfies GameProject);
  const session = createTestSession(project);
  startDirectedSequence(session);
  session.steps(2);

  expect(session.snapshot().activity).toBeNull();
  expect(session.snapshot().characters.actor).toMatchObject({
    groundPoint: { x: 12, y: 10 },
    facing: "left",
  });
  expect(session.snapshot().objects.prop!.location).toEqual({
    kind: "scene",
    scene: "room",
    groundPoint: { x: 30, y: 20 },
  });
});

function arrivalProject(audio?: URL, openingCases?: readonly SceneOpeningCase[]) {
  const square = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 100 },
    { x: 0, y: 100 },
  ];
  const passageNoun = {
    labels: [{ text: "Door" }],
    preferredVerbs: [{ verb: "walk-to" }],
    cases: [],
  } satisfies NounDefinition;
  const room = {
    background: "room.png",
    walkableRegion: square,
    entrances: {
      fromTower: { groundPoint: { x: 10, y: 10 }, facing: "right" },
    },
    passages: [
      {
        area: square,
        approach: { groundPoint: { x: 10, y: 10 }, facing: "right" },
        noun: passageNoun,
        direction: "right",
        destination: { scene: "tower", entrance: "fromRoom" },
      },
    ],
  } satisfies SceneDefinition;
  const tower = {
    background: "tower.png",
    walkableRegion: square,
    entrances: { fromRoom: { groundPoint: { x: 5, y: 5 }, facing: "left" } },
    cases: openingCases ?? [
      {
        entrance: "fromRoom",
        when: { variable: "arrived", equals: false },
        sequence: "arrival",
      },
    ],
    passages: [
      {
        area: square,
        approach: { groundPoint: { x: 5, y: 5 }, facing: "left" },
        noun: passageNoun,
        direction: "left",
        destination: { scene: "room", entrance: "fromTower" },
      },
    ],
  } satisfies SceneDefinition;
  const player = validateTestCharacterDefinition({
    initialScene: "room",
    initialGroundPoint: { x: 10, y: 10 },
    initialFacing: "right",
    initialAppearance: "normal",
    appearances: {
      normal: {
        animations: {
          idle: { sheets: { left: { image: "idle.png", frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, right: { image: "idle.png", frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, front: { image: "idle.png", frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, back: { image: "idle.png", frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) } }, timing: { framesPerSecond: 1, loop: true } },
          walk: { sheets: { left: { image: "walk-left.png", frames: Array.from({ length: 2 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, right: { image: "walk-right.png", frames: Array.from({ length: 2 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, front: { image: "walk-front.png", frames: Array.from({ length: 2 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, back: { image: "walk-back.png", frames: Array.from({ length: 2 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) } }, timing: { framesPerSecond: 8, loop: true } },
        },
        roles: { default: "idle", walking: "walk" },
      },
    },
    movementSpeed: 60,
  } satisfies CharacterDefinition);
  const arrival = {
    steps: [
      audio === undefined
        ? { type: "narration", text: "A boat appears." }
        : { type: "line", character: "player", text: "A boat appears.", audio },
      {
        type: "operations",
        operations: [
          { type: "set-variable", variable: "arrived", value: true },
        ],
      },
    ],
  } satisfies SequenceDefinition;
  return validateTestGameProject({
    identity: "test.arrival-sequence",
    version: "1",
    logicalResolution: { width: 100, height: 100 },
    scenes: { room, tower },
    characters: { player },
    playerCharacter: "player",
    sequences: { arrival },
    variables: { arrived: false },
    initialScene: "room",
    commandLexicon: {
      inventory: { select: "Hold {noun}", deselect: "Put back {noun}" },
      verbs: {
        open: "Open",
        "pick-up": "Pick up",
        push: "Push",
        close: "Close",
        "look-at": "Look",
        pull: "Pull",
        give: "Give",
        "talk-to": "Talk",
        use: "Use",
      },
      patterns: {
        unary: "{verb} {noun}",
        give: "{verb} {first} to {second}",
        use: "{verb} {first} with {second}",
      },
    } satisfies CommandLexicon,
    commandFallbacks: Object.fromEntries(
      [
        "open",
        "pick-up",
        "push",
        "close",
        "look-at",
        "pull",
        "give",
        "talk-to",
        "use",
      ].map((verb) => [verb, { text: "No." }]),
    ) as never,
  } satisfies GameProject);
}

test("CoreSession exposes defensive Sequence Line facts with URL audio", () => {
  const audio = new URL("https://example.test/arrival.ogg");
  const session = createTestSession(arrivalProject(audio));
  session.input({ type: "quick-passage", passage: 0 });
  session.steps();

  const first = session.sequence();
  const second = session.sequence();
  expect(first).toMatchObject({ kind: "line", character: "player", audio });
  if (
    first?.kind !== "line" ||
    second?.kind !== "line" ||
    !(first.audio instanceof URL) ||
    !(second.audio instanceof URL)
  )
    return;
  expect(first.audio).not.toBe(audio);
  expect(first.audio).not.toBe(second.audio);
});

test("a Scene Opening starts its Sequence after the passage commit and before player control", () => {
  const session = createTestSession(arrivalProject());
  session.input({ type: "quick-passage", passage: 0 });
  session.steps();

  expect(session.snapshot()).toMatchObject({
    currentScene: "tower",
    characters: {
      player: { scene: "tower", groundPoint: { x: 5, y: 5 }, facing: "left" },
    },
    activity: {
      type: "sequence",
      sequence: "arrival",
      active: { kind: "narration" },
    },
  });
  session.input({ type: "move", point: { x: 90, y: 90 } });
  session.input({ type: "advance-sequence" });
  session.steps();
  expect(session.snapshot().activity).toBeNull();
  expect(session.snapshot().variables.arrived).toBe(true);

  session.input({ type: "quick-passage", passage: 0 });
  session.steps();
  session.input({ type: "quick-passage", passage: 0 });
  session.steps();
  expect(session.snapshot().currentScene).toBe("tower");
  expect(session.snapshot().activity).toBeNull();
});

test("a Scene Opening case answers with a Line and its Game Operations without a Sequence", () => {
  const session = createTestSession(arrivalProject(undefined, [
    {
      line: { character: "player", text: "The tower is cold." },
      operations: [{ type: "set-variable", variable: "arrived", value: true }],
    },
  ]));
  session.input({ type: "quick-passage", passage: 0 });
  session.steps();

  expect(session.snapshot()).toMatchObject({
    currentScene: "tower",
    variables: { arrived: true },
    activity: {
      type: "line",
      line: { character: "player", text: "The tower is cold." },
    },
  });
});

test("a Scene Opening case answers with a Command Response", () => {
  const session = createTestSession(arrivalProject(undefined, [
    { response: { text: "The door falls shut behind you." } },
  ]));
  session.input({ type: "quick-passage", passage: 0 });
  session.steps();

  expect(session.effects().map((effect) =>
    effect.type === "interaction-response" ? effect.text : "",
  )).toContain("The door falls shut behind you.");
  expect(session.snapshot().activity).toBeNull();
});

test("the first eligible Scene Opening case applies and the ones below it do not", () => {
  const session = createTestSession(arrivalProject(undefined, [
    {
      when: { variable: "arrived", equals: false },
      line: { character: "player", text: "The first case." },
    },
    { line: { character: "player", text: "The case below it." } },
  ]));
  session.input({ type: "quick-passage", passage: 0 });
  session.steps();

  expect(session.snapshot().activity).toMatchObject({
    type: "line",
    line: { text: "The first case." },
  });
});

test("a Scene Opening case naming a Scene Entrance that does not exist is refused", () => {
  let error: unknown;
  try {
    arrivalProject(undefined, [{ entrance: "fromCellar", sequence: "arrival" }]);
  } catch (cause) {
    error = cause;
  }
  expect(error).toBeInstanceOf(AuthoringError);
  expect((error as AuthoringError).diagnostics).toContainEqual(
    expect.objectContaining({
      code: "reference.scene-opening.entrance",
      path: "scenes.tower.cases[0].entrance",
    }),
  );
});

test("a Scene Opening case placed below an unconditional one is refused", () => {
  let error: unknown;
  try {
    arrivalProject(undefined, [
      // Unconditional and naming no Entrance, so it applies to every opening:
      // the case below it can never be reached.
      { line: { character: "player", text: "Always." } },
      {
        when: { variable: "arrived", equals: false },
        line: { character: "player", text: "Never reached." },
      },
    ]);
  } catch (cause) {
    error = cause;
  }
  expect(error).toBeInstanceOf(AuthoringError);
  expect((error as AuthoringError).diagnostics).toContainEqual(
    expect.objectContaining({
      code: "definition.conditional-fallback",
      path: "scenes.tower.cases",
    }),
  );
});

test("a Scene Opening case naming an Entrance never shadows the cases below it", () => {
  // Naming an Entrance is itself a condition — the case applies only to that
  // door — so it is not a default and nothing below it is dead.
  expect(() => arrivalProject(undefined, [
    { entrance: "fromRoom", sequence: "arrival" },
    { line: { character: "player", text: "Every other opening." } },
  ])).not.toThrow();
});

/** The same project with Interaction Cases on the Scene the game begins in. */
function initialSceneOpeningProject(cases: readonly SceneOpeningCase[]) {
  const base = arrivalProject(undefined, []);
  return validateTestGameProject({
    ...base,
    scenes: { ...base.scenes, room: { ...base.scenes.room, cases } },
  });
}

test("a new game opens on its initial Scene before the Player has control", () => {
  const session = createTestSession(initialSceneOpeningProject([{ sequence: "arrival" }]));

  expect(session.snapshot()).toMatchObject({
    currentScene: "room",
    tick: 0,
    activity: { type: "sequence", sequence: "arrival", active: { kind: "narration" } },
  });
  // The Player has no frame of control before the staging: the first movement
  // the Session is offered is refused while the Sequence holds the Scene.
  session.input({ type: "move", point: { x: 90, y: 90 } });
  session.steps();
  expect(session.snapshot().characters.player).toMatchObject({
    groundPoint: { x: 10, y: 10 },
  });
});

test("the same game restored from a Save Snapshot does not open its initial Scene", () => {
  const project = initialSceneOpeningProject([{ sequence: "arrival" }]);
  const opened = createTestSession(project);
  opened.input({ type: "advance-sequence" });
  opened.steps(2);
  expect(opened.snapshot().activity).toBeNull();

  const validation = validateTestSaveSnapshot(project, opened.createSaveSnapshot());
  expect(validation.ok).toBe(true);
  if (!validation.ok) return;
  const restored = createTestSession(project, validation.snapshot);

  expect(restored.snapshot().activity).toBeNull();
  expect(restored.snapshot()).toEqual(opened.snapshot());
});

test("an opening case naming a Scene Entrance waits for that door rather than the start", () => {
  const session = createTestSession(initialSceneOpeningProject([
    { entrance: "fromTower", line: { character: "player", text: "Back in the room." } },
  ]));
  expect(session.snapshot().activity).toBeNull();

  session.input({ type: "quick-passage", passage: 0 });
  session.steps();
  expect(session.snapshot().currentScene).toBe("tower");
  session.input({ type: "quick-passage", passage: 0 });
  session.steps();

  expect(session.snapshot()).toMatchObject({
    currentScene: "room",
    activity: { type: "line", line: { text: "Back in the room." } },
  });
});

test("an opening case naming no Entrance applies at the start and on every later arrival", () => {
  const session = createTestSession(initialSceneOpeningProject([
    { line: { character: "player", text: "The room is quiet." } },
  ]));
  expect(session.snapshot().activity).toMatchObject({
    type: "line",
    line: { text: "The room is quiet." },
  });

  session.input({ type: "advance-line" });
  session.steps();
  session.input({ type: "quick-passage", passage: 0 });
  session.steps();
  session.input({ type: "quick-passage", passage: 0 });
  session.steps();

  expect(session.snapshot()).toMatchObject({
    currentScene: "room",
    activity: { type: "line", line: { text: "The room is quiet." } },
  });
});

test("an opening at the start of a game is decided by the whole initial Session state", () => {
  const session = createTestSession(initialSceneOpeningProject([
    {
      when: { variable: "arrived", equals: true },
      line: { character: "player", text: "Back again." },
    },
    {
      when: { variable: "arrived", equals: false },
      line: { character: "player", text: "For the first time." },
    },
  ]));

  expect(session.snapshot().activity).toMatchObject({
    type: "line",
    line: { text: "For the first time." },
  });
});

test("an opening at the start of a game may answer with a Command Response alone", () => {
  const session = createTestSession(initialSceneOpeningProject([
    {
      response: { text: "The door has already closed behind you." },
      operations: [{ type: "set-variable", variable: "arrived", value: true }],
    },
  ]));

  expect(session.effects().map((effect) =>
    effect.type === "interaction-response" ? effect.text : "",
  )).toContain("The door has already closed behind you.");
  expect(session.snapshot()).toMatchObject({ variables: { arrived: true }, activity: null });
});
