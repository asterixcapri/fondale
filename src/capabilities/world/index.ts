import {
  AuthoringError,
  type AuthoringDiagnostic,
  type LogicalResolution,
} from "../game-project";
import {
  validateAppearance,
  validateAppearanceSet,
  type Appearance,
} from "../animation";
import type { InteractionCondition, NounDefinition } from "../interaction";
import type { PassageDirection } from "../hud";
import type { DirectionStep, DirectedSubject, MotionDirection } from "../sequence";
import { isInside, navigationPath, nearestPoint } from "./geometry";

export { isInside, navigationPath, nearestPoint } from "./geometry";

/** A point measured in logical Scene Space pixels. */
export interface Point {
  readonly x: number;
  readonly y: number;
}

/** The complete two-dimensional extent of one Scene Space. */
export interface SceneSize {
  readonly width: number;
  readonly height: number;
}

/** The four authored facings used by directional Character walking. */
export type Facing = "front" | "back" | "left" | "right";

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
      family: "definition", owner: "world",
      path: "initialGroundPoint",
      message: "A Character Ground Point must use finite Scene Space coordinates.",
    });
  }
  if (!Number.isFinite(input.movementSpeed) || input.movementSpeed <= 0) {
    diagnostics.push({
      code: "definition.character.movement-speed",
      family: "definition", owner: "world",
      path: "movementSpeed",
      message: "Character movement speed must be a positive finite number.",
    });
  }
  diagnostics.push(...validateAppearanceSet(input.appearances, {
    path: "appearances",
    initialAppearance: input.initialAppearance,
    subject: "Character",
  }));
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
  if (!Number.isFinite(input.initialGroundPoint.x) || !Number.isFinite(input.initialGroundPoint.y)) {
    diagnostics.push({
      code: "definition.point.finite",
      family: "definition", owner: "world",
      path: "initialGroundPoint",
      message: "An Object Ground Point must use finite Scene Space coordinates.",
    });
  }
  diagnostics.push(...validateAppearanceSet(input.appearances, {
    path: "appearances",
    initialAppearance: input.initialAppearance,
    subject: "Object",
  }));
  if (diagnostics.length > 0) throw new AuthoringError(diagnostics);
  return deepFreeze({
    ...input,
    initialGroundPoint: { ...input.initialGroundPoint },
    appearances: { ...input.appearances },
  });
}

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

/** A Scene whose default Size has been resolved during composition. */
export interface ResolvedSceneDefinition extends Omit<SceneDefinition, "size"> {
  readonly size: SceneSize;
}

/** Creates and freezes one Scene after validating its local geometry. */
export function defineScene(input: SceneInput): SceneDefinition {
  const diagnostics: AuthoringDiagnostic[] = [];

  for (const axis of ["width", "height"] as const) {
    const value = input.size?.[axis];
    if (input.size && (!Number.isInteger(value) || value! <= 0)) {
      diagnostics.push({
        code: "definition.scene-size.positive-integer",
        family: "definition", owner: "world",
        path: `size.${axis}`,
        message: "Scene Size dimensions must be positive integers.",
      });
    }
  }

  input.walkableRegion.forEach((point, index) => {
    if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) {
      diagnostics.push({
        code: "definition.point.finite",
        family: "definition", owner: "world",
        path: `walkableRegion[${index}]`,
        message: "Scene Space coordinates must be finite numbers.",
        suggestion: "Replace NaN and infinite coordinates with finite logical pixels.",
      });
    }
  });

  if (input.walkableRegion.length < 3) {
    diagnostics.push({
      code: "definition.polygon.vertices",
      family: "definition", owner: "world",
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
        family: "reference", owner: "animation",
        path: `scenery.${sceneryId}.initialAppearance`,
        message: `Appearance '${scenery.initialAppearance}' is not defined on this Scenery.`,
      });
    }
    if (!Number.isFinite(scenery.baseline)) {
      diagnostics.push({
        code: "definition.scenery.baseline",
        family: "definition", owner: "world",
        path: `scenery.${sceneryId}.baseline`,
        message: "A Scenery baseline must be a finite Scene Space coordinate.",
      });
    }
    if (scenery.position && (!Number.isFinite(scenery.position.x) || !Number.isFinite(scenery.position.y))) {
      diagnostics.push({
        code: "definition.point.finite",
        family: "definition", owner: "world",
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
        diagnostics.push(...validateAppearance(
          appearance,
          `scenery.${sceneryId}.appearances.${appearanceId}`,
        ));
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

export interface CharacterState {
  scene: string;
  groundPoint: Point;
  facing: Facing;
  appearance: string;
}

export type ObjectLocation =
  | { kind: "scene"; scene: string; groundPoint: Point }
  | { kind: "inventory" }
  | { kind: "consumed" };

export interface ObjectState {
  location: ObjectLocation;
  appearance: string;
}

export interface WorldState {
  currentScene: string;
  characters: Record<string, CharacterState>;
  scenery: Record<string, Record<string, string>>;
  objects: Record<string, ObjectState>;
}

export interface WorldProjectView {
  readonly initialScene: string;
  readonly scenes: Readonly<Record<string, ResolvedSceneDefinition>>;
  readonly characters: Readonly<Record<string, CharacterDefinition>>;
  readonly objects: Readonly<Record<string, ObjectDefinition>>;
}

export interface WorldDefinitionView {
  readonly logicalResolution: LogicalResolution;
  readonly initialScene: string;
  readonly playerCharacter?: string;
  readonly scenes: Readonly<Record<string, SceneDefinition>>;
  readonly characters: Readonly<Record<string, CharacterDefinition>>;
  readonly objects: Readonly<Record<string, ObjectDefinition>>;
}

export interface WorldDefinitionQueries {
  hasSubject(scene: string | undefined, subject: DirectedSubject): boolean;
  hasDirectedSubject(
    scene: string,
    subject: DirectedSubject,
    availableObjects: ReadonlySet<string>,
  ): boolean;
  pointInScene(scene: string, point: Point): boolean;
  validateMotion(
    scene: string,
    direction: MotionDirection,
    path: string,
    context: MotionValidationContext,
  ): readonly AuthoringDiagnostic[];
  validatePlacement(
    scenes: readonly string[],
    point: Point,
    path: string,
  ): readonly AuthoringDiagnostic[];
}

/** Creates the narrow spatial queries used while other capabilities validate references. */
export function createWorldDefinitionQueries(view: WorldDefinitionView): WorldDefinitionQueries {
  const pointInScene = (sceneId: string, point: Point): boolean => {
    const scene = view.scenes[sceneId];
    return scene !== undefined && pointInSceneSize(
      resolvedSceneSize(scene, view.logicalResolution),
      point,
    );
  };
  return {
    hasSubject(scene, subject) {
      if (subject.kind === "character") return subject.character in view.characters;
      if (subject.kind === "object") return subject.object in view.objects;
      return scene !== undefined && subject.scenery in (view.scenes[scene]?.scenery ?? {});
    },
    hasDirectedSubject(scene, subject, availableObjects) {
      if (subject.kind === "character") {
        const character = view.characters[subject.character];
        return character !== undefined && (
          subject.character === view.playerCharacter || character.initialScene === scene
        );
      }
      if (subject.kind === "object") {
        return subject.object in view.objects && availableObjects.has(subject.object);
      }
      return subject.scenery in (view.scenes[scene]?.scenery ?? {});
    },
    pointInScene,
    validateMotion(sceneId, direction, path, context) {
      const diagnostics: AuthoringDiagnostic[] = [];
      const scene = view.scenes[sceneId];
      if (!scene) return diagnostics;
      if (!context.subjectBelongsToScene) {
        diagnostics.push(worldReference(
          "reference.sequence.subject-scene",
          `${path}.subject`,
          "A Motion subject must belong to the Sequence Scene.",
        ));
      }
      direction.path.forEach((point, pointIndex) => {
        if (!pointInScene(sceneId, point)) {
          diagnostics.push(worldDefinition(
            "definition.motion.bounds",
            `${path}.path[${pointIndex}]`,
            "A Motion path point must remain inside the Sequence Scene Size.",
          ));
        } else if (
          direction.subject.kind === "character" &&
          !pointInPolygonOrBoundary(scene.walkableRegion, point)
        ) {
          diagnostics.push(worldDefinition(
            "definition.motion.walkable",
            `${path}.path[${pointIndex}]`,
            "A Character Motion destination must lie in the Walkable Region.",
          ));
        }
      });
      if (
        direction.subject.kind === "scenery" &&
        !continuesSceneryMotion(direction, context.nextStep)
      ) {
        const rest = scene.scenery?.[direction.subject.scenery]?.position;
        const destination = direction.path.at(-1);
        if (!rest || !destination || Math.hypot(
          rest.x - destination.x,
          rest.y - destination.y,
        ) > 1e-8) {
          diagnostics.push(worldDefinition(
            "definition.motion.scenery-rest",
            `${path}.path`,
            "A Scenery Motion must end at its authored resting position.",
          ));
        }
      }
      return diagnostics;
    },
    validatePlacement(scenes, point, path) {
      return scenes.some((scene) => !pointInScene(scene, point))
        ? [worldDefinition(
            "definition.operation.ground-point",
            path,
            "A placed Object Ground Point must be finite and inside the destination Scene Size.",
          )]
        : [];
    },
  };
}

export interface MotionValidationContext {
  readonly subjectBelongsToScene: boolean;
  readonly nextStep?: DirectionStep;
}

/** Reports local Motion authoring invariants owned by World. */
export function validateMotionDirection(
  direction: MotionDirection,
  path: string,
): readonly AuthoringDiagnostic[] {
  const diagnostics: AuthoringDiagnostic[] = [];
  direction.path.forEach((point, pointIndex) => {
    if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) {
      diagnostics.push(worldDefinition(
        "definition.point.finite",
        `${path}.path[${pointIndex}]`,
        "A Motion path must use finite Scene Space coordinates.",
      ));
    }
  });
  if (direction.path.length === 0) {
    diagnostics.push(worldDefinition(
      "definition.motion.path",
      `${path}.path`,
      "A Motion needs at least one destination point.",
    ));
  }
  if (direction.subject.kind === "character") {
    if (direction.path.length !== 1) {
      diagnostics.push(worldDefinition(
        "definition.motion.character-path",
        `${path}.path`,
        "A Character Motion declares one navigation destination.",
      ));
    }
    if (direction.duration !== undefined) {
      diagnostics.push(worldDefinition(
        "definition.motion.character-duration",
        `${path}.duration`,
        "Character Motion duration is derived from navigation and movement speed.",
      ));
    }
  } else if (!Number.isFinite(direction.duration) || direction.duration! <= 0) {
    diagnostics.push(worldDefinition(
      "definition.motion.duration",
      `${path}.duration`,
      "Object and Scenery Motion needs a positive finite duration.",
    ));
  }
  return diagnostics;
}

/** Reports composed geometry, membership, and spatial-reference errors owned by World. */
export function validateWorldProject(view: WorldDefinitionView): readonly AuthoringDiagnostic[] {
  const diagnostics: AuthoringDiagnostic[] = [];
  if (!(view.initialScene in view.scenes)) {
    diagnostics.push(worldReference(
      "reference.scene.initial",
      "initialScene",
      `Scene '${view.initialScene}' does not exist.`,
    ));
  }
  if (view.playerCharacter !== undefined && !(view.playerCharacter in view.characters)) {
    diagnostics.push(worldReference(
      "reference.character.player",
      "playerCharacter",
      `Character '${view.playerCharacter}' does not exist.`,
    ));
  }

  for (const [sceneId, scene] of Object.entries(view.scenes)) {
    const size = resolvedSceneSize(scene, view.logicalResolution);
    for (const axis of ["width", "height"] as const) {
      if (size[axis] < view.logicalResolution[axis]) {
        diagnostics.push({
          code: "definition.scene-size.viewport-minimum",
          family: "definition", owner: "world",
          path: `scenes.${sceneId}.size.${axis}`,
          message: `Scene Size ${axis} must be at least the Logical Resolution ${axis}.`,
        });
      }
    }
    const inScene = (point: Point) => pointInSceneSize(size, point);
    scene.walkableRegion.forEach((point, index) => {
      if (!inScene(point)) {
        diagnostics.push({
          code: "definition.scene-space.bounds",
          family: "definition", owner: "world",
          path: `scenes.${sceneId}.walkableRegion[${index}]`,
          message: "Scene geometry must remain inside the Scene Size.",
        });
      }
    });
    scene.perspectiveScale?.forEach((stop, index) => {
      if (!Number.isFinite(stop.y) || !Number.isFinite(stop.scale) ||
          stop.scale <= 0 || stop.y < 0 || stop.y > size.height) {
        diagnostics.push({
          code: "definition.perspective-scale.stop",
          family: "definition", owner: "world",
          path: `scenes.${sceneId}.perspectiveScale[${index}]`,
          message: "Perspective Scale stops need an in-frame y and a positive finite scale.",
        });
      }
    });
    for (const [sceneryId, scenery] of Object.entries(scene.scenery ?? {})) {
      if (scenery.baseline < 0 || scenery.baseline > size.height) {
        diagnostics.push({
          code: "definition.scene-space.bounds",
          family: "definition", owner: "world",
          path: `scenes.${sceneId}.scenery.${sceneryId}.baseline`,
          message: "A Scenery Baseline must remain inside the Scene Size.",
        });
      }
      if (scenery.position && !inScene(scenery.position)) {
        diagnostics.push({
          code: "definition.scene-space.bounds",
          family: "definition", owner: "world",
          path: `scenes.${sceneId}.scenery.${sceneryId}.position`,
          message: "Scenery positions must remain inside the Scene Size.",
        });
      }
      for (const [appearanceId, appearance] of Object.entries(scenery.appearances)) {
        if ("kind" in appearance && appearance.kind === "background-region") {
          validatePolygonBounds(
            appearance.area,
            `scenes.${sceneId}.scenery.${sceneryId}.appearances.${appearanceId}.area`,
            inScene,
            diagnostics,
          );
        }
      }
    }
    for (const [entranceId, entrance] of Object.entries(scene.entrances ?? {})) {
      const path = `scenes.${sceneId}.entrances.${entranceId}.groundPoint`;
      if (!inScene(entrance.groundPoint)) {
        diagnostics.push(worldDefinition("definition.scene-space.bounds", path, "Scene Entrance Ground Points must remain inside the Scene Size."));
      } else if (!pointInPolygonOrBoundary(scene.walkableRegion, entrance.groundPoint)) {
        diagnostics.push(worldDefinition("definition.entrance.walkable", path, "A Scene Entrance Ground Point must lie in the Walkable Region."));
      }
    }
    scene.arrivalSequences?.forEach((rule, ruleIndex) => {
      const base = `scenes.${sceneId}.arrivalSequences[${ruleIndex}]`;
      if (rule.entrance !== undefined && !(rule.entrance in (scene.entrances ?? {}))) {
        diagnostics.push(worldReference(
          "reference.arrival.entrance",
          `${base}.entrance`,
          `Scene Entrance '${rule.entrance}' does not exist.`,
        ));
      }
      scene.arrivalSequences!.slice(0, ruleIndex).forEach((previous, previousIndex) => {
        const entrancesOverlap = previous.entrance === undefined || rule.entrance === undefined ||
          previous.entrance === rule.entrance;
        const conditionsDisjoint = previous.when !== undefined && rule.when !== undefined &&
          "variable" in previous.when && "variable" in rule.when &&
          previous.when.variable === rule.when.variable && previous.when.equals !== rule.when.equals;
        if (entrancesOverlap && !conditionsDisjoint) {
          diagnostics.push(worldDefinition(
            "definition.arrival-sequence.ambiguous",
            base,
            `Arrival Sequence rules ${previousIndex} and ${ruleIndex} can both apply to the same arrival.`,
          ));
        }
      });
    });
    scene.hotspots?.forEach((hotspot, index) => {
      const base = `scenes.${sceneId}.hotspots[${index}]`;
      validatePolygonBounds(hotspot.area, `${base}.area`, inScene, diagnostics);
      validateApproach(scene, hotspot.approach, base, inScene, diagnostics);
      const targetExists = hotspot.target.kind === "background" ||
        hotspot.target.kind === "character" && hotspot.target.character in view.characters ||
        hotspot.target.kind === "object" && hotspot.target.object in view.objects ||
        hotspot.target.kind === "scenery" && hotspot.target.scenery in (scene.scenery ?? {});
      if (!targetExists) {
        diagnostics.push(worldReference(
          "reference.hotspot.target",
          `${base}.target`,
          "Hotspot target does not exist.",
        ));
      }
    });
    scene.passages?.forEach((passage, index) => {
      const base = `scenes.${sceneId}.passages[${index}]`;
      validatePolygonBounds(passage.area, `${base}.area`, inScene, diagnostics);
      validateApproach(scene, passage.approach, base, inScene, diagnostics);
      const destination = view.scenes[passage.destination.scene];
      if (!destination) {
        diagnostics.push(worldReference(
          "reference.passage.scene",
          `${base}.destination.scene`,
          `Scene '${passage.destination.scene}' does not exist.`,
        ));
      } else if (!(passage.destination.entrance in (destination.entrances ?? {}))) {
        diagnostics.push(worldReference(
          "reference.passage.entrance",
          `${base}.destination.entrance`,
          `Scene Entrance '${passage.destination.entrance}' does not exist.`,
        ));
      }
    });
  }

  for (const [characterId, character] of Object.entries(view.characters)) {
    const scene = view.scenes[character.initialScene];
    if (!scene) {
      diagnostics.push(worldReference(
        "reference.character.initial-scene",
        `characters.${characterId}.initialScene`,
        `Scene '${character.initialScene}' does not exist.`,
      ));
      continue;
    }
    const path = `characters.${characterId}.initialGroundPoint`;
    if (!pointInSceneSize(resolvedSceneSize(scene, view.logicalResolution), character.initialGroundPoint)) {
      diagnostics.push(worldDefinition("definition.scene-space.bounds", path, "Character Ground Points must remain inside the Scene Size."));
    } else if (!pointInPolygonOrBoundary(scene.walkableRegion, character.initialGroundPoint)) {
      diagnostics.push(worldDefinition("definition.character.walkable", path, "A Character Ground Point must lie in the Scene Walkable Region."));
    }
  }
  for (const [objectId, object] of Object.entries(view.objects)) {
    const scene = view.scenes[object.initialScene];
    if (!scene) {
      diagnostics.push(worldReference(
        "reference.object.initial-scene",
        `objects.${objectId}.initialScene`,
        `Scene '${object.initialScene}' does not exist.`,
      ));
      continue;
    }
    if (!pointInSceneSize(resolvedSceneSize(scene, view.logicalResolution), object.initialGroundPoint)) {
      diagnostics.push(worldDefinition(
        "definition.scene-space.bounds",
        `objects.${objectId}.initialGroundPoint`,
        "Object Ground Points must remain inside the Scene Size.",
      ));
    }
  }
  return diagnostics;
}

export type WorldTarget =
  | { readonly kind: "hotspot"; readonly index: number }
  | { readonly kind: "passage"; readonly index: number };

export interface WorldHotspot {
  readonly index: number;
  readonly definition: HotspotDefinition;
}

export interface WorldPassage {
  readonly index: number;
  readonly definition: ScenePassage;
}

export type WorldConditionMatches = (condition: InteractionCondition | undefined) => boolean;

export interface WorldSceneryPresentation {
  readonly id: string;
  readonly appearanceName: string;
  readonly appearance: SceneryAppearance;
  readonly baseline: number;
  readonly position?: Point;
}

export interface WorldObjectPresentation {
  readonly id: string;
  readonly appearanceName: string;
  readonly groundPoint: Point;
  readonly scale: number;
}

export interface WorldCharacterPresentation extends WorldObjectPresentation {
  readonly facing: Facing;
}

export interface WorldPresentation {
  readonly scene: string;
  readonly background: URL | string;
  readonly size: SceneSize;
  readonly scenery: readonly WorldSceneryPresentation[];
  readonly objects: readonly WorldObjectPresentation[];
  readonly characters: readonly WorldCharacterPresentation[];
}

export interface CharacterAdvanceRequest {
  readonly character: string;
  readonly destination: Point;
  readonly finalFacing?: Facing;
  readonly speedMultiplier?: number;
}

export interface CharacterAdvanceResult {
  readonly state: WorldState;
  readonly complete: boolean;
}

export interface MotionTiming {
  readonly localTick: number;
  readonly durationTicks: number;
}

export interface MotionAdvanceResult extends CharacterAdvanceResult {
  readonly point?: Point;
}

export interface PassageTransitionRequest {
  readonly passage: number;
  readonly character: string;
}

export type WorldStateConditionMatches = (
  condition: InteractionCondition | undefined,
  state: Readonly<WorldState>,
) => boolean;

export type PassageTransitionResult =
  | { readonly status: "unavailable" }
  | { readonly status: "invalid"; readonly message: string }
  | {
      readonly status: "transitioned";
      readonly state: WorldState;
      readonly scene: string;
      readonly arrivalSequence?: string;
    };

/** World-owned spatial policy over one validated Game Project view. */
export interface World {
  initialState(): WorldState;
  /** Validates the spatial invariants of restored committed World state. */
  isValidState(state: unknown): state is WorldState;
  hasCharacter(character: string): boolean;
  hitTest(state: Readonly<WorldState>, point: Point, matches: WorldConditionMatches): WorldTarget | null;
  isHotspotAvailable(
    state: Readonly<WorldState>,
    hotspot: HotspotDefinition,
    matches: WorldConditionMatches,
  ): boolean;
  hotspots(state: Readonly<WorldState>, matches: WorldConditionMatches): readonly WorldHotspot[];
  passages(state: Readonly<WorldState>, matches: WorldConditionMatches): readonly WorldPassage[];
  approach(
    state: Readonly<WorldState>,
    target: WorldTarget,
    matches: WorldConditionMatches,
  ): ApproachPoint | undefined;
  navigationDestination(state: Readonly<WorldState>, requested: Point): Point;
  advanceCharacter(
    state: Readonly<WorldState>,
    request: CharacterAdvanceRequest,
  ): CharacterAdvanceResult;
  advanceMotion(
    state: Readonly<WorldState>,
    direction: MotionDirection,
    timing: MotionTiming,
  ): MotionAdvanceResult;
  motionPoint(direction: MotionDirection, timing: MotionTiming): Point | undefined;
  transitionPassage(
    state: Readonly<WorldState>,
    request: PassageTransitionRequest,
    matches: WorldStateConditionMatches,
  ): PassageTransitionResult;
  hasDirectedSubject(state: Readonly<WorldState>, subject: DirectedSubject): boolean;
  pointForSubject(state: Readonly<WorldState>, subject: DirectedSubject): Point | undefined;
  canPlaceObject(scene: string, point: Point): boolean;
  presentation(
    state: Readonly<WorldState>,
    directedSceneryPoint?: (scenery: string) => Point | undefined,
  ): WorldPresentation;
}

/** Creates the World module from only the definitions needed for spatial policy. */
export function createWorld(view: WorldProjectView): World {
  const availableHotspots = (
    state: Readonly<WorldState>,
    matches: WorldConditionMatches,
  ): readonly WorldHotspot[] => {
    const scene = view.scenes[state.currentScene];
    return (scene?.hotspots ?? []).flatMap((definition, index) => {
      if (!isHotspotAvailable(state, definition, matches)) return [];
      return [{ index, definition: structuredClone(definition) }];
    });
  };
  const availablePassages = (
    state: Readonly<WorldState>,
    matches: WorldConditionMatches,
  ): readonly WorldPassage[] => {
    const scene = view.scenes[state.currentScene];
    return (scene?.passages ?? []).flatMap((definition, index) =>
      matches(definition.when)
        ? [{ index, definition: structuredClone(definition) }]
        : [],
    );
  };

  return {
    initialState() {
      return {
        currentScene: view.initialScene,
        characters: Object.fromEntries(
          Object.entries(view.characters).map(([id, definition]) => [
            id,
            {
              scene: definition.initialScene,
              groundPoint: { ...definition.initialGroundPoint },
              facing: definition.initialFacing,
              appearance: definition.initialAppearance,
            },
          ]),
        ),
        scenery: Object.fromEntries(
          Object.entries(view.scenes).map(([sceneId, scene]) => [
            sceneId,
            Object.fromEntries(
              Object.entries(scene.scenery ?? {}).map(([id, definition]) => [
                id,
                definition.initialAppearance,
              ]),
            ),
          ]),
        ),
        objects: Object.fromEntries(
          Object.entries(view.objects).map(([id, definition]) => [
            id,
            {
              location: {
                kind: "scene" as const,
                scene: definition.initialScene,
                groundPoint: { ...definition.initialGroundPoint },
              },
              appearance: definition.initialAppearance,
            },
          ]),
        ),
      };
    },
    isValidState(value): value is WorldState {
      if (!isRecord(value) || typeof value.currentScene !== "string" ||
          !(value.currentScene in view.scenes) ||
          !isRecord(value.characters) || !sameRecordKeys(value.characters, view.characters) ||
          !isRecord(value.scenery) || !sameRecordKeys(value.scenery, view.scenes) ||
          !isRecord(value.objects) || !sameRecordKeys(value.objects, view.objects)) return false;
      for (const [characterId, candidate] of Object.entries(value.characters)) {
        if (!isRecord(candidate) || !hasExactRecordKeys(
          candidate,
          ["scene", "groundPoint", "facing", "appearance"],
        )) return false;
        const character = candidate as unknown as CharacterState;
        const scene = view.scenes[character.scene];
        if (
          !scene ||
          typeof character.appearance !== "string" ||
          !["front", "back", "left", "right"].includes(character.facing) ||
          !isPoint(character.groundPoint) ||
          !pointInSceneSize(scene.size, character.groundPoint) ||
          !pointInPolygonOrBoundary(scene.walkableRegion, character.groundPoint)
        ) return false;
        if (!(characterId in view.characters)) return false;
      }
      for (const [sceneId, candidate] of Object.entries(value.scenery)) {
        const definitions = view.scenes[sceneId]?.scenery ?? {};
        if (!isRecord(candidate) || !sameRecordKeys(candidate, definitions) ||
            !Object.values(candidate).every((appearance) => typeof appearance === "string")) {
          return false;
        }
      }
      for (const candidate of Object.values(value.objects)) {
        if (!isRecord(candidate) || !hasExactRecordKeys(candidate, ["location", "appearance"]) ||
            typeof candidate.appearance !== "string" || !isRecord(candidate.location) ||
            typeof candidate.location.kind !== "string") return false;
        const object = candidate as unknown as ObjectState;
        if (object.location.kind === "inventory" || object.location.kind === "consumed") {
          if (!hasExactRecordKeys(candidate.location, ["kind"])) return false;
          continue;
        }
        if (object.location.kind !== "scene" ||
            !hasExactRecordKeys(candidate.location, ["kind", "scene", "groundPoint"]) ||
            typeof object.location.scene !== "string" || !isPoint(object.location.groundPoint)) {
          return false;
        }
        const scene = view.scenes[object.location.scene];
        if (!scene || !pointInSceneSize(scene.size, object.location.groundPoint)) return false;
      }
      return true;
    },
    hasCharacter(character) {
      return character in view.characters;
    },
    hitTest(state, point, matches) {
      const hotspot = availableHotspots(state, matches)
        .findLast(({ definition }) => isInside(definition.area, point));
      if (hotspot) return { kind: "hotspot", index: hotspot.index };
      const passage = availablePassages(state, matches)
        .findLast(({ definition }) => isInside(definition.area, point));
      return passage ? { kind: "passage", index: passage.index } : null;
    },
    isHotspotAvailable,
    hotspots: availableHotspots,
    passages: availablePassages,
    approach(state, target, matches) {
      const entry = target.kind === "hotspot"
        ? availableHotspots(state, matches).find(({ index }) => index === target.index)
        : availablePassages(state, matches).find(({ index }) => index === target.index);
      return entry ? structuredClone(entry.definition.approach) : undefined;
    },
    navigationDestination(state, requested) {
      const scene = view.scenes[state.currentScene];
      return scene ? nearestPoint(scene.walkableRegion, requested) : { ...requested };
    },
    advanceCharacter(state, request) {
      const next = cloneWorldState(state);
      const character = next.characters[request.character];
      const definition = view.characters[request.character];
      const scene = view.scenes[state.currentScene];
      if (!character || !definition || !scene || character.scene !== state.currentScene) {
        return { state: next, complete: false };
      }
      const route = navigationPath(scene.walkableRegion, character.groundPoint, request.destination);
      const waypoint = route[1] ?? request.destination;
      const dx = waypoint.x - character.groundPoint.x;
      const dy = waypoint.y - character.groundPoint.y;
      const distance = Math.hypot(dx, dy);
      const travel = definition.movementSpeed / 60 * (request.speedMultiplier ?? 1);
      if (distance > 1e-8) character.facing = facingAlong(dx, dy);
      if (distance > travel) {
        character.groundPoint = {
          x: character.groundPoint.x + dx / distance * travel,
          y: character.groundPoint.y + dy / distance * travel,
        };
        return { state: next, complete: false };
      }
      const atDestination = Math.hypot(
        request.destination.x - waypoint.x,
        request.destination.y - waypoint.y,
      ) <= 1e-8;
      character.groundPoint = atDestination ? { ...request.destination } : { ...waypoint };
      if (atDestination && request.finalFacing) character.facing = request.finalFacing;
      return { state: next, complete: atDestination };
    },
    advanceMotion(state, direction, timing) {
      if (timing.localTick <= 0) return { state: cloneWorldState(state), complete: false };
      if (direction.subject.kind === "character") {
        return this.advanceCharacter(state, {
          character: direction.subject.character,
          destination: direction.path[0]!,
          ...(direction.facing ? { finalFacing: direction.facing } : {}),
        });
      }
      const point = motionPoint(direction, timing)!;
      const complete = timing.durationTicks === 0 || timing.localTick >= timing.durationTicks;
      const next = cloneWorldState(state);
      if (direction.subject.kind === "object") {
        const object = next.objects[direction.subject.object];
        if (object?.location.kind !== "scene" || object.location.scene !== state.currentScene) {
          return { state: next, complete: false };
        }
        object.location.groundPoint = { ...point };
      }
      return {
        state: next,
        complete,
        point: { ...point },
      };
    },
    motionPoint,
    transitionPassage(state, request, matches) {
      const passage = view.scenes[state.currentScene]?.passages?.[request.passage];
      if (!passage || !matches(passage.when, state)) return { status: "unavailable" };
      const destination = view.scenes[passage.destination.scene];
      const entrance = destination?.entrances?.[passage.destination.entrance];
      const character = state.characters[request.character];
      if (!destination || !entrance || !character || character.scene !== state.currentScene) {
        return {
          status: "invalid",
          message: "A Scene Passage destination is not available.",
        };
      }
      const next = cloneWorldState(state);
      next.currentScene = passage.destination.scene;
      next.characters[request.character] = {
        ...character,
        scene: passage.destination.scene,
        groundPoint: { ...entrance.groundPoint },
        facing: entrance.facing,
      };
      const arrivals = (destination.arrivalSequences ?? []).filter((rule) =>
        (rule.entrance === undefined || rule.entrance === passage.destination.entrance) &&
        matches(rule.when, next),
      );
      if (arrivals.length > 1) {
        return {
          status: "invalid",
          message: "More than one Sequence is applicable to this Scene arrival.",
        };
      }
      return {
        status: "transitioned",
        state: next,
        scene: passage.destination.scene,
        ...(arrivals[0] ? { arrivalSequence: arrivals[0].sequence } : {}),
      };
    },
    hasDirectedSubject(state, subject) {
      if (subject.kind === "character") {
        return state.characters[subject.character]?.scene === state.currentScene;
      }
      if (subject.kind === "object") {
        const location = state.objects[subject.object]?.location;
        return location?.kind === "scene" && location.scene === state.currentScene;
      }
      return subject.scenery in (view.scenes[state.currentScene]?.scenery ?? {});
    },
    pointForSubject(state, subject) {
      if (subject.kind === "character") {
        const character = state.characters[subject.character];
        return character?.scene === state.currentScene
          ? { ...character.groundPoint }
          : undefined;
      }
      if (subject.kind === "object") {
        const location = state.objects[subject.object]?.location;
        return location?.kind === "scene" && location.scene === state.currentScene
          ? { ...location.groundPoint }
          : undefined;
      }
      const position = view.scenes[state.currentScene]?.scenery?.[subject.scenery]?.position;
      return position ? { ...position } : undefined;
    },
    canPlaceObject(sceneId, point) {
      const scene = view.scenes[sceneId];
      return scene !== undefined && pointInSceneSize(scene.size, point);
    },
    presentation(state, directedSceneryPoint = () => undefined) {
      const scene = view.scenes[state.currentScene]!;
      return {
        scene: state.currentScene,
        background: scene.background instanceof URL
          ? new URL(scene.background.href)
          : scene.background,
        size: { ...scene.size },
        scenery: Object.entries(scene.scenery ?? {}).map(([id, definition]) => {
          const appearanceName = state.scenery[state.currentScene]?.[id] ??
            definition.initialAppearance;
          const position = directedSceneryPoint(id) ?? definition.position;
          return {
            id,
            appearanceName,
            appearance: cloneSceneryAppearance(definition.appearances[appearanceName]!),
            baseline: definition.baseline,
            ...(position ? { position: { ...position } } : {}),
          };
        }),
        objects: Object.entries(state.objects).flatMap(([id, object]) =>
          object.location.kind === "scene" && object.location.scene === state.currentScene
            ? [{
                id,
                appearanceName: object.appearance,
                groundPoint: { ...object.location.groundPoint },
                scale: perspectiveScaleAt(scene.perspectiveScale, object.location.groundPoint.y),
              }]
            : [],
        ),
        characters: Object.entries(state.characters).flatMap(([id, character]) =>
          character.scene === state.currentScene
            ? [{
                id,
                appearanceName: character.appearance,
                groundPoint: { ...character.groundPoint },
                facing: character.facing,
                scale: perspectiveScaleAt(scene.perspectiveScale, character.groundPoint.y),
              }]
            : [],
        ),
      };
    },
  };

  function isHotspotAvailable(
    state: Readonly<WorldState>,
    hotspot: HotspotDefinition,
    matches: WorldConditionMatches,
  ): boolean {
    if (!matches(hotspot.when)) return false;
    if (hotspot.target.kind !== "object") return true;
    const location = state.objects[hotspot.target.object]?.location;
    return location?.kind === "scene" && location.scene === state.currentScene;
  }
}

function cloneWorldState(state: Readonly<WorldState>): WorldState {
  return {
    currentScene: state.currentScene,
    characters: structuredClone(state.characters),
    scenery: structuredClone(state.scenery),
    objects: structuredClone(state.objects),
  };
}

function motionPoint(direction: MotionDirection, timing: MotionTiming): Point | undefined {
  if (direction.subject.kind === "character") return undefined;
  const progress = timing.durationTicks === 0
    ? 1
    : Math.max(0, Math.min(1, timing.localTick / timing.durationTicks));
  return pointAlongPath(direction.path, progress);
}

function continuesSceneryMotion(
  direction: MotionDirection,
  nextStep: DirectionStep | undefined,
): boolean {
  if (direction.subject.kind !== "scenery" || nextStep === undefined) return false;
  const scenery = direction.subject.scenery;
  const destination = direction.path.at(-1);
  if (!destination) return false;
  return nextStep.directions.some((nextDirection) =>
    nextDirection.type === "motion" &&
    nextDirection.startAfter === undefined &&
    nextDirection.subject.kind === "scenery" &&
    nextDirection.subject.scenery === scenery &&
    nextDirection.path[0] !== undefined &&
    Math.hypot(
      nextDirection.path[0].x - destination.x,
      nextDirection.path[0].y - destination.y,
    ) <= 1e-8,
  );
}

function facingAlong(dx: number, dy: number): Facing {
  if (Math.abs(dx) * 1.4 >= Math.abs(dy)) return dx < 0 ? "left" : "right";
  return dy > 0 ? "front" : "back";
}

function cloneSceneryAppearance(appearance: SceneryAppearance): SceneryAppearance {
  if (!isAnimatedAppearance(appearance)) {
    return { kind: "background-region", area: appearance.area.map((point) => ({ ...point })) };
  }
  return {
    animations: Object.fromEntries(
      Object.entries(appearance.animations).map(([name, animation]) => [
        name,
        {
          ...animation,
          frames: "side" in animation.frames
            ? {
                side: {
                  ...animation.frames.side,
                  image: cloneAssetReference(animation.frames.side.image),
                },
                front: {
                  ...animation.frames.front,
                  image: cloneAssetReference(animation.frames.front.image),
                },
                back: {
                  ...animation.frames.back,
                  image: cloneAssetReference(animation.frames.back.image),
                },
              }
            : animation.frames.map(cloneAssetReference),
          ...(animation.cues ? { cues: { ...animation.cues } } : {}),
        },
      ]),
    ),
    roles: { ...appearance.roles },
    ...(appearance.visualAnchor ? { visualAnchor: { ...appearance.visualAnchor } } : {}),
  };
}

function cloneAssetReference(reference: URL | string): URL | string {
  return reference instanceof URL ? new URL(reference.href) : reference;
}

/** World-owned arrival predicate shared by simulation and presentation. */
export function characterMotionReachedDestination(
  direction: MotionDirection,
  groundPoint: Point | undefined,
): boolean {
  const destination = direction.path[0];
  return groundPoint !== undefined && destination !== undefined && Math.hypot(
    destination.x - groundPoint.x,
    destination.y - groundPoint.y,
  ) <= 1e-8;
}

/** World-owned interpolation for Object and Scenery Motion paths. */
export function pointAlongPath(path: readonly Point[], progress: number): Point {
  if (path.length === 1) return { ...path[0]! };
  const lengths = path.slice(1).map((point, index) =>
    Math.hypot(point.x - path[index]!.x, point.y - path[index]!.y),
  );
  const total = lengths.reduce((sum, length) => sum + length, 0);
  if (total === 0) return { ...path.at(-1)! };
  let remaining = total * progress;
  for (let index = 0; index < lengths.length; index += 1) {
    const length = lengths[index]!;
    if (remaining <= length) {
      const start = path[index]!;
      const end = path[index + 1]!;
      const ratio = length === 0 ? 1 : remaining / length;
      return {
        x: start.x + (end.x - start.x) * ratio,
        y: start.y + (end.y - start.y) * ratio,
      };
    }
    remaining -= length;
  }
  return { ...path.at(-1)! };
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
          family: "definition", owner: "world",
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
      family: "definition", owner: "world",
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
        family: "definition", owner: "world",
        path: `${path}[${index}]`,
        message: "Scene Space coordinates must be finite numbers.",
      });
    }
  });
  if (polygon.length < 3) {
    diagnostics.push({
      code: "definition.polygon.vertices",
      family: "definition", owner: "world",
      path,
      message: "A polygon needs at least three vertices.",
    });
  } else if (polygon.every(({ x, y }) => Number.isFinite(x) && Number.isFinite(y))) {
    validatePolygon(polygon, path, diagnostics);
  }
}

function validatePolygonBounds(
  polygon: readonly Point[],
  path: string,
  pointInScene: (point: Point) => boolean,
  diagnostics: AuthoringDiagnostic[],
): void {
  polygon.forEach((point, index) => {
    if (!pointInScene(point)) {
      diagnostics.push(worldDefinition(
        "definition.scene-space.bounds",
        `${path}[${index}]`,
        "Scene geometry must remain inside the Scene Size.",
      ));
    }
  });
}

function validateApproach(
  scene: SceneDefinition,
  approach: ApproachPoint,
  base: string,
  pointInScene: (point: Point) => boolean,
  diagnostics: AuthoringDiagnostic[],
): void {
  if (!pointInScene(approach.groundPoint)) {
    diagnostics.push(worldDefinition(
      "definition.approach.bounds",
      `${base}.approach`,
      "Approach Point must be inside Scene Space.",
    ));
  } else if (!pointInPolygonOrBoundary(scene.walkableRegion, approach.groundPoint)) {
    diagnostics.push(worldDefinition(
      "definition.approach.walkable",
      `${base}.approach`,
      "An Approach Point must lie in the Walkable Region.",
    ));
  }
}

function resolvedSceneSize(scene: SceneDefinition, logicalResolution: LogicalResolution): SceneSize {
  return scene.size ?? logicalResolution;
}

function pointInSceneSize(size: SceneSize, point: Point): boolean {
  return Number.isFinite(point.x) && Number.isFinite(point.y) &&
    point.x >= 0 && point.y >= 0 && point.x <= size.width && point.y <= size.height;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isPoint(value: unknown): value is Point {
  return isRecord(value) && hasExactRecordKeys(value, ["x", "y"]) &&
    typeof value.x === "number" && Number.isFinite(value.x) &&
    typeof value.y === "number" && Number.isFinite(value.y);
}

function hasExactRecordKeys(
  value: Record<string, unknown>,
  required: readonly string[],
): boolean {
  const keys = Object.keys(value);
  return required.every((key) => keys.includes(key)) &&
    keys.every((key) => required.includes(key));
}

function sameRecordKeys(left: Record<string, unknown>, right: object): boolean {
  const leftKeys = Object.keys(left).sort();
  const rightKeys = Object.keys(right).sort();
  return leftKeys.length === rightKeys.length &&
    leftKeys.every((key, index) => key === rightKeys[index]);
}

function pointInPolygonOrBoundary(polygon: readonly Point[], point: Point): boolean {
  if (isInside(polygon, point)) return true;
  return polygon.some((start, index) => {
    const end = polygon[(index + 1) % polygon.length]!;
    const cross = (point.x - start.x) * (end.y - start.y) -
      (point.y - start.y) * (end.x - start.x);
    return Math.abs(cross) <= 1e-9 &&
      point.x >= Math.min(start.x, end.x) && point.x <= Math.max(start.x, end.x) &&
      point.y >= Math.min(start.y, end.y) && point.y <= Math.max(start.y, end.y);
  });
}

function perspectiveScaleAt(stops: readonly PerspectiveScaleStop[] | undefined, y: number): number {
  if (!stops || stops.length === 0) return 1;
  const sorted = [...stops].sort((left, right) => left.y - right.y);
  const first = sorted[0]!;
  const last = sorted.at(-1)!;
  if (y <= first.y) return first.scale;
  if (y >= last.y) return last.scale;
  for (let index = 1; index < sorted.length; index += 1) {
    const lower = sorted[index - 1]!;
    const upper = sorted[index]!;
    if (y <= upper.y) {
      const amount = (y - lower.y) / (upper.y - lower.y);
      return lower.scale + (upper.scale - lower.scale) * amount;
    }
  }
  return last.scale;
}

function worldDefinition(code: string, path: string, message: string): AuthoringDiagnostic {
  return { code, family: "definition", owner: "world", path, message };
}

function worldReference(code: string, path: string, message: string): AuthoringDiagnostic {
  return { code, family: "reference", owner: "world", path, message };
}

function isAnimatedAppearance(appearance: EntityAppearance | SceneryAppearance): appearance is Appearance {
  return "animations" in appearance;
}

function segmentsIntersect(a: Point, b: Point, c: Point, d: Point): boolean {
  const cross = (p: Point, q: Point, r: Point) =>
    Math.sign((q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x));
  return cross(a, b, c) !== cross(a, b, d) && cross(c, d, a) !== cross(c, d, b);
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !(value instanceof URL) && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}
