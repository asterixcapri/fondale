import type { AuthoringDiagnostic, GameProjectData } from "../game-project";
import type { GameState } from "../game-session";
import type {
  DirectionStep,
  DirectionStepInterpretation,
  DirectionTiming,
  DirectedSubject,
  SequenceDirection,
} from "../sequence";

/** Image-pixel coordinates used to align an Animation frame to its world position. */
export interface VisualAnchor {
  readonly x: number;
  readonly y: number;
}

/** One horizontal image strip containing a positive number of Animation frames. */
export interface AnimationStrip {
  readonly image: URL | string;
  readonly count: number;
}

/** Frames used by one Animation, either as images or directional strips. */
export type AnimationFrames =
  | readonly (URL | string)[]
  | {
      readonly side: AnimationStrip;
      readonly front: AnimationStrip;
      readonly back: AnimationStrip;
    };

/** A declarative transient visual performance owned by an Appearance. */
export interface AnimationDefinition {
  readonly frames: AnimationFrames;
  readonly framesPerSecond: number;
  readonly loop?: boolean;
  /** Named logical seconds from the start of the Animation. */
  readonly cues?: Readonly<Record<string, number>>;
}

/** Semantic Animation selections used automatically by the Engine. */
export interface AnimationRoles {
  readonly default: string;
  readonly speaking?: string;
  readonly walking?: string;
}

/** A persistent visual condition that owns all transient Animations available in it. */
export interface Appearance {
  readonly animations: Readonly<Record<string, AnimationDefinition>>;
  readonly roles: AnimationRoles;
  readonly visualAnchor?: VisualAnchor;
}

/** Resolves an Engine-selected Animation Role, including the speaking fallback. */
export function animationNameForRole(
  appearance: Appearance,
  role: keyof AnimationRoles,
): string | undefined {
  if (role === "speaking") return appearance.roles.speaking ?? appearance.roles.default;
  return appearance.roles[role];
}

/** Reports every local Appearance and Animation authoring error. */
export function validateAppearance(
  appearance: Appearance,
  path: string,
): readonly AuthoringDiagnostic[] {
  const diagnostics: AuthoringDiagnostic[] = [];
  const animationNames = Object.keys(appearance.animations);
  if (animationNames.length === 0) {
    diagnostics.push({
      code: "definition.appearance.animations",
      family: "definition",
      owner: "animation",
      path: `${path}.animations`,
      message: "An Appearance must define at least one Animation.",
    });
  }

  if (typeof appearance.roles?.default !== "string" || !appearance.roles.default.trim()) {
    diagnostics.push({
      code: "definition.appearance.default-role",
      family: "definition",
      owner: "animation",
      path: `${path}.roles.default`,
      message: "An Appearance must identify a Default Animation Role.",
    });
  }
  for (const [role, animation] of Object.entries(appearance.roles ?? {})) {
    if (typeof animation !== "string" || !(animation in appearance.animations)) {
      diagnostics.push({
        code: "reference.animation.role",
        family: "reference",
        owner: "animation",
        path: `${path}.roles.${role}`,
        message: `Animation Role '${role}' refers to missing Animation '${String(animation)}'.`,
      });
    }
  }

  if (
    appearance.visualAnchor &&
    (!Number.isFinite(appearance.visualAnchor.x) || !Number.isFinite(appearance.visualAnchor.y))
  ) {
    diagnostics.push({
      code: "definition.animation.visual-anchor",
      family: "definition",
      owner: "animation",
      path: `${path}.visualAnchor`,
      message: "A Visual Anchor must use finite image-pixel coordinates.",
    });
  }

  for (const [animationName, animation] of Object.entries(appearance.animations)) {
    const animationPath = `${path}.animations.${animationName}`;
    const frameCount = validateFrames(animation.frames, animationPath, diagnostics);
    if (!Number.isFinite(animation.framesPerSecond) || animation.framesPerSecond <= 0) {
      diagnostics.push({
        code: "definition.animation.frames-per-second",
        family: "definition",
        owner: "animation",
        path: `${animationPath}.framesPerSecond`,
        message: "Animation frames per second must be a positive finite number.",
      });
    }
    if (animation.loop !== undefined && typeof animation.loop !== "boolean") {
      diagnostics.push({
        code: "definition.animation.loop",
        family: "definition",
        owner: "animation",
        path: `${animationPath}.loop`,
        message: "Animation loop must be a boolean when provided.",
      });
    }
    const duration = frameCount > 0 && animation.framesPerSecond > 0
      ? frameCount / animation.framesPerSecond
      : 0;
    for (const [cue, at] of Object.entries(animation.cues ?? {})) {
      if (!cue.trim() || !Number.isFinite(at) || at < 0 || at > duration) {
        diagnostics.push({
          code: "definition.animation.cue",
          family: "definition",
          owner: "animation",
          path: `${animationPath}.cues.${cue}`,
          message: "An Animation Cue must have a name and occur within the Animation duration.",
        });
      }
    }
  }
  return diagnostics;
}

export interface AppearanceSetValidation {
  readonly path: string;
  readonly initialAppearance: string;
  readonly subject: "Character" | "Object";
  readonly requireWalking?: boolean;
}

/** Validates one entity's complete set of Appearance choices and role requirements. */
export function validateAppearanceSet(
  appearances: Readonly<Record<string, Appearance>>,
  validation: AppearanceSetValidation,
): readonly AuthoringDiagnostic[] {
  const diagnostics = Object.entries(appearances).flatMap(([appearanceName, appearance]) =>
    validateAppearance(appearance, `${validation.path}.${appearanceName}`),
  );
  const ownerPath = validation.path.endsWith(".appearances")
    ? validation.path.slice(0, -".appearances".length)
    : "";
  if (!(validation.initialAppearance in appearances)) {
    diagnostics.push({
      code: "reference.appearance.initial",
      family: "reference",
      owner: "animation",
      path: ownerPath ? `${ownerPath}.initialAppearance` : "initialAppearance",
      message: `Appearance '${validation.initialAppearance}' is not defined on this ${validation.subject}.`,
    });
  }
  if (validation.requireWalking) {
    for (const [appearanceName, appearance] of Object.entries(appearances)) {
      if (!appearance.roles.walking) {
        diagnostics.push({
          code: "reference.animation.walking-role",
          family: "reference",
          owner: "animation",
          path: `${validation.path}.${appearanceName}.roles.walking`,
          message: `A ${validation.subject} Appearance requires a walking Animation Role.`,
        });
      }
    }
  }
  return diagnostics;
}

/** Validates that every possible Appearance can present a named Animation. */
export function validateAnimationReference(
  appearances: readonly Appearance[],
  animation: string,
  path: string,
  code: string,
  message: string,
): readonly AuthoringDiagnostic[] {
  return appearances.length > 0 && appearances.every((appearance) => animation in appearance.animations)
    ? []
    : [{ code, family: "reference", owner: "animation", path, message }];
}

function validateFrames(
  frames: AnimationFrames,
  animationPath: string,
  diagnostics: AuthoringDiagnostic[],
): number {
  if (isImageAnimationFrames(frames)) {
    if (frames.length === 0) {
      diagnostics.push({
        code: "definition.animation.frames",
        family: "definition",
        owner: "animation",
        path: `${animationPath}.frames`,
        message: "An Animation must contain at least one frame.",
      });
    }
    frames.forEach((frame, index) => {
      if (!(frame instanceof URL) && (typeof frame !== "string" || !frame.trim())) {
        diagnostics.push({
          code: "definition.animation.frame-source",
          family: "definition",
          owner: "animation",
          path: `${animationPath}.frames[${index}]`,
          message: "An Animation frame source must be a URL or non-empty string.",
        });
      }
    });
    return frames.length;
  }

  const counts = new Set<number>();
  for (const direction of ["side", "front", "back"] as const) {
    const strip = frames[direction];
    if (!(strip.image instanceof URL) && (typeof strip.image !== "string" || !strip.image.trim())) {
      diagnostics.push({
        code: "definition.animation.frame-source",
        family: "definition",
        owner: "animation",
        path: `${animationPath}.frames.${direction}.image`,
        message: "An Animation strip source must be a URL or non-empty string.",
      });
    }
    if (!Number.isInteger(strip.count) || strip.count <= 0) {
      diagnostics.push({
        code: "definition.animation.frames",
        family: "definition",
        owner: "animation",
        path: `${animationPath}.frames.${direction}.count`,
        message: "An Animation strip must contain a positive integer number of frames.",
      });
    } else {
      counts.add(strip.count);
    }
  }
  if (counts.size > 1) {
    diagnostics.push({
      code: "definition.animation.directional-frame-count",
      family: "definition",
      owner: "animation",
      path: `${animationPath}.frames`,
      message: "Directional Animation strips must contain the same number of frames.",
    });
  }
  return frames.front.count;
}

/** Animation-owned finite duration used by Sequence and browser presentation. */
export function animationDurationTicks(animation: AnimationDefinition): number {
  const count = animationFrameCount(animation);
  return Math.max(1, Math.ceil(count / animation.framesPerSecond * 60));
}

/** Animation-owned logical Cue position used by Sequence scheduling. */
export function animationCueTick(animation: AnimationDefinition, cue: string): number | undefined {
  const seconds = animation.cues?.[cue];
  return seconds === undefined ? undefined : Math.max(0, Math.ceil(seconds * 60));
}

/** Selects the logical frame presented at an Animation-local tick. */
export function animationFrameIndex(
  animation: AnimationDefinition,
  elapsedTicks: number,
  loop = Boolean(animation.loop),
): number {
  const frameCount = animationFrameCount(animation);
  const logicalFrame = Math.max(0, Math.floor(elapsedTicks * animation.framesPerSecond / 60));
  return loop ? logicalFrame % frameCount : Math.min(frameCount - 1, logicalFrame);
}

export function animationFrameCount(animation: AnimationDefinition): number {
  return isImageAnimationFrames(animation.frames)
    ? animation.frames.length
    : animation.frames.front.count;
}

export interface AnimationPresentationContext {
  readonly direction?: {
    readonly step: DirectionStep;
    readonly interpretation: DirectionStepInterpretation;
  };
  readonly line?: { readonly character: string; readonly animation?: string };
}

/** Browser-independent visual facts for one animated subject. */
export interface AnimationPresentation {
  readonly appearanceName: string;
  readonly appearance: Appearance;
  readonly animationName: string;
  readonly animation: AnimationDefinition;
  readonly elapsedTicks: number;
  readonly frameIndex: number;
  readonly loop: boolean;
  readonly visualAnchor?: VisualAnchor;
}

/** Derives the active Appearance, Animation, and logical frame for one subject. */
export function animationPresentationForSubject(
  data: GameProjectData,
  state: Readonly<GameState>,
  subject: DirectedSubject,
  context: AnimationPresentationContext = {},
): AnimationPresentation | undefined {
  const selection = appearanceSelectionForSubject(data, state, subject);
  if (!selection) return undefined;
  const { appearanceName, appearance } = selection;

  let animationName = appearance.roles.default;
  let elapsedTicks = state.tick;
  let forceLoop = false;
  let directed = false;
  const active = context.direction;
  if (active) {
    for (const { direction, timing } of reverseDirectionTimings(active)) {
      if (
        direction.type === "animation" &&
        sameSubject(direction.subject, subject) &&
        timing.active &&
        appearance.animations[direction.animation]
      ) {
        animationName = direction.animation;
        elapsedTicks = timing.localTick;
        directed = true;
        break;
      }
    }
    if (!directed && subject.kind === "character" && appearance.roles.walking) {
      for (const { direction, timing } of reverseDirectionTimings(active)) {
        if (direction.type === "motion" && sameSubject(direction.subject, subject) && timing.active) {
          animationName = appearance.roles.walking;
          elapsedTicks = timing.localTick;
          forceLoop = true;
          directed = true;
          break;
        }
      }
    }
  }

  if (!directed) {
    if (subject.kind === "character" && context.line?.character === subject.character) {
      animationName = context.line.animation ?? animationNameForRole(appearance, "speaking")!;
      elapsedTicks = activityAnimationElapsedTicks(state, "line");
    } else if (
      subject.kind === "character" &&
      subject.character === data.playerCharacter &&
      state.activity?.type === "player-intent" &&
      appearance.roles.walking
    ) {
      animationName = appearance.roles.walking;
      elapsedTicks = activityAnimationElapsedTicks(state, "player-intent");
      forceLoop = true;
    }
  }

  const animation = appearance.animations[animationName] ?? appearance.animations[appearance.roles.default];
  if (!animation) return undefined;
  const loop = forceLoop || Boolean(animation.loop);
  return Object.freeze({
    appearanceName,
    appearance,
    animationName,
    animation,
    elapsedTicks,
    frameIndex: animationFrameIndex(animation, elapsedTicks, loop),
    loop,
    ...(appearance.visualAnchor ? { visualAnchor: Object.freeze({ ...appearance.visualAnchor }) } : {}),
  });
}

function activityAnimationElapsedTicks(
  state: Readonly<GameState>,
  kind: "line" | "player-intent",
): number {
  const activity = state.activity;
  let animationStartedTick: number | undefined;
  if (kind === "player-intent" && activity?.type === "player-intent") {
    animationStartedTick = activity.animationStartedTick;
  } else if (kind === "line" && activity?.type === "line") {
    animationStartedTick = activity.animationStartedTick;
  } else if (kind === "line" && activity?.type === "sequence" && activity.active?.kind === "line") {
    animationStartedTick = activity.active.animationStartedTick;
  }
  return animationStartedTick === undefined
    ? state.tick
    : Math.max(0, state.tick - animationStartedTick);
}

/** Resolves the current Appearance without exposing mutable Game State. */
export function appearanceForSubject(
  data: GameProjectData,
  state: Readonly<GameState>,
  subject: DirectedSubject,
): Appearance | undefined {
  return appearanceSelectionForSubject(data, state, subject)?.appearance;
}

/** Reports whether Animation recognizes an Appearance for one persistent Object. */
export function objectHasAppearance(
  data: Pick<GameProjectData, "objects">,
  object: string,
  appearance: string,
): boolean {
  return appearance in (data.objects[object]?.appearances ?? {});
}

/** Validates one Object Appearance reference without exposing Animation representation. */
export function validateObjectAppearanceReference(
  data: Pick<GameProjectData, "objects">,
  object: string,
  appearance: string,
  path: string,
): readonly AuthoringDiagnostic[] {
  return objectHasAppearance(data, object, appearance)
    ? []
    : [{
        code: "reference.appearance",
        family: "reference",
        owner: "animation",
        path,
        message: `Appearance '${appearance}' does not exist on Object '${object}'.`,
      }];
}

function appearanceSelectionForSubject(
  data: GameProjectData,
  state: Readonly<GameState>,
  subject: DirectedSubject,
): { readonly appearanceName: string; readonly appearance: Appearance } | undefined {
  const subjectId = directedSubjectId(subject);
  const appearanceName = {
    character: state.characters[subjectId]?.appearance,
    object: state.objects[subjectId]?.appearance,
    scenery: state.scenery[state.currentScene]?.[subjectId],
  }[subject.kind];
  const candidate = {
    character: data.characters[subjectId]?.appearances[appearanceName ?? ""],
    object: data.objects[subjectId]?.appearances[appearanceName ?? ""],
    scenery: data.scenes[state.currentScene]?.scenery?.[subjectId]?.appearances[appearanceName ?? ""],
  }[subject.kind];
  return appearanceName && candidate && "animations" in candidate
    ? { appearanceName, appearance: candidate }
    : undefined;
}

function sameSubject(left: DirectedSubject, right: DirectedSubject): boolean {
  return left.kind === right.kind && directedSubjectId(left) === directedSubjectId(right);
}

function directedSubjectId(subject: DirectedSubject): string {
  if (subject.kind === "character") return subject.character;
  if (subject.kind === "object") return subject.object;
  return subject.scenery;
}

function* reverseDirectionTimings(context: NonNullable<AnimationPresentationContext["direction"]>): Generator<{
  readonly direction: SequenceDirection;
  readonly timing: DirectionTiming;
}> {
  for (let index = context.step.directions.length - 1; index >= 0; index -= 1) {
    yield {
      direction: context.step.directions[index]!,
      timing: context.interpretation.directions[index]!,
    };
  }
}

export function isImageAnimationFrames(
  frames: AnimationFrames,
): frames is readonly (URL | string)[] {
  return Array.isArray(frames);
}
