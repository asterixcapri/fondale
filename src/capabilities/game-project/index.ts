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
  type InventoryOperation,
  type NounDefinition,
  isInventoryOperation,
  validateCommandResponse,
  validateInventoryOperation,
  validateInteractionComposition,
  validateInteractionConditionReference,
  validateNounReferences,
} from "../interaction";
import type { HUDTheme } from "../hud";
import {
  validateSequenceReferences,
  type DirectedSubject,
  type Line,
  type SequenceDefinition,
} from "../sequence";
import {
  validateAppearanceSet,
  validateAnimationReference,
  validateObjectAppearanceReference,
  type AnimationDefinition,
  type AnimationFrames,
  type AnimationRoles,
  type AnimationStrip,
  type AnimationProjectView,
  type Appearance,
} from "../animation";
import {
  createWorldDefinitionQueries,
  validateWorldProject,
  type CharacterDefinition,
  type EntityAppearance,
  type HotspotTarget,
  type ObjectDefinition,
  type Point,
  type ResolvedSceneDefinition,
  type WorldProjectView,
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
  | InventoryOperation;

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

/** @internal Project-owned identity and variable registry needed by Save. */
export interface SaveGameProjectView {
  readonly identity: string;
  readonly version: string;
  readonly variables: Readonly<Record<string, boolean>>;
  readonly playerCharacter?: string;
}

/** @internal Narrow capability views composed for Save validation. */
export interface SaveCompositionView {
  readonly gameProject: SaveGameProjectView;
  readonly world: WorldProjectView;
  readonly animation: AnimationProjectView;
  readonly sequences: Readonly<Record<string, SequenceDefinition>>;
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

/** @internal Composes the distinct narrow views consumed by Save. */
export function getSaveCompositionView(project: GameProject): SaveCompositionView {
  const data = getGameProjectData(project);
  return Object.freeze({
    gameProject: data,
    world: data,
    animation: data,
    sequences: data.sequences,
  });
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
  const sceneReferences = new Set(allSceneIds);
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
    context: { target?: HotspotTarget; scenes?: readonly string[] } = {},
  ) => {
    const operationDiagnostics: AuthoringDiagnostic[] = [];
    values.forEach((operation, index) => {
      const operationPath = `${path}[${index}]`;
      if (isInventoryOperation(operation)) {
        operationDiagnostics.push(...validateInventoryOperation(
          operation,
          operationPath,
          {
            ...(context.target ? { target: context.target } : {}),
            ...(context.scenes ? { scenes: context.scenes } : {}),
          },
          {
            objects: interactionReferences.objects,
            scenes: sceneReferences,
            validatePlacement: (scenes, point, placementPath) =>
              world.validatePlacement(scenes, point, placementPath),
            validateObjectAppearance: (object, appearance, appearancePath) =>
              validateObjectAppearanceReference(
                { objects },
                object,
                appearance,
                appearancePath,
              ),
          },
        ));
        return;
      }
      if (operation.type === "set-variable" && !(operation.variable in variables)) {
        operationDiagnostics.push(referenceDiagnostic("reference.variable", operationPath, `Game Variable '${operation.variable}' does not exist.`));
      } else if (operation.type === "start-sequence") {
        if (!(operation.sequence in sequences)) {
          operationDiagnostics.push(referenceDiagnostic("reference.sequence", operationPath, `Sequence '${operation.sequence}' does not exist.`));
        }
      } else if (operation.type === "set-appearance") {
        const target = operation.target;
        const appearances =
          target.kind === "character"
            ? characters[target.character]?.appearances
            : target.kind === "object"
              ? objects[target.object]?.appearances
              : input.scenes[target.scene]?.scenery?.[target.scenery]?.appearances;
        if (!appearances) {
          operationDiagnostics.push(referenceDiagnostic("reference.appearance.target", operationPath, "Appearance target does not exist."));
        } else if (!(operation.appearance in appearances)) {
          operationDiagnostics.push(referenceDiagnostic("reference.appearance", operationPath, `Appearance '${operation.appearance}' does not exist on the target.`));
        }
      }
    });
    return operationDiagnostics;
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
      diagnostics.push(...operations(candidate.operations ?? [], `${candidatePath}.operations`, {
        target,
        scenes: destinationScenes,
      }));
    });
    for (const verb of commandVerbs) {
      const fallback = value.fallbacks?.[verb];
      if (fallback) {
        diagnostics.push(...operations(fallback.operations ?? [], `${path}.fallbacks.${verb}.operations`, {
          target,
          scenes: destinationScenes,
        }));
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
  for (const [sequenceId, sequence] of Object.entries(sequences)) {
    diagnostics.push(...validateSequenceReferences(sequenceId, sequence, {
      ...(input.playerCharacter ? { playerCharacter: input.playerCharacter } : {}),
      sceneExists: (scene) => scene in input.scenes,
      characterExists: (character) => character in characters,
      appearancesForCharacter: (character) =>
        Object.values(characters[character]?.appearances ?? {}),
      appearancesForSubject,
      initialObjectsInScene: (scene) => new Set(Object.entries(objects)
        .filter(([, object]) => object.initialScene === scene)
        .map(([objectId]) => objectId)),
      hasDirectedSubject: (scene, subject, availableObjects) =>
        world.hasDirectedSubject(scene, subject, availableObjects),
      cameraSubjectExists: (scene, subject) => world.hasSubject(scene, subject),
      pointInScene: (scene, point) => world.pointInScene(scene, point),
      validateCondition: (value, path) =>
        validateInteractionConditionReference(value, path, interactionReferences),
      validateOperations: operations,
      validateMotion: (scene, direction, path, availableObjects, nextStep) =>
        world.validateMotion(scene, direction, path, {
          subjectBelongsToScene: world.hasDirectedSubject(
            scene,
            direction.subject,
            availableObjects,
          ),
          ...(nextStep ? { nextStep } : {}),
        }),
    }));
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
