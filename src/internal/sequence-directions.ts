import type {
  Appearance,
  AnimationDefinition,
  AnimationFrames,
  DirectStep,
  DirectedSubject,
  GameProjectData,
  Point,
} from "../public/definitions";
import type { GameState } from "./core";

export function secondsToTicks(seconds: number): number {
  return Math.max(1, Math.ceil(seconds * 60));
}

export function animationDurationTicks(animation: AnimationDefinition): number {
  const count = isImageAnimationFrames(animation.frames)
    ? animation.frames.length
    : animation.frames.front.count;
  return secondsToTicks(count / animation.framesPerSecond);
}

export function directionStartTick(
  step: DirectStep,
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

export function resolveSequencePath(value: unknown, path: string): unknown {
  return path.split("/").reduce<unknown>((current, segment) => {
    if (current === null || typeof current !== "object") return undefined;
    return (current as Record<string, unknown>)[segment];
  }, value);
}

export function appearanceForSubject(
  data: GameProjectData,
  state: GameState,
  subject: DirectedSubject,
): Appearance | undefined {
  const appearance = subject.kind === "character"
    ? data.characters[subject.character]?.appearances[state.characters[subject.character]?.appearance ?? ""]
    : subject.kind === "object"
      ? data.objects[subject.object]?.appearances[state.objects[subject.object]?.appearance ?? ""]
      : data.scenes[state.currentScene]?.scenery?.[subject.scenery]?.appearances[
        state.scenery[state.currentScene]?.[subject.scenery] ?? ""
      ];
  return appearance && "animations" in appearance ? appearance : undefined;
}

export function isImageAnimationFrames(
  frames: AnimationFrames,
): frames is readonly (URL | string)[] {
  return Array.isArray(frames);
}

export function pointAlongPath(path: readonly Point[], progress: number): Point {
  if (path.length === 1) return { ...path[0]! };
  const lengths = path.slice(1).map((point, index) =>
    Math.hypot(point.x - path[index]!.x, point.y - path[index]!.y),
  );
  const total = lengths.reduce((sum, length) => sum + length, 0);
  if (total === 0) return { ...path.at(-1)! };
  let remaining = total * progress;
  for (let index = 0; index < lengths.length; index += 1) {
    const length = lengths[index]!;
    if (remaining <= length) {
      const start = path[index]!;
      const end = path[index + 1]!;
      const ratio = length === 0 ? 1 : remaining / length;
      return {
        x: start.x + (end.x - start.x) * ratio,
        y: start.y + (end.y - start.y) * ratio,
      };
    }
    remaining -= length;
  }
  return { ...path.at(-1)! };
}
