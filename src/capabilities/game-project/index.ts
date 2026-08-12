import {
  AuthoringError,
  freezeAuthoringDiagnostics,
  type AuthoringDiagnostic,
} from "./diagnostics";
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
  isLearnNarrativeFactOperation,
  validateKnowledgeDrivenDialogueProject,
  validateLearnNarrativeFactOperation,
  type KnowledgeDrivenDialogueProjectView,
  type LearnNarrativeFactOperation,
  type NarrativeFactDefinition,
} from "../dialogue";
export type {
  CharacterDialogueDefinition,
  CharacterKnowledgeDefinition,
  NarrativeFactDefinition,
  LearnNarrativeFactOperation,
  OpenDisclosure,
} from "../dialogue";
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
  type ApproachPoint,
  type ArrivalSequenceRule,
  type BackgroundRegionAppearance,
  type CharacterDefinition,
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
  | InventoryOperation
  | LearnNarrativeFactOperation;

/** Ordinary declarative Game Project data. Registry keys are definition identities. */
export interface GameProject {
  readonly identity: string;
  readonly version: string;
  readonly logicalResolution: LogicalResolution;
  readonly scenes: Readonly<Record<string, SceneDefinition>>;
  readonly narrativeFacts?: Readonly<Record<string, NarrativeFactDefinition>>;
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

declare const compiledGameProjectBrand: unique symbol;

/** @internal An isolated, immutable, fully validated Game Project snapshot. */
export interface CompiledGameProject {
  readonly [compiledGameProjectBrand]: true;
}

/** Fully expanded representation kept inside the Game Project implementation. */
interface GameProjectData
  extends Omit<GameProject, "scenes" | "characters" | "objects" | "sequences" | "variables" | "narrativeFacts"> {
  readonly scenes: Readonly<Record<string, ResolvedSceneDefinition>>;
  readonly letterboxColor: string;
  readonly characters: Readonly<Record<string, CharacterDefinition>>;
  readonly objects: Readonly<Record<string, ObjectDefinition>>;
  readonly sequences: Readonly<Record<string, SequenceDefinition>>;
  readonly variables: Readonly<Record<string, boolean>>;
  readonly narrativeFacts: Readonly<Record<string, NarrativeFactDefinition>>;
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
  readonly dialogue: KnowledgeDrivenDialogueProjectView;
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
  readonly dialogue: KnowledgeDrivenDialogueProjectView;
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

const projectData = new WeakMap<CompiledGameProject, GameProjectData>();

/** @internal Ordinary result of compiling one authored Game Project snapshot. */
export type GameProjectCompilation =
  | { readonly ok: true; readonly project: CompiledGameProject }
  | { readonly ok: false; readonly diagnostics: readonly AuthoringDiagnostic[] };

/** @internal Validates and compiles one browser-independent Game Project snapshot. */
export function compileGameProject(input: GameProject): GameProjectCompilation {
  const diagnostics: AuthoringDiagnostic[] = [];
  const characters = input.characters ?? {};
  const objects = input.objects ?? {};
  const sequences = input.sequences ?? {};
  const variables = input.variables ?? {};
  const narrativeFacts = input.narrativeFacts ?? {};
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
  diagnostics.push(...validateKnowledgeDrivenDialogueProject({
    narrativeFacts,
    characters,
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
  if (diagnostics.length > 0) {
    return Object.freeze({
      ok: false,
      diagnostics: freezeAuthoringDiagnostics(diagnostics),
    });
  }

  const cloned = cloneAuthoredValue(input);
  const scenes = Object.fromEntries(Object.entries(cloned.scenes).map(([sceneId, scene]) => [
    sceneId,
    { ...scene, size: { ...(scene.size ?? cloned.logicalResolution) } },
  ])) as Readonly<Record<string, ResolvedSceneDefinition>>;
  const data = deepFreeze({
    ...cloned,
    scenes,
    characters: cloned.characters ?? {},
    objects: cloned.objects ?? {},
    sequences: cloned.sequences ?? {},
    variables: cloned.variables ?? {},
    narrativeFacts: cloned.narrativeFacts ?? {},
    letterboxColor: cloned.letterboxColor ?? "#000000",
  });
  const project = Object.freeze({}) as CompiledGameProject;
  projectData.set(project, data);
  return Object.freeze({ ok: true, project });
}

function requireGameProjectData(project: CompiledGameProject): GameProjectData {
  const data = projectData.get(project);
  if (!data) throw new TypeError("Expected a compiled Game Project.");
  return data;
}

/** @internal Composes the capability views needed by Game Session. */
export function getGameSessionCompositionView(project: CompiledGameProject): GameSessionCompositionView {
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
    dialogue: dialogueProjectView(data),
  });
}

/** @internal Composes distinct views for browser technical adapters. */
export function getBrowserProjectView(project: CompiledGameProject): BrowserProjectView {
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
export function getSaveCompositionView(project: CompiledGameProject): SaveCompositionView {
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
    dialogue: dialogueProjectView(data),
  });
}

function dialogueProjectView(data: GameProjectData): KnowledgeDrivenDialogueProjectView {
  return Object.freeze({
    narrativeFacts: data.narrativeFacts,
    characters: data.characters,
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
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

function cloneAuthoredValue<T>(value: T, seen = new WeakMap<object, object>()): T {
  if (value instanceof URL) return cloneImmutableURL(value) as T;
  if (value === null || typeof value !== "object") return value;
  const existing = seen.get(value);
  if (existing) return existing as T;
  if (Array.isArray(value)) {
    const clone: unknown[] = [];
    seen.set(value, clone);
    clone.push(...value.map((child) => cloneAuthoredValue(child, seen)));
    return clone as T;
  }
  const clone: Record<string, unknown> = {};
  seen.set(value, clone);
  for (const [key, child] of Object.entries(value)) {
    Object.defineProperty(clone, key, {
      value: cloneAuthoredValue(child, seen),
      enumerable: true,
      configurable: true,
      writable: true,
    });
  }
  return clone as T;
}

const urlSearchParamsMutators = new Set<PropertyKey>(["append", "delete", "set", "sort"]);

function cloneImmutableURL(value: URL): URL {
  const target = new URL(value.href);
  const searchParamsTarget = new URLSearchParams(target.searchParams);
  let searchParams: URLSearchParams;
  searchParams = new Proxy(searchParamsTarget, {
    get(innerTarget, property) {
      if (urlSearchParamsMutators.has(property)) return immutableURLMutation;
      if (property === "forEach") {
        return (
          callback: (value: string, key: string, parent: URLSearchParams) => void,
          thisArg?: unknown,
        ) => innerTarget.forEach((entryValue, key) => {
          callback.call(thisArg, entryValue, key, searchParams);
        });
      }
      const member = Reflect.get(innerTarget, property, innerTarget) as unknown;
      return typeof member === "function" ? member.bind(innerTarget) : member;
    },
    set: immutableURLMutation,
  });
  Object.freeze(searchParams);
  const clone = new Proxy(target, {
    get(innerTarget, property) {
      if (property === "searchParams") return searchParams;
      const member = Reflect.get(innerTarget, property, innerTarget) as unknown;
      return typeof member === "function" ? member.bind(innerTarget) : member;
    },
    set: immutableURLMutation,
  });
  return Object.freeze(clone);
}

function immutableURLMutation(): never {
  throw new TypeError("Compiled URL references are immutable.");
}

function validateProjectDefinitions(
  input: GameProject,
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
  const dialogueReferences = { narrativeFacts: input.narrativeFacts ?? {}, characters };
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
      if (isLearnNarrativeFactOperation(operation)) {
        operationDiagnostics.push(...validateLearnNarrativeFactOperation(
          operation,
          operationPath,
          dialogueReferences,
        ));
        return;
      }
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
