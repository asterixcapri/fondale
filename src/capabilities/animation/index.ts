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

/** One authored rectangular cell within an Animation Sheet, in image pixels. */
export interface AnimationFrame {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/** One Runtime Asset image and its ordered Animation frames. */
export interface AnimationSheet {
  readonly image: URL | string;
  readonly frames: readonly AnimationFrame[];
}

/** Four synchronized authored presentations owned by one Character Animation. */
export interface CharacterAnimationSheets {
  readonly left: AnimationSheet;
  readonly right: AnimationSheet;
  readonly front: AnimationSheet;
  readonly back: AnimationSheet;
}

/** Temporal traversal shared by directional and non-directional Animations. */
export interface AnimationTiming {
  readonly framesPerSecond: number;
  readonly loop?: boolean;
  /** Named logical seconds from the start of the Animation. */
  readonly cues?: Readonly<Record<string, number>>;
}

/** A declarative transient visual performance owned by an Appearance. */
export interface AnimationDefinition {
  readonly sheet: AnimationSheet;
  readonly timing: AnimationTiming;
}

/** A Character Animation whose artwork is authored independently for every Facing. */
export interface CharacterAnimationDefinition {
  readonly sheets: CharacterAnimationSheets;
  readonly timing: AnimationTiming;
}
export type AnyAnimationDefinition = AnimationDefinition | CharacterAnimationDefinition;

export interface UniformGridOptions {
  readonly frameWidth: number;
  readonly frameHeight: number;
  readonly columns: number;
  readonly count: number;
  readonly x?: number;
  readonly y?: number;
  readonly columnGap?: number;
  readonly rowGap?: number;
}

/** Returns row-major frame coordinates; semantic validation remains at startGame. */
export function uniformGrid(options: UniformGridOptions): readonly AnimationFrame[] {
  const { frameWidth, frameHeight, columns, count, x = 0, y = 0, columnGap = 0, rowGap = 0 } = options;
  const length = Math.max(0, Number.isFinite(count) ? Math.floor(count) : 0);
  return Array.from({ length }, (_, index) => ({
    x: x + (index % columns) * (frameWidth + columnGap),
    y: y + Math.floor(index / columns) * (frameHeight + rowGap),
    width: frameWidth,
    height: frameHeight,
  }));
}

/** Semantic Animation selections used automatically by the Engine. */
export interface AnimationRoles {
  readonly default: string;
  readonly speaking?: string;
  readonly walking?: string;
}

/** @internal Shared read model for any Appearance carrying Animations. */
export interface AnimationBearingAppearance {
  readonly animations: Readonly<Record<string, AnyAnimationDefinition>>;
  readonly roles: AnimationRoles;
  readonly visualAnchor?: VisualAnchor;
}

/** A persistent visual condition that owns all transient Animations available in it. */
export interface Appearance {
  readonly animations: Readonly<Record<string, AnimationDefinition>>;
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
      ? validateCharacterSheets(
          isCharacterAnimationDefinition(animation) ? animation.sheets : undefined,
          animationPath,
          diagnostics,
        )
      : validateAnimationSheet(
          isCharacterAnimationDefinition(animation) ? undefined : animation.sheet,
          `${animationPath}.sheet`,
          diagnostics,
        );
    if (!Number.isFinite(animation.timing?.framesPerSecond) || animation.timing.framesPerSecond <= 0) {
      diagnostics.push({
        code: "definition.animation.frames-per-second",
        family: "definition",
        owner: "animation",
        path: `${animationPath}.timing.framesPerSecond`,
        message: "Animation frames per second must be a positive finite number.",
      });
    }
    if (animation.timing?.loop !== undefined && typeof animation.timing.loop !== "boolean") {
      diagnostics.push({
        code: "definition.animation.loop",
        family: "definition",
        owner: "animation",
        path: `${animationPath}.timing.loop`,
        message: "Animation loop must be a boolean when provided.",
      });
    }
    const duration = frameCount > 0 && animation.timing?.framesPerSecond > 0
      ? frameCount / animation.timing.framesPerSecond
      : 0;
    for (const [cue, at] of Object.entries(animation.timing?.cues ?? {}) as [string, number][]) {
      if (!cue.trim() || !Number.isFinite(at) || at < 0 || at > duration) {
        diagnostics.push({
          code: "definition.animation.cue",
          family: "definition",
          owner: "animation",
          path: `${animationPath}.timing.cues.${cue}`,
          message: "An Animation Cue must have a name and occur within the Animation duration.",
        });
      }
    }
  }
  validateAppearanceCellDimensions(appearance, path, character, diagnostics);
  return diagnostics;
}

function validateAppearanceCellDimensions(
  appearance: AnyAppearance,
  path: string,
  character: boolean,
  diagnostics: AuthoringDiagnostic[],
): void {
  let expected: { readonly width: number; readonly height: number } | undefined;
  for (const [animationName, animation] of Object.entries(appearance.animations)) {
    const animationPath = `${path}.animations.${animationName}`;
    const sheets: readonly [AnimationSheet | undefined, string][] = character
      ? (["left", "right", "front", "back"] as const).map((direction) => [
          isCharacterAnimationDefinition(animation) ? animation.sheets?.[direction] : undefined,
          `${animationPath}.sheets.${direction}`,
        ])
      : [[
          isCharacterAnimationDefinition(animation) ? undefined : animation.sheet,
          `${animationPath}.sheet`,
        ]];
    for (const [sheet, sheetPath] of sheets) {
      if (!Array.isArray(sheet?.frames)) continue;
      sheet.frames.forEach((frame, index) => {
        if (!isFrameRecord(frame) ||
            !isPositiveInteger(frame.width) ||
            !isPositiveInteger(frame.height)) return;
        if (!expected) {
          expected = { width: frame.width, height: frame.height };
          return;
        }
        if (frame.width !== expected.width || frame.height !== expected.height) {
          diagnostics.push({
            code: "definition.animation.cell-dimensions",
            family: "definition",
            owner: "animation",
            path: `${sheetPath}.frames[${index}]`,
            message: "Every Animation Sheet in an Appearance must use matching Runtime cell dimensions.",
          });
        }
      });
    }
  }
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

function validateAnimationSheet(
  sheet: AnimationSheet | undefined,
  path: string,
  diagnostics: AuthoringDiagnostic[],
): number {
  if (!(sheet?.image instanceof URL) && (typeof sheet?.image !== "string" || !sheet.image.trim())) {
    diagnostics.push({
      code: "definition.animation.frame-source",
      family: "definition",
      owner: "animation",
      path: `${path}.image`,
      message: "An Animation Sheet source must be a URL or non-empty string.",
    });
  }
  if (!Array.isArray(sheet?.frames) || sheet.frames.length === 0) {
    diagnostics.push({
      code: "definition.animation.frames",
      family: "definition",
      owner: "animation",
      path: `${path}.frames`,
      message: "An Animation Sheet must contain at least one frame.",
    });
  }
  if (!Array.isArray(sheet?.frames)) return 0;
  sheet.frames.forEach((frame, index) => {
    const framePath = `${path}.frames[${index}]`;
    if (!isFrameRecord(frame)) {
      diagnostics.push({
        code: "definition.animation.frame",
        family: "definition",
        owner: "animation",
        path: framePath,
        message: "An Animation frame must define image-pixel coordinates and dimensions.",
      });
      return;
    }
    for (const coordinate of ["x", "y"] as const) {
      if (!isNonNegativeInteger(frame[coordinate])) {
        diagnostics.push({
          code: "definition.animation.frame-coordinate",
          family: "definition",
          owner: "animation",
          path: `${framePath}.${coordinate}`,
          message: "Animation frame coordinates must be non-negative integers.",
        });
      }
    }
    for (const dimension of ["width", "height"] as const) {
      if (!isPositiveInteger(frame[dimension])) {
        diagnostics.push({
          code: "definition.animation.frame-dimension",
          family: "definition",
          owner: "animation",
          path: `${framePath}.${dimension}`,
          message: "Animation frame dimensions must be positive integers.",
        });
      }
    }
  });
  return sheet.frames.length;
}

function validateCharacterSheets(
  sheets: CharacterAnimationSheets | undefined,
  animationPath: string,
  diagnostics: AuthoringDiagnostic[],
): number {
  const counts = new Map<keyof CharacterAnimationSheets, number>();
  for (const direction of ["left", "right", "front", "back"] as const) {
    const sheet = sheets?.[direction];
    if (!sheet || typeof sheet !== "object") {
      diagnostics.push({
        code: "definition.animation.facing-presentation",
        family: "definition",
        owner: "animation",
        path: `${animationPath}.sheets.${direction}`,
        message: `A Character Animation must provide an authored ${direction} presentation.`,
      });
      continue;
    }
    validateAnimationSheet(sheet, `${animationPath}.sheets.${direction}`, diagnostics);
    counts.set(direction, Array.isArray(sheet.frames) ? sheet.frames.length : 0);
  }
  const frontCount = counts.get("front");
  const referenceFacing = frontCount !== undefined
    ? "front"
    : counts.keys().next().value;
  if (referenceFacing !== undefined) {
    const referenceCount = counts.get(referenceFacing)!;
    for (const direction of ["left", "right", "front", "back"] as const) {
      if (direction === referenceFacing) continue;
      const count = counts.get(direction);
      if (count === undefined || count === referenceCount) continue;
      diagnostics.push({
        code: "definition.animation.directional-frame-count",
        family: "definition",
        owner: "animation",
        path: `${animationPath}.sheets.${direction}.frames[${Math.min(count, referenceCount)}]`,
        message: `The ${direction} Animation Sheet must contain ${referenceCount} frames to match the ${referenceFacing} Facing.`,
      });
    }
  }
  return frontCount ?? 0;
}

function isFrameRecord(value: unknown): value is Record<keyof AnimationFrame, unknown> {
  return value !== null && typeof value === "object";
}

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 0;
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) > 0;
}

/** Animation-owned finite duration used by Sequence and browser presentation. */
export function animationDurationTicks(animation: AnyAnimationDefinition): number {
  const count = animationFrameCount(animation);
  return Math.max(1, Math.ceil(count / animation.timing.framesPerSecond * 60));
}

/** Animation-owned logical Cue position used by Sequence scheduling. */
export function animationCueTick(animation: AnyAnimationDefinition, cue: string): number | undefined {
  const seconds = animation.timing.cues?.[cue];
  return seconds === undefined ? undefined : Math.max(0, Math.ceil(seconds * 60));
}

/** Selects the logical frame presented at an Animation-local tick. */
export function animationFrameIndex(
  animation: AnyAnimationDefinition,
  elapsedTicks: number,
  loop = Boolean(animation.timing.loop),
): number {
  const frameCount = animationFrameCount(animation);
  const logicalFrame = Math.max(0, Math.floor(elapsedTicks * animation.timing.framesPerSecond / 60));
  return loop ? logicalFrame % frameCount : Math.min(frameCount - 1, logicalFrame);
}

export function animationFrameCount(animation: AnyAnimationDefinition): number {
  return isCharacterAnimationDefinition(animation)
    ? animation.sheets.front.frames.length
    : animation.sheet.frames.length;
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
  const loop = forceLoop || Boolean(animation.timing.loop);
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

export function isCharacterAnimationDefinition(
  animation: AnyAnimationDefinition,
): animation is CharacterAnimationDefinition {
  return animation !== null && typeof animation === "object" && "sheets" in animation;
}
