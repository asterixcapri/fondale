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
  type InteractionProjectView,
  type InventoryOperation,
  type NounDefinition,
  isInventoryOperation,
  validateCommandResponse,
  validateInventoryOperation,
  validateInteractionComposition,
  validateInteractionConditionReference,
  validateCommandLexicon,
  validateNounDefinition,
  validateNounReferences,
} from "../interaction";
import {
  validateHUDProjectReferences,
  validateHUDTheme,
  type HUDProjectView,
  type HUDTheme,
} from "../hud";
import {
  validateArrivalSequenceReferences,
  validateLineReferences,
  validateSequenceStartReference,
  validateSequenceReferences,
  validateSequenceDefinition,
  type DirectedSubject,
  type Line,
  type SequenceDefinition,
} from "../sequence";
import {
  validateAnimationProjectSettings,
  validateAppearanceOperationReference,
  validateObjectAppearanceReference,
  validateWalkingAppearanceRoles,
  type AnimationDefinition,
  type AnimationFrames,
  type AnimationRoles,
  type AnimationStrip,
  type AnimationProjectView,
  type Appearance,
} from "../animation";
import {
  createWorldDefinitionQueries,
  validateCharacterDefinition,
  validateObjectDefinition,
  validateSceneDefinition,
  validateWorldProject,
  type CharacterDefinition,
  type EntityAppearance,
  type HotspotTarget,
  type ObjectDefinition,
  type Point,
  type ResolvedSceneDefinition,
  type WorldProjectView,
  type WorldDefinitionView,
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

/** Fully expanded representation kept inside the Game Project implementation. */
interface GameProjectData
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

/** @internal Project-owned registries used while coordinating one Game Session. */
export interface GameSessionGameProjectView {
  readonly variables: Readonly<Record<string, boolean>>;
}

/** @internal Consumer-specific views composed for Game Session coordination. */
export interface GameSessionCompositionView {
  readonly gameProject: GameSessionGameProjectView;
  readonly world: WorldProjectView & Pick<WorldDefinitionView, "logicalResolution" | "playerCharacter">;
  readonly interaction: InteractionProjectView;
  readonly animation: AnimationProjectView;
  readonly hud: HUDProjectView;
  readonly sequences: Readonly<Record<string, SequenceDefinition>>;
}

/** @internal Authored assets needed by the browser asset adapter. */
export interface BrowserAssetProjectView {
  readonly scenes: Readonly<Record<string, ResolvedSceneDefinition>>;
  readonly characters: Readonly<Record<string, CharacterDefinition>>;
  readonly objects: Readonly<Record<string, ObjectDefinition>>;
  readonly sequences: Readonly<Record<string, SequenceDefinition>>;
  readonly hudTheme?: HUDTheme;
  readonly inventoryAppearanceSize?: number;
}

/** @internal Project settings needed to mount the browser adapters. */
export interface BrowserStartProjectView {
  readonly identity: string;
  readonly logicalResolution: LogicalResolution;
  readonly letterboxColor: string;
}

/** @internal Authored presentation settings consumed by the browser renderer. */
export interface BrowserPresentationProjectView {
  readonly identity: string;
  readonly logicalResolution: LogicalResolution;
  readonly hudTheme?: HUDTheme;
  readonly inventoryAppearanceSize?: number;
}

/** @internal Explicit browser adapter views; never the aggregate project representation. */
export interface BrowserProjectView {
  readonly startup: BrowserStartProjectView;
  readonly assets: BrowserAssetProjectView;
  readonly presentation: BrowserPresentationProjectView;
}

const projectData = new WeakMap<GameProject, GameProjectData>();

/** Composes named definitions into one validated and immutable Game Project. */
export function defineGame(input: GameInput): GameProject {
  const diagnostics: AuthoringDiagnostic[] = [];
  const characters = input.characters ?? {};
  const objects = input.objects ?? {};
  const sequences = input.sequences ?? {};
  const variables = input.variables ?? {};
  for (const [sceneId, scene] of Object.entries(input.scenes)) {
    diagnostics.push(...validateSceneDefinition(scene, `scenes.${sceneId}`));
  }
  for (const [characterId, character] of Object.entries(characters)) {
    diagnostics.push(...validateCharacterDefinition(character, `characters.${characterId}`));
  }
  for (const [objectId, object] of Object.entries(objects)) {
    diagnostics.push(...validateObjectDefinition(object, `objects.${objectId}`));
  }
  for (const [sequenceId, sequence] of Object.entries(sequences)) {
    diagnostics.push(...validateSequenceDefinition(sequence, `sequences.${sequenceId}`));
  }
  if (input.commandLexicon) {
    diagnostics.push(...validateCommandLexicon(input.commandLexicon, "commandLexicon"));
  }
  if (input.hudTheme) diagnostics.push(...validateHUDTheme(input.hudTheme, "hudTheme"));
  diagnostics.push(...validateWorldProject({
    logicalResolution: input.logicalResolution,
    initialScene: input.initialScene,
    ...(input.playerCharacter === undefined ? {} : { playerCharacter: input.playerCharacter }),
    scenes: input.scenes,
    characters,
    objects,
  }));
  validateProjectDefinitions(input, characters, objects, sequences, variables, diagnostics);
  diagnostics.push(...validateAnimationProjectSettings(input.inventoryAppearanceSize));
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

function requireGameProjectData(project: GameProject): GameProjectData {
  const data = projectData.get(project);
  if (!data) throw new TypeError("Expected a Game Project returned by defineGame().");
  return data;
}

/** @internal Composes the capability views needed by Game Session. */
export function getGameSessionCompositionView(project: GameProject): GameSessionCompositionView {
  const data = requireGameProjectData(project);
  const world = Object.freeze({
    logicalResolution: data.logicalResolution,
    initialScene: data.initialScene,
    ...(data.playerCharacter === undefined ? {} : { playerCharacter: data.playerCharacter }),
    scenes: data.scenes,
    characters: data.characters,
    objects: data.objects,
  });
  return Object.freeze({
    gameProject: Object.freeze({ variables: data.variables }),
    world,
    interaction: Object.freeze({
      scenes: data.scenes,
      characters: data.characters,
      objects: data.objects,
      ...(data.commandFallbacks === undefined ? {} : { commandFallbacks: data.commandFallbacks }),
    }),
    animation: animationProjectView(data),
    hud: Object.freeze({
      ...(data.commandLexicon === undefined ? {} : { commandLexicon: data.commandLexicon }),
      logicalResolution: data.logicalResolution,
      ...(data.playerCharacter === undefined ? {} : { playerCharacter: data.playerCharacter }),
      ...(data.hudTheme === undefined ? {} : { theme: data.hudTheme }),
    }),
    sequences: data.sequences,
  });
}

/** @internal Composes distinct views for browser technical adapters. */
export function getBrowserProjectView(project: GameProject): BrowserProjectView {
  const data = requireGameProjectData(project);
  return Object.freeze({
    startup: Object.freeze({
      identity: data.identity,
      logicalResolution: data.logicalResolution,
      letterboxColor: data.letterboxColor,
    }),
    assets: Object.freeze({
      scenes: data.scenes,
      characters: data.characters,
      objects: data.objects,
      sequences: data.sequences,
      ...(data.hudTheme === undefined ? {} : { hudTheme: data.hudTheme }),
      ...(data.inventoryAppearanceSize === undefined
        ? {}
        : { inventoryAppearanceSize: data.inventoryAppearanceSize }),
    }),
    presentation: Object.freeze({
      identity: data.identity,
      logicalResolution: data.logicalResolution,
      ...(data.hudTheme === undefined ? {} : { hudTheme: data.hudTheme }),
      ...(data.inventoryAppearanceSize === undefined
        ? {}
        : { inventoryAppearanceSize: data.inventoryAppearanceSize }),
    }),
  });
}

/** @internal Composes the distinct narrow views consumed by Save. */
export function getSaveCompositionView(project: GameProject): SaveCompositionView {
  const data = requireGameProjectData(project);
  return Object.freeze({
    gameProject: Object.freeze({
      identity: data.identity,
      version: data.version,
      variables: data.variables,
      ...(data.playerCharacter === undefined ? {} : { playerCharacter: data.playerCharacter }),
    }),
    world: Object.freeze({
      initialScene: data.initialScene,
      scenes: data.scenes,
      characters: data.characters,
      objects: data.objects,
    }),
    animation: animationProjectView(data),
    sequences: data.sequences,
  });
}

function animationProjectView(data: GameProjectData): AnimationProjectView {
  return Object.freeze({
    characters: data.characters,
    objects: data.objects,
    scenes: data.scenes,
    ...(data.playerCharacter === undefined ? {} : { playerCharacter: data.playerCharacter }),
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
        operationDiagnostics.push({
          code: "reference.variable",
          family: "reference",
          owner: "game-project",
          path: operationPath,
          message: `Game Variable '${operation.variable}' does not exist.`,
        });
      } else if (operation.type === "start-sequence") {
        operationDiagnostics.push(...validateSequenceStartReference(
          operation.sequence,
          operationPath,
          sequences,
        ));
      } else if (operation.type === "set-appearance") {
        operationDiagnostics.push(...validateAppearanceOperationReference(
          operation,
          operationPath,
          { characters, objects, scenes: input.scenes },
        ));
      }
    });
    return operationDiagnostics;
  };
  const line = (value: Line | undefined, path: string) => {
    diagnostics.push(...validateLineReferences(value, path, {
      characterExists: (character) => character in characters,
      appearancesForCharacter: (character) =>
        Object.values(characters[character]?.appearances ?? {}),
    }));
  };
  const noun = (
    value: NounDefinition | undefined,
    path: string,
    target?: HotspotTarget,
    destinationScenes?: readonly string[],
  ) => {
    if (!value) return;
    diagnostics.push(...validateNounDefinition(value, path));
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
    }
    diagnostics.push(...validateArrivalSequenceReferences(
      sceneId,
      scene.arrivalSequences,
      sequences,
    ));
    scene.arrivalSequences?.forEach((rule, ruleIndex) => {
      const base = `scenes.${sceneId}.arrivalSequences[${ruleIndex}]`;
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
      diagnostics.push(...validateWalkingAppearanceRoles(
        character.appearances,
        `characters.${characterId}.appearances`,
        "Character",
      ));
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
  diagnostics.push(...validateHUDProjectReferences(
    input.hudTheme,
    new Set(Object.keys(characters)),
  ));

}
