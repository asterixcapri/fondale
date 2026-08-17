import type { AuthoringDiagnostic, GameOperation } from "../game-project";
import {
  eligibleAlternativeIndexes,
  exceedsEligibleAlternativeLimit,
  type InteractionCondition,
} from "../interaction";
import {
  validateMotionDirection,
  type ArrivalSequenceRule,
  type Facing,
  type Point,
} from "../world";
import {
  animationCueTick,
  animationDurationTicks,
  validateAnimationReference,
  type AnyAnimationDefinition,
  type AnimationBearingAppearance,
} from "../animation";
import {
  validateCameraDirection,
  validateCameraDirectionReferences,
  type CameraDirection,
} from "../camera";

export interface Line {
  readonly text: string;
  readonly character: string;
  readonly audio?: URL | string;
  readonly animation?: string;
}

/** Validates references owned by one Line wherever another capability embeds it. */
export function validateLineReferences(
  line: Line | undefined,
  path: string,
  context: {
    readonly characterExists: (character: string) => boolean;
    readonly appearancesForCharacter: (character: string) => readonly AnimationBearingAppearance[];
  },
): readonly AuthoringDiagnostic[] {
  if (!line) return [];
  if (!context.characterExists(line.character)) {
    return [{
      code: "reference.character",
      family: "reference",
      owner: "sequence",
      path: `${path}.character`,
      message: `Character '${line.character}' does not exist.`,
    }];
  }
  return line.animation === undefined
    ? []
    : validateAnimationReference(
        context.appearancesForCharacter(line.character),
        line.animation,
        `${path}.animation`,
        "reference.animation.line",
        `Line Animation '${line.animation}' is not available in every Appearance of Character '${line.character}'.`,
      );
}

export interface LineStep extends Line {
  readonly type: "line";
}

export interface NarrationStep {
  readonly type: "narration";
  readonly text: string;
}

export interface OperationsStep {
  readonly type: "operations";
  readonly operations: readonly GameOperation[];
}

export interface ChoiceAlternative {
  readonly text: string;
  readonly when?: InteractionCondition;
  readonly spoken?: boolean;
  readonly steps: readonly SequenceStep[];
}

export interface ChoiceStep {
  readonly type: "choice";
  readonly alternatives: readonly ChoiceAlternative[];
  readonly fallback: {
    readonly text: string;
    readonly spoken?: boolean;
    readonly steps: readonly SequenceStep[];
  };
}

export interface BranchStep {
  readonly type: "branch";
  readonly cases: readonly {
    readonly when: InteractionCondition;
    readonly steps: readonly SequenceStep[];
  }[];
  readonly fallback: readonly SequenceStep[];
}

/** A Character, Object, or current-Scene Scenery directed by a Sequence. */
export type DirectedSubject =
  | { readonly kind: "character"; readonly character: string }
  | { readonly kind: "object"; readonly object: string }
  | { readonly kind: "scenery"; readonly scenery: string };

/** Starts this direction when a named Cue occurs in an earlier Animation direction. */
export interface CueStart {
  readonly direction: number;
  readonly cue: string;
}

export interface AnimationDirection {
  readonly type: "animation";
  readonly subject: DirectedSubject;
  readonly animation: string;
  readonly startAfter?: CueStart;
}

export interface MotionDirection {
  readonly type: "motion";
  readonly subject: DirectedSubject;
  /** Character destinations contain one point; Object and Scenery paths may contain several. */
  readonly path: readonly Point[];
  readonly duration?: number;
  readonly facing?: Facing;
  readonly startAfter?: CueStart;
}

export type SequenceDirection = AnimationDirection | MotionDirection | CameraDirection;

/** One sequential Sequence step containing concurrent visual directions. */
export interface DirectionStep {
  readonly type: "direction";
  readonly directions: readonly SequenceDirection[];
  /** Optional finite boundary for loops and held/following Camera direction, in logical seconds. */
  readonly duration?: number;
}

export type SequenceStep =
  | LineStep
  | NarrationStep
  | OperationsStep
  | ChoiceStep
  | BranchStep
  | DirectionStep;

/** A finite, root-level Sequence definition. */
export interface SequenceDefinition {
  readonly steps: readonly SequenceStep[];
  /** Scene that owns directed Animation, Motion, and Camera steps. */
  readonly scene?: string;
  readonly skippable?: boolean;
  readonly skipOutcome?: readonly GameOperation[];
}

/** Validates references from World arrival rules into Sequence definitions. */
export function validateArrivalSequenceReferences(
  scene: string,
  rules: readonly ArrivalSequenceRule[] | undefined,
  sequences: Readonly<Record<string, SequenceDefinition>>,
): readonly AuthoringDiagnostic[] {
  const diagnostics: AuthoringDiagnostic[] = [];
  rules?.forEach((rule, ruleIndex) => {
    const path = `scenes.${scene}.arrivalSequences[${ruleIndex}].sequence`;
    const sequence = sequences[rule.sequence];
    if (!sequence) {
      diagnostics.push({
        code: "reference.sequence",
        family: "reference",
        owner: "sequence",
        path,
        message: `Sequence '${rule.sequence}' does not exist.`,
      });
    } else if (sequence.scene !== undefined && sequence.scene !== scene) {
      diagnostics.push({
        code: "reference.sequence.scene",
        family: "reference",
        owner: "sequence",
        path,
        message: `Sequence '${rule.sequence}' belongs to Scene '${sequence.scene}'.`,
      });
    }
  });
  return diagnostics;
}

/** Validates an authored request to start a named Sequence. */
export function validateSequenceStartReference(
  sequence: string,
  path: string,
  sequences: Readonly<Record<string, SequenceDefinition>>,
): readonly AuthoringDiagnostic[] {
  return sequence in sequences
    ? []
    : [{
        code: "reference.sequence",
        family: "reference",
        owner: "sequence",
        path,
        message: `Sequence '${sequence}' does not exist.`,
      }];
}

/** Reports every local Sequence Authoring Diagnostic without a Game Project. */
export function validateSequenceDefinition(
  input: SequenceDefinition,
  path = "",
): readonly AuthoringDiagnostic[] {
  const diagnostics: AuthoringDiagnostic[] = [];
  if (input.skippable && input.skipOutcome === undefined) {
    diagnostics.push({
      code: "definition.sequence.skip-outcome",
      family: "definition", owner: "sequence",
      path: childPath(path, "skipOutcome"),
      message: "A skippable Sequence must declare its Skip Outcome.",
    });
  }
  if (!input.skippable && input.skipOutcome !== undefined) {
    diagnostics.push({
      code: "definition.sequence.skip-outcome.unused",
      family: "definition", owner: "sequence",
      path: childPath(path, "skipOutcome"),
      message: "Only a skippable Sequence can declare a Skip Outcome.",
    });
  }
  const visiting = new WeakSet<object>();
  const visit = (steps: readonly SequenceStep[], path: string) => {
    if (visiting.has(steps)) {
      diagnostics.push({
        code: "definition.sequence.cycle",
        family: "definition", owner: "sequence",
        path,
        message: "A Sequence must be finite and cannot contain a cycle.",
      });
      return;
    }
    visiting.add(steps);
    steps.forEach((step, index) => {
      if (step.type === "operations") {
        diagnostics.push(...validateSequenceOperationRules(
          step.operations,
          `${path}[${index}].operations`,
        ));
      } else if (step.type === "line") {
        if (!step.character?.trim()) {
          diagnostics.push({
            code: "definition.line.character",
            family: "definition", owner: "sequence",
            path: `${path}[${index}].character`,
            message: "A Line requires a Character.",
          });
        }
        if (!step.text.trim()) {
          diagnostics.push({
            code: "definition.line.text",
            family: "definition", owner: "sequence",
            path: `${path}[${index}].text`,
            message: "A Line cannot be empty.",
          });
        }
      } else if (step.type === "narration" && !step.text.trim()) {
        diagnostics.push({
          code: "definition.narration.text",
          family: "definition", owner: "sequence",
          path: `${path}[${index}].text`,
          message: "Narration cannot be empty.",
        });
      } else if (step.type === "direction") {
        const stepPath = `${path}[${index}]`;
        diagnostics.push(...validateDirectionStep(step, stepPath));
        step.directions.forEach((direction, directionIndex) => {
          if (direction.type === "motion") {
            diagnostics.push(...validateMotionDirection(
              direction,
              `${stepPath}.directions[${directionIndex}]`,
            ));
          }
        });
      } else if (step.type === "choice") {
        if (exceedsEligibleAlternativeLimit(step.alternatives)) {
          diagnostics.push({
            code: "definition.choice.limit",
            family: "definition", owner: "sequence",
            path: `${path}[${index}].alternatives`,
            message: "A Choice can present at most six eligible alternatives.",
          });
        }
        step.alternatives.forEach((alternative, alternativeIndex) =>
          visit(alternative.steps, `${path}[${index}].alternatives[${alternativeIndex}].steps`),
        );
        visit(step.fallback.steps, `${path}[${index}].fallback.steps`);
      } else if (step.type === "branch") {
        step.cases.forEach((branch, branchIndex) =>
          visit(branch.steps, `${path}[${index}].cases[${branchIndex}].steps`),
        );
        visit(step.fallback, `${path}[${index}].fallback`);
      }
    });
    visiting.delete(steps);
  };
  visit(input.steps, childPath(path, "steps"));
  diagnostics.push(...validateSequenceOperationRules(
    input.skipOutcome ?? [],
    childPath(path, "skipOutcome"),
  ));
  return diagnostics;
}

/** Clones Author-owned input before Game Project composition freezes it. */
export function cloneDirectionStep(step: DirectionStep): DirectionStep {
  return structuredClone(step);
}

/** Reports local Direction Step invariants without requiring a composed Game Project. */
export function validateDirectionStep(
  step: DirectionStep,
  path: string,
): readonly AuthoringDiagnostic[] {
  const diagnostics: AuthoringDiagnostic[] = [];
  if (step.directions.length === 0) {
    diagnostics.push({ code: "definition.sequence.direction.empty", family: "definition", owner: "sequence", path: `${path}.directions`, message: "A Direction Step needs at least one direction." });
  }
  if (step.duration !== undefined && (!Number.isFinite(step.duration) || step.duration <= 0)) {
    diagnostics.push({ code: "definition.sequence.duration", family: "definition", owner: "sequence", path: `${path}.duration`, message: "A Sequence duration must be a positive finite number of logical seconds." });
  }
  let hasFiniteBoundary = step.duration !== undefined && step.duration > 0;
  step.directions.forEach((direction, index) => {
    const directionPath = `${path}.directions[${index}]`;
    if (direction.startAfter) {
      const sourceIndex = direction.startAfter.direction;
      if (!Number.isInteger(sourceIndex) || sourceIndex < 0 || sourceIndex >= index) {
        diagnostics.push({ code: "definition.sequence.cue-order", family: "definition", owner: "sequence", path: `${directionPath}.startAfter.direction`, message: "A direction can wait only for an earlier Animation direction in the same step." });
      } else if (step.directions[sourceIndex]?.type !== "animation") {
        diagnostics.push({ code: "definition.sequence.cue-source", family: "definition", owner: "sequence", path: `${directionPath}.startAfter.direction`, message: "A Cue dependency must reference an Animation direction." });
      }
      if (!direction.startAfter.cue.trim()) {
        diagnostics.push({ code: "definition.sequence.cue-name", family: "definition", owner: "sequence", path: `${directionPath}.startAfter.cue`, message: "A Cue reference cannot be empty." });
      }
    }
    if (direction.type === "animation") return;
    if (direction.type === "motion") {
      if (direction.subject.kind === "character") {
        hasFiniteBoundary = true;
      } else if (Number.isFinite(direction.duration) && direction.duration! > 0) hasFiniteBoundary = true;
      return;
    }
    diagnostics.push(...validateCameraDirection(direction, directionPath));
    if ("duration" in direction && direction.duration !== undefined &&
        Number.isFinite(direction.duration) && direction.duration > 0) hasFiniteBoundary = true;
    if (direction.mode === "cut") hasFiniteBoundary = true;
  });
  if (!hasFiniteBoundary && step.directions.length > 0 && step.directions.every((direction) => direction.type !== "animation")) {
    diagnostics.push({ code: "definition.sequence.direction.unbounded", family: "definition", owner: "sequence", path, message: "A Direction Step needs a finite completion boundary." });
  }
  return diagnostics;
}

/** @internal */
export interface DirectionStepReferenceContext {
  readonly hasScene: boolean;
  readonly appearancesForSubject: (subject: DirectedSubject) => readonly AnimationBearingAppearance[];
  readonly subjectBelongsToScene: (subject: DirectedSubject) => boolean;
  readonly cameraSubjectExists: (subject: DirectedSubject) => boolean;
  readonly pointInScene: (point: Point) => boolean;
  readonly validateMotion: (
    direction: MotionDirection,
    path: string,
  ) => readonly AuthoringDiagnostic[];
}

/** Validates composed Direction Step references through a narrow Game Project view. */
export function validateDirectionStepReferences(
  step: DirectionStep,
  path: string,
  context: DirectionStepReferenceContext,
): readonly AuthoringDiagnostic[] {
  const diagnostics: AuthoringDiagnostic[] = [];
  let hasFiniteBoundary = step.duration !== undefined;
  step.directions.forEach((direction, directionIndex) => {
    const directionPath = `${path}.directions[${directionIndex}]`;
    if (direction.type !== "camera") {
      const appearances = context.appearancesForSubject(direction.subject);
      if (appearances.length === 0) {
        diagnostics.push({ code: "reference.sequence.subject", family: "reference", owner: "sequence", path: `${directionPath}.subject`, message: "Directed subject does not exist or has no animated Appearance." });
      }
      if (
        direction.type !== "motion" &&
        context.hasScene &&
        !context.subjectBelongsToScene(direction.subject)
      ) {
        diagnostics.push({ code: "reference.sequence.subject-scene", family: "reference", owner: "sequence", path: `${directionPath}.subject`, message: "A directed subject must belong to the Sequence Scene." });
      }
      if (direction.type === "animation") {
        const animations = appearances.map((appearance) => appearance.animations[direction.animation]);
        diagnostics.push(...validateAnimationReference(
          appearances,
          direction.animation,
          `${directionPath}.animation`,
          "reference.animation",
          `Animation '${direction.animation}' is not available in every Appearance of the subject.`,
        ));
        if (animations.some((animation) => animation !== undefined && !animation.timing.loop)) hasFiniteBoundary = true;
      } else {
        hasFiniteBoundary = true;
        if (direction.subject.kind === "character" && appearances.some((appearance) => !appearance.roles.walking)) {
          diagnostics.push({ code: "reference.animation.walking-role", family: "reference", owner: "animation", path: `${directionPath}.subject`, message: "Character Motion requires a walking Animation Role in every Appearance." });
        }
        if (context.hasScene) diagnostics.push(...context.validateMotion(direction, directionPath));
      }
    }
    if (direction.type === "camera") {
      if (direction.mode === "cut" || direction.duration !== undefined) hasFiniteBoundary = true;
      diagnostics.push(...validateCameraDirectionReferences(direction, directionPath, {
        hasScene: context.hasScene,
        subjectExists: context.cameraSubjectExists,
        subjectBelongsToScene: context.subjectBelongsToScene,
        pointInScene: context.pointInScene,
      }));
    }
    if (direction.startAfter) {
      const source = step.directions[direction.startAfter.direction];
      if (source?.type === "animation") {
        const animations = context.appearancesForSubject(source.subject).map((appearance) => appearance.animations[source.animation]);
        if (animations.length === 0 || animations.some((animation) => animation?.timing.cues?.[direction.startAfter!.cue] === undefined)) {
          diagnostics.push({ code: "reference.animation.cue", family: "reference", owner: "sequence", path: `${directionPath}.startAfter.cue`, message: `Animation Cue '${direction.startAfter.cue}' is not available in every Appearance of the source subject.` });
        }
      }
    }
  });
  if (!hasFiniteBoundary) {
    diagnostics.push({ code: "definition.sequence.direction.unbounded", family: "definition", owner: "sequence", path, message: "A Direction Step containing only loops needs a finite completion boundary." });
  }
  return diagnostics;
}

/** @internal Narrow capability views used while composing Sequence references. */
export interface SequenceReferenceContext {
  readonly playerCharacter?: string;
  readonly sceneExists: (scene: string) => boolean;
  readonly characterExists: (character: string) => boolean;
  readonly appearancesForCharacter: (character: string) => readonly AnimationBearingAppearance[];
  readonly appearancesForSubject: (
    subject: DirectedSubject,
    scene?: string,
  ) => readonly AnimationBearingAppearance[];
  readonly initialObjectsInScene: (scene?: string) => ReadonlySet<string>;
  readonly hasDirectedSubject: (
    scene: string,
    subject: DirectedSubject,
    availableObjects: ReadonlySet<string>,
  ) => boolean;
  readonly cameraSubjectExists: (scene: string | undefined, subject: DirectedSubject) => boolean;
  readonly pointInScene: (scene: string, point: Point) => boolean;
  readonly validateCondition: (
    condition: InteractionCondition | undefined,
    path: string,
  ) => readonly AuthoringDiagnostic[];
  readonly validateOperations: (
    operations: readonly GameOperation[],
    path: string,
  ) => readonly AuthoringDiagnostic[];
  readonly validateMotion: (
    scene: string,
    direction: MotionDirection,
    path: string,
    availableObjects: ReadonlySet<string>,
    nextStep?: DirectionStep,
  ) => readonly AuthoringDiagnostic[];
}

function validateSequenceOperationRules(
  operations: readonly GameOperation[],
  path: string,
): readonly AuthoringDiagnostic[] {
  return operations.flatMap((operation, index) => {
    const operationPath = `${path}[${index}]`;
    if (
      operation.type === "place-selected-object" ||
      operation.type === "consume-selected-object"
    ) {
      return [{
        code: "definition.sequence.selected-object-operation",
        family: "definition" as const,
        owner: "sequence" as const,
        path: operationPath,
        message: "A Sequence cannot use a selected-Object operation because it has no Command selection context.",
      }];
    }
    if (operation.type === "start-sequence") {
      return [{
        code: "definition.sequence.nested",
        family: "definition" as const,
        owner: "sequence" as const,
        path: operationPath,
        message: "A Sequence cannot start another Sequence.",
      }];
    }
    return [];
  });
}

/** @internal Validates Sequence-owned relationships against narrow capability views. */
export function validateSequenceReferences(
  sequenceId: string,
  definition: SequenceDefinition,
  context: SequenceReferenceContext,
): readonly AuthoringDiagnostic[] {
  const diagnostics: AuthoringDiagnostic[] = [];
  const sequencePath = `sequences.${sequenceId}`;
  const scene = definition.scene;

  const validateOperations = (operations: readonly GameOperation[], path: string) => {
    diagnostics.push(...context.validateOperations(operations, path));
  };

  const visit = (
    steps: readonly SequenceStep[],
    path: string,
    availableObjects: ReadonlySet<string>,
  ): Set<string> => {
    let objectsInScene = new Set(availableObjects);
    steps.forEach((step, index) => {
      const base = `${path}[${index}]`;
      if (step.type === "line") {
        diagnostics.push(...validateLineReferences(step, base, context));
      } else if (step.type === "operations") {
        validateOperations(step.operations, `${base}.operations`);
        for (const operation of step.operations) {
          if (operation.type === "place-object") {
            if (operation.scene === scene) objectsInScene.add(operation.object);
            else objectsInScene.delete(operation.object);
          } else if (operation.type === "give-object-to-player") {
            objectsInScene.delete(operation.object);
          }
        }
      } else if (step.type === "direction") {
        const nextStep = steps[index + 1];
        diagnostics.push(...validateDirectionStepReferences(step, base, {
          hasScene: scene !== undefined,
          appearancesForSubject: (subject) => context.appearancesForSubject(subject, scene),
          subjectBelongsToScene: (subject) => scene !== undefined &&
            context.hasDirectedSubject(scene, subject, objectsInScene),
          cameraSubjectExists: (subject) => context.cameraSubjectExists(scene, subject),
          pointInScene: (point) => scene !== undefined && context.pointInScene(scene, point),
          validateMotion: (direction, directionPath) => scene === undefined
            ? []
            : context.validateMotion(
                scene,
                direction,
                directionPath,
                objectsInScene,
                nextStep?.type === "direction" ? nextStep : undefined,
              ),
        }));
      } else if (step.type === "choice") {
        const branches: Set<string>[] = [];
        step.alternatives.forEach((alternative, alternativeIndex) => {
          if (alternative.spoken !== false && !context.playerCharacter) {
            diagnostics.push({
              code: "definition.choice.player-character",
              family: "definition", owner: "sequence",
              path: `${base}.alternatives[${alternativeIndex}].spoken`,
              message: "A spoken Choice requires a Player Character.",
            });
          }
          diagnostics.push(...context.validateCondition(
            alternative.when,
            `${base}.alternatives[${alternativeIndex}].when`,
          ));
          branches.push(visit(
            alternative.steps,
            `${base}.alternatives[${alternativeIndex}].steps`,
            objectsInScene,
          ));
        });
        if (step.fallback.spoken !== false && !context.playerCharacter) {
          diagnostics.push({
            code: "definition.choice.player-character",
            family: "definition", owner: "sequence",
            path: `${base}.fallback.spoken`,
            message: "A spoken Choice requires a Player Character.",
          });
        }
        branches.push(visit(step.fallback.steps, `${base}.fallback.steps`, objectsInScene));
        objectsInScene = intersectSets(branches);
      } else if (step.type === "branch") {
        const branches: Set<string>[] = [];
        step.cases.forEach((branch, branchIndex) => {
          diagnostics.push(...context.validateCondition(
            branch.when,
            `${base}.cases[${branchIndex}].when`,
          ));
          branches.push(visit(
            branch.steps,
            `${base}.cases[${branchIndex}].steps`,
            objectsInScene,
          ));
        });
        branches.push(visit(step.fallback, `${base}.fallback`, objectsInScene));
        objectsInScene = intersectSets(branches);
      }
    });
    return objectsInScene;
  };

  if (hasDirectedStep(definition.steps) && (!scene || !context.sceneExists(scene))) {
    diagnostics.push({
      code: "reference.sequence.scene",
      family: "reference", owner: "sequence",
      path: `${sequencePath}.scene`,
      message: "A directed Sequence must name its owning Scene.",
    });
  }
  visit(definition.steps, `${sequencePath}.steps`, context.initialObjectsInScene(scene));
  validateOperations(definition.skipOutcome ?? [], `${sequencePath}.skipOutcome`);
  return diagnostics;
}

export function secondsToTicks(seconds: number): number {
  return Math.max(1, Math.ceil(seconds * 60));
}

export function directionStartTick(
  step: DirectionStep,
  index: number,
  animationFor: (subject: DirectedSubject, animation: string) => AnyAnimationDefinition | undefined,
): number {
  const dependency = step.directions[index]?.startAfter;
  if (!dependency) return 0;
  const source = step.directions[dependency.direction];
  if (!source || source.type !== "animation") return 0;
  const animation = animationFor(source.subject, source.animation);
  const cueTick = animation ? animationCueTick(animation, dependency.cue) ?? 0 : 0;
  return directionStartTick(step, dependency.direction, animationFor) + cueTick;
}

/** @internal */
export interface DirectionTiming {
  readonly index: number;
  readonly startTick: number;
  readonly localTick: number;
  readonly started: boolean;
  readonly finite: boolean;
  readonly complete: boolean;
  readonly active: boolean;
  readonly presented: boolean;
}

/** @internal */
export interface DirectionStepInterpretation {
  readonly elapsedTicks: number;
  readonly durationElapsed: boolean;
  readonly complete: boolean;
  readonly directions: readonly DirectionTiming[];
}

/** The single browser-independent temporal interpretation of a Direction Step. */
export function interpretDirectionStep(
  step: DirectionStep,
  elapsedTicks: number,
  animationFor: (subject: DirectedSubject, animation: string) => AnyAnimationDefinition | undefined,
  characterMotionComplete: (direction: MotionDirection) => boolean = () => false,
): DirectionStepInterpretation {
  const durationElapsed = step.duration !== undefined && elapsedTicks >= secondsToTicks(step.duration);
  const directions = Object.freeze(step.directions.map((direction, index) => {
    const startTick = directionStartTick(step, index, animationFor);
    const localTick = elapsedTicks - startTick;
    const started = localTick >= 0;
    let finite = false;
    let complete = false;
    if (direction.type === "animation") {
      const animation = animationFor(direction.subject, direction.animation);
      finite = animation !== undefined && !animation.timing.loop;
      complete = animation !== undefined && !animation.timing.loop && started &&
        localTick >= animationDurationTicks(animation);
    } else if (direction.type === "motion") {
      finite = true;
      complete = direction.subject.kind === "character"
        ? started && characterMotionComplete(direction)
        : started && localTick >= secondsToTicks(direction.duration!);
    } else if (direction.mode === "cut") {
      finite = true;
      complete = started && localTick >= 1;
    } else if (direction.duration !== undefined) {
      finite = true;
      complete = started && localTick >= secondsToTicks(direction.duration);
    }
    return Object.freeze({
      index,
      startTick,
      localTick,
      started,
      finite,
      complete,
      active: started && !complete,
      presented: started && (direction.type !== "animation" || !complete),
    });
  }));
  const finiteDirections = directions.filter(({ finite }) => finite);
  return Object.freeze({
    elapsedTicks,
    durationElapsed,
    complete: durationElapsed || finiteDirections.length > 0 && finiteDirections.every(({ complete }) => complete),
    directions,
  });
}

/** @internal */
export function resolveSequencePath(value: unknown, path: string): unknown {
  return path.split("/").reduce<unknown>((current, segment) => {
    if (current === null || typeof current !== "object") return undefined;
    return (current as Record<string, unknown>)[segment];
  }, value);
}

/** @internal Enumerates authored Lines without exposing nested Sequence traversal to adapters. */
export function sequenceLines(
  definition: SequenceDefinition,
  rootPath = "steps",
): readonly { readonly line: LineStep; readonly path: string }[] {
  const lines: { line: LineStep; path: string }[] = [];
  const visit = (steps: readonly SequenceStep[], path: string) => {
    steps.forEach((step, index) => {
      const stepPath = `${path}[${index}]`;
      if (step.type === "line") {
        lines.push({ line: step, path: stepPath });
      } else if (step.type === "choice") {
        step.alternatives.forEach((alternative, alternativeIndex) =>
          visit(alternative.steps, `${stepPath}.alternatives[${alternativeIndex}].steps`),
        );
        visit(step.fallback.steps, `${stepPath}.fallback.steps`);
      } else if (step.type === "branch") {
        step.cases.forEach((branch, branchIndex) =>
          visit(branch.steps, `${stepPath}.cases[${branchIndex}].steps`),
        );
        visit(step.fallback, `${stepPath}.fallback`);
      }
    });
  };
  visit(definition.steps, rootPath);
  return Object.freeze(lines.map(({ line, path }) => Object.freeze({ line, path })));
}

/** @internal */
export type SequenceActiveState =
  | { readonly kind: "line"; readonly path: string; readonly animationStartedTick: number; readonly choiceText?: string; readonly choiceCharacter?: string }
  | { readonly kind: "narration"; readonly path: string }
  | { readonly kind: "choice"; readonly path: string; readonly eligibleAlternatives: readonly number[] }
  | { readonly kind: "direction"; readonly path: string; readonly elapsedTicks: number };

/** @internal */
export interface SequenceActivityState {
  readonly type: "sequence";
  readonly sequence: string;
  readonly pendingPaths: readonly string[];
  readonly active: SequenceActiveState | null;
}

/** @internal */
export interface SequenceRuntimeContext {
  readonly tick: number;
  readonly playerCharacter?: string;
  readonly conditionMatches: (condition?: InteractionCondition) => boolean;
  readonly directedSubjectsAreAvailable: (step: DirectionStep) => boolean;
}

/** @internal */
export type SequenceDecision =
  | { readonly type: "waiting"; readonly activity: SequenceActivityState }
  | {
      readonly type: "apply-operations";
      readonly activity: SequenceActivityState;
      readonly operations: readonly GameOperation[];
    }
  | { readonly type: "complete" }
  | { readonly type: "invalid"; readonly message: string };

/** @internal */
export type SequenceSkipDecision =
  | { readonly type: "apply-skip-outcome"; readonly operations: readonly GameOperation[] }
  | { readonly type: "not-skippable" };

/** @internal */
export interface SequenceDirectionContext {
  readonly animationFor: (
    subject: DirectedSubject,
    animation: string,
  ) => AnyAnimationDefinition | undefined;
  readonly characterMotionComplete: (direction: MotionDirection) => boolean;
}

/** @internal */
export interface SequenceRestoreContext {
  readonly currentTick: number;
  readonly playerCharacter?: string;
  readonly characterExists: (character: string) => boolean;
  readonly conditionMatches: (condition?: InteractionCondition) => boolean;
}

/** @internal */
export interface SequenceDirectionPresentation {
  readonly kind: "direction";
  readonly elapsedTicks: number;
  readonly complete: boolean;
  readonly directions: readonly {
    readonly direction: SequenceDirection;
    readonly timing: DirectionTiming;
  }[];
}

/** @internal */
export type SequencePresentation =
  | {
      readonly kind: "line";
      readonly character: string;
      readonly text: string;
      readonly audio?: URL | string;
      readonly animation?: string;
      readonly animationStartedTick: number;
    }
  | { readonly kind: "narration"; readonly text: string }
  | {
      readonly kind: "choice";
      readonly alternatives: readonly { readonly index: number; readonly text: string }[];
    }
  | SequenceDirectionPresentation;

/** @internal Sequence-owned traversal and presentation behind one immutable module interface. */
export interface Sequence {
  start(sequence: string, currentScene: string): SequenceActivityState;
  advance(activity: SequenceActivityState, context: SequenceRuntimeContext): SequenceDecision;
  continue(activity: SequenceActivityState, context: SequenceRuntimeContext): SequenceDecision;
  choose(
    activity: SequenceActivityState,
    alternative: number,
    context: SequenceRuntimeContext,
  ): SequenceDecision;
  skip(activity: SequenceActivityState): SequenceSkipDecision;
  tickDirection(activity: SequenceActivityState): SequenceActivityState;
  completeDirection(
    activity: SequenceActivityState,
    context: SequenceRuntimeContext,
  ): SequenceDecision;
  presentation(
    activity: SequenceActivityState,
    directionContext?: SequenceDirectionContext,
  ): SequencePresentation | undefined;
  isValidActivity(value: unknown, context: SequenceRestoreContext): value is SequenceActivityState;
}

/** @internal */
export function createSequence(
  definitions: Readonly<Record<string, SequenceDefinition>>,
): Sequence {
  const sequence: Sequence = {
    start(sequence, currentScene) {
      const definition = definitions[sequence];
      if (!definition) throw new Error(`Unknown Sequence '${sequence}'.`);
      if (definition.scene !== undefined && definition.scene !== currentScene) {
        throw new Error(`Sequence '${sequence}' belongs to another Scene.`);
      }
      return {
        type: "sequence",
        sequence,
        pendingPaths: topLevelPaths(definition),
        active: null,
      };
    },
    advance(activity, context) {
      const definition = definitions[activity.sequence];
      if (!definition) return { type: "invalid", message: `Unknown Sequence '${activity.sequence}'.` };
      if (activity.active !== null) return { type: "waiting", activity: structuredClone(activity) };
      const pendingPaths = [...activity.pendingPaths];
      while (true) {
        const path = pendingPaths.shift();
        if (!path) return { type: "complete" };
        const step = resolveSequencePath(definition, path) as SequenceStep | undefined;
        if (!step) return { type: "invalid", message: "Sequence traversal reached an invalid step path." };
        const next = (active: SequenceActiveState): SequenceDecision => ({
          type: "waiting",
          activity: { ...activity, pendingPaths, active },
        });
        if (step.type === "line") {
          return next({ kind: "line", path, animationStartedTick: context.tick + 1 });
        }
        if (step.type === "narration") return next({ kind: "narration", path });
        if (step.type === "choice") {
          const eligible = eligibleAlternativeIndexes(step.alternatives, context.conditionMatches);
          return next({
            kind: "choice",
            path,
            eligibleAlternatives: eligible.length > 0 ? eligible : [-1],
          });
        }
        if (step.type === "branch") {
          const branchIndex = step.cases.findIndex(({ when }) => context.conditionMatches(when));
          const container = branchIndex >= 0
            ? `${path}/cases/${branchIndex}/steps`
            : `${path}/fallback`;
          pendingPaths.unshift(...pathsForContainer(definition, container));
          continue;
        }
        if (step.type === "operations") {
          return {
            type: "apply-operations",
            activity: { ...activity, pendingPaths, active: null },
            operations: structuredClone(step.operations),
          };
        }
        if (!context.directedSubjectsAreAvailable(step)) {
          return { type: "invalid", message: "A directed subject is not available in the Sequence Scene." };
        }
        return next({ kind: "direction", path, elapsedTicks: 0 });
      }
    },
    continue(activity, context) {
      if (activity.active?.kind !== "line" && activity.active?.kind !== "narration") {
        return { type: "waiting", activity: structuredClone(activity) };
      }
      return sequence.advance({ ...activity, active: null }, context);
    },
    choose(activity, alternative, context) {
      const definition = definitions[activity.sequence];
      const active = activity.active;
      if (!definition || active?.kind !== "choice" ||
          !active.eligibleAlternatives.includes(alternative)) {
        return { type: "waiting", activity: structuredClone(activity) };
      }
      const step = resolveSequencePath(definition, active.path) as ChoiceStep | undefined;
      if (step?.type !== "choice") {
        return { type: "invalid", message: "Sequence Choice state refers to an invalid step path." };
      }
      const container = alternative === -1
        ? `${active.path}/fallback/steps`
        : `${active.path}/alternatives/${alternative}/steps`;
      const pendingPaths = [
        ...pathsForContainer(definition, container),
        ...activity.pendingPaths,
      ];
      const choice = alternative === -1 ? step.fallback : step.alternatives[alternative]!;
      if (choice.spoken !== false && context.playerCharacter) {
        return {
          type: "waiting",
          activity: {
            ...activity,
            pendingPaths,
            active: {
              kind: "line",
              path: active.path,
              animationStartedTick: context.tick + 1,
              choiceText: choice.text,
              choiceCharacter: context.playerCharacter,
            },
          },
        };
      }
      return sequence.advance({ ...activity, pendingPaths, active: null }, context);
    },
    skip(activity) {
      const definition = definitions[activity.sequence];
      if (!definition?.skippable || definition.skipOutcome === undefined) {
        return { type: "not-skippable" };
      }
      return {
        type: "apply-skip-outcome",
        operations: structuredClone(definition.skipOutcome),
      };
    },
    tickDirection(activity) {
      if (activity.active?.kind !== "direction") return structuredClone(activity);
      return {
        ...activity,
        pendingPaths: [...activity.pendingPaths],
        active: {
          ...activity.active,
          elapsedTicks: activity.active.elapsedTicks + 1,
        },
      };
    },
    completeDirection(activity, context) {
      if (activity.active?.kind !== "direction") {
        return { type: "waiting", activity: structuredClone(activity) };
      }
      return sequence.advance({ ...activity, active: null }, context);
    },
    presentation(activity, directionContext) {
      const definition = definitions[activity.sequence];
      const active = activity.active;
      if (!definition || !active) return undefined;
      const step = resolveSequencePath(definition, active.path) as SequenceStep | undefined;
      if (active.kind === "line") {
        if (active.choiceText !== undefined && active.choiceCharacter !== undefined) {
          return {
            kind: "line",
            character: active.choiceCharacter,
            text: active.choiceText,
            animationStartedTick: active.animationStartedTick,
          };
        }
        if (step?.type !== "line") return undefined;
        return {
          kind: "line",
          character: step.character,
          text: step.text,
          ...(step.audio === undefined
            ? {}
            : { audio: step.audio instanceof URL ? new URL(step.audio.href) : step.audio }),
          ...(step.animation === undefined ? {} : { animation: step.animation }),
          animationStartedTick: active.animationStartedTick,
        };
      }
      if (active.kind === "narration" && step?.type === "narration") {
        return { kind: "narration", text: step.text };
      }
      if (active.kind === "choice" && step?.type === "choice") {
        return {
          kind: "choice",
          alternatives: active.eligibleAlternatives.map((index) => ({
            index,
            text: index === -1 ? step.fallback.text : step.alternatives[index]!.text,
          })),
        };
      }
      if (active.kind === "direction" && step?.type === "direction" && directionContext) {
        const interpretation = interpretDirectionStep(
          step,
          active.elapsedTicks,
          directionContext.animationFor,
          directionContext.characterMotionComplete,
        );
        return {
          kind: "direction",
          elapsedTicks: active.elapsedTicks,
          complete: interpretation.complete,
          directions: step.directions.map((direction, index) => ({
            direction: structuredClone(direction),
            timing: interpretation.directions[index]!,
          })),
        };
      }
      return undefined;
    },
    isValidActivity(value, context): value is SequenceActivityState {
      if (!isRecord(value) || !hasExactKeys(value, ["type", "sequence", "pendingPaths", "active"])) return false;
      if (value.type !== "sequence" || typeof value.sequence !== "string") return false;
      const definition = definitions[value.sequence];
      if (!definition || !Array.isArray(value.pendingPaths) || !value.pendingPaths.every(
        (path) => typeof path === "string" && isSequenceStep(resolveSequencePath(definition, path)),
      )) return false;
      if (!isRecord(value.active) || typeof value.active.kind !== "string" ||
          typeof value.active.path !== "string") return false;
      const active = value.active;
      const activePath = value.active.path;
      const step = resolveSequencePath(definition, activePath);
      const pending = value.pendingPaths as string[];
      const expectedPending = expectedPendingPaths(definition, activePath);
      if (active.kind === "line") {
        if (!hasExactKeys(active, ["kind", "path", "animationStartedTick"], ["choiceText", "choiceCharacter"]) ||
            !validAnimationStartedTick(active.animationStartedTick, context.currentTick)) return false;
        if ((active.choiceText === undefined) !== (active.choiceCharacter === undefined)) return false;
        if (active.choiceText !== undefined) {
          if (typeof active.choiceText !== "string" || typeof active.choiceCharacter !== "string" ||
              active.choiceCharacter !== context.playerCharacter ||
              !context.characterExists(active.choiceCharacter) || !isSequenceStep(step) ||
              step.type !== "choice" || expectedPending === null) return false;
          return validChoiceSpeechPending(
            definition,
            step,
            activePath,
            active.choiceText,
            pending,
            expectedPending,
            context.conditionMatches,
          );
        }
        return expectedPending !== null && sameOrderedStrings(pending, expectedPending) &&
          isSequenceStep(step) && step.type === "line";
      }
      if (active.kind === "narration") {
        return hasExactKeys(active, ["kind", "path"]) && expectedPending !== null &&
          sameOrderedStrings(pending, expectedPending) && isSequenceStep(step) &&
          step.type === "narration";
      }
      if (active.kind === "direction") {
        return hasExactKeys(active, ["kind", "path", "elapsedTicks"]) &&
          expectedPending !== null && sameOrderedStrings(pending, expectedPending) &&
          isSequenceStep(step) && step.type === "direction" &&
          Number.isInteger(active.elapsedTicks) && (active.elapsedTicks as number) >= 0 &&
          (active.elapsedTicks as number) <= context.currentTick;
      }
      if (active.kind !== "choice" || !hasExactKeys(active, ["kind", "path", "eligibleAlternatives"]) ||
          expectedPending === null || !sameOrderedStrings(pending, expectedPending) ||
          !isSequenceStep(step) || step.type !== "choice" ||
          !Array.isArray(active.eligibleAlternatives) ||
          !active.eligibleAlternatives.every((index) => Number.isInteger(index))) return false;
      const eligible = eligibleAlternativeIndexes(step.alternatives, context.conditionMatches);
      return sameNumbers(
        active.eligibleAlternatives as number[],
        eligible.length > 0 ? eligible : [-1],
      );
    },
  };
  return sequence;
}

function childPath(path: string, child: string): string {
  return path ? `${path}.${child}` : child;
}

function topLevelPaths(sequence: SequenceDefinition): string[] {
  return sequence.steps.map((_, index) => `steps/${index}`);
}

function pathsForContainer(sequence: SequenceDefinition, path: string): string[] {
  const steps = resolveSequencePath(sequence, path) as readonly SequenceStep[];
  return steps.map((_, index) => `${path}/${index}`);
}

function expectedPendingPaths(sequence: SequenceDefinition, activePath: string): string[] | null {
  const segments = activePath.split("/");
  const ancestors: { containerPath: string; index: number; steps: readonly SequenceStep[] }[] = [];
  for (let segmentIndex = 0; segmentIndex < segments.length; segmentIndex += 1) {
    const index = Number(segments[segmentIndex]);
    if (!Number.isInteger(index) || String(index) !== segments[segmentIndex]) continue;
    const containerPath = segments.slice(0, segmentIndex).join("/");
    const container = resolveSequencePath(sequence, containerPath);
    if (!Array.isArray(container) || !isSequenceStep(container[index])) continue;
    ancestors.push({ containerPath, index, steps: container as readonly SequenceStep[] });
  }
  if (ancestors.length === 0 ||
      ancestors.at(-1)?.containerPath + `/${ancestors.at(-1)?.index}` !== activePath) return null;
  return ancestors.reverse().flatMap(({ containerPath, index, steps }) =>
    steps.slice(index + 1).map((_, offset) => `${containerPath}/${index + offset + 1}`),
  );
}

function validChoiceSpeechPending(
  definition: SequenceDefinition,
  step: ChoiceStep,
  activePath: string,
  choiceText: string,
  pending: readonly string[],
  outerPending: readonly string[],
  conditionMatches: (condition?: InteractionCondition) => boolean,
): boolean {
  const eligible = eligibleAlternativeIndexes(step.alternatives, conditionMatches);
  const choices = eligible.length > 0
    ? eligible.map((index) => ({
        choice: step.alternatives[index]!,
        container: `${activePath}/alternatives/${index}/steps`,
      }))
    : [{ choice: step.fallback, container: `${activePath}/fallback/steps` }];
  return choices.some(({ choice, container }) => choice.spoken !== false &&
    choice.text === choiceText && sameOrderedStrings(
      pending,
      [...pathsForContainer(definition, container), ...outerPending],
    ));
}

function isSequenceStep(value: unknown): value is SequenceStep {
  return isRecord(value) &&
    ["line", "narration", "operations", "choice", "branch", "direction"].includes(String(value.type));
}

function validAnimationStartedTick(value: unknown, currentTick: number): boolean {
  return Number.isInteger(value) && (value as number) >= 0 && (value as number) <= currentTick + 1;
}

function sameOrderedStrings(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function sameNumbers(left: readonly number[], right: readonly number[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasExactKeys(
  value: Record<string, unknown>,
  required: readonly string[],
  optional: readonly string[] = [],
): boolean {
  const keys = Object.keys(value);
  return required.every((key) => key in value) &&
    keys.every((key) => required.includes(key) || optional.includes(key));
}

function hasDirectedStep(steps: readonly SequenceStep[]): boolean {
  return steps.some((step) =>
    step.type === "direction" ||
    step.type === "choice" && (
      step.alternatives.some((alternative) => hasDirectedStep(alternative.steps)) ||
      hasDirectedStep(step.fallback.steps)
    ) ||
    step.type === "branch" && (
      step.cases.some((branch) => hasDirectedStep(branch.steps)) ||
      hasDirectedStep(step.fallback)
    ));
}

function intersectSets(sets: readonly Set<string>[]): Set<string> {
  const [first, ...rest] = sets;
  return new Set([...(first ?? new Set<string>())].filter((value) =>
    rest.every((set) => set.has(value)),
  ));
}
