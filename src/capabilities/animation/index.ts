import type {
  AnimationDefinition,
  AnimationFrames,
  Appearance,
  DirectedSubject,
  GameProjectData,
} from "../game-project";
import type { GameState } from "../game-session";

/** Animation-owned finite duration used by Sequence and browser presentation. */
export function animationDurationTicks(animation: AnimationDefinition): number {
  const count = isImageAnimationFrames(animation.frames)
    ? animation.frames.length
    : animation.frames.front.count;
  return Math.max(1, Math.ceil(count / animation.framesPerSecond * 60));
}

/** Resolves the current Appearance without exposing mutable Game State. */
export function appearanceForSubject(
  data: GameProjectData,
  state: Readonly<GameState>,
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
