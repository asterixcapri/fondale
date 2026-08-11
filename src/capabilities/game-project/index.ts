import { AuthoringError, type AuthoringDiagnostic } from "./diagnostics";
export {
  AuthoringError,
  type AuthoringDiagnostic,
  type AuthoringDiagnosticFamily,
  type AuthoringDiagnosticOwner,
} from "./diagnostics";
import {
  commandVerbs,
  type CommandLexicon,
  type CommandResponse,
  type InteractionCondition,
  type NounDefinition,
  validateCommandResponse,
  validateInteractionComposition,
  validateInteractionConditionReference,
  validateNounReferences,
} from "../interaction";
import type { HUDTheme } from "../hud";
import {
  cloneDirectionStep,
  validateDirectionStep,
  validateDirectionStepReferences,
  type DirectionStep,
  type DirectedSubject,
} from "../sequence";
import {
  validateAppearanceSet,
  validateAnimationReference,
  type AnimationDefinition,
  type AnimationFrames,
  type AnimationRoles,
  type AnimationStrip,
  type Appearance,
} from "../animation";
import {
  createWorldDefinitionQueries,
  validateMotionDirection,
  validateWorldProject,
  type CharacterDefinition,
  type EntityAppearance,
  type HotspotTarget,
  type ObjectDefinition,
  type Point,
  type ResolvedSceneDefinition,
  type SceneryAppearance,
  type SceneDefinition,
} from "../world";
export {
  defineCharacter,
  defineObject,
  defineScene,
  type ApproachPoint,
  type ArrivalSequenceRule,
  type BackgroundRegionAppearance,
  type CharacterDefinition,
  type CharacterInput,
  type EntityAppearance,
  type Facing,
  type HotspotDefinition,
  type HotspotTarget,
  type ObjectDefinition,
  type PerspectiveScaleStop,
  type Point,
  type ResolvedSceneDefinition,
  type SceneryAppearance,
  type SceneryDefinition,
  type SceneDefinition,
  type SceneEntrance,
  type SceneInput,
  type ScenePassage,
  type SceneSize,
} from "../world";
export type {
  AnimationDefinition,
  AnimationFrames,
  AnimationRoles,
  AnimationStrip,
  Appearance,
} from "../animation";

/** The fixed dimensions of the logical viewport and Engine-owned overlay. */
export interface LogicalResolution {
  readonly width: number;
  readonly height: number;
}

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

export type SequenceStep = LineStep | NarrationStep | OperationsStep | ChoiceStep | BranchStep | DirectionStep;

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
      family: "definition", owner: "sequence",
      path: "skipOutcome",
      message: "A skippable Sequence must declare its Skip Outcome.",
    });
  }
  if (!input.skippable && input.skipOutcome !== undefined) {
    diagnostics.push({
      code: "definition.sequence.skip-outcome.unused",
      family: "definition", owner: "sequence",
      path: "skipOutcome",
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
      if (step.type === "line") {
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
        if (maximumEligibleAlternatives(step.alternatives) > 6) {
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
    if (step.type === "direction") return cloneDirectionStep(step);
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
  extends Omit<GameInput, "scenes" | "characters" | "objects" | "sequences" | "variables"> {
  readonly scenes: Readonly<Record<string, ResolvedSceneDefinition>>;
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
  const characters = input.characters ?? {};
  const objects = input.objects ?? {};
  const sequences = input.sequences ?? {};
  const variables = input.variables ?? {};
  diagnostics.push(...validateWorldProject({
    logicalResolution: input.logicalResolution,
    initialScene: input.initialScene,
    ...(input.playerCharacter === undefined ? {} : { playerCharacter: input.playerCharacter }),
    scenes: input.scenes,
    characters,
    objects,
  }));
  validateProjectDefinitions(input, characters, objects, sequences, variables, diagnostics);
  if (input.inventoryAppearanceSize !== undefined &&
      (!Number.isInteger(input.inventoryAppearanceSize) || input.inventoryAppearanceSize <= 0)) {
    diagnostics.push({
      code: "definition.inventory-appearance-size",
      family: "definition", owner: "animation",
      path: "inventoryAppearanceSize",
      message: "Inventory Appearance Size must be a positive integer.",
    });
  }
  if (!input.identity.trim()) {
    diagnostics.push({
      code: "definition.project.identity",
      family: "definition", owner: "game-project",
      path: "identity",
      message: "Project Identity cannot be empty.",
    });
  }
  if (!input.version.trim()) {
    diagnostics.push({
      code: "definition.project.version",
      family: "definition", owner: "game-project",
      path: "version",
      message: "Project Version cannot be empty.",
    });
  }
  for (const [axis, value] of Object.entries(input.logicalResolution)) {
    if (!Number.isInteger(value) || value <= 0) {
      diagnostics.push({
        code: "definition.logical-resolution.positive-integer",
        family: "definition", owner: "game-project",
        path: `logicalResolution.${axis}`,
        message: "Logical Resolution dimensions must be positive integers.",
      });
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
  const allSceneIds = Object.keys(input.scenes);
  const world = createWorldDefinitionQueries({
    logicalResolution: input.logicalResolution,
    initialScene: input.initialScene,
    ...(input.playerCharacter === undefined ? {} : { playerCharacter: input.playerCharacter }),
    scenes: input.scenes,
    characters,
    objects,
  });
  const interactionReferences = {
    variables: new Set(Object.keys(variables)),
    objects: new Set(Object.keys(objects)),
    sequences: new Set(Object.keys(sequences)),
    commandFallbacks: input.commandFallbacks,
  };
  diagnostics.push(...validateInteractionComposition({
    commandLexicon: input.commandLexicon,
    scenes: input.scenes,
    characters,
    objects,
  }));
  const condition = (value: InteractionCondition | undefined, path: string) => {
    diagnostics.push(...validateInteractionConditionReference(value, path, interactionReferences));
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
          family: "definition", owner: "sequence",
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
            family: "definition", owner: "sequence",
            path: operationPath,
            message: "A Sequence cannot start another Sequence.",
          });
        }
      } else if (operation.type === "collect-target-object" && context.target?.kind !== "object") {
        diagnostics.push({
          code: "definition.operation.collect-target",
          family: "definition", owner: "game-project",
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
        diagnostics.push(...world.validatePlacement(
          [operation.scene],
          operation.groundPoint,
          `${operationPath}.groundPoint`,
        ));
      } else if (operation.type === "place-selected-object") {
        diagnostics.push(...world.validatePlacement(
          context.scenes ?? allSceneIds,
          operation.groundPoint,
          `${operationPath}.groundPoint`,
        ));
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
      diagnostics.push(...validateAnimationReference(
        appearances,
        value.animation,
        `${path}.animation`,
        "reference.animation.line",
        `Line Animation '${value.animation}' is not available in every Appearance of Character '${value.character}'.`,
      ));
    }
  };
  const noun = (
    value: NounDefinition | undefined,
    path: string,
    target?: HotspotTarget,
    destinationScenes?: readonly string[],
  ) => {
    if (!value) return;
    diagnostics.push(...validateNounReferences(value, path, interactionReferences));
    value.cases.forEach((candidate, index) => {
      const candidatePath = `${path}.cases[${index}]`;
      line(candidate.line, `${candidatePath}.line`);
      operations(candidate.operations ?? [], `${candidatePath}.operations`, {
        target,
        scenes: destinationScenes,
      });
    });
    for (const verb of commandVerbs) {
      const fallback = value.fallbacks?.[verb];
      if (fallback) {
        operations(fallback.operations ?? [], `${path}.fallbacks.${verb}.operations`, {
          target,
          scenes: destinationScenes,
        });
      }
    }
  };

  for (const [verb, fallback] of Object.entries(input.commandFallbacks ?? {})) {
    validateCommandResponse(fallback, `commandFallbacks.${verb}`, diagnostics);
  }

  for (const [sceneId, scene] of Object.entries(input.scenes)) {
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
    }
    scene.arrivalSequences?.forEach((rule, ruleIndex) => {
      const base = `scenes.${sceneId}.arrivalSequences[${ruleIndex}]`;
      if (!(rule.sequence in sequences)) diagnostics.push(referenceDiagnostic("reference.sequence", `${base}.sequence`, `Sequence '${rule.sequence}' does not exist.`));
      else if (sequences[rule.sequence]?.scene !== undefined && sequences[rule.sequence]!.scene !== sceneId) diagnostics.push(referenceDiagnostic("reference.sequence.scene", `${base}.sequence`, `Sequence '${rule.sequence}' belongs to Scene '${sequences[rule.sequence]!.scene}'.`));
      condition(rule.when, `${base}.when`);
    });
    scene.hotspots?.forEach((hotspot, hotspotIndex) => {
      const base = `scenes.${sceneId}.hotspots[${hotspotIndex}]`;
      if (hotspot.target.kind === "background") {
        noun(hotspot.noun, `${base}.noun`, hotspot.target, [sceneId]);
      }
      condition(hotspot.when, `${base}.when`);
    });
    scene.passages?.forEach((passage, passageIndex) => {
      const base = `scenes.${sceneId}.passages[${passageIndex}]`;
      noun(passage.noun, `${base}.noun`, undefined, [sceneId]);
      condition(passage.when, `${base}.when`);
    });
  }

  for (const [characterId, character] of Object.entries(characters)) {
    noun(
      character.noun,
      `characters.${characterId}.noun`,
      { kind: "character", character: characterId },
      characterId === input.playerCharacter ? allSceneIds : [character.initialScene],
    );
    if (characterId === input.playerCharacter) {
      diagnostics.push(...validateAppearanceSet(character.appearances, {
        path: `characters.${characterId}.appearances`,
        initialAppearance: character.initialAppearance,
        subject: "Character",
        requireWalking: true,
      }));
    }
  }
  for (const [objectId, object] of Object.entries(objects)) {
    noun(
      object.noun,
      `objects.${objectId}.noun`,
      { kind: "object", object: objectId },
      allSceneIds,
    );
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
        diagnostics.push(...validateAnimationReference(
          appearances,
          step.animation,
          `${base}.animation`,
          "reference.animation.line",
          `Line Animation '${step.animation}' is not available in every Appearance of Character '${step.character}'.`,
        ));
      } else if (step.type === "operations") {
        operations(step.operations, `${base}.operations`, { sequence: true });
        for (const operation of step.operations) {
          if (operation.type !== "place-object") continue;
          if (operation.scene === sceneId) objectsInScene.add(operation.object);
          else objectsInScene.delete(operation.object);
        }
      } else if (step.type === "direction") {
        step.directions.forEach((direction, directionIndex) => {
          if (direction.type === "motion") {
            diagnostics.push(...validateMotionDirection(
              direction,
              `${base}.directions[${directionIndex}]`,
            ));
          }
        });
        diagnostics.push(...validateDirectionStepReferences(step, base, {
          hasScene: sceneId !== undefined,
          appearancesForSubject: (subject) => appearancesForSubject(subject, sceneId),
          subjectBelongsToScene: (subject) => sceneId !== undefined &&
            world.hasDirectedSubject(sceneId, subject, objectsInScene),
          cameraSubjectExists: (subject) => world.hasSubject(sceneId, subject),
          pointInScene: (point) => sceneId !== undefined && world.pointInScene(sceneId, point),
          validateMotion: (direction, directionPath) => {
            if (sceneId === undefined) return [];
            const next = steps[index + 1];
            return world.validateMotion(sceneId, direction, directionPath, {
              subjectBelongsToScene: world.hasDirectedSubject(
                sceneId,
                direction.subject,
                objectsInScene,
              ),
              ...(next?.type === "direction" ? { nextStep: next } : {}),
            });
          },
        }));
      } else if (step.type === "choice") {
        const branchObjects: Set<string>[] = [];
        step.alternatives.forEach((alternative, alternativeIndex) => {
          if (alternative.spoken !== false && !input.playerCharacter) {
            diagnostics.push({
              code: "definition.choice.player-character",
              family: "definition", owner: "sequence",
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
            family: "definition", owner: "sequence",
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
    step.type === "direction" ||
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

}

function referenceDiagnostic(code: string, path: string, message: string): AuthoringDiagnostic {
  return { code, family: "reference", owner: "game-project", path, message };
}

function intersectSets(values: readonly ReadonlySet<string>[]): Set<string> {
  const [first, ...rest] = values;
  return new Set([...(first ?? [])].filter((value) => rest.every((candidate) => candidate.has(value))));
}
