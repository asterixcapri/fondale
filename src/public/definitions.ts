import { AuthoringError, type AuthoringDiagnostic } from "./diagnostics";
import {
  commandVerbs,
  type CommandLexicon,
  type CommandResponse,
  type NounDefinition,
  validateCommandResponse,
} from "./commands";
import type { HUDTheme, PassageDirection } from "./hud-theme";

/** A point measured in logical Scene Space pixels. */
export interface Point {
  readonly x: number;
  readonly y: number;
}

/** The fixed dimensions of the logical viewport and Engine-owned overlay. */
export interface LogicalResolution {
  readonly width: number;
  readonly height: number;
}

/** The complete two-dimensional extent of one Scene Space. */
export interface SceneSize {
  readonly width: number;
  readonly height: number;
}

/** The four authored facings used by directional Character walking. */
export type Facing = "front" | "back" | "left" | "right";

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
  readonly visualAnchor?: Point;
}

/** An Appearance cut directly from the owning Scene's Background. */
export interface BackgroundRegionAppearance {
  readonly kind: "background-region";
  readonly area: readonly Point[];
}

export type EntityAppearance = Appearance;
export type SceneryAppearance = Appearance | BackgroundRegionAppearance;

/** A locally validated persistent Character definition. */
export interface CharacterDefinition {
  readonly initialScene: string;
  readonly initialGroundPoint: Point;
  readonly initialFacing: Facing;
  readonly initialAppearance: string;
  readonly appearances: Readonly<Record<string, EntityAppearance>>;
  readonly movementSpeed: number;
  readonly noun?: NounDefinition;
}

/** Input accepted by {@link defineCharacter}. */
export interface CharacterInput extends CharacterDefinition {}

/** Creates and freezes one persistent Character definition. */
export function defineCharacter(input: CharacterInput): CharacterDefinition {
  const diagnostics: AuthoringDiagnostic[] = [];
  if (!Number.isFinite(input.initialGroundPoint.x) || !Number.isFinite(input.initialGroundPoint.y)) {
    diagnostics.push({
      code: "definition.point.finite",
      family: "definition",
      path: "initialGroundPoint",
      message: "A Character Ground Point must use finite Scene Space coordinates.",
    });
  }
  if (!(input.initialAppearance in input.appearances)) {
    diagnostics.push({
      code: "reference.appearance.initial",
      family: "reference",
      path: "initialAppearance",
      message: `Appearance '${input.initialAppearance}' is not defined on this Character.`,
    });
  }
  if (!Number.isFinite(input.movementSpeed) || input.movementSpeed <= 0) {
    diagnostics.push({
      code: "definition.character.movement-speed",
      family: "definition",
      path: "movementSpeed",
      message: "Character movement speed must be a positive finite number.",
    });
  }
  for (const [appearanceId, appearance] of Object.entries(input.appearances)) {
    const base = `appearances.${appearanceId}`;
    validateVisualAnchor(appearance.visualAnchor, `${base}.visualAnchor`, diagnostics);
    validateAppearance(appearance, base, diagnostics);
  }
  if (diagnostics.length > 0) throw new AuthoringError(diagnostics);
  return deepFreeze({
    ...input,
    initialGroundPoint: { ...input.initialGroundPoint },
    appearances: { ...input.appearances },
  });
}

/** A persistent collectible Object definition. */
export interface ObjectDefinition {
  readonly initialScene: string;
  readonly initialGroundPoint: Point;
  readonly initialAppearance: string;
  readonly appearances: Readonly<Record<string, EntityAppearance>>;
  readonly inventoryAppearance: URL | string;
  readonly noun?: NounDefinition;
}

/** Creates and freezes one Object that initially belongs to a Scene. */
export function defineObject(input: ObjectDefinition): ObjectDefinition {
  const diagnostics: AuthoringDiagnostic[] = [];
  if (!(input.initialAppearance in input.appearances)) {
    diagnostics.push({
      code: "reference.appearance.initial",
      family: "reference",
      path: "initialAppearance",
      message: `Appearance '${input.initialAppearance}' is not defined on this Object.`,
    });
  }
  if (!Number.isFinite(input.initialGroundPoint.x) || !Number.isFinite(input.initialGroundPoint.y)) {
    diagnostics.push({
      code: "definition.point.finite",
      family: "definition",
      path: "initialGroundPoint",
      message: "An Object Ground Point must use finite Scene Space coordinates.",
    });
  }
  for (const [appearanceId, appearance] of Object.entries(input.appearances)) {
    validateVisualAnchor(
      appearance.visualAnchor,
      `appearances.${appearanceId}.visualAnchor`,
      diagnostics,
    );
    validateAppearance(appearance, `appearances.${appearanceId}`, diagnostics);
  }
  if (diagnostics.length > 0) throw new AuthoringError(diagnostics);
  return deepFreeze({
    ...input,
    initialGroundPoint: { ...input.initialGroundPoint },
    appearances: { ...input.appearances },
  });
}

/** A boolean proposition evaluated against the latest committed Game State. */
export type InteractionCondition =
  | { readonly variable: string; readonly equals: boolean }
  | { readonly hasObject: string };

/** The finite set of declarative state transitions authored in Fondale 0.2. */
export type GameOperation =
  | { readonly type: "set-variable"; readonly variable: string; readonly value: boolean }
  | {
      readonly type: "set-appearance";
      readonly target:
        | { readonly kind: "character"; readonly character: string }
        | { readonly kind: "object"; readonly object: string }
        | { readonly kind: "scenery"; readonly scene: string; readonly scenery: string };
      readonly appearance: string;
    }
  | { readonly type: "start-sequence"; readonly sequence: string }
  | { readonly type: "collect-target-object" }
  | {
      readonly type: "place-selected-object";
      readonly groundPoint: Point;
      readonly appearance?: string;
    }
  | {
      readonly type: "place-object";
      readonly object: string;
      readonly scene: string;
      readonly groundPoint: Point;
      readonly appearance?: string;
    }
  | { readonly type: "consume-selected-object" };

export type HotspotTarget =
  | { readonly kind: "background" }
  | { readonly kind: "character"; readonly character: string }
  | { readonly kind: "object"; readonly object: string }
  | { readonly kind: "scenery"; readonly scenery: string };

export interface ApproachPoint {
  readonly groundPoint: Point;
  readonly facing: Facing;
}

interface HotspotDefinitionBase {
  readonly area: readonly Point[];
  readonly approach: ApproachPoint;
  readonly when?: InteractionCondition;
}

interface BackgroundHotspotDefinition extends HotspotDefinitionBase {
  readonly target: { readonly kind: "background" };
  readonly noun: NounDefinition;
}

interface CharacterHotspotDefinition extends HotspotDefinitionBase {
  readonly target: Extract<HotspotTarget, { readonly kind: "character" }>;
  readonly noun?: never;
}

interface ObjectHotspotDefinition extends HotspotDefinitionBase {
  readonly target: Extract<HotspotTarget, { readonly kind: "object" }>;
  readonly noun?: never;
}

interface SceneryHotspotDefinition extends HotspotDefinitionBase {
  readonly target: Extract<HotspotTarget, { readonly kind: "scenery" }>;
  readonly noun?: never;
}

export type HotspotDefinition =
  | BackgroundHotspotDefinition
  | CharacterHotspotDefinition
  | ObjectHotspotDefinition
  | SceneryHotspotDefinition;

export interface SceneryDefinition {
  readonly baseline: number;
  readonly initialAppearance: string;
  readonly appearances: Readonly<Record<string, SceneryAppearance>>;
  readonly position?: Point;
  readonly noun?: NounDefinition;
}

export interface SceneEntrance {
  readonly groundPoint: Point;
  readonly facing: Facing;
}

export interface ScenePassage {
  readonly area: readonly Point[];
  readonly approach: ApproachPoint;
  readonly when?: InteractionCondition;
  readonly noun: NounDefinition;
  readonly direction: PassageDirection;
  readonly destination: { readonly scene: string; readonly entrance: string };
}

/** A conditional Sequence start evaluated after arrival through a Scene Passage. */
export interface ArrivalSequenceRule {
  readonly sequence: string;
  readonly entrance?: string;
  readonly when?: InteractionCondition;
}

export interface PerspectiveScaleStop {
  readonly y: number;
  readonly scale: number;
}

/** The minimal input accepted by {@link defineScene}. */
export interface SceneInput {
  readonly background: URL | string;
  readonly size?: SceneSize;
  readonly walkableRegion: readonly Point[];
  readonly perspectiveScale?: readonly PerspectiveScaleStop[];
  readonly scenery?: Readonly<Record<string, SceneryDefinition>>;
  readonly hotspots?: readonly HotspotDefinition[];
  readonly entrances?: Readonly<Record<string, SceneEntrance>>;
  readonly passages?: readonly ScenePassage[];
  readonly arrivalSequences?: readonly ArrivalSequenceRule[];
}

/** A locally validated Scene definition. Its registry key supplies its identity. */
export interface SceneDefinition extends SceneInput {}

/** Creates and freezes one Scene after validating its local geometry. */
export function defineScene(input: SceneInput): SceneDefinition {
  const diagnostics: AuthoringDiagnostic[] = [];

  for (const axis of ["width", "height"] as const) {
    const value = input.size?.[axis];
    if (input.size && (!Number.isInteger(value) || value! <= 0)) {
      diagnostics.push({
        code: "definition.scene-size.positive-integer",
        family: "definition",
        path: `size.${axis}`,
        message: "Scene Size dimensions must be positive integers.",
      });
    }
  }

  input.walkableRegion.forEach((point, index) => {
    if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) {
      diagnostics.push({
        code: "definition.point.finite",
        family: "definition",
        path: `walkableRegion[${index}]`,
        message: "Scene Space coordinates must be finite numbers.",
        suggestion: "Replace NaN and infinite coordinates with finite logical pixels.",
      });
    }
  });

  if (input.walkableRegion.length < 3) {
    diagnostics.push({
      code: "definition.polygon.vertices",
      family: "definition",
      path: "walkableRegion",
      message: "A Walkable Region needs at least three vertices.",
      suggestion: "Provide a non-degenerate polygon with at least three vertices.",
    });
  }
  if (
    input.walkableRegion.length >= 3 &&
    input.walkableRegion.every(({ x, y }) => Number.isFinite(x) && Number.isFinite(y))
  ) {
    validatePolygon(input.walkableRegion, "walkableRegion", diagnostics);
  }
  for (const [sceneryId, scenery] of Object.entries(input.scenery ?? {})) {
    if (!(scenery.initialAppearance in scenery.appearances)) {
      diagnostics.push({
        code: "reference.appearance.initial",
        family: "reference",
        path: `scenery.${sceneryId}.initialAppearance`,
        message: `Appearance '${scenery.initialAppearance}' is not defined on this Scenery.`,
      });
    }
    if (!Number.isFinite(scenery.baseline)) {
      diagnostics.push({
        code: "definition.scenery.baseline",
        family: "definition",
        path: `scenery.${sceneryId}.baseline`,
        message: "A Scenery baseline must be a finite Scene Space coordinate.",
      });
    }
    if (scenery.position && (!Number.isFinite(scenery.position.x) || !Number.isFinite(scenery.position.y))) {
      diagnostics.push({
        code: "definition.point.finite",
        family: "definition",
        path: `scenery.${sceneryId}.position`,
        message: "A Scenery position must use finite Scene Space coordinates.",
      });
    }
    for (const [appearanceId, appearance] of Object.entries(scenery.appearances)) {
      if (!isAnimatedAppearance(appearance)) {
        validateLocalPolygon(
          appearance.area,
          `scenery.${sceneryId}.appearances.${appearanceId}.area`,
          diagnostics,
        );
      } else {
        validateVisualAnchor(
          appearance.visualAnchor,
          `scenery.${sceneryId}.appearances.${appearanceId}.visualAnchor`,
          diagnostics,
        );
        validateAppearance(
          appearance,
          `scenery.${sceneryId}.appearances.${appearanceId}`,
          diagnostics,
        );
      }
    }
  }
  input.hotspots?.forEach((hotspot, index) =>
    validateLocalPolygon(hotspot.area, `hotspots[${index}].area`, diagnostics),
  );
  input.passages?.forEach((passage, index) =>
    validateLocalPolygon(passage.area, `passages[${index}].area`, diagnostics),
  );

  if (diagnostics.length > 0) throw new AuthoringError(diagnostics);

  return deepFreeze({
    ...input,
    background: input.background instanceof URL ? new URL(input.background.href) : input.background,
    ...(input.size ? { size: { ...input.size } } : {}),
    walkableRegion: input.walkableRegion.map((point) => ({ ...point })),
    scenery: { ...(input.scenery ?? {}) },
    hotspots: [...(input.hotspots ?? [])],
    entrances: { ...(input.entrances ?? {}) },
    passages: [...(input.passages ?? [])],
    arrivalSequences: [...(input.arrivalSequences ?? [])],
  });
}

export interface Line {
  readonly text: string;
  readonly character: string;
  readonly audio?: URL | string;
  readonly animation?: string;
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
  readonly cases: readonly { readonly when: InteractionCondition; readonly steps: readonly SequenceStep[] }[];
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

export type CameraDirection =
  | { readonly type: "camera"; readonly mode: "cut"; readonly point: Point; readonly startAfter?: CueStart }
  | { readonly type: "camera"; readonly mode: "move"; readonly from: Point; readonly to: Point; readonly duration: number; readonly startAfter?: CueStart }
  | { readonly type: "camera"; readonly mode: "hold"; readonly point: Point; readonly duration?: number; readonly startAfter?: CueStart }
  | { readonly type: "camera"; readonly mode: "follow"; readonly subject: DirectedSubject; readonly duration?: number; readonly startAfter?: CueStart };

export type SequenceDirection = AnimationDirection | MotionDirection | CameraDirection;

/** One sequential Sequence step containing concurrent visual directions. */
export interface DirectStep {
  readonly type: "direct";
  readonly directions: readonly SequenceDirection[];
  /** Optional finite boundary for loops and held/following Camera direction, in logical seconds. */
  readonly duration?: number;
}

export type SequenceStep = LineStep | NarrationStep | OperationsStep | ChoiceStep | BranchStep | DirectStep;

/** A finite, root-level Sequence definition. */
export interface SequenceDefinition {
  readonly steps: readonly SequenceStep[];
  /** Scene that owns directed Animation, Motion, and Camera steps. */
  readonly scene?: string;
  readonly skippable?: boolean;
  readonly skipOutcome?: readonly GameOperation[];
}

/** Creates and freezes a finite Sequence of Lines, Narrations, Choices, branches and operations. */
export function defineSequence(input: SequenceDefinition): SequenceDefinition {
  const diagnostics: AuthoringDiagnostic[] = [];
  if (input.skippable && input.skipOutcome === undefined) {
    diagnostics.push({
      code: "definition.sequence.skip-outcome",
      family: "definition",
      path: "skipOutcome",
      message: "A skippable Sequence must declare its Skip Outcome.",
    });
  }
  if (!input.skippable && input.skipOutcome !== undefined) {
    diagnostics.push({
      code: "definition.sequence.skip-outcome.unused",
      family: "definition",
      path: "skipOutcome",
      message: "Only a skippable Sequence can declare a Skip Outcome.",
    });
  }
  const visiting = new WeakSet<object>();
  const visit = (steps: readonly SequenceStep[], path: string) => {
    if (visiting.has(steps)) {
      diagnostics.push({
        code: "definition.sequence.cycle",
        family: "definition",
        path,
        message: "A Sequence must be finite and cannot contain a cycle.",
      });
      return;
    }
    visiting.add(steps);
    steps.forEach((step, index) => {
      if (step.type === "line") {
        if (!step.character?.trim()) {
          diagnostics.push({
            code: "definition.line.character",
            family: "definition",
            path: `${path}[${index}].character`,
            message: "A Line requires a Character.",
          });
        }
        if (!step.text.trim()) {
          diagnostics.push({
            code: "definition.line.text",
            family: "definition",
            path: `${path}[${index}].text`,
            message: "A Line cannot be empty.",
          });
        }
      } else if (step.type === "narration" && !step.text.trim()) {
        diagnostics.push({
          code: "definition.narration.text",
          family: "definition",
          path: `${path}[${index}].text`,
          message: "Narration cannot be empty.",
        });
      } else if (step.type === "direct") {
        validateDirectStep(step, `${path}[${index}]`, diagnostics);
      } else if (step.type === "choice") {
        if (maximumEligibleAlternatives(step.alternatives) > 6) {
          diagnostics.push({
            code: "definition.choice.limit",
            family: "definition",
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
  visit(input.steps, "steps");
  if (diagnostics.length > 0) throw new AuthoringError(diagnostics);
  return deepFreeze({
    ...input,
    steps: cloneSequenceSteps(input.steps),
    ...(input.skipOutcome ? { skipOutcome: structuredClone(input.skipOutcome) } : {}),
  });
}

function cloneSequenceSteps(steps: readonly SequenceStep[]): SequenceStep[] {
  return steps.map((step) => {
    if (step.type === "line") {
      return {
        ...step,
        ...(step.audio instanceof URL ? { audio: new URL(step.audio.href) } : {}),
      };
    }
    if (step.type === "narration" || step.type === "operations" || step.type === "direct") return structuredClone(step);
    if (step.type === "choice") {
      return {
        ...step,
        alternatives: step.alternatives.map((alternative) => ({
          ...alternative,
          steps: cloneSequenceSteps(alternative.steps),
        })),
        fallback: { ...step.fallback, steps: cloneSequenceSteps(step.fallback.steps) },
      };
    }
    return {
      ...step,
      cases: step.cases.map((branch) => ({ ...branch, steps: cloneSequenceSteps(branch.steps) })),
      fallback: cloneSequenceSteps(step.fallback),
    };
  });
}

function validateDirectStep(
  step: DirectStep,
  path: string,
  diagnostics: AuthoringDiagnostic[],
): void {
  if (step.directions.length === 0) {
    diagnostics.push({ code: "definition.sequence.direct.empty", family: "definition", path: `${path}.directions`, message: "A directed step needs at least one direction." });
  }
  if (step.duration !== undefined && (!Number.isFinite(step.duration) || step.duration <= 0)) {
    diagnostics.push({ code: "definition.sequence.duration", family: "definition", path: `${path}.duration`, message: "A Sequence duration must be a positive finite number of logical seconds." });
  }
  let hasFiniteBoundary = step.duration !== undefined && step.duration > 0;
  step.directions.forEach((direction, index) => {
    const directionPath = `${path}.directions[${index}]`;
    if (direction.startAfter) {
      if (!Number.isInteger(direction.startAfter.direction) || direction.startAfter.direction < 0 || direction.startAfter.direction >= index) {
        diagnostics.push({ code: "definition.sequence.cue-order", family: "definition", path: `${directionPath}.startAfter.direction`, message: "A direction can wait only for an earlier Animation direction in the same step." });
      }
      if (!direction.startAfter.cue.trim()) {
        diagnostics.push({ code: "definition.sequence.cue-name", family: "definition", path: `${directionPath}.startAfter.cue`, message: "A Cue reference cannot be empty." });
      }
    }
    if (direction.type === "animation") return;
    if (direction.type === "motion") {
      direction.path.forEach((point, pointIndex) => {
        if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) diagnostics.push({ code: "definition.point.finite", family: "definition", path: `${directionPath}.path[${pointIndex}]`, message: "A Motion path must use finite Scene Space coordinates." });
      });
      if (direction.path.length === 0) diagnostics.push({ code: "definition.motion.path", family: "definition", path: `${directionPath}.path`, message: "A Motion needs at least one destination point." });
      if (direction.subject.kind === "character") {
        if (direction.path.length !== 1) diagnostics.push({ code: "definition.motion.character-path", family: "definition", path: `${directionPath}.path`, message: "A Character Motion declares one navigation destination." });
        if (direction.duration !== undefined) diagnostics.push({ code: "definition.motion.character-duration", family: "definition", path: `${directionPath}.duration`, message: "Character Motion duration is derived from navigation and movement speed." });
        hasFiniteBoundary = true;
      } else if (!Number.isFinite(direction.duration) || direction.duration! <= 0) {
        diagnostics.push({ code: "definition.motion.duration", family: "definition", path: `${directionPath}.duration`, message: "Object and Scenery Motion needs a positive finite duration." });
      } else hasFiniteBoundary = true;
      return;
    }
    if ("duration" in direction && direction.duration !== undefined) {
      if (!Number.isFinite(direction.duration) || direction.duration <= 0) diagnostics.push({ code: "definition.camera.duration", family: "definition", path: `${directionPath}.duration`, message: "A Camera duration must be positive and finite." });
      else hasFiniteBoundary = true;
    }
    for (const [pointName, point] of [["point", "point" in direction ? direction.point : undefined], ["from", "from" in direction ? direction.from : undefined], ["to", "to" in direction ? direction.to : undefined]] as const) {
      if (point && (!Number.isFinite(point.x) || !Number.isFinite(point.y))) diagnostics.push({ code: "definition.point.finite", family: "definition", path: `${directionPath}.${pointName}`, message: "A Camera point must use finite Scene Space coordinates." });
    }
    if (direction.mode === "cut") hasFiniteBoundary = true;
  });
  if (!hasFiniteBoundary && step.directions.length > 0 && step.directions.every((direction) => direction.type !== "animation")) {
    diagnostics.push({ code: "definition.sequence.direct.unbounded", family: "definition", path, message: "A directed step needs a finite completion boundary." });
  }
}

function maximumEligibleAlternatives(alternatives: readonly ChoiceAlternative[]): number {
  let simultaneouslyEligible = 0;
  const variableCases = new Map<string, { true: number; false: number }>();
  for (const alternative of alternatives) {
    const condition = alternative.when;
    if (!condition || "hasObject" in condition) {
      simultaneouslyEligible += 1;
      continue;
    }
    const counts = variableCases.get(condition.variable) ?? { true: 0, false: 0 };
    counts[String(condition.equals) as "true" | "false"] += 1;
    variableCases.set(condition.variable, counts);
  }
  for (const counts of variableCases.values()) {
    simultaneouslyEligible += Math.max(counts.true, counts.false);
  }
  return simultaneouslyEligible;
}

/** Input accepted by {@link defineGame}. Registry keys are definition identities. */
export interface GameInput {
  readonly identity: string;
  readonly version: string;
  readonly logicalResolution: LogicalResolution;
  readonly scenes: Readonly<Record<string, SceneDefinition>>;
  readonly characters?: Readonly<Record<string, CharacterDefinition>>;
  readonly playerCharacter?: string;
  readonly objects?: Readonly<Record<string, ObjectDefinition>>;
  readonly sequences?: Readonly<Record<string, SequenceDefinition>>;
  readonly variables?: Readonly<Record<string, boolean>>;
  readonly inventoryAppearanceSize?: number;
  readonly initialScene: string;
  readonly letterboxColor?: string;
  readonly commandLexicon?: CommandLexicon;
  readonly commandFallbacks?: Readonly<Partial<Record<(typeof commandVerbs)[number], CommandResponse>>>;
  readonly hudTheme?: HUDTheme;
}

declare const gameProjectBrand: unique symbol;

/** An opaque, immutable, fully validated Game Project. */
export interface GameProject {
  readonly [gameProjectBrand]: true;
}

/** @internal Fully expanded representation kept behind the opaque project boundary. */
export interface GameProjectData
  extends Omit<GameInput, "scenes" | "characters" | "objects" | "sequences" | "variables"> {
  readonly scenes: Readonly<Record<string, ResolvedSceneDefinition>>;
  readonly letterboxColor: string;
  readonly characters: Readonly<Record<string, CharacterDefinition>>;
  readonly objects: Readonly<Record<string, ObjectDefinition>>;
  readonly sequences: Readonly<Record<string, SequenceDefinition>>;
  readonly variables: Readonly<Record<string, boolean>>;
}

/** @internal A Scene whose default Size has been resolved during composition. */
export interface ResolvedSceneDefinition extends Omit<SceneDefinition, "size"> {
  readonly size: SceneSize;
}

const projectData = new WeakMap<GameProject, GameProjectData>();

/** Composes named definitions into one validated and immutable Game Project. */
export function defineGame(input: GameInput): GameProject {
  const diagnostics: AuthoringDiagnostic[] = [];
  if (!(input.initialScene in input.scenes)) {
    diagnostics.push({
      code: "reference.scene.initial",
      family: "reference",
      path: "initialScene",
      message: `Scene '${input.initialScene}' does not exist.`,
    });
  }
  const characters = input.characters ?? {};
  const objects = input.objects ?? {};
  const sequences = input.sequences ?? {};
  const variables = input.variables ?? {};
  if (input.playerCharacter !== undefined && !(input.playerCharacter in characters)) {
    diagnostics.push({
      code: "reference.character.player",
      family: "reference",
      path: "playerCharacter",
      message: `Character '${input.playerCharacter}' does not exist.`,
    });
  }
  for (const [characterId, character] of Object.entries(characters)) {
    if (!(character.initialScene in input.scenes)) {
      diagnostics.push({
        code: "reference.character.initial-scene",
        family: "reference",
        path: `characters.${characterId}.initialScene`,
        message: `Scene '${character.initialScene}' does not exist.`,
      });
    }
  }
  for (const [objectId, object] of Object.entries(objects)) {
    if (!(object.initialScene in input.scenes)) {
      diagnostics.push({
        code: "reference.object.initial-scene",
        family: "reference",
        path: `objects.${objectId}.initialScene`,
        message: `Scene '${object.initialScene}' does not exist.`,
      });
    }
  }
  validateProjectDefinitions(input, characters, objects, sequences, variables, diagnostics);
  if (input.inventoryAppearanceSize !== undefined &&
      (!Number.isInteger(input.inventoryAppearanceSize) || input.inventoryAppearanceSize <= 0)) {
    diagnostics.push({
      code: "definition.inventory-appearance-size",
      family: "definition",
      path: "inventoryAppearanceSize",
      message: "Inventory Appearance Size must be a positive integer.",
    });
  }
  if (!input.identity.trim()) {
    diagnostics.push({
      code: "definition.project.identity",
      family: "definition",
      path: "identity",
      message: "Project Identity cannot be empty.",
    });
  }
  if (!input.version.trim()) {
    diagnostics.push({
      code: "definition.project.version",
      family: "definition",
      path: "version",
      message: "Project Version cannot be empty.",
    });
  }
  for (const [axis, value] of Object.entries(input.logicalResolution)) {
    if (!Number.isInteger(value) || value <= 0) {
      diagnostics.push({
        code: "definition.logical-resolution.positive-integer",
        family: "definition",
        path: `logicalResolution.${axis}`,
        message: "Logical Resolution dimensions must be positive integers.",
      });
    }
  }
  for (const [sceneId, scene] of Object.entries(input.scenes)) {
    const size = scene.size ?? input.logicalResolution;
    for (const axis of ["width", "height"] as const) {
      if (size[axis] < input.logicalResolution[axis]) {
        diagnostics.push({
          code: "definition.scene-size.viewport-minimum",
          family: "definition",
          path: `scenes.${sceneId}.size.${axis}`,
          message: `Scene Size ${axis} must be at least the Logical Resolution ${axis}.`,
        });
      }
    }
  }
  if (diagnostics.length > 0) throw new AuthoringError(diagnostics);

  const scenes = Object.fromEntries(Object.entries(input.scenes).map(([sceneId, scene]) => [
    sceneId,
    { ...scene, size: { ...(scene.size ?? input.logicalResolution) } },
  ])) as Readonly<Record<string, ResolvedSceneDefinition>>;
  const data = deepFreeze({
    ...input,
    logicalResolution: { ...input.logicalResolution },
    scenes,
    characters: { ...characters },
    objects: { ...objects },
    sequences: { ...sequences },
    variables: { ...variables },
    letterboxColor: input.letterboxColor ?? "#000000",
  });
  const project = Object.freeze({}) as GameProject;
  projectData.set(project, data);
  return project;
}

/** @internal Returns validated definitions without making them public properties. */
export function getGameProjectData(project: GameProject): GameProjectData {
  const data = projectData.get(project);
  if (!data) throw new TypeError("Expected a Game Project returned by defineGame().");
  return data;
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !(value instanceof URL) && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

function validateProjectDefinitions(
  input: GameInput,
  characters: Readonly<Record<string, CharacterDefinition>>,
  objects: Readonly<Record<string, ObjectDefinition>>,
  sequences: Readonly<Record<string, SequenceDefinition>>,
  variables: Readonly<Record<string, boolean>>,
  diagnostics: AuthoringDiagnostic[],
): void {
  const missingOwnerNounPaths = new Set<string>();
  const allSceneIds = Object.keys(input.scenes);
  const sceneSize = (scene: SceneDefinition): SceneSize => scene.size ?? input.logicalResolution;
  const pointInScene = (scene: SceneDefinition, point: Point) => {
    const { width, height } = sceneSize(scene);
    return (
    Number.isFinite(point.x) && Number.isFinite(point.y) &&
    point.x >= 0 && point.y >= 0 && point.x <= width && point.y <= height
    );
  };
  const condition = (value: InteractionCondition | undefined, path: string) => {
    if (!value) return;
    if ("variable" in value && !(value.variable in variables)) {
      diagnostics.push(referenceDiagnostic("reference.variable", path, `Game Variable '${value.variable}' does not exist.`));
    }
    if ("hasObject" in value && !(value.hasObject in objects)) {
      diagnostics.push(referenceDiagnostic("reference.object", path, `Object '${value.hasObject}' does not exist.`));
    }
  };
  const operations = (
    values: readonly GameOperation[],
    path: string,
    context: { target?: HotspotTarget; sequence?: boolean; scenes?: readonly string[] } = {},
  ) => {
    values.forEach((operation, index) => {
      const operationPath = `${path}[${index}]`;
      if (
        context.sequence &&
        (operation.type === "place-selected-object" || operation.type === "consume-selected-object")
      ) {
        diagnostics.push({
          code: "definition.sequence.selected-object-operation",
          family: "definition",
          path: operationPath,
          message: "A Sequence cannot use a selected-Object operation because it has no Command selection context.",
        });
      }
      if (operation.type === "set-variable" && !(operation.variable in variables)) {
        diagnostics.push(referenceDiagnostic("reference.variable", operationPath, `Game Variable '${operation.variable}' does not exist.`));
      } else if (operation.type === "start-sequence") {
        if (!(operation.sequence in sequences)) {
          diagnostics.push(referenceDiagnostic("reference.sequence", operationPath, `Sequence '${operation.sequence}' does not exist.`));
        }
        if (context.sequence) {
          diagnostics.push({
            code: "definition.sequence.nested",
            family: "definition",
            path: operationPath,
            message: "A Sequence cannot start another Sequence.",
          });
        }
      } else if (operation.type === "collect-target-object" && context.target?.kind !== "object") {
        diagnostics.push({
          code: "definition.operation.collect-target",
          family: "definition",
          path: operationPath,
          message: "collect-target-object requires an Object Hotspot target.",
        });
      } else if (operation.type === "set-appearance") {
        const target = operation.target;
        const appearances =
          target.kind === "character"
            ? characters[target.character]?.appearances
            : target.kind === "object"
              ? objects[target.object]?.appearances
              : input.scenes[target.scene]?.scenery?.[target.scenery]?.appearances;
        if (!appearances) {
          diagnostics.push(referenceDiagnostic("reference.appearance.target", operationPath, "Appearance target does not exist."));
        } else if (!(operation.appearance in appearances)) {
          diagnostics.push(referenceDiagnostic("reference.appearance", operationPath, `Appearance '${operation.appearance}' does not exist on the target.`));
        }
      } else if (operation.type === "place-object") {
        if (!(operation.object in objects)) diagnostics.push(referenceDiagnostic("reference.object", `${operationPath}.object`, `Object '${operation.object}' does not exist.`));
        if (!(operation.scene in input.scenes)) diagnostics.push(referenceDiagnostic("reference.scene", `${operationPath}.scene`, `Scene '${operation.scene}' does not exist.`));
        if (objects[operation.object] && operation.appearance !== undefined && !(operation.appearance in objects[operation.object]!.appearances)) diagnostics.push(referenceDiagnostic("reference.appearance", `${operationPath}.appearance`, `Appearance '${operation.appearance}' does not exist on Object '${operation.object}'.`));
        const destination = input.scenes[operation.scene];
        if (!destination || !pointInScene(destination, operation.groundPoint)) diagnostics.push({ code: "definition.operation.ground-point", family: "definition", path: `${operationPath}.groundPoint`, message: "A placed Object Ground Point must be finite and inside its destination Scene Size." });
      } else if (operation.type === "place-selected-object" && (
        !Number.isFinite(operation.groundPoint.x) ||
        !Number.isFinite(operation.groundPoint.y) ||
        (context.scenes ?? allSceneIds).some((sceneId) => {
          const scene = input.scenes[sceneId];
          return scene !== undefined && !pointInScene(scene, operation.groundPoint);
        })
      )) {
        diagnostics.push({
          code: "definition.operation.ground-point",
          family: "definition",
          path: `${operationPath}.groundPoint`,
          message: "A placed Object Ground Point must be finite and inside the destination Scene Size.",
        });
      }
    });
  };
  const line = (value: Line | undefined, path: string) => {
    if (!value) return;
    if (!(value.character in characters)) {
      diagnostics.push(referenceDiagnostic(
        "reference.character",
        `${path}.character`,
        `Character '${value.character}' does not exist.`,
      ));
    } else if (value.animation !== undefined) {
      const appearances = Object.values(characters[value.character]!.appearances);
      if (appearances.some((appearance) => !(value.animation! in appearance.animations))) {
        diagnostics.push(referenceDiagnostic(
          "reference.animation.line",
          `${path}.animation`,
          `Line Animation '${value.animation}' is not available in every Appearance of Character '${value.character}'.`,
        ));
      }
    }
  };
  const noun = (
    value: NounDefinition | undefined,
    path: string,
    target?: HotspotTarget,
    destinationScenes?: readonly string[],
  ) => {
    if (!value) return;
    value.labels.forEach((label, index) => condition(label.when, `${path}.labels[${index}].when`));
    value.preferredVerbs.forEach((preferred, index) =>
      condition(preferred.when, `${path}.preferredVerbs[${index}].when`),
    );
    value.secondaryVerbs?.forEach((secondary, index) =>
      condition(secondary.when, `${path}.secondaryVerbs[${index}].when`),
    );
    value.objectVerbs?.forEach((objectVerb, index) =>
      condition(objectVerb.when, `${path}.objectVerbs[${index}].when`),
    );
    value.cases.forEach((candidate, index) => {
      const candidatePath = `${path}.cases[${index}]`;
      condition(candidate.when, `${candidatePath}.when`);
      if (candidate.firstNoun !== undefined && !(candidate.firstNoun in objects)) {
        diagnostics.push(referenceDiagnostic(
          "reference.object",
          `${candidatePath}.firstNoun`,
          `Object '${candidate.firstNoun}' does not exist.`,
        ));
      }
      if (candidate.sequence !== undefined && !(candidate.sequence in sequences)) {
        diagnostics.push(referenceDiagnostic(
          "reference.sequence",
          `${candidatePath}.sequence`,
          `Sequence '${candidate.sequence}' does not exist.`,
        ));
      }
      validateCommandResponse(candidate.response, `${candidatePath}.response`, diagnostics);
      line(candidate.line, `${candidatePath}.line`);
      operations(candidate.operations ?? [], `${candidatePath}.operations`, {
        target,
        scenes: destinationScenes,
      });
    });
    for (const verb of commandVerbs) {
      const fallback = value.fallbacks?.[verb];
      const globalFallback = input.commandFallbacks?.[verb];
      if (!fallback && !globalFallback) {
        diagnostics.push({
          code: "definition.command.silent",
          family: "definition",
          path: `${path}.fallbacks.${verb}`,
          message: `Noun '${path}' needs a local or global '${verb}' Command Fallback.`,
        });
      }
      if (fallback) {
        validateCommandResponse(fallback.response, `${path}.fallbacks.${verb}.response`, diagnostics);
        operations(fallback.operations ?? [], `${path}.fallbacks.${verb}.operations`, {
          target,
          scenes: destinationScenes,
        });
        if (fallback.sequence !== undefined && !(fallback.sequence in sequences)) {
          diagnostics.push(referenceDiagnostic(
            "reference.sequence",
            `${path}.fallbacks.${verb}.sequence`,
            `Sequence '${fallback.sequence}' does not exist.`,
          ));
        }
      }
    }
  };

  for (const [verb, fallback] of Object.entries(input.commandFallbacks ?? {})) {
    validateCommandResponse(fallback, `commandFallbacks.${verb}`, diagnostics);
  }

  for (const [sceneId, scene] of Object.entries(input.scenes)) {
    const { height } = sceneSize(scene);
    const inScene = (point: Point) => pointInScene(scene, point);
    scene.walkableRegion.forEach((point, index) => {
      if (!inScene(point)) {
        diagnostics.push({
          code: "definition.scene-space.bounds",
          family: "definition",
          path: `scenes.${sceneId}.walkableRegion[${index}]`,
          message: "Scene geometry must remain inside the Scene Size.",
        });
      }
    });
    scene.perspectiveScale?.forEach((stop, index) => {
      if (!Number.isFinite(stop.y) || !Number.isFinite(stop.scale) || stop.scale <= 0 || stop.y < 0 || stop.y > height) {
        diagnostics.push({
          code: "definition.perspective-scale.stop",
          family: "definition",
          path: `scenes.${sceneId}.perspectiveScale[${index}]`,
          message: "Perspective Scale stops need an in-frame y and a positive finite scale.",
        });
      }
    });
    for (const [sceneryId, scenery] of Object.entries(scene.scenery ?? {})) {
      noun(
        scenery.noun,
        `scenes.${sceneId}.scenery.${sceneryId}.noun`,
        { kind: "scenery", scenery: sceneryId },
        [sceneId],
      );
      if (!(scenery.initialAppearance in scenery.appearances)) {
        diagnostics.push(referenceDiagnostic("reference.appearance.initial", `scenes.${sceneId}.scenery.${sceneryId}.initialAppearance`, "Initial Scenery Appearance does not exist."));
      }
      if (scenery.baseline < 0 || scenery.baseline > height) {
        diagnostics.push({
          code: "definition.scene-space.bounds",
          family: "definition",
          path: `scenes.${sceneId}.scenery.${sceneryId}.baseline`,
          message: "A Scenery Baseline must remain inside the Scene Size.",
        });
      }
      if (scenery.position && !inScene(scenery.position)) {
        diagnostics.push({ code: "definition.scene-space.bounds", family: "definition", path: `scenes.${sceneId}.scenery.${sceneryId}.position`, message: "Scenery positions must remain inside the Scene Size." });
      }
      for (const [appearanceId, appearance] of Object.entries(scenery.appearances)) {
      if ("kind" in appearance && appearance.kind === "background-region") {
          validatePolygonBounds(appearance.area, `scenes.${sceneId}.scenery.${sceneryId}.appearances.${appearanceId}.area`, inScene, diagnostics);
        }
      }
    }
    for (const [entranceId, entrance] of Object.entries(scene.entrances ?? {})) {
      if (!inScene(entrance.groundPoint)) {
        diagnostics.push({ code: "definition.scene-space.bounds", family: "definition", path: `scenes.${sceneId}.entrances.${entranceId}.groundPoint`, message: "Scene Entrance Ground Points must remain inside the Scene Size." });
      } else if (!pointInPolygonOrBoundary(scene.walkableRegion, entrance.groundPoint)) {
        diagnostics.push({ code: "definition.entrance.walkable", family: "definition", path: `scenes.${sceneId}.entrances.${entranceId}.groundPoint`, message: "A Scene Entrance Ground Point must lie in the Walkable Region." });
      }
    }
    scene.arrivalSequences?.forEach((rule, ruleIndex) => {
      const base = `scenes.${sceneId}.arrivalSequences[${ruleIndex}]`;
      if (!(rule.sequence in sequences)) diagnostics.push(referenceDiagnostic("reference.sequence", `${base}.sequence`, `Sequence '${rule.sequence}' does not exist.`));
      else if (sequences[rule.sequence]?.scene !== undefined && sequences[rule.sequence]!.scene !== sceneId) diagnostics.push(referenceDiagnostic("reference.sequence.scene", `${base}.sequence`, `Sequence '${rule.sequence}' belongs to Scene '${sequences[rule.sequence]!.scene}'.`));
      if (rule.entrance !== undefined && !(rule.entrance in (scene.entrances ?? {}))) diagnostics.push(referenceDiagnostic("reference.entrance", `${base}.entrance`, `Scene Entrance '${rule.entrance}' does not exist.`));
      condition(rule.when, `${base}.when`);
      scene.arrivalSequences!.slice(0, ruleIndex).forEach((previous, previousIndex) => {
        const entrancesOverlap = previous.entrance === undefined || rule.entrance === undefined || previous.entrance === rule.entrance;
        const conditionsDisjoint = previous.when !== undefined && rule.when !== undefined &&
          "variable" in previous.when && "variable" in rule.when &&
          previous.when.variable === rule.when.variable && previous.when.equals !== rule.when.equals;
        if (entrancesOverlap && !conditionsDisjoint) diagnostics.push({
          code: "definition.arrival-sequence.ambiguous",
          family: "definition",
          path: base,
          message: `Arrival Sequence rules ${previousIndex} and ${ruleIndex} can both apply to the same arrival.`,
        });
      });
    });
    scene.hotspots?.forEach((hotspot, hotspotIndex) => {
      const base = `scenes.${sceneId}.hotspots[${hotspotIndex}]`;
      if (hotspot.target.kind === "background") {
        noun(hotspot.noun, `${base}.noun`, hotspot.target, [sceneId]);
      }
      validatePolygonBounds(hotspot.area, `${base}.area`, inScene, diagnostics);
      if (!inScene(hotspot.approach.groundPoint)) {
        diagnostics.push({ code: "definition.approach.bounds", family: "definition", path: `${base}.approach`, message: "Approach Point must be inside Scene Space." });
      } else if (!pointInPolygonOrBoundary(scene.walkableRegion, hotspot.approach.groundPoint)) {
        diagnostics.push({ code: "definition.approach.walkable", family: "definition", path: `${base}.approach`, message: "An Approach Point must lie in the Walkable Region." });
      }
      const targetExists =
        hotspot.target.kind === "background" ||
        (hotspot.target.kind === "character" && hotspot.target.character in characters) ||
        (hotspot.target.kind === "object" && hotspot.target.object in objects) ||
        (hotspot.target.kind === "scenery" && hotspot.target.scenery in (scene.scenery ?? {}));
      if (!targetExists) {
        diagnostics.push(referenceDiagnostic("reference.hotspot.target", `${base}.target`, "Hotspot target does not exist."));
      } else if (hotspot.target.kind !== "background") {
        const owner = hotspot.target.kind === "character"
          ? characters[hotspot.target.character]
          : hotspot.target.kind === "object"
            ? objects[hotspot.target.object]
            : scene.scenery?.[hotspot.target.scenery];
        if (!owner?.noun) {
          const ownerPath = hotspot.target.kind === "character"
            ? `characters.${hotspot.target.character}.noun`
            : hotspot.target.kind === "object"
              ? `objects.${hotspot.target.object}.noun`
              : `scenes.${sceneId}.scenery.${hotspot.target.scenery}.noun`;
          if (!missingOwnerNounPaths.has(ownerPath)) {
            missingOwnerNounPaths.add(ownerPath);
            diagnostics.push({
              code: "definition.hotspot.target-noun.required",
              family: "definition",
              path: ownerPath,
              message: "A target referenced by a Hotspot must own a Noun Definition.",
            });
          }
        }
      }
      condition(hotspot.when, `${base}.when`);
    });
    scene.passages?.forEach((passage, passageIndex) => {
      const base = `scenes.${sceneId}.passages[${passageIndex}]`;
      noun(passage.noun, `${base}.noun`, undefined, [sceneId]);
      validatePolygonBounds(passage.area, `${base}.area`, inScene, diagnostics);
      if (!inScene(passage.approach.groundPoint)) {
        diagnostics.push({ code: "definition.approach.bounds", family: "definition", path: `${base}.approach`, message: "Approach Point must be inside Scene Space." });
      } else if (!pointInPolygonOrBoundary(scene.walkableRegion, passage.approach.groundPoint)) {
        diagnostics.push({ code: "definition.approach.walkable", family: "definition", path: `${base}.approach`, message: "An Approach Point must lie in the Walkable Region." });
      }
      condition(passage.when, `${base}.when`);
      const destination = input.scenes[passage.destination.scene];
      if (!destination) {
        diagnostics.push(referenceDiagnostic("reference.passage.scene", `${base}.destination.scene`, `Scene '${passage.destination.scene}' does not exist.`));
      } else if (!(passage.destination.entrance in (destination.entrances ?? {}))) {
        diagnostics.push(referenceDiagnostic("reference.passage.entrance", `${base}.destination.entrance`, `Scene Entrance '${passage.destination.entrance}' does not exist.`));
      }
    });
  }

  for (const [characterId, character] of Object.entries(characters)) {
    noun(
      character.noun,
      `characters.${characterId}.noun`,
      { kind: "character", character: characterId },
      characterId === input.playerCharacter ? allSceneIds : [character.initialScene],
    );
    const scene = input.scenes[character.initialScene];
    if (!scene) continue;
    if (characterId === input.playerCharacter) {
      for (const [appearanceId, appearance] of Object.entries(character.appearances)) {
        if (!appearance.roles.walking) {
          diagnostics.push(referenceDiagnostic(
            "reference.animation.walking-role",
            `characters.${characterId}.appearances.${appearanceId}.roles.walking`,
            "A Player Character Appearance requires a walking Animation Role.",
          ));
        }
      }
    }
    const path = `characters.${characterId}.initialGroundPoint`;
    if (!pointInScene(scene, character.initialGroundPoint)) {
      diagnostics.push({ code: "definition.scene-space.bounds", family: "definition", path, message: "Character Ground Points must remain inside the Scene Size." });
    } else if (!pointInPolygonOrBoundary(scene.walkableRegion, character.initialGroundPoint)) {
      diagnostics.push({ code: "definition.character.walkable", family: "definition", path, message: "A Character Ground Point must lie in the Scene Walkable Region." });
    }
  }
  for (const [objectId, object] of Object.entries(objects)) {
    noun(
      object.noun,
      `objects.${objectId}.noun`,
      { kind: "object", object: objectId },
      allSceneIds,
    );
    const scene = input.scenes[object.initialScene];
    if (scene && !pointInScene(scene, object.initialGroundPoint)) {
      diagnostics.push({ code: "definition.scene-space.bounds", family: "definition", path: `objects.${objectId}.initialGroundPoint`, message: "Object Ground Points must remain inside the Scene Size." });
    }
  }

  const appearancesForSubject = (subject: DirectedSubject, sceneId?: string): Appearance[] => {
    const candidates: (EntityAppearance | SceneryAppearance)[] = subject.kind === "character"
      ? Object.values(characters[subject.character]?.appearances ?? {})
      : subject.kind === "object"
        ? Object.values(objects[subject.object]?.appearances ?? {})
        : sceneId
          ? Object.values(input.scenes[sceneId]?.scenery?.[subject.scenery]?.appearances ?? {})
          : [];
    return candidates.flatMap((appearance) => "animations" in appearance ? [appearance] : []);
  };
  const validateDirections = (
    step: DirectStep,
    path: string,
    sceneId?: string,
    availableObjects: ReadonlySet<string> = new Set(),
    continuesSceneryMotion: (scenery: string, destination: Point) => boolean = () => false,
  ) => {
    let hasFiniteBoundary = step.duration !== undefined;
    step.directions.forEach((direction, directionIndex) => {
      const directionPath = `${path}.directions[${directionIndex}]`;
      if (direction.type !== "camera") {
        const appearances = appearancesForSubject(direction.subject, sceneId);
        if (appearances.length === 0) {
          diagnostics.push(referenceDiagnostic("reference.sequence.subject", `${directionPath}.subject`, "Directed subject does not exist or has no animated Appearance."));
        }
        if (sceneId && !subjectBelongsToScene(direction.subject, sceneId, input.playerCharacter, characters, objects, input.scenes, availableObjects)) {
          diagnostics.push(referenceDiagnostic(
            "reference.sequence.subject-scene",
            `${directionPath}.subject`,
            "A directed subject must belong to the Sequence Scene.",
          ));
        }
        if (direction.type === "animation") {
          const animations = appearances.map((appearance) => appearance.animations[direction.animation]);
          if (animations.length === 0 || animations.some((animation) => animation === undefined)) {
            diagnostics.push(referenceDiagnostic("reference.animation", `${directionPath}.animation`, `Animation '${direction.animation}' is not available in every Appearance of the subject.`));
          }
          if (animations.some((animation) => animation !== undefined && !animation.loop)) hasFiniteBoundary = true;
        } else {
          hasFiniteBoundary = true;
          if (direction.subject.kind === "character" && appearances.some((appearance) => !appearance.roles.walking)) {
            diagnostics.push(referenceDiagnostic("reference.animation.walking-role", `${directionPath}.subject`, "Character Motion requires a walking Animation Role in every Appearance."));
          }
          if (sceneId) {
            const scene = input.scenes[sceneId];
            direction.path.forEach((point, pointIndex) => {
              if (!scene || !pointInScene(scene, point)) {
                diagnostics.push({
                  code: "definition.motion.bounds",
                  family: "definition",
                  path: `${directionPath}.path[${pointIndex}]`,
                  message: "A Motion path point must remain inside the Sequence Scene Size.",
                });
              } else if (
                direction.subject.kind === "character" &&
                !pointInPolygonOrBoundary(scene.walkableRegion, point)
              ) {
                diagnostics.push({
                  code: "definition.motion.walkable",
                  family: "definition",
                  path: `${directionPath}.path[${pointIndex}]`,
                  message: "A Character Motion destination must lie in the Walkable Region.",
                });
              }
            });
            if (
              direction.subject.kind === "scenery" &&
              scene &&
              !continuesSceneryMotion(direction.subject.scenery, direction.path.at(-1)!)
            ) {
              const rest = scene.scenery?.[direction.subject.scenery]?.position;
              const destination = direction.path.at(-1);
              if (
                !rest || !destination ||
                Math.hypot(rest.x - destination.x, rest.y - destination.y) > 1e-8
              ) {
                diagnostics.push({
                  code: "definition.motion.scenery-rest",
                  family: "definition",
                  path: `${directionPath}.path`,
                  message: "A Scenery Motion must end at its authored resting position.",
                });
              }
            }
          }
        }
      }
      if (direction.type === "camera") {
        if (direction.mode === "cut" || direction.duration !== undefined) hasFiniteBoundary = true;
        if (direction.mode === "follow") {
          const sceneryId = direction.subject.kind === "scenery" ? direction.subject.scenery : undefined;
          const exists = direction.subject.kind === "character"
            ? direction.subject.character in characters
            : direction.subject.kind === "object"
              ? direction.subject.object in objects
              : sceneId !== undefined && sceneryId! in (input.scenes[sceneId]?.scenery ?? {});
          if (!exists) diagnostics.push(referenceDiagnostic("reference.camera.subject", `${directionPath}.subject`, "Camera follow subject does not exist."));
          else if (sceneId && !subjectBelongsToScene(direction.subject, sceneId, input.playerCharacter, characters, objects, input.scenes, availableObjects)) {
            diagnostics.push(referenceDiagnostic(
              "reference.camera.subject-scene",
              `${directionPath}.subject`,
              "A Camera follow subject must belong to the Sequence Scene.",
            ));
          }
        }
        const cameraPoints = [
          ["point", "point" in direction ? direction.point : undefined],
          ["from", "from" in direction ? direction.from : undefined],
          ["to", "to" in direction ? direction.to : undefined],
        ] as const;
        for (const [pointName, point] of cameraPoints) {
          if (point && sceneId && !pointInScene(input.scenes[sceneId]!, point)) diagnostics.push({ code: "definition.camera.bounds", family: "definition", path: `${directionPath}.${pointName}`, message: "A Camera destination must remain inside the Sequence Scene Size." });
        }
      }
      if (direction.startAfter) {
        const source = step.directions[direction.startAfter.direction];
        if (source?.type === "animation") {
          const animations = appearancesForSubject(source.subject, sceneId).map((appearance) => appearance.animations[source.animation]);
          if (animations.length === 0 || animations.some((animation) => animation?.cues?.[direction.startAfter!.cue] === undefined)) {
            diagnostics.push(referenceDiagnostic("reference.animation.cue", `${directionPath}.startAfter.cue`, `Animation Cue '${direction.startAfter.cue}' is not available in every Appearance of the source subject.`));
          }
        }
      }
    });
    if (!hasFiniteBoundary) diagnostics.push({ code: "definition.sequence.direct.unbounded", family: "definition", path, message: "A directed step containing only loops needs a finite completion boundary." });
  };

  const visitSteps = (
    steps: readonly SequenceStep[],
    path: string,
    sceneId?: string,
    availableObjects: ReadonlySet<string> = new Set(),
  ): Set<string> => {
    let objectsInScene = new Set(availableObjects);
    steps.forEach((step, index) => {
      const base = `${path}[${index}]`;
      if (step.type === "line" && step.character !== undefined && !(step.character in characters)) {
        diagnostics.push(referenceDiagnostic("reference.character", `${base}.character`, `Character '${step.character}' does not exist.`));
      } else if (step.type === "line" && step.animation !== undefined) {
        const appearances = Object.values(characters[step.character]?.appearances ?? {});
        if (appearances.length === 0 || appearances.some((appearance) => !("animations" in appearance) || !(step.animation! in appearance.animations))) {
          diagnostics.push(referenceDiagnostic("reference.animation.line", `${base}.animation`, `Line Animation '${step.animation}' is not available in every Appearance of Character '${step.character}'.`));
        }
      } else if (step.type === "operations") {
        operations(step.operations, `${base}.operations`, { sequence: true });
        for (const operation of step.operations) {
          if (operation.type !== "place-object") continue;
          if (operation.scene === sceneId) objectsInScene.add(operation.object);
          else objectsInScene.delete(operation.object);
        }
      } else if (step.type === "direct") {
        validateDirections(
          step,
          base,
          sceneId,
          objectsInScene,
          (scenery, destination) => {
            const next = steps[index + 1];
            if (next?.type !== "direct") return false;
            return next.directions.some((direction) =>
              direction.type === "motion" &&
              direction.startAfter === undefined &&
              direction.subject.kind === "scenery" &&
              direction.subject.scenery === scenery &&
              direction.path[0] !== undefined &&
              Math.hypot(
                direction.path[0].x - destination.x,
                direction.path[0].y - destination.y,
              ) <= 1e-8,
            );
          },
        );
      } else if (step.type === "choice") {
        const branchObjects: Set<string>[] = [];
        step.alternatives.forEach((alternative, alternativeIndex) => {
          if (alternative.spoken !== false && !input.playerCharacter) {
            diagnostics.push({
              code: "definition.choice.player-character",
              family: "definition",
              path: `${base}.alternatives[${alternativeIndex}].spoken`,
              message: "A spoken Choice requires a Player Character.",
            });
          }
          condition(alternative.when, `${base}.alternatives[${alternativeIndex}].when`);
          branchObjects.push(visitSteps(
            alternative.steps,
            `${base}.alternatives[${alternativeIndex}].steps`,
            sceneId,
            objectsInScene,
          ));
        });
        if (step.fallback.spoken !== false && !input.playerCharacter) {
          diagnostics.push({
            code: "definition.choice.player-character",
            family: "definition",
            path: `${base}.fallback.spoken`,
            message: "A spoken Choice requires a Player Character.",
          });
        }
        branchObjects.push(visitSteps(step.fallback.steps, `${base}.fallback.steps`, sceneId, objectsInScene));
        objectsInScene = intersectSets(branchObjects);
      } else if (step.type === "branch") {
        const branchObjects: Set<string>[] = [];
        step.cases.forEach((branch, branchIndex) => {
          condition(branch.when, `${base}.cases[${branchIndex}].when`);
          branchObjects.push(visitSteps(
            branch.steps,
            `${base}.cases[${branchIndex}].steps`,
            sceneId,
            objectsInScene,
          ));
        });
        branchObjects.push(visitSteps(step.fallback, `${base}.fallback`, sceneId, objectsInScene));
        objectsInScene = intersectSets(branchObjects);
      }
    });
    return objectsInScene;
  };
  const hasDirectedStep = (steps: readonly SequenceStep[]): boolean => steps.some((step) =>
    step.type === "direct" ||
    (step.type === "choice" && (
      step.alternatives.some((alternative) => hasDirectedStep(alternative.steps)) ||
      hasDirectedStep(step.fallback.steps)
    )) ||
    (step.type === "branch" && (
      step.cases.some((branch) => hasDirectedStep(branch.steps)) ||
      hasDirectedStep(step.fallback)
    )),
  );
  for (const [sequenceId, sequence] of Object.entries(sequences)) {
    const directs = hasDirectedStep(sequence.steps);
    if (directs && (!sequence.scene || !(sequence.scene in input.scenes))) {
      diagnostics.push(referenceDiagnostic("reference.sequence.scene", `sequences.${sequenceId}.scene`, "A directed Sequence must name its owning Scene."));
    }
    const initiallyAvailableObjects = new Set(Object.entries(objects)
      .filter(([, object]) => object.initialScene === sequence.scene)
      .map(([objectId]) => objectId));
    visitSteps(sequence.steps, `sequences.${sequenceId}.steps`, sequence.scene, initiallyAvailableObjects);
    operations(sequence.skipOutcome ?? [], `sequences.${sequenceId}.skipOutcome`, { sequence: true });
  }
  for (const character of Object.keys(input.hudTheme?.speechColors ?? {})) {
    if (!(character in characters)) {
      diagnostics.push(referenceDiagnostic(
        "reference.character",
        `hudTheme.speechColors.${character}`,
        `Character '${character}' does not exist.`,
      ));
    }
  }

  const hasNouns = Object.values(characters).some((value) => value.noun !== undefined) ||
    Object.values(objects).some((value) => value.noun !== undefined) ||
    Object.values(input.scenes).some((scene) =>
      Object.values(scene.scenery ?? {}).some((value) => value.noun !== undefined) ||
      scene.hotspots?.some((value) => value.noun !== undefined) ||
      scene.passages?.some((value) => value.noun !== undefined),
    );
  if (hasNouns && !input.commandLexicon) {
    diagnostics.push({
      code: "definition.command-lexicon.required",
      family: "definition",
      path: "commandLexicon",
      message: "A Game Project with Nouns must define a Command Lexicon.",
    });
  }
}

function referenceDiagnostic(code: string, path: string, message: string): AuthoringDiagnostic {
  return { code, family: "reference", path, message };
}

function validatePolygon(
  polygon: readonly Point[],
  path: string,
  diagnostics: AuthoringDiagnostic[],
): void {
  for (let left = 0; left < polygon.length; left += 1) {
    const leftNext = (left + 1) % polygon.length;
    for (let right = left + 1; right < polygon.length; right += 1) {
      const rightNext = (right + 1) % polygon.length;
      if (left === right || leftNext === right || rightNext === left) continue;
      if (segmentsIntersect(polygon[left]!, polygon[leftNext]!, polygon[right]!, polygon[rightNext]!)) {
        diagnostics.push({
          code: "definition.polygon.self-intersection",
          family: "definition",
          path,
          message: "A polygon cannot cross itself.",
        });
        return;
      }
    }
  }
  const twiceArea = polygon.reduce((total, point, index) => {
    const next = polygon[(index + 1) % polygon.length]!;
    return total + point.x * next.y - next.x * point.y;
  }, 0);
  if (Math.abs(twiceArea) < Number.EPSILON) {
    diagnostics.push({
      code: "definition.polygon.degenerate",
      family: "definition",
      path,
      message: "A polygon must enclose a non-zero area.",
    });
  }
}

function validateLocalPolygon(
  polygon: readonly Point[],
  path: string,
  diagnostics: AuthoringDiagnostic[],
): void {
  polygon.forEach((point, index) => {
    if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) {
      diagnostics.push({
        code: "definition.point.finite",
        family: "definition",
        path: `${path}[${index}]`,
        message: "Scene Space coordinates must be finite numbers.",
      });
    }
  });
  if (polygon.length < 3) {
    diagnostics.push({
      code: "definition.polygon.vertices",
      family: "definition",
      path,
      message: "A polygon needs at least three vertices.",
    });
  } else if (polygon.every(({ x, y }) => Number.isFinite(x) && Number.isFinite(y))) {
    validatePolygon(polygon, path, diagnostics);
  }
}

function validateVisualAnchor(
  anchor: Point | undefined,
  path: string,
  diagnostics: AuthoringDiagnostic[],
): void {
  if (anchor && (!Number.isFinite(anchor.x) || !Number.isFinite(anchor.y))) {
    diagnostics.push({
      code: "definition.point.finite",
      family: "definition",
      path,
      message: "A Visual Anchor must use finite image-pixel coordinates.",
    });
  }
}

function isAnimatedAppearance(appearance: EntityAppearance | SceneryAppearance): appearance is Appearance {
  return "animations" in appearance;
}

function validateAppearance(
  appearance: Appearance,
  path: string,
  diagnostics: AuthoringDiagnostic[],
): void {
  const animationNames = Object.keys(appearance.animations);
  if (animationNames.length === 0) {
    diagnostics.push({
      code: "definition.appearance.animations",
      family: "definition",
      path: `${path}.animations`,
      message: "An Appearance must define at least one Animation.",
    });
  }
  if (typeof appearance.roles.default !== "string" || !appearance.roles.default.trim()) {
    diagnostics.push({
      code: "definition.appearance.default-role",
      family: "definition",
      path: `${path}.roles.default`,
      message: "An Appearance must identify a Default Animation Role.",
    });
  }
  for (const [role, animation] of Object.entries(appearance.roles)) {
    if (!(animation in appearance.animations)) {
      diagnostics.push({
        code: "reference.animation.role",
        family: "reference",
        path: `${path}.roles.${role}`,
        message: `Animation Role '${role}' refers to missing Animation '${animation}'.`,
      });
    }
  }
  for (const [animationName, animation] of Object.entries(appearance.animations)) {
    const animationPath = `${path}.animations.${animationName}`;
    const frameCount = isAnimationImageFrames(animation.frames)
      ? animation.frames.length
      : animation.frames.side.count;
    if (isAnimationImageFrames(animation.frames) && frameCount === 0) {
      diagnostics.push({
        code: "definition.animation.frames",
        family: "definition",
        path: `${animationPath}.frames`,
        message: "An Animation must contain at least one frame.",
      });
    }
    if (!isAnimationImageFrames(animation.frames)) {
      const counts = new Set<number>();
      for (const direction of ["side", "front", "back"] as const) {
        if (!Number.isInteger(animation.frames[direction].count) || animation.frames[direction].count <= 0) {
          diagnostics.push({
            code: "definition.animation.frames",
            family: "definition",
            path: `${animationPath}.frames.${direction}.count`,
            message: "An Animation strip must contain a positive integer number of frames.",
          });
        } else {
          counts.add(animation.frames[direction].count);
        }
      }
      if (counts.size > 1) {
        diagnostics.push({
          code: "definition.animation.directional-frame-count",
          family: "definition",
          path: `${animationPath}.frames`,
          message: "Directional Animation strips must contain the same number of frames.",
        });
      }
    }
    if (!Number.isFinite(animation.framesPerSecond) || animation.framesPerSecond <= 0) {
      diagnostics.push({
        code: "definition.animation.frames-per-second",
        family: "definition",
        path: `${animationPath}.framesPerSecond`,
        message: "Animation frames per second must be a positive finite number.",
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
          path: `${animationPath}.cues.${cue}`,
          message: "An Animation Cue must have a name and occur within the Animation duration.",
        });
      }
    }
  }
}

function subjectBelongsToScene(
  subject: DirectedSubject,
  sceneId: string,
  playerCharacter: string | undefined,
  characters: Readonly<Record<string, CharacterDefinition>>,
  objects: Readonly<Record<string, ObjectDefinition>>,
  scenes: Readonly<Record<string, SceneDefinition>>,
  availableObjects: ReadonlySet<string> = new Set(),
): boolean {
  if (subject.kind === "character") {
    return subject.character === playerCharacter || characters[subject.character]?.initialScene === sceneId;
  }
  if (subject.kind === "object") return subject.object in objects && availableObjects.has(subject.object);
  return subject.scenery in (scenes[sceneId]?.scenery ?? {});
}

function intersectSets(values: readonly ReadonlySet<string>[]): Set<string> {
  const [first, ...rest] = values;
  return new Set([...(first ?? [])].filter((value) => rest.every((candidate) => candidate.has(value))));
}

function isAnimationImageFrames(frames: AnimationFrames): frames is readonly (URL | string)[] {
  return Array.isArray(frames);
}

function validatePolygonBounds(
  polygon: readonly Point[],
  path: string,
  pointInFrame: (point: Point) => boolean,
  diagnostics: AuthoringDiagnostic[],
): void {
  polygon.forEach((point, index) => {
    if (!pointInFrame(point)) {
      diagnostics.push({
        code: "definition.scene-space.bounds",
        family: "definition",
        path: `${path}[${index}]`,
        message: "Scene geometry must remain inside the Logical Resolution.",
      });
    }
  });
}

function pointInPolygonOrBoundary(polygon: readonly Point[], point: Point): boolean {
  let inside = false;
  for (let current = 0, previous = polygon.length - 1; current < polygon.length; previous = current++) {
    const a = polygon[previous]!;
    const b = polygon[current]!;
    const cross = (point.x - a.x) * (b.y - a.y) - (point.y - a.y) * (b.x - a.x);
    const onSegment = Math.abs(cross) <= 1e-9 &&
      point.x >= Math.min(a.x, b.x) && point.x <= Math.max(a.x, b.x) &&
      point.y >= Math.min(a.y, b.y) && point.y <= Math.max(a.y, b.y);
    if (onSegment) return true;
    if ((a.y > point.y) !== (b.y > point.y) &&
        point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x) {
      inside = !inside;
    }
  }
  return inside;
}

function segmentsIntersect(a: Point, b: Point, c: Point, d: Point): boolean {
  const cross = (p: Point, q: Point, r: Point) =>
    Math.sign((q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x));
  return cross(a, b, c) !== cross(a, b, d) && cross(c, d, a) !== cross(c, d, b);
}
