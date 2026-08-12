import { expect, test } from "@playwright/test";

import {
  createSequence,
  defineSequence,
  sequenceLines,
  validateSequenceDefinition,
  validateSequenceReferences,
  type SequenceRuntimeContext,
} from "./index";

const runtimeContext: SequenceRuntimeContext = {
  tick: 12,
  playerCharacter: "player",
  conditionMatches: (condition) =>
    condition === undefined || "variable" in condition && condition.variable === "open" && condition.equals,
  directedSubjectsAreAvailable: () => true,
};

test("Sequence validates its complete local contract with a rooted path", () => {
  const cyclic: unknown[] = [];
  cyclic.push({
    type: "branch",
    cases: [],
    fallback: cyclic,
  });
  const diagnostics = validateSequenceDefinition({
    skippable: true,
    steps: [{ type: "line", character: "", text: "" }, {
      type: "narration",
      text: "",
    }, {
      type: "choice",
      alternatives: Array.from({ length: 7 }, (_, index) => ({ text: String(index), steps: [] })),
      fallback: { text: "Leave", steps: cyclic },
    }, {
      type: "operations",
      operations: [{ type: "start-sequence", sequence: "nested" }],
    }, {
      type: "direction",
      directions: [{
        type: "motion",
        subject: { kind: "object", object: "key" },
        path: [],
        duration: 0,
      }, {
        type: "camera",
        mode: "cut",
        point: { x: 0, y: 0 },
        startAfter: { direction: 0, cue: "" },
      }],
    }],
  } as never, "sequences.opening");

  expect(diagnostics).toEqual(expect.arrayContaining([
    expect.objectContaining({ code: "definition.sequence.skip-outcome", path: "sequences.opening.skipOutcome" }),
    expect.objectContaining({ code: "definition.line.character", path: "sequences.opening.steps[0].character" }),
    expect.objectContaining({ code: "definition.line.text", path: "sequences.opening.steps[0].text" }),
    expect.objectContaining({ code: "definition.narration.text", path: "sequences.opening.steps[1].text" }),
    expect.objectContaining({ code: "definition.choice.limit", path: "sequences.opening.steps[2].alternatives" }),
    expect.objectContaining({ code: "definition.sequence.cycle" }),
    expect.objectContaining({ code: "definition.sequence.nested", path: "sequences.opening.steps[3].operations[0]" }),
    expect.objectContaining({ code: "definition.motion.path", path: "sequences.opening.steps[4].directions[0].path" }),
    expect.objectContaining({ code: "definition.motion.duration", path: "sequences.opening.steps[4].directions[0].duration" }),
    expect.objectContaining({
      code: "definition.sequence.cue-source",
      path: "sequences.opening.steps[4].directions[1].startAfter.direction",
    }),
    expect.objectContaining({
      code: "definition.sequence.cue-name",
      path: "sequences.opening.steps[4].directions[1].startAfter.cue",
    }),
  ]));
  expect(diagnostics.every(({ owner }) => ["sequence", "world", "camera"].includes(owner))).toBe(true);
});

test("Sequence traverses a Branch and requests Operations before presenting a Line", () => {
  const sequence = createSequence({
    opening: defineSequence({
      steps: [{
        type: "branch",
        cases: [{
          when: { variable: "open", equals: true },
          steps: [{
            type: "operations",
            operations: [{ type: "set-variable", variable: "visited", value: true }],
          }, {
            type: "line",
            character: "guide",
            text: "Welcome inside.",
          }],
        }],
        fallback: [{ type: "narration", text: "The door remains closed." }],
      }],
    }),
  });
  const started = sequence.start("opening", "room");
  const beforeAdvance = structuredClone(started);

  const operationDecision = sequence.advance(started, runtimeContext);

  expect(started).toEqual(beforeAdvance);
  expect(operationDecision).toMatchObject({
    type: "apply-operations",
    operations: [{ type: "set-variable", variable: "visited", value: true }],
  });
  if (operationDecision.type !== "apply-operations") return;

  const lineDecision = sequence.advance(operationDecision.activity, runtimeContext);
  expect(lineDecision.type).toBe("waiting");
  if (lineDecision.type !== "waiting") return;
  expect(sequence.presentation(lineDecision.activity)).toEqual({
    kind: "line",
    character: "guide",
    text: "Welcome inside.",
    animationStartedTick: 13,
  });
});

test("Sequence owns Choice eligibility, speech, and nested continuation", () => {
  const sequence = createSequence({
    conversation: defineSequence({
      steps: [{
        type: "choice",
        alternatives: [{
          text: "Open it.",
          when: { variable: "open", equals: true },
          steps: [{ type: "narration", text: "The hinges answer." }],
        }, {
          text: "Wait.",
          when: { variable: "open", equals: false },
          steps: [],
        }],
        fallback: { text: "Leave.", spoken: false, steps: [] },
      }],
    }),
  });
  const choiceDecision = sequence.advance(sequence.start("conversation", "room"), runtimeContext);
  expect(choiceDecision).toMatchObject({
    type: "waiting",
    activity: { active: { kind: "choice", eligibleAlternatives: [0] } },
  });
  if (choiceDecision.type !== "waiting") return;

  const spokenDecision = sequence.choose(choiceDecision.activity, 0, runtimeContext);
  expect(spokenDecision).toMatchObject({
    type: "waiting",
    activity: { active: { kind: "line", choiceText: "Open it.", choiceCharacter: "player" } },
  });
  if (spokenDecision.type !== "waiting") return;
  expect(sequence.presentation(spokenDecision.activity)).toMatchObject({
    kind: "line",
    character: "player",
    text: "Open it.",
  });

  const narrationDecision = sequence.continue(spokenDecision.activity, runtimeContext);
  expect(narrationDecision).toMatchObject({
    type: "waiting",
    activity: { active: { kind: "narration" } },
  });
});

test("Sequence selects the unspoken Choice fallback and completes its nested path", () => {
  const sequence = createSequence({
    fallback: defineSequence({
      steps: [{
        type: "choice",
        alternatives: [{
          text: "Unavailable.",
          when: { variable: "open", equals: false },
          steps: [],
        }],
        fallback: {
          text: "Leave.",
          spoken: false,
          steps: [{ type: "narration", text: "You step away." }],
        },
      }],
    }),
  });
  const choice = sequence.advance(sequence.start("fallback", "room"), runtimeContext);
  expect(choice).toMatchObject({
    type: "waiting",
    activity: { active: { kind: "choice", eligibleAlternatives: [-1] } },
  });
  if (choice.type !== "waiting") return;
  const narration = sequence.choose(choice.activity, -1, runtimeContext);
  expect(narration).toMatchObject({
    type: "waiting",
    activity: { active: { kind: "narration" } },
  });
  if (narration.type !== "waiting") return;
  expect(sequence.continue(narration.activity, runtimeContext)).toEqual({ type: "complete" });
});

test("Sequence returns an explicit Skip Outcome without applying Game Operations", () => {
  const sequence = createSequence({
    skippable: defineSequence({
      skippable: true,
      skipOutcome: [{ type: "set-variable", variable: "finished", value: true }],
      steps: [{ type: "narration", text: "A long account." }],
    }),
  });
  const waiting = sequence.advance(sequence.start("skippable", "room"), runtimeContext);
  if (waiting.type !== "waiting") throw new Error("expected an active Sequence");

  expect(sequence.skip(waiting.activity)).toEqual({
    type: "apply-skip-outcome",
    operations: [{ type: "set-variable", variable: "finished", value: true }],
  });
});

test("Sequence owns Direction progress and resumes traversal after completion", () => {
  const sequence = createSequence({
    directed: defineSequence({
      scene: "room",
      steps: [{
        type: "direction",
        directions: [{ type: "camera", mode: "cut", point: { x: 10, y: 10 } }],
      }, {
        type: "narration",
        text: "The view settles.",
      }],
    }),
  });
  const waiting = sequence.advance(sequence.start("directed", "room"), runtimeContext);
  if (waiting.type !== "waiting") throw new Error("expected a Direction Step");

  const ticked = sequence.tickDirection(waiting.activity);
  expect(waiting.activity.active).toMatchObject({ kind: "direction", elapsedTicks: 0 });
  expect(ticked.active).toMatchObject({ kind: "direction", elapsedTicks: 1 });
  expect(sequence.presentation(ticked, {
    animationFor: () => undefined,
    characterMotionComplete: () => false,
  })).toMatchObject({
    kind: "direction",
    complete: true,
    directions: [{ direction: { type: "camera", mode: "cut" }, timing: { complete: true } }],
  });

  const narration = sequence.completeDirection(ticked, runtimeContext);
  expect(narration).toMatchObject({
    type: "waiting",
    activity: { active: { kind: "narration" } },
  });
});

test("Sequence rejects a start outside its authored Scene", () => {
  const sequence = createSequence({
    local: defineSequence({
      scene: "room",
      steps: [{ type: "narration", text: "Only here." }],
    }),
  });

  expect(() => sequence.start("local", "outside")).toThrow(
    "Sequence 'local' belongs to another Scene.",
  );
});

test("Sequence owns diagnostics for its composed references", () => {
  const definition = {
    steps: [{ type: "line", character: "missing", text: "Hello." }, {
      type: "choice",
      alternatives: [{ text: "Continue.", steps: [{
        type: "operations",
        operations: [{ type: "start-sequence", sequence: "another" }],
      }] }],
      fallback: { text: "Leave.", spoken: false, steps: [] },
    }],
  } as const;

  expect(validateSequenceReferences("opening", definition, {
    sceneExists: () => true,
    characterExists: () => false,
    appearancesForCharacter: () => [],
    appearancesForSubject: () => [],
    initialObjectsInScene: () => new Set(),
    hasDirectedSubject: () => false,
    cameraSubjectExists: () => false,
    pointInScene: () => false,
    validateCondition: () => [],
    validateOperations: () => [],
    validateMotion: () => [],
  })).toEqual(expect.arrayContaining([
    expect.objectContaining({ code: "reference.character", owner: "sequence" }),
    expect.objectContaining({ code: "definition.choice.player-character", owner: "sequence" }),
  ]));
});

test("Sequence validates restored active state against its authored traversal", () => {
  const sequence = createSequence({
    restore: defineSequence({
      steps: [{ type: "narration", text: "Before." }, {
        type: "choice",
        alternatives: [{ text: "Continue.", spoken: false, steps: [] }],
        fallback: { text: "Leave.", spoken: false, steps: [] },
      }, { type: "narration", text: "After." }, {
        type: "narration",
        text: "Last.",
      }],
    }),
  });
  const first = sequence.advance(sequence.start("restore", "room"), runtimeContext);
  if (first.type !== "waiting") throw new Error("expected Narration");
  const choice = sequence.continue(first.activity, runtimeContext);
  if (choice.type !== "waiting") throw new Error("expected Choice");
  const restoreContext = {
    currentTick: 12,
    playerCharacter: "player",
    characterExists: () => true,
    conditionMatches: runtimeContext.conditionMatches,
  };

  expect(sequence.isValidActivity(choice.activity, restoreContext)).toBe(true);
  expect(sequence.isValidActivity({
    ...choice.activity,
    pendingPaths: [...choice.activity.pendingPaths].reverse(),
  }, restoreContext)).toBe(false);
});

test("Sequence rejects impossible restored Choice speech metadata", () => {
  const sequence = createSequence({
    restore: defineSequence({
      steps: [
        { type: "line", character: "guide", text: "Before." },
        {
          type: "choice",
          alternatives: [{ text: "Continue.", steps: [] }],
          fallback: { text: "Leave.", steps: [] },
        },
      ],
    }),
  });
  const restoreContext = {
    currentTick: 12,
    playerCharacter: "player",
    characterExists: () => true,
    conditionMatches: runtimeContext.conditionMatches,
  };
  const line = sequence.advance(sequence.start("restore", "room"), runtimeContext);
  if (line.type !== "waiting" || line.activity.active?.kind !== "line") {
    throw new Error("expected Line");
  }
  expect(sequence.isValidActivity({
    ...line.activity,
    active: { ...line.activity.active, choiceCharacter: "villain" },
  }, restoreContext)).toBe(false);

  const choice = sequence.continue(line.activity, runtimeContext);
  if (choice.type !== "waiting") throw new Error("expected Choice");
  const spoken = sequence.choose(choice.activity, 0, runtimeContext);
  if (spoken.type !== "waiting" || spoken.activity.active?.kind !== "line") {
    throw new Error("expected spoken Choice");
  }
  expect(sequence.isValidActivity({
    ...spoken.activity,
    active: { ...spoken.activity.active, choiceCharacter: "villain" },
  }, restoreContext)).toBe(false);
});

test("Sequence enumerates nested Lines with stable authored paths", () => {
  const definition = defineSequence({
    steps: [{
      type: "branch",
      cases: [{
        when: { variable: "open", equals: true },
        steps: [{ type: "line", character: "guide", text: "Inside.", audio: "inside.ogg" }],
      }],
      fallback: [{ type: "narration", text: "Outside." }],
    }],
  });

  expect(sequenceLines(definition, "sequences.opening.steps")).toEqual([{
    line: expect.objectContaining({ text: "Inside.", audio: "inside.ogg" }),
    path: "sequences.opening.steps[0].cases[0].steps[0]",
  }]);
});

test("Sequence presentation defensively clones a Line audio URL", () => {
  const audio = new URL("https://example.test/line.ogg");
  const sequence = createSequence({
    audio: defineSequence({
      steps: [{ type: "line", character: "guide", text: "Listen.", audio }],
    }),
  });
  const waiting = sequence.advance(sequence.start("audio", "room"), runtimeContext);
  if (waiting.type !== "waiting") throw new Error("expected Line");

  const presentation = sequence.presentation(waiting.activity);
  const repeated = sequence.presentation(waiting.activity);
  expect(presentation).toMatchObject({ kind: "line", audio });
  if (presentation?.kind !== "line" || repeated?.kind !== "line" ||
      !(presentation.audio instanceof URL) || !(repeated.audio instanceof URL)) return;
  expect(presentation.audio).not.toBe(audio);
  expect(presentation.audio).not.toBe(repeated.audio);
});
