import type {
  AnimationDefinition,
  Appearance,
  Facing,
  Point,
  AuthoringDiagnostic,
} from "../game-project";
import { animationDurationTicks } from "../animation";

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

export type CameraDirection =
  | { readonly type: "camera"; readonly mode: "cut"; readonly point: Point; readonly startAfter?: CueStart }
  | { readonly type: "camera"; readonly mode: "move"; readonly from: Point; readonly to: Point; readonly duration: number; readonly startAfter?: CueStart }
  | { readonly type: "camera"; readonly mode: "hold"; readonly point: Point; readonly duration?: number; readonly startAfter?: CueStart }
  | { readonly type: "camera"; readonly mode: "follow"; readonly subject: DirectedSubject; readonly duration?: number; readonly startAfter?: CueStart };

export type SequenceDirection = AnimationDirection | MotionDirection | CameraDirection;

/** One sequential Sequence step containing concurrent visual directions. */
export interface DirectionStep {
  readonly type: "direction";
  readonly directions: readonly SequenceDirection[];
  /** Optional finite boundary for loops and held/following Camera direction, in logical seconds. */
  readonly duration?: number;
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
      direction.path.forEach((point, pointIndex) => {
        if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) diagnostics.push({ code: "definition.point.finite", family: "definition", owner: "world", path: `${directionPath}.path[${pointIndex}]`, message: "A Motion path must use finite Scene Space coordinates." });
      });
      if (direction.path.length === 0) diagnostics.push({ code: "definition.motion.path", family: "definition", owner: "world", path: `${directionPath}.path`, message: "A Motion needs at least one destination point." });
      if (direction.subject.kind === "character") {
        if (direction.path.length !== 1) diagnostics.push({ code: "definition.motion.character-path", family: "definition", owner: "world", path: `${directionPath}.path`, message: "A Character Motion declares one navigation destination." });
        if (direction.duration !== undefined) diagnostics.push({ code: "definition.motion.character-duration", family: "definition", owner: "world", path: `${directionPath}.duration`, message: "Character Motion duration is derived from navigation and movement speed." });
        hasFiniteBoundary = true;
      } else if (!Number.isFinite(direction.duration) || direction.duration! <= 0) {
        diagnostics.push({ code: "definition.motion.duration", family: "definition", owner: "world", path: `${directionPath}.duration`, message: "Object and Scenery Motion needs a positive finite duration." });
      } else hasFiniteBoundary = true;
      return;
    }
    if ("duration" in direction && direction.duration !== undefined) {
      if (!Number.isFinite(direction.duration) || direction.duration <= 0) diagnostics.push({ code: "definition.camera.duration", family: "definition", owner: "camera", path: `${directionPath}.duration`, message: "A Camera duration must be positive and finite." });
      else hasFiniteBoundary = true;
    }
    for (const [pointName, point] of [["point", "point" in direction ? direction.point : undefined], ["from", "from" in direction ? direction.from : undefined], ["to", "to" in direction ? direction.to : undefined]] as const) {
      if (point && (!Number.isFinite(point.x) || !Number.isFinite(point.y))) diagnostics.push({ code: "definition.point.finite", family: "definition", owner: "world", path: `${directionPath}.${pointName}`, message: "A Camera point must use finite Scene Space coordinates." });
    }
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
  readonly appearancesForSubject: (subject: DirectedSubject) => readonly Appearance[];
  readonly subjectBelongsToScene: (subject: DirectedSubject) => boolean;
  readonly cameraSubjectExists: (subject: DirectedSubject) => boolean;
  readonly pointInScene: (point: Point) => boolean;
  readonly characterPointIsWalkable: (point: Point) => boolean;
  readonly sceneryRestingPoint: (scenery: string) => Point | undefined;
  readonly continuesSceneryMotion: (scenery: string, destination: Point) => boolean;
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
      if (context.hasScene && !context.subjectBelongsToScene(direction.subject)) {
        diagnostics.push({ code: "reference.sequence.subject-scene", family: "reference", owner: "sequence", path: `${directionPath}.subject`, message: "A directed subject must belong to the Sequence Scene." });
      }
      if (direction.type === "animation") {
        const animations = appearances.map((appearance) => appearance.animations[direction.animation]);
        if (animations.length === 0 || animations.some((animation) => animation === undefined)) {
          diagnostics.push({ code: "reference.animation", family: "reference", owner: "animation", path: `${directionPath}.animation`, message: `Animation '${direction.animation}' is not available in every Appearance of the subject.` });
        }
        if (animations.some((animation) => animation !== undefined && !animation.loop)) hasFiniteBoundary = true;
      } else {
        hasFiniteBoundary = true;
        if (direction.subject.kind === "character" && appearances.some((appearance) => !appearance.roles.walking)) {
          diagnostics.push({ code: "reference.animation.walking-role", family: "reference", owner: "animation", path: `${directionPath}.subject`, message: "Character Motion requires a walking Animation Role in every Appearance." });
        }
        if (context.hasScene) {
          direction.path.forEach((point, pointIndex) => {
            if (!context.pointInScene(point)) {
              diagnostics.push({ code: "definition.motion.bounds", family: "definition", owner: "world", path: `${directionPath}.path[${pointIndex}]`, message: "A Motion path point must remain inside the Sequence Scene Size." });
            } else if (direction.subject.kind === "character" && !context.characterPointIsWalkable(point)) {
              diagnostics.push({ code: "definition.motion.walkable", family: "definition", owner: "world", path: `${directionPath}.path[${pointIndex}]`, message: "A Character Motion destination must lie in the Walkable Region." });
            }
          });
          if (
            direction.subject.kind === "scenery" &&
            !context.continuesSceneryMotion(direction.subject.scenery, direction.path.at(-1)!)
          ) {
            const rest = context.sceneryRestingPoint(direction.subject.scenery);
            const destination = direction.path.at(-1);
            if (!rest || !destination || Math.hypot(rest.x - destination.x, rest.y - destination.y) > 1e-8) {
              diagnostics.push({ code: "definition.motion.scenery-rest", family: "definition", owner: "world", path: `${directionPath}.path`, message: "A Scenery Motion must end at its authored resting position." });
            }
          }
        }
      }
    }
    if (direction.type === "camera") {
      if (direction.mode === "cut" || direction.duration !== undefined) hasFiniteBoundary = true;
      if (direction.mode === "follow") {
        if (!context.cameraSubjectExists(direction.subject)) {
          diagnostics.push({ code: "reference.camera.subject", family: "reference", owner: "camera", path: `${directionPath}.subject`, message: "Camera follow subject does not exist." });
        } else if (context.hasScene && !context.subjectBelongsToScene(direction.subject)) {
          diagnostics.push({ code: "reference.camera.subject-scene", family: "reference", owner: "camera", path: `${directionPath}.subject`, message: "A Camera follow subject must belong to the Sequence Scene." });
        }
      }
      const cameraPoints = [
        ["point", "point" in direction ? direction.point : undefined],
        ["from", "from" in direction ? direction.from : undefined],
        ["to", "to" in direction ? direction.to : undefined],
      ] as const;
      for (const [pointName, point] of cameraPoints) {
        if (point && context.hasScene && !context.pointInScene(point)) {
          diagnostics.push({ code: "definition.camera.bounds", family: "definition", owner: "camera", path: `${directionPath}.${pointName}`, message: "A Camera destination must remain inside the Sequence Scene Size." });
        }
      }
    }
    if (direction.startAfter) {
      const source = step.directions[direction.startAfter.direction];
      if (source?.type === "animation") {
        const animations = context.appearancesForSubject(source.subject).map((appearance) => appearance.animations[source.animation]);
        if (animations.length === 0 || animations.some((animation) => animation?.cues?.[direction.startAfter!.cue] === undefined)) {
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

export function secondsToTicks(seconds: number): number {
  return Math.max(1, Math.ceil(seconds * 60));
}

export function directionStartTick(
  step: DirectionStep,
  index: number,
  animationFor: (subject: DirectedSubject, animation: string) => AnimationDefinition | undefined,
): number {
  const dependency = step.directions[index]?.startAfter;
  if (!dependency) return 0;
  const source = step.directions[dependency.direction];
  if (!source || source.type !== "animation") return 0;
  const cue = animationFor(source.subject, source.animation)?.cues?.[dependency.cue] ?? 0;
  return directionStartTick(step, dependency.direction, animationFor) + secondsToTicks(cue);
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
  animationFor: (subject: DirectedSubject, animation: string) => AnimationDefinition | undefined,
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
      finite = animation !== undefined && !animation.loop;
      complete = animation !== undefined && !animation.loop && started &&
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

export function resolveSequencePath(value: unknown, path: string): unknown {
  return path.split("/").reduce<unknown>((current, segment) => {
    if (current === null || typeof current !== "object") return undefined;
    return (current as Record<string, unknown>)[segment];
  }, value);
}
