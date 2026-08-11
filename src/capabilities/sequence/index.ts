import type {
  AnimationDefinition,
  DirectionStep,
  DirectedSubject,
  MotionDirection,
} from "../game-project";
import { animationDurationTicks } from "../animation";

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

export interface DirectionTiming {
  readonly index: number;
  readonly startTick: number;
  readonly localTick: number;
  readonly started: boolean;
}

export interface DirectionStepInterpretation {
  readonly elapsedTicks: number;
  readonly durationElapsed: boolean;
  readonly directions: readonly DirectionTiming[];
}

/** The single browser-independent temporal interpretation of a Direction Step. */
export function interpretDirectionStep(
  step: DirectionStep,
  elapsedTicks: number,
  animationFor: (subject: DirectedSubject, animation: string) => AnimationDefinition | undefined,
): DirectionStepInterpretation {
  return Object.freeze({
    elapsedTicks,
    durationElapsed: step.duration !== undefined && elapsedTicks >= secondsToTicks(step.duration),
    directions: Object.freeze(step.directions.map((_, index) => {
      const startTick = directionStartTick(step, index, animationFor);
      const localTick = elapsedTicks - startTick;
      return Object.freeze({ index, startTick, localTick, started: localTick >= 0 });
    })),
  });
}

/** Sequence owns completion while World reports Character Motion arrival. */
export function directionStepComplete(
  step: DirectionStep,
  interpretation: DirectionStepInterpretation,
  animationFor: (subject: DirectedSubject, animation: string) => AnimationDefinition | undefined,
  characterMotionComplete: (direction: MotionDirection) => boolean,
): boolean {
  if (interpretation.durationElapsed) return true;
  const boundaries = step.directions.flatMap((direction, index) => {
    const localTick = interpretation.directions[index]!.localTick;
    if (direction.type === "animation") {
      const animation = animationFor(direction.subject, direction.animation);
      return animation && !animation.loop ? [localTick >= animationDurationTicks(animation)] : [];
    }
    if (direction.type === "motion") {
      return direction.subject.kind === "character"
        ? [localTick >= 0 && characterMotionComplete(direction)]
        : [localTick >= secondsToTicks(direction.duration!)];
    }
    if (direction.mode === "cut") return [localTick >= 1];
    return direction.duration === undefined ? [] : [localTick >= secondsToTicks(direction.duration)];
  });
  return boundaries.length > 0 && boundaries.every(Boolean);
}

export function resolveSequencePath(value: unknown, path: string): unknown {
  return path.split("/").reduce<unknown>((current, segment) => {
    if (current === null || typeof current !== "object") return undefined;
    return (current as Record<string, unknown>)[segment];
  }, value);
}
