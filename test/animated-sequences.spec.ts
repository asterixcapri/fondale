import { expect, test } from "@playwright/test";

import {
  AuthoringError,
  defineCharacter,
  defineCommandLexicon,
  defineGame,
  defineNoun,
  defineObject,
  defineScene,
  defineSequence,
  validateSaveSnapshot,
  type Appearance,
} from "../src/index";
import { createTestSession } from "../src/internal/core";

const staticAppearance = (image: string): Appearance => ({
  animations: {
    idle: {
      frames: [image],
      framesPerSecond: 1,
      loop: true,
    },
  },
  roles: { default: "idle" },
});

test("an Appearance owns immutable Animations and semantic Animation Roles", () => {
  const appearance: Appearance = {
    animations: {
      idle: { frames: ["idle-1.png", "idle-2.png"], framesPerSecond: 4, loop: true },
      speaking: {
        frames: ["speak-1.png", "speak-2.png"],
        framesPerSecond: 8,
        loop: true,
        cues: { syllable: 0.125 },
      },
      walking: {
        frames: {
          side: { image: "walk-side.png", count: 4 },
          front: { image: "walk-front.png", count: 4 },
          back: { image: "walk-back.png", count: 4 },
        },
        framesPerSecond: 8,
        loop: true,
      },
    },
    roles: { default: "idle", speaking: "speaking", walking: "walking" },
    visualAnchor: { x: 8, y: 16 },
  };

  const character = defineCharacter({
    initialScene: "room",
    initialGroundPoint: { x: 10, y: 10 },
    initialFacing: "front",
    initialAppearance: "normal",
    appearances: { normal: appearance },
    movementSpeed: 60,
  });

  expect(character.appearances.normal).toEqual(appearance);
  const result = character.appearances.normal as Appearance;
  expect(Object.isFrozen(result.animations.speaking!.cues)).toBe(true);
  expect(Object.isFrozen(result.roles)).toBe(true);
});

test("Appearance validation aggregates invalid Animation values and Role references", () => {
  expect(() => defineCharacter({
    initialScene: "room",
    initialGroundPoint: { x: 10, y: 10 },
    initialFacing: "front",
    initialAppearance: "normal",
    appearances: {
      normal: {
        animations: {
          idle: { frames: [], framesPerSecond: 0, cues: { late: -1 } },
        },
        roles: { default: "missing", speaking: "also-missing" },
      },
    },
    movementSpeed: 60,
  })).toThrow(AuthoringError);
});

test("composition diagnoses a movable Player Appearance without a walking Role", () => {
  const scene = defineScene({
    background: "room.png",
    walkableRegion: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }],
  });
  const player = defineCharacter({
    initialScene: "room",
    initialGroundPoint: { x: 10, y: 10 },
    initialFacing: "front",
    initialAppearance: "normal",
    appearances: { normal: staticAppearance("player.png") },
    movementSpeed: 60,
  });

  try {
    defineGame({
      identity: "test.missing-walking-role",
      version: "1",
      logicalResolution: { width: 100, height: 100 },
      scenes: { room: scene },
      characters: { player },
      playerCharacter: "player",
      initialScene: "room",
    });
    throw new Error("Expected defineGame to reject the project.");
  } catch (error) {
    expect(error).toBeInstanceOf(AuthoringError);
    expect((error as AuthoringError).diagnostics).toContainEqual(expect.objectContaining({
      code: "reference.animation.walking-role",
      path: "characters.player.appearances.normal.roles.walking",
    }));
  }
});

test("composition diagnoses nested directed Sequences and Motion outside their Scene", () => {
  const scene = defineScene({
    background: "room.png",
    walkableRegion: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }],
    scenery: {
      marker: {
        baseline: 20,
        initialAppearance: "normal",
        appearances: { normal: staticAppearance("marker.png") },
      },
    },
  });
  const nested = defineSequence({
    steps: [{
      type: "branch",
      cases: [{
        when: { variable: "enabled", equals: true },
        steps: [{
          type: "direct",
          directions: [{
            type: "motion",
            subject: { kind: "scenery", scenery: "marker" },
            path: [{ x: 101, y: 20 }],
            duration: 1,
          }],
        }],
      }],
      fallback: [],
    }],
  });

  try {
    defineGame({
      identity: "test.invalid-directed-scene",
      version: "1",
      logicalResolution: { width: 100, height: 100 },
      scenes: { room: scene },
      sequences: { nested },
      variables: { enabled: true },
      initialScene: "room",
    });
    throw new Error("Expected defineGame to reject the project.");
  } catch (error) {
    expect(error).toBeInstanceOf(AuthoringError);
    expect((error as AuthoringError).diagnostics).toContainEqual(expect.objectContaining({
      code: "reference.sequence.scene",
      path: "sequences.nested.scene",
    }));
  }

  const bounded = defineSequence({ ...nested, scene: "room" });
  expect(() => defineGame({
    identity: "test.invalid-motion-bounds",
    version: "1",
    logicalResolution: { width: 100, height: 100 },
    scenes: { room: scene },
    sequences: { bounded },
    variables: { enabled: true },
    initialScene: "room",
  })).toThrow(/Motion path point/);
});

export { staticAppearance };

function directedProject(skippable = false) {
  const square = [
    { x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 },
  ];
  const actor = defineCharacter({
    initialScene: "room",
    initialGroundPoint: { x: 10, y: 10 },
    initialFacing: "front",
    initialAppearance: "normal",
    appearances: {
      normal: {
        animations: {
          idle: { frames: ["idle.png"], framesPerSecond: 1, loop: true },
          gesture: {
            frames: ["gesture-1.png", "gesture-2.png"],
            framesPerSecond: 60,
            cues: { contact: 1 / 60 },
          },
          walk: {
            frames: {
              side: { image: "walk-side.png", count: 2 },
              front: { image: "walk-front.png", count: 2 },
              back: { image: "walk-back.png", count: 2 },
            },
            framesPerSecond: 60,
            loop: true,
          },
        },
        roles: { default: "idle", walking: "walk" },
      },
    },
    movementSpeed: 60,
  });
  const action = defineSequence({
    scene: "room",
    ...(skippable ? {
      skippable: true,
      skipOutcome: [{ type: "set-variable" as const, variable: "finished", value: true }],
    } : {}),
    steps: [
      {
        type: "direct",
        directions: [
          {
            type: "animation",
            subject: { kind: "character", character: "actor" },
            animation: "gesture",
          },
          {
            type: "motion",
            subject: { kind: "scenery", scenery: "marker" },
            path: [{ x: 20, y: 20 }, { x: 60, y: 30 }],
            duration: 2 / 60,
          },
          {
            type: "animation",
            subject: { kind: "scenery", scenery: "marker" },
            animation: "react",
            startAfter: { direction: 0, cue: "contact" },
          },
          { type: "camera", mode: "hold", point: { x: 50, y: 50 }, duration: 2 / 60 },
        ],
      },
      {
        type: "operations",
        operations: [{ type: "set-variable", variable: "finished", value: true }],
      },
    ],
  });
  const scene = defineScene({
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
              idle: { frames: ["marker.png"], framesPerSecond: 1, loop: true },
              react: { frames: ["react-1.png", "react-2.png"], framesPerSecond: 60 },
            },
            roles: { default: "idle" },
          },
        },
      },
    },
    hotspots: [{
      target: { kind: "background" },
      area: square,
      approach: { groundPoint: { x: 10, y: 10 }, facing: "front" },
      noun: defineNoun({
        labels: [{ text: "Action" }],
        preferredVerbs: [{ verb: "use" }],
        cases: [{ verb: "use", sequence: "action" }],
      }),
    }],
  });
  return defineGame({
    identity: "test.animated-sequences",
    version: "1",
    logicalResolution: { width: 100, height: 100 },
    scenes: { room: scene },
    characters: { actor },
    playerCharacter: "actor",
    sequences: { action },
    variables: { finished: false },
    initialScene: "room",
    commandLexicon: defineCommandLexicon({
      inventory: { select: "Hold {noun}", deselect: "Put back {noun}" },
      verbs: {
        open: "Open", "pick-up": "Pick up", push: "Push", close: "Close",
        "look-at": "Look", pull: "Pull", give: "Give", "talk-to": "Talk", use: "Use",
      },
      patterns: { unary: "{verb} {noun}", give: "{verb} {first} to {second}", use: "{verb} {first} with {second}" },
    }),
    commandFallbacks: Object.fromEntries([
      "open", "pick-up", "push", "close", "look-at", "pull", "give", "talk-to", "use",
    ].map((verb) => [verb, { text: "No." }])) as never,
  });
}

function startDirectedSequence(session: ReturnType<typeof createTestSession>): void {
  session.input({ type: "quick-hotspot", hotspot: 0, verb: "use" });
  session.steps();
}

test("a directed Sequence waits for all finite directions and blocks normal input", () => {
  const session = createTestSession(directedProject());
  startDirectedSequence(session);
  expect(session.snapshot().activity).toMatchObject({
    type: "sequence",
    active: { kind: "direct", elapsedTicks: 0 },
  });

  session.input({ type: "move", point: { x: 90, y: 90 } });
  session.steps(2);
  expect(session.snapshot().activity).toMatchObject({
    type: "sequence",
    active: { kind: "direct", elapsedTicks: 2 },
  });
  expect(session.snapshot().variables.finished).toBe(false);

  session.steps();
  expect(session.snapshot().activity).toBeNull();
  expect(session.snapshot().variables.finished).toBe(true);
  expect(session.snapshot().characters.actor!.groundPoint).toEqual({ x: 10, y: 10 });
});

test("directed Sequence progress survives Save and restore", () => {
  const project = directedProject();
  const uninterrupted = createTestSession(project);
  startDirectedSequence(uninterrupted);
  uninterrupted.steps();
  const validation = validateSaveSnapshot(
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
    { x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 },
  ];
  const actor = defineCharacter({
    initialScene: "room",
    initialGroundPoint: { x: 10, y: 10 },
    initialFacing: "front",
    initialAppearance: "normal",
    appearances: {
      normal: {
        animations: { idle: { frames: ["actor.png"], framesPerSecond: 1, loop: true } },
        roles: { default: "idle", walking: "idle" },
      },
    },
    movementSpeed: 60,
  });
  const prop = defineObject({
    initialScene: "room",
    initialGroundPoint: { x: 20, y: 20 },
    initialAppearance: "normal",
    appearances: { normal: staticAppearance("prop.png") },
    inventoryAppearance: "prop-inventory.png",
  });
  const action = defineSequence({
    scene: "room",
    steps: [{
      type: "direct",
      directions: [{
        type: "motion",
        subject: { kind: "character", character: "actor" },
        path: [{ x: 12, y: 10 }],
        facing: "left",
      }, {
        type: "motion",
        subject: { kind: "object", object: "prop" },
        path: [{ x: 20, y: 20 }, { x: 30, y: 20 }],
        duration: 2 / 60,
      }],
    }],
  });
  const scene = defineScene({
    background: "room.png",
    walkableRegion: square,
    hotspots: [{
      target: { kind: "background" },
      area: square,
      approach: { groundPoint: { x: 10, y: 10 }, facing: "front" },
      noun: defineNoun({
        labels: [{ text: "Action" }],
        preferredVerbs: [{ verb: "use" }],
        cases: [{ verb: "use", sequence: "action" }],
      }),
    }],
  });
  const project = defineGame({
    identity: "test.directed-motion",
    version: "1",
    logicalResolution: { width: 100, height: 100 },
    scenes: { room: scene },
    characters: { actor },
    playerCharacter: "actor",
    objects: { prop },
    sequences: { action },
    initialScene: "room",
    commandLexicon: defineCommandLexicon({
      inventory: { select: "Hold {noun}", deselect: "Put back {noun}" },
      verbs: {
        open: "Open", "pick-up": "Pick up", push: "Push", close: "Close",
        "look-at": "Look", pull: "Pull", give: "Give", "talk-to": "Talk", use: "Use",
      },
      patterns: { unary: "{verb} {noun}", give: "{verb} {first} to {second}", use: "{verb} {first} with {second}" },
    }),
    commandFallbacks: Object.fromEntries([
      "open", "pick-up", "push", "close", "look-at", "pull", "give", "talk-to", "use",
    ].map((verb) => [verb, { text: "No." }])) as never,
  });
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

function arrivalProject() {
  const square = [
    { x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 },
  ];
  const passageNoun = defineNoun({
    labels: [{ text: "Door" }],
    preferredVerbs: [{ verb: "walk-to" }],
    cases: [],
  });
  const room = defineScene({
    background: "room.png",
    walkableRegion: square,
    entrances: { fromTower: { groundPoint: { x: 10, y: 10 }, facing: "right" } },
    passages: [{
      area: square,
      approach: { groundPoint: { x: 10, y: 10 }, facing: "right" },
      noun: passageNoun,
      direction: "right",
      destination: { scene: "tower", entrance: "fromRoom" },
    }],
  });
  const tower = defineScene({
    background: "tower.png",
    walkableRegion: square,
    entrances: { fromRoom: { groundPoint: { x: 5, y: 5 }, facing: "left" } },
    arrivalSequences: [{
      entrance: "fromRoom",
      when: { variable: "arrived", equals: false },
      sequence: "arrival",
    }],
    passages: [{
      area: square,
      approach: { groundPoint: { x: 5, y: 5 }, facing: "left" },
      noun: passageNoun,
      direction: "left",
      destination: { scene: "room", entrance: "fromTower" },
    }],
  });
  const player = defineCharacter({
    initialScene: "room",
    initialGroundPoint: { x: 10, y: 10 },
    initialFacing: "right",
    initialAppearance: "normal",
    appearances: {
      normal: {
        animations: {
          idle: { frames: ["idle.png"], framesPerSecond: 1, loop: true },
          walk: {
            frames: {
              side: { image: "walk-side.png", count: 2 },
              front: { image: "walk-front.png", count: 2 },
              back: { image: "walk-back.png", count: 2 },
            },
            framesPerSecond: 8,
            loop: true,
          },
        },
        roles: { default: "idle", walking: "walk" },
      },
    },
    movementSpeed: 60,
  });
  const arrival = defineSequence({
    steps: [
      { type: "narration", text: "A boat appears." },
      { type: "operations", operations: [{ type: "set-variable", variable: "arrived", value: true }] },
    ],
  });
  return defineGame({
    identity: "test.arrival-sequence",
    version: "1",
    logicalResolution: { width: 100, height: 100 },
    scenes: { room, tower },
    characters: { player },
    playerCharacter: "player",
    sequences: { arrival },
    variables: { arrived: false },
    initialScene: "room",
    commandLexicon: defineCommandLexicon({
      inventory: { select: "Hold {noun}", deselect: "Put back {noun}" },
      verbs: {
        open: "Open", "pick-up": "Pick up", push: "Push", close: "Close",
        "look-at": "Look", pull: "Pull", give: "Give", "talk-to": "Talk", use: "Use",
      },
      patterns: { unary: "{verb} {noun}", give: "{verb} {first} to {second}", use: "{verb} {first} with {second}" },
    }),
    commandFallbacks: Object.fromEntries([
      "open", "pick-up", "push", "close", "look-at", "pull", "give", "talk-to", "use",
    ].map((verb) => [verb, { text: "No." }])) as never,
  });
}

test("a Scene arrival starts its Sequence after the passage commit and before player control", () => {
  const session = createTestSession(arrivalProject());
  session.input({ type: "quick-passage", passage: 0 });
  session.steps();

  expect(session.snapshot()).toMatchObject({
    currentScene: "tower",
    characters: { player: { scene: "tower", groundPoint: { x: 5, y: 5 }, facing: "left" } },
    activity: { type: "sequence", sequence: "arrival", active: { kind: "narration" } },
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
