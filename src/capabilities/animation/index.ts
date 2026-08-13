import type { AuthoringDiagnostic } from "../game-project";
import type { GameState } from "../game-session";
import type {
  CharacterDefinition,
  ObjectDefinition,
  ResolvedSceneDefinition,
  WorldState,
} from "../world";
import type {
  DirectedSubject,
  SequenceDirectionPresentation,
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

/** Non-directional images or one horizontal strip used by an Object or Scenery Animation. */
export type AnimationFrames = readonly (URL | string)[] | AnimationStrip;

/** Four synchronized authored presentations owned by one Character Animation. */
export interface CharacterAnimationFrames {
  readonly left: AnimationStrip;
  readonly right: AnimationStrip;
  readonly front: AnimationStrip;
  readonly back: AnimationStrip;
}

type AnyAnimationFrames = AnimationFrames | CharacterAnimationFrames;

/** A declarative transient visual performance owned by an Appearance. */
export interface AnimationDefinition<Frames extends AnyAnimationFrames = AnyAnimationFrames> {
  readonly frames: Frames;
  readonly framesPerSecond: number;
  readonly loop?: boolean;
  /** Named logical seconds from the start of the Animation. */
  readonly cues?: Readonly<Record<string, number>>;
}

/** A Character Animation whose artwork is authored independently for every Facing. */
export type CharacterAnimationDefinition = AnimationDefinition<CharacterAnimationFrames>;
type AnyAnimationDefinition = AnimationDefinition | CharacterAnimationDefinition;

/** Semantic Animation selections used automatically by the Engine. */
export interface AnimationRoles {
  readonly default: string;
  readonly speaking?: string;
  readonly walking?: string;
}

/** @internal Shared read model for any Appearance carrying Animations. */
export interface AnimationBearingAppearance {
  readonly animations: Readonly<Record<string, AnimationDefinition>>;
  readonly roles: AnimationRoles;
  readonly visualAnchor?: VisualAnchor;
}

/** A persistent visual condition that owns all transient Animations available in it. */
export interface Appearance {
  readonly animations: Readonly<Record<string, AnimationDefinition<AnimationFrames>>>;
  readonly roles: AnimationRoles;
  readonly visualAnchor?: VisualAnchor;
}

/** A Character Appearance whose every Animation supplies all four Facing presentations. */
export interface CharacterAppearance extends Omit<Appearance, "animations"> {
  readonly animations: Readonly<Record<string, CharacterAnimationDefinition>>;
}

type AnyAppearance = Appearance | CharacterAppearance;

/** @internal Definitions needed for Animation interpretation and Save validation. */
export interface AnimationProjectView {
  readonly characters: Readonly<Record<string, CharacterDefinition>>;
  readonly objects: Readonly<Record<string, ObjectDefinition>>;
  readonly scenes: Readonly<Record<string, ResolvedSceneDefinition>>;
  readonly playerCharacter?: string;
}

/** Validates project-level Animation settings outside any focused definition. */
export function validateAnimationProjectSettings(
  inventoryAppearanceSize: number | undefined,
): readonly AuthoringDiagnostic[] {
  return inventoryAppearanceSize === undefined || (
    Number.isInteger(inventoryAppearanceSize) && inventoryAppearanceSize > 0
  )
    ? []
    : [{
        code: "definition.inventory-appearance-size",
        family: "definition",
        owner: "animation",
        path: "inventoryAppearanceSize",
        message: "Inventory Appearance Size must be a positive integer.",
      }];
}

/** Validates one authored Appearance-changing operation against Animation definitions. */
export function validateAppearanceOperationReference(
  operation: {
    readonly target:
      | { readonly kind: "character"; readonly character: string }
      | { readonly kind: "object"; readonly object: string }
      | { readonly kind: "scenery"; readonly scene: string; readonly scenery: string };
    readonly appearance: string;
  },
  path: string,
  project: {
    readonly characters: AnimationProjectView["characters"];
    readonly objects: AnimationProjectView["objects"];
    readonly scenes: Readonly<Record<string, Pick<ResolvedSceneDefinition, "scenery">>>;
  },
): readonly AuthoringDiagnostic[] {
  const target = operation.target;
  const appearances = target.kind === "character"
    ? project.characters[target.character]?.appearances
    : target.kind === "object"
      ? project.objects[target.object]?.appearances
      : project.scenes[target.scene]?.scenery?.[target.scenery]?.appearances;
  if (!appearances) {
    return [{
      code: "reference.appearance.target",
      family: "reference",
      owner: "animation",
      path,
      message: "Appearance target does not exist.",
    }];
  }
  return operation.appearance in appearances
    ? []
    : [{
        code: "reference.appearance",
        family: "reference",
        owner: "animation",
        path,
        message: `Appearance '${operation.appearance}' does not exist on the target.`,
      }];
}

/** Resolves an Engine-selected Animation Role, including the speaking fallback. */
export function animationNameForRole(
  appearance: AnyAppearance,
  role: keyof AnimationRoles,
): string | undefined {
  if (role === "speaking") return appearance.roles.speaking ?? appearance.roles.default;
  return appearance.roles[role];
}

/** Reports every local Appearance and Animation Authoring Diagnostic. */
export function validateAppearance(
  appearance: AnyAppearance,
  path: string,
): readonly AuthoringDiagnostic[] {
  return validateAppearanceContract(appearance, path, false);
}

function validateAppearanceContract(
  appearance: AnyAppearance,
  path: string,
  character: boolean,
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
    const frameCount = character
      ? validateCharacterFrames(
          isCharacterAnimationFrames(animation.frames) ? animation.frames : undefined,
          animationPath,
          diagnostics,
        )
      : validateFrames(animation.frames, animationPath, diagnostics);
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
    for (const [cue, at] of Object.entries(animation.cues ?? {}) as [string, number][]) {
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

/** Reports every local Character Appearance and synchronized Facing diagnostic. */
export function validateCharacterAppearance(
  appearance: CharacterAppearance,
  path: string,
): readonly AuthoringDiagnostic[] {
  return validateAppearanceContract(appearance, path, true);
}

export interface AppearanceSetValidation {
  readonly path: string;
  readonly initialAppearance: string;
  readonly subject: "Character" | "Object";
  readonly requireWalking?: boolean;
}

/** Reports required walking-role Authoring Diagnostic without repeating Appearance validation. */
export function validateWalkingAppearanceRoles(
  appearances: Readonly<Record<string, AnyAppearance>>,
  path: string,
  subject: "Character" | "Object",
): readonly AuthoringDiagnostic[] {
  return Object.entries(appearances).flatMap(([appearanceName, appearance]) =>
    appearance.roles.walking
      ? []
      : [{
          code: "reference.animation.walking-role",
          family: "reference" as const,
          owner: "animation" as const,
          path: `${path}.${appearanceName}.roles.walking`,
          message: `A ${subject} Appearance requires a walking Animation Role.`,
        }],
  );
}

/** Reports an invalid initial Appearance selection for any animated subject. */
export function validateInitialAppearance(
  appearances: Readonly<Record<string, unknown>>,
  initialAppearance: string,
  path: string,
  subject: "Character" | "Object" | "Scenery",
): readonly AuthoringDiagnostic[] {
  return initialAppearance in appearances
    ? []
    : [{
        code: "reference.appearance.initial",
        family: "reference",
        owner: "animation",
        path,
        message: `Appearance '${initialAppearance}' is not defined on this ${subject}.`,
      }];
}

/** Validates one entity's complete set of Appearance choices and role requirements. */
export function validateAppearanceSet(
  appearances: Readonly<Record<string, AnyAppearance>>,
  validation: AppearanceSetValidation,
): readonly AuthoringDiagnostic[] {
  const diagnostics = Object.entries(appearances).flatMap(([appearanceName, appearance]) =>
    validation.subject === "Character"
      ? validateCharacterAppearance(appearance as CharacterAppearance, `${validation.path}.${appearanceName}`)
      : validateAppearance(appearance, `${validation.path}.${appearanceName}`),
  );
  const ownerPath = validation.path.endsWith(".appearances")
    ? validation.path.slice(0, -".appearances".length)
    : "";
  diagnostics.push(...validateInitialAppearance(
    appearances,
    validation.initialAppearance,
    ownerPath ? `${ownerPath}.initialAppearance` : "initialAppearance",
    validation.subject,
  ));
  if (validation.requireWalking) {
    diagnostics.push(...validateWalkingAppearanceRoles(
      appearances,
      validation.path,
      validation.subject,
    ));
  }
  return diagnostics;
}

/** Validates that every possible Appearance can present a named Animation. */
export function validateAnimationReference(
  appearances: readonly AnimationBearingAppearance[],
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
  frames: AnyAnimationFrames,
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

  return isCharacterAnimationFrames(frames)
    ? validateCharacterFrames(frames, animationPath, diagnostics)
    : validateAnimationStrip(frames, `${animationPath}.frames`, diagnostics);
}

function validateAnimationStrip(
  strip: AnimationStrip,
  path: string,
  diagnostics: AuthoringDiagnostic[],
): number {
  if (!(strip?.image instanceof URL) && (typeof strip?.image !== "string" || !strip.image.trim())) {
    diagnostics.push({
      code: "definition.animation.frame-source",
      family: "definition",
      owner: "animation",
      path: `${path}.image`,
      message: "An Animation strip source must be a URL or non-empty string.",
    });
  }
  if (!Number.isInteger(strip?.count) || strip.count <= 0) {
    diagnostics.push({
      code: "definition.animation.frames",
      family: "definition",
      owner: "animation",
      path: `${path}.count`,
      message: "An Animation strip must contain a positive integer number of frames.",
    });
  }
  return strip?.count ?? 0;
}

function validateCharacterFrames(
  frames: CharacterAnimationFrames | undefined,
  animationPath: string,
  diagnostics: AuthoringDiagnostic[],
): number {
  const counts = new Set<number>();
  for (const direction of ["left", "right", "front", "back"] as const) {
    const strip = frames?.[direction];
    if (!strip || typeof strip !== "object") {
      diagnostics.push({
        code: "definition.animation.facing-presentation",
        family: "definition",
        owner: "animation",
        path: `${animationPath}.frames.${direction}`,
        message: `A Character Animation must provide an authored ${direction} presentation.`,
      });
      continue;
    }
    validateAnimationStrip(strip, `${animationPath}.frames.${direction}`, diagnostics);
    if (Number.isInteger(strip.count) && strip.count > 0) {
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
  return frames?.front?.count ?? 0;
}

/** Animation-owned finite duration used by Sequence and browser presentation. */
export function animationDurationTicks(animation: AnyAnimationDefinition): number {
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
  animation: AnyAnimationDefinition,
  elapsedTicks: number,
  loop = Boolean(animation.loop),
): number {
  const frameCount = animationFrameCount(animation);
  const logicalFrame = Math.max(0, Math.floor(elapsedTicks * animation.framesPerSecond / 60));
  return loop ? logicalFrame % frameCount : Math.min(frameCount - 1, logicalFrame);
}

export function animationFrameCount(animation: AnyAnimationDefinition): number {
  return isImageAnimationFrames(animation.frames)
    ? animation.frames.length
    : isCharacterAnimationFrames(animation.frames)
      ? animation.frames.front.count
      : animation.frames.count;
}

export interface AnimationPresentationContext {
  readonly direction?: SequenceDirectionPresentation;
  readonly line?: { readonly character: string; readonly animation?: string };
}

/** Browser-independent visual facts for one animated subject. */
export interface AnimationPresentation {
  readonly appearanceName: string;
  readonly appearance: AnyAppearance;
  readonly animationName: string;
  readonly animation: AnyAnimationDefinition;
  readonly elapsedTicks: number;
  readonly frameIndex: number;
  readonly loop: boolean;
  readonly visualAnchor?: VisualAnchor;
}

/** Derives the active Appearance, Animation, and logical frame for one subject. */
export function animationPresentationForSubject(
  data: AnimationProjectView,
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
  data: AnimationProjectView,
  state: Readonly<GameState>,
  subject: DirectedSubject,
): AnyAppearance | undefined {
  return appearanceSelectionForSubject(data, state, subject)?.appearance;
}

/** Reports whether Animation recognizes an Appearance for one persistent Object. */
export function objectHasAppearance(
  data: Pick<AnimationProjectView, "objects">,
  object: string,
  appearance: string,
): boolean {
  return appearance in (data.objects[object]?.appearances ?? {});
}

/** Validates one Object Appearance reference without exposing Animation representation. */
export function validateObjectAppearanceReference(
  data: Pick<AnimationProjectView, "objects">,
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
  data: AnimationProjectView,
  state: Readonly<GameState>,
  subject: DirectedSubject,
): { readonly appearanceName: string; readonly appearance: AnyAppearance } | undefined {
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

/** Validates every persistent Appearance selection in restored World state. */
export function isValidAnimationState(
  view: AnimationProjectView,
  state: Readonly<WorldState>,
): boolean {
  for (const [character, selection] of Object.entries(state.characters)) {
    if (!(selection.appearance in (view.characters[character]?.appearances ?? {}))) return false;
  }
  for (const [object, selection] of Object.entries(state.objects)) {
    if (!(selection.appearance in (view.objects[object]?.appearances ?? {}))) return false;
  }
  for (const [scene, selections] of Object.entries(state.scenery)) {
    for (const [scenery, appearance] of Object.entries(selections)) {
      if (!(appearance in (view.scenes[scene]?.scenery?.[scenery]?.appearances ?? {}))) return false;
    }
  }
  return true;
}

/** Reports whether a restored Line can use its authored Animation override. */
export function isValidLineAnimation(
  view: AnimationProjectView,
  state: Readonly<WorldState>,
  character: string,
  animation: string | undefined,
): boolean {
  if (animation === undefined) return character in view.characters;
  const appearance = state.characters[character]?.appearance;
  return appearance !== undefined &&
    animation in (view.characters[character]?.appearances[appearance]?.animations ?? {});
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
  readonly timing: SequenceDirectionPresentation["directions"][number]["timing"];
}> {
  for (let index = context.directions.length - 1; index >= 0; index -= 1) {
    yield context.directions[index]!;
  }
}

export function isImageAnimationFrames(
  frames: AnyAnimationFrames,
): frames is readonly (URL | string)[] {
  return Array.isArray(frames);
}

export function isCharacterAnimationFrames(
  frames: AnyAnimationFrames,
): frames is CharacterAnimationFrames {
  return !Array.isArray(frames) && frames !== null && typeof frames === "object" && "left" in frames;
}
