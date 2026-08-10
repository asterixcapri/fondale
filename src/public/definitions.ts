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

/** The fixed dimensions shared by every Scene and Engine-owned overlay. */
export interface LogicalResolution {
  readonly width: number;
  readonly height: number;
}

/** The four authored facings used by directional Character walking. */
export type Facing = "front" | "back" | "left" | "right";

/** A static PNG Appearance aligned to a Character or Object Ground Point. */
export interface StaticAppearance {
  readonly kind: "static";
  readonly image: URL | string;
  readonly visualAnchor?: Point;
}

/** One horizontal PNG strip used by a directional walking Appearance. */
export interface WalkStrip {
  readonly image: URL | string;
  readonly frames: number;
}

/** The three authored directions of a basic Character walking Appearance. */
export interface WalkingAppearance {
  readonly kind: "walking";
  readonly side: WalkStrip;
  readonly front: WalkStrip;
  readonly back: WalkStrip;
  readonly framesPerSecond: number;
  readonly visualAnchor?: Point;
}

/** An Appearance cut directly from the owning Scene's Background. */
export interface BackgroundRegionAppearance {
  readonly kind: "background-region";
  readonly area: readonly Point[];
}

export type EntityAppearance = StaticAppearance | WalkingAppearance;
export type SceneryAppearance = StaticAppearance | BackgroundRegionAppearance;

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
    if (appearance.kind === "walking") {
      if (!Number.isFinite(appearance.framesPerSecond) || appearance.framesPerSecond <= 0) {
        diagnostics.push({
          code: "definition.walking.frames-per-second",
          family: "definition",
          path: `${base}.framesPerSecond`,
          message: "Walking frames per second must be a positive finite number.",
        });
      }
      for (const direction of ["side", "front", "back"] as const) {
        if (!Number.isInteger(appearance[direction].frames) || appearance[direction].frames <= 0) {
          diagnostics.push({
            code: "definition.walking.frames",
            family: "definition",
            path: `${base}.${direction}.frames`,
            message: "A walking strip must contain a positive integer number of frames.",
          });
        }
      }
    }
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
  readonly appearances: Readonly<Record<string, StaticAppearance>>;
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

/** The finite set of declarative state transitions authored in Fondale 1.1. */
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

export interface HotspotDefinition {
  readonly target: HotspotTarget;
  readonly area: readonly Point[];
  readonly approach: ApproachPoint;
  readonly when?: InteractionCondition;
  readonly noun: NounDefinition;
}

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

export interface PerspectiveScaleStop {
  readonly y: number;
  readonly scale: number;
}

/** The minimal input accepted by {@link defineScene}. */
export interface SceneInput {
  readonly background: URL | string;
  readonly walkableRegion: readonly Point[];
  readonly perspectiveScale?: readonly PerspectiveScaleStop[];
  readonly scenery?: Readonly<Record<string, SceneryDefinition>>;
  readonly hotspots?: readonly HotspotDefinition[];
  readonly entrances?: Readonly<Record<string, SceneEntrance>>;
  readonly passages?: readonly ScenePassage[];
}

/** A locally validated Scene definition. Its registry key supplies its identity. */
export interface SceneDefinition extends SceneInput {}

/** Creates and freezes one Scene after validating its local geometry. */
export function defineScene(input: SceneInput): SceneDefinition {
  const diagnostics: AuthoringDiagnostic[] = [];

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
      if (appearance.kind === "background-region") {
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
    walkableRegion: input.walkableRegion.map((point) => ({ ...point })),
    scenery: { ...(input.scenery ?? {}) },
    hotspots: [...(input.hotspots ?? [])],
    entrances: { ...(input.entrances ?? {}) },
    passages: [...(input.passages ?? [])],
  });
}

export interface Line {
  readonly text: string;
  readonly character: string;
  readonly audio?: URL | string;
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

export type SequenceStep = LineStep | NarrationStep | OperationsStep | ChoiceStep | BranchStep;

/** A finite, root-level Sequence definition. */
export interface SequenceDefinition {
  readonly steps: readonly SequenceStep[];
  readonly skippable?: boolean;
}

/** Creates and freezes a finite Sequence of Lines, Narrations, Choices, branches and operations. */
export function defineSequence(input: SequenceDefinition): SequenceDefinition {
  const diagnostics: AuthoringDiagnostic[] = [];
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
  return deepFreeze({ ...input, steps: cloneSequenceSteps(input.steps) });
}

function cloneSequenceSteps(steps: readonly SequenceStep[]): SequenceStep[] {
  return steps.map((step) => {
    if (step.type === "line") {
      return {
        ...step,
        ...(step.audio instanceof URL ? { audio: new URL(step.audio.href) } : {}),
      };
    }
    if (step.type === "narration" || step.type === "operations") return structuredClone(step);
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
  extends Omit<GameInput, "characters" | "objects" | "sequences" | "variables"> {
  readonly letterboxColor: string;
  readonly characters: Readonly<Record<string, CharacterDefinition>>;
  readonly objects: Readonly<Record<string, ObjectDefinition>>;
  readonly sequences: Readonly<Record<string, SequenceDefinition>>;
  readonly variables: Readonly<Record<string, boolean>>;
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
  if (diagnostics.length > 0) throw new AuthoringError(diagnostics);

  const data = deepFreeze({
    ...input,
    logicalResolution: { ...input.logicalResolution },
    scenes: { ...input.scenes },
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
  const { width, height } = input.logicalResolution;
  const pointInFrame = (point: Point) =>
    Number.isFinite(point.x) && Number.isFinite(point.y) &&
    point.x >= 0 && point.y >= 0 && point.x <= width && point.y <= height;
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
    context: { target?: HotspotTarget; sequence?: boolean } = {},
  ) => {
    values.forEach((operation, index) => {
      const operationPath = `${path}[${index}]`;
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
      } else if (operation.type === "place-selected-object" && !pointInFrame(operation.groundPoint)) {
        diagnostics.push({
          code: "definition.operation.ground-point",
          family: "definition",
          path: `${operationPath}.groundPoint`,
          message: "A placed Object Ground Point must be finite and inside the Logical Resolution.",
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
    }
  };
  const noun = (value: NounDefinition | undefined, path: string, target?: HotspotTarget) => {
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
      operations(candidate.operations ?? [], `${candidatePath}.operations`, { target });
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
        operations(fallback.operations ?? [], `${path}.fallbacks.${verb}.operations`, { target });
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
    scene.walkableRegion.forEach((point, index) => {
      if (!pointInFrame(point)) {
        diagnostics.push({
          code: "definition.scene-space.bounds",
          family: "definition",
          path: `scenes.${sceneId}.walkableRegion[${index}]`,
          message: "Scene geometry must remain inside the Logical Resolution.",
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
      );
      if (!(scenery.initialAppearance in scenery.appearances)) {
        diagnostics.push(referenceDiagnostic("reference.appearance.initial", `scenes.${sceneId}.scenery.${sceneryId}.initialAppearance`, "Initial Scenery Appearance does not exist."));
      }
      if (scenery.position && !pointInFrame(scenery.position)) {
        diagnostics.push({ code: "definition.scene-space.bounds", family: "definition", path: `scenes.${sceneId}.scenery.${sceneryId}.position`, message: "Scenery positions must remain inside the Logical Resolution." });
      }
      for (const [appearanceId, appearance] of Object.entries(scenery.appearances)) {
        if (appearance.kind === "background-region") {
          validatePolygonBounds(appearance.area, `scenes.${sceneId}.scenery.${sceneryId}.appearances.${appearanceId}.area`, pointInFrame, diagnostics);
        }
      }
    }
    for (const [entranceId, entrance] of Object.entries(scene.entrances ?? {})) {
      if (!pointInFrame(entrance.groundPoint)) {
        diagnostics.push({ code: "definition.scene-space.bounds", family: "definition", path: `scenes.${sceneId}.entrances.${entranceId}.groundPoint`, message: "Scene Entrance Ground Points must remain inside the Logical Resolution." });
      } else if (!pointInPolygonOrBoundary(scene.walkableRegion, entrance.groundPoint)) {
        diagnostics.push({ code: "definition.entrance.walkable", family: "definition", path: `scenes.${sceneId}.entrances.${entranceId}.groundPoint`, message: "A Scene Entrance Ground Point must lie in the Walkable Region." });
      }
    }
    scene.hotspots?.forEach((hotspot, hotspotIndex) => {
      const base = `scenes.${sceneId}.hotspots[${hotspotIndex}]`;
      noun(hotspot.noun, `${base}.noun`, hotspot.target);
      validatePolygonBounds(hotspot.area, `${base}.area`, pointInFrame, diagnostics);
      if (!pointInFrame(hotspot.approach.groundPoint)) {
        diagnostics.push({ code: "definition.approach.bounds", family: "definition", path: `${base}.approach`, message: "Approach Point must be inside Scene Space." });
      } else if (!pointInPolygonOrBoundary(scene.walkableRegion, hotspot.approach.groundPoint)) {
        diagnostics.push({ code: "definition.approach.walkable", family: "definition", path: `${base}.approach`, message: "An Approach Point must lie in the Walkable Region." });
      }
      const targetExists =
        hotspot.target.kind === "background" ||
        (hotspot.target.kind === "character" && hotspot.target.character in characters) ||
        (hotspot.target.kind === "object" && hotspot.target.object in objects) ||
        (hotspot.target.kind === "scenery" && hotspot.target.scenery in (scene.scenery ?? {}));
      if (!targetExists) diagnostics.push(referenceDiagnostic("reference.hotspot.target", `${base}.target`, "Hotspot target does not exist."));
      condition(hotspot.when, `${base}.when`);
    });
    scene.passages?.forEach((passage, passageIndex) => {
      const base = `scenes.${sceneId}.passages[${passageIndex}]`;
      noun(passage.noun, `${base}.noun`);
      validatePolygonBounds(passage.area, `${base}.area`, pointInFrame, diagnostics);
      if (!pointInFrame(passage.approach.groundPoint)) {
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
    noun(character.noun, `characters.${characterId}.noun`, { kind: "character", character: characterId });
    const scene = input.scenes[character.initialScene];
    if (!scene) continue;
    const path = `characters.${characterId}.initialGroundPoint`;
    if (!pointInFrame(character.initialGroundPoint)) {
      diagnostics.push({ code: "definition.scene-space.bounds", family: "definition", path, message: "Character Ground Points must remain inside the Logical Resolution." });
    } else if (!pointInPolygonOrBoundary(scene.walkableRegion, character.initialGroundPoint)) {
      diagnostics.push({ code: "definition.character.walkable", family: "definition", path, message: "A Character Ground Point must lie in the Scene Walkable Region." });
    }
  }
  for (const [objectId, object] of Object.entries(objects)) {
    noun(object.noun, `objects.${objectId}.noun`, { kind: "object", object: objectId });
    if (input.scenes[object.initialScene] && !pointInFrame(object.initialGroundPoint)) {
      diagnostics.push({ code: "definition.scene-space.bounds", family: "definition", path: `objects.${objectId}.initialGroundPoint`, message: "Object Ground Points must remain inside the Logical Resolution." });
    }
  }

  const visitSteps = (steps: readonly SequenceStep[], path: string) => {
    steps.forEach((step, index) => {
      const base = `${path}[${index}]`;
      if (step.type === "line" && step.character !== undefined && !(step.character in characters)) {
        diagnostics.push(referenceDiagnostic("reference.character", `${base}.character`, `Character '${step.character}' does not exist.`));
      } else if (step.type === "operations") {
        operations(step.operations, `${base}.operations`, { sequence: true });
      } else if (step.type === "choice") {
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
          visitSteps(alternative.steps, `${base}.alternatives[${alternativeIndex}].steps`);
        });
        if (step.fallback.spoken !== false && !input.playerCharacter) {
          diagnostics.push({
            code: "definition.choice.player-character",
            family: "definition",
            path: `${base}.fallback.spoken`,
            message: "A spoken Choice requires a Player Character.",
          });
        }
        visitSteps(step.fallback.steps, `${base}.fallback.steps`);
      } else if (step.type === "branch") {
        step.cases.forEach((branch, branchIndex) => {
          condition(branch.when, `${base}.cases[${branchIndex}].when`);
          visitSteps(branch.steps, `${base}.cases[${branchIndex}].steps`);
        });
        visitSteps(step.fallback, `${base}.fallback`);
      }
    });
  };
  for (const [sequenceId, sequence] of Object.entries(sequences)) {
    visitSteps(sequence.steps, `sequences.${sequenceId}.steps`);
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
