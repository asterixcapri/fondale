import { AuthoringError, type AuthoringDiagnostic } from "../public/diagnostics";
import {
  getGameProjectData,
  type Facing,
  type GameBehaviorContext,
  type GameOperation,
  type GameProject,
  type GameProjectData,
  type HotspotDefinition,
  type HotspotTarget,
  type InteractionCondition,
  type Point,
  type PrimaryInteractionCase,
  type SequenceDefinition,
  type SequenceStep,
} from "../public/definitions";
import {
  createSaveSnapshot,
  getValidatedSaveState,
  type SaveSnapshot,
  type ValidatedSaveSnapshot,
} from "../public/save";
import { isInside, navigationPath, nearestPoint } from "./geometry";
import { conditionMatchesState, hotspotAvailableInState } from "./state-queries";

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

export interface PlayerIntentState {
  type: "player-intent";
  destination: Point;
  finalFacing?: Facing;
  intent:
    | { kind: "move" }
    | { kind: "interaction"; scene: string; hotspot: number; selectedObject: string | null }
    | { kind: "passage"; scene: string; passage: number };
}

export type SequenceActiveState =
  | { kind: "line"; path: string }
  | { kind: "choice"; path: string; eligibleAlternatives: number[] };

export interface SequenceActivityState {
  type: "sequence";
  sequence: string;
  pendingPaths: string[];
  active: SequenceActiveState | null;
}

export type GameActivityState = PlayerIntentState | SequenceActivityState;

export interface GameState {
  currentScene: string;
  characters: Record<string, CharacterState>;
  scenery: Record<string, Record<string, string>>;
  objects: Record<string, ObjectState>;
  inventory: { objects: string[]; selected: string | null };
  variables: Record<string, boolean>;
  activity: GameActivityState | null;
  tick: number;
}

export type CoreInput =
  | { readonly type: "move"; readonly point: Point }
  | { readonly type: "activate-hotspot"; readonly hotspot: number }
  | { readonly type: "activate-passage"; readonly passage: number }
  | { readonly type: "select-object"; readonly object: string }
  | { readonly type: "escape" }
  | { readonly type: "advance-sequence" }
  | { readonly type: "choose"; readonly alternative: number };

export type CoreEffect =
  | { readonly type: "movement-started"; readonly destination: Point }
  | { readonly type: "movement-finished"; readonly destination: Point }
  | { readonly type: "interaction-response"; readonly text: string }
  | { readonly type: "scene-changed"; readonly scene: string }
  | { readonly type: "sequence-changed" };

export type CoreWorldTarget =
  | { readonly kind: "hotspot"; readonly index: number }
  | { readonly kind: "passage"; readonly index: number };

export interface AvailableHotspot {
  readonly index: number;
  readonly area: readonly Point[];
  readonly label: string;
}

/** Internal deterministic seam shared by browser and tests. */
export interface CoreSession {
  input(input: CoreInput): void;
  steps(count?: number): void;
  snapshot(): GameState;
  effects(): readonly CoreEffect[];
  takeEffects(): readonly CoreEffect[];
  createSaveSnapshot(): SaveSnapshot;
  lifecycle(): "running" | "failed" | "stopped";
  diagnostics(): readonly AuthoringDiagnostic[];
  hitTest(point: Point): CoreWorldTarget | null;
  availableHotspots(): readonly AvailableHotspot[];
  stop(): void;
}

export function createTestSession(
  project: GameProject,
  restored?: ValidatedSaveSnapshot,
): CoreSession {
  return createCoreSession(project, restored);
}

export function createCoreSession(
  project: GameProject,
  restored?: ValidatedSaveSnapshot,
): CoreSession {
  const data = getGameProjectData(project);
  let state = restored ? getValidatedSaveState(restored) : initialState(data);
  let status: "running" | "failed" | "stopped" = "running";
  let failureDiagnostics: readonly AuthoringDiagnostic[] = [];
  const inputs: CoreInput[] = [];
  const emitted: CoreEffect[] = [];

  const session: CoreSession = {
    input(input) {
      if (status === "running") inputs.push(structuredClone(input));
    },
    steps(count = 1) {
      assertRunning();
      if (!Number.isInteger(count) || count < 0) throw new RangeError("steps must be non-negative");
      for (let index = 0; index < count && status === "running"; index += 1) step();
    },
    snapshot() {
      return structuredClone(state);
    },
    effects() {
      return structuredClone(emitted);
    },
    takeEffects() {
      return structuredClone(emitted.splice(0));
    },
    createSaveSnapshot() {
      assertRunning();
      return createSaveSnapshot(data, state);
    },
    lifecycle: () => status,
    diagnostics: () => failureDiagnostics,
    hitTest(point) {
      const scene = data.scenes[state.currentScene]!;
      const hotspot = [...(scene.hotspots ?? [])].findLastIndex(
        (definition) => hotspotAvailable(definition) && isInside(definition.area, point),
      );
      if (hotspot >= 0) return { kind: "hotspot", index: hotspot };
      const passage = [...(scene.passages ?? [])].findLastIndex(
        ({ area, when }) => conditionMatches(when) && isInside(area, point),
      );
      return passage >= 0 ? { kind: "passage", index: passage } : null;
    },
    availableHotspots() {
      const scene = data.scenes[state.currentScene]!;
      return (scene.hotspots ?? []).flatMap((hotspot, index) => {
        if (!hotspotAvailable(hotspot)) return [];
        const action = hotspot.primaryAction;
        const interaction = action.cases.find(({ when }) => conditionMatches(when)) ?? action.fallback;
        return [{ index, area: hotspot.area.map((point) => ({ ...point })), label: interaction.label }];
      });
    },
    stop() {
      if (status === "stopped") return;
      status = "stopped";
      inputs.length = 0;
    },
  };

  function assertRunning(): void {
    if (status !== "running") throw new Error(`Game Session is ${status}.`);
  }

  function step(): void {
    for (const input of inputs.splice(0)) handleInput(input);
    advancePlayerIntent();
    state.tick += 1;
  }

  function handleInput(input: CoreInput): void {
    if (state.activity?.type === "sequence") {
      if (input.type === "advance-sequence" && state.activity.active?.kind === "line") {
        state.activity.active = null;
        advanceSequence();
      } else if (input.type === "choose" && state.activity.active?.kind === "choice") {
        chooseAlternative(input.alternative);
      }
      return;
    }

    if (input.type === "move") {
      beginIntent({ kind: "move" }, input.point);
    } else if (input.type === "activate-hotspot") {
      const scene = data.scenes[state.currentScene]!;
      const hotspot = scene.hotspots?.[input.hotspot];
      if (hotspot && hotspotAvailable(hotspot)) {
        beginIntent(
          {
            kind: "interaction",
            scene: state.currentScene,
            hotspot: input.hotspot,
            selectedObject: state.inventory.selected,
          },
          hotspot.approach.groundPoint,
          hotspot.approach.facing,
        );
      }
    } else if (input.type === "activate-passage") {
      const scene = data.scenes[state.currentScene]!;
      const passage = scene.passages?.[input.passage];
      if (passage && conditionMatches(passage.when)) {
        beginIntent(
          { kind: "passage", scene: state.currentScene, passage: input.passage },
          passage.approach.groundPoint,
          passage.approach.facing,
        );
      }
    } else if (input.type === "select-object") {
      if (!state.inventory.objects.includes(input.object)) return;
      state.activity = null;
      state.inventory.selected = state.inventory.selected === input.object ? null : input.object;
    } else if (input.type === "escape") {
      state.inventory.selected = null;
    }
  }

  function beginIntent(
    intent: PlayerIntentState["intent"],
    requested: Point,
    finalFacing?: Facing,
  ): void {
    const scene = data.scenes[state.currentScene]!;
    const destination = nearestPoint(scene.walkableRegion, requested);
    state.activity = finalFacing === undefined
      ? { type: "player-intent", destination, intent }
      : { type: "player-intent", destination, finalFacing, intent };
    emitted.push({ type: "movement-started", destination: { ...destination } });
  }

  function advancePlayerIntent(): void {
    const activity = state.activity;
    if (activity?.type !== "player-intent") return;
    const playerId = data.playerCharacter;
    const player = playerId ? state.characters[playerId] : undefined;
    const definition = playerId ? data.characters[playerId] : undefined;
    if (!player || !definition) {
      state.activity = null;
      return;
    }
    const scene = data.scenes[state.currentScene]!;
    const path = navigationPath(scene.walkableRegion, player.groundPoint, activity.destination);
    const waypoint = path[1] ?? activity.destination;
    const dx = waypoint.x - player.groundPoint.x;
    const dy = waypoint.y - player.groundPoint.y;
    const distance = Math.hypot(dx, dy);
    const travel = definition.movementSpeed / 60;
    if (distance > travel) {
      player.facing = facingAlong(dx, dy);
      player.groundPoint = {
        x: player.groundPoint.x + (dx / distance) * travel,
        y: player.groundPoint.y + (dy / distance) * travel,
      };
      return;
    }
    if (Math.hypot(
      activity.destination.x - waypoint.x,
      activity.destination.y - waypoint.y,
    ) > 1e-8) {
      player.groundPoint = { ...waypoint };
      return;
    }

    player.groundPoint = { ...activity.destination };
    if (activity.finalFacing) player.facing = activity.finalFacing;
    state.activity = null;
    emitted.push({ type: "movement-finished", destination: { ...activity.destination } });
    if (activity.intent.kind === "interaction") resolveInteraction(activity.intent);
    if (activity.intent.kind === "passage") resolvePassage(activity.intent);
  }

  function resolveInteraction(intent: Extract<PlayerIntentState["intent"], { kind: "interaction" }>): void {
    if (intent.scene !== state.currentScene || intent.selectedObject !== state.inventory.selected) return;
    const hotspot = data.scenes[intent.scene]?.hotspots?.[intent.hotspot];
    if (!hotspot || !hotspotAvailable(hotspot)) return;

    if (intent.selectedObject) {
      const use = hotspot.inventoryUse;
      const interaction =
        use?.cases.find(
          (candidate) =>
            candidate.object === intent.selectedObject && conditionMatches(candidate.when),
        ) ?? use?.fallback;
      if (!interaction) {
        emitted.push({ type: "interaction-response", text: "That does not work." });
        return;
      }
      if (
        interaction.outcome === "failure" &&
        interaction.operations.some(
          ({ type }) => type === "place-selected-object" || type === "consume-selected-object",
        )
      ) {
        failOperation("A failed Inventory Use cannot place or consume the selected Object.");
        return;
      }
      if (!applyOperations(interaction.operations, hotspot.target)) return;
      if (interaction.outcome === "success") state.inventory.selected = null;
      emitted.push({ type: "interaction-response", text: interaction.response });
      return;
    }

    const action = hotspot.primaryAction;
    const interaction = action.cases.find((candidate) => conditionMatches(candidate.when)) ?? action.fallback;
    applyPrimaryInteraction(interaction, hotspot.target);
  }

  function applyPrimaryInteraction(interaction: PrimaryInteractionCase, target: HotspotTarget): void {
    let operations: readonly GameOperation[];
    if (interaction.behavior) {
      const requested: GameOperation[] = [];
      const context: GameBehaviorContext = Object.freeze({
        reads: Object.freeze({
          variable: (name: string) => readVariable(name),
          hasObject: (object: string) => state.inventory.objects.includes(object),
        }),
        operations: Object.freeze({
          setVariable: (variable: string, value: boolean) =>
            requested.push({ type: "set-variable", variable, value }),
          setAppearance: (
            operationTarget: Extract<GameOperation, { type: "set-appearance" }>["target"],
            appearance: string,
          ) => requested.push({ type: "set-appearance", target: operationTarget, appearance }),
          startSequence: (sequence: string) =>
            requested.push({ type: "start-sequence", sequence }),
        }),
        target,
      });
      try {
        interaction.behavior(context);
      } catch (cause) {
        failBehavior(cause);
        return;
      }
      operations = requested;
    } else {
      operations = interaction.operations;
    }
    if (!applyOperations(operations, target)) return;
    emitted.push({ type: "interaction-response", text: interaction.response });
  }

  function resolvePassage(intent: Extract<PlayerIntentState["intent"], { kind: "passage" }>): void {
    if (intent.scene !== state.currentScene) return;
    const passage = data.scenes[intent.scene]?.passages?.[intent.passage];
    if (!passage || !conditionMatches(passage.when)) return;
    const destination = data.scenes[passage.destination.scene];
    const entrance = destination?.entrances?.[passage.destination.entrance];
    const playerId = data.playerCharacter;
    if (!destination || !entrance || !playerId || !state.characters[playerId]) {
      failOperation("A Scene Passage destination is not available.");
      return;
    }
    const next = structuredClone(state);
    next.currentScene = passage.destination.scene;
    next.characters[playerId] = {
      ...next.characters[playerId]!,
      scene: passage.destination.scene,
      groundPoint: { ...entrance.groundPoint },
      facing: entrance.facing,
    };
    next.activity = null;
    state = next;
    emitted.push({ type: "scene-changed", scene: state.currentScene });
  }

  function applyOperations(operations: readonly GameOperation[], target: HotspotTarget): boolean {
    const draft = structuredClone(state);
    try {
      for (const operation of operations) applyOperation(draft, operation, target);
    } catch (cause) {
      failOperation(cause instanceof Error ? cause.message : String(cause), cause);
      return false;
    }
    state = draft;
    if (state.activity?.type === "sequence") advanceSequence();
    return true;
  }

  function applyOperation(draft: GameState, operation: GameOperation, target: HotspotTarget): void {
    if (operation.type === "set-variable") {
      if (!(operation.variable in data.variables)) throw new Error(`Unknown Game Variable '${operation.variable}'.`);
      draft.variables[operation.variable] = operation.value;
    } else if (operation.type === "set-appearance") {
      const { target: appearanceTarget } = operation;
      if (appearanceTarget.kind === "character") {
        const definition = data.characters[appearanceTarget.character];
        const current = draft.characters[appearanceTarget.character];
        if (!definition || !current || !(operation.appearance in definition.appearances)) {
          throw new Error("Invalid Character Appearance operation.");
        }
        current.appearance = operation.appearance;
      } else if (appearanceTarget.kind === "object") {
        const definition = data.objects[appearanceTarget.object];
        const current = draft.objects[appearanceTarget.object];
        if (!definition || !current || !(operation.appearance in definition.appearances)) {
          throw new Error("Invalid Object Appearance operation.");
        }
        current.appearance = operation.appearance;
      } else {
        const definition = data.scenes[appearanceTarget.scene]?.scenery?.[appearanceTarget.scenery];
        if (!definition || !(operation.appearance in definition.appearances)) {
          throw new Error("Invalid Scenery Appearance operation.");
        }
        draft.scenery[appearanceTarget.scene]![appearanceTarget.scenery] = operation.appearance;
      }
    } else if (operation.type === "start-sequence") {
      if (!data.sequences[operation.sequence]) throw new Error(`Unknown Sequence '${operation.sequence}'.`);
      if (draft.activity?.type === "sequence") throw new Error("A Sequence cannot start another Sequence.");
      draft.activity = {
        type: "sequence",
        sequence: operation.sequence,
        pendingPaths: topLevelPaths(data.sequences[operation.sequence]!),
        active: null,
      };
    } else if (operation.type === "collect-target-object") {
      if (target.kind !== "object") throw new Error("Collect requires an Object target.");
      const object = draft.objects[target.object];
      if (!object || object.location.kind !== "scene" || object.location.scene !== draft.currentScene) {
        throw new Error("The target Object is not present in the current Scene.");
      }
      object.location = { kind: "inventory" };
      draft.inventory.objects.push(target.object);
    } else if (operation.type === "place-selected-object") {
      const selected = draft.inventory.selected;
      if (!selected || !draft.inventory.objects.includes(selected)) throw new Error("No Object is selected.");
      const object = draft.objects[selected]!;
      if (operation.appearance !== undefined && !(operation.appearance in data.objects[selected]!.appearances)) {
        throw new Error(`Unknown Object Appearance '${operation.appearance}'.`);
      }
      object.location = {
        kind: "scene",
        scene: draft.currentScene,
        groundPoint: { ...operation.groundPoint },
      };
      if (operation.appearance !== undefined) object.appearance = operation.appearance;
      draft.inventory.objects = draft.inventory.objects.filter((id) => id !== selected);
      draft.inventory.selected = null;
    } else if (operation.type === "consume-selected-object") {
      const selected = draft.inventory.selected;
      if (!selected || !draft.inventory.objects.includes(selected)) throw new Error("No Object is selected.");
      draft.objects[selected]!.location = { kind: "consumed" };
      draft.inventory.objects = draft.inventory.objects.filter((id) => id !== selected);
      draft.inventory.selected = null;
    }
  }

  function advanceSequence(): void {
    while (state.activity?.type === "sequence" && state.activity.active === null) {
      const activity = state.activity;
      const path = activity.pendingPaths.shift();
      if (!path) {
        state.activity = null;
        emitted.push({ type: "sequence-changed" });
        return;
      }
      const definition = data.sequences[activity.sequence]!;
      const stepDefinition = resolvePath(definition, path) as SequenceStep;
      if (stepDefinition.type === "line") {
        activity.active = { kind: "line", path };
      } else if (stepDefinition.type === "choice") {
        const eligible = stepDefinition.alternatives
          .map((alternative, index) => (conditionMatches(alternative.when) ? index : -1))
          .filter((index) => index >= 0);
        activity.active = {
          kind: "choice",
          path,
          eligibleAlternatives: eligible.length > 0 ? eligible : [-1],
        };
      } else if (stepDefinition.type === "branch") {
        const branchIndex = stepDefinition.cases.findIndex(({ when }) => conditionMatches(when));
        const container =
          branchIndex >= 0 ? `${path}/cases/${branchIndex}/steps` : `${path}/fallback`;
        activity.pendingPaths.unshift(...pathsForContainer(definition, container));
      } else if (stepDefinition.type === "operations") {
        if (!applyOperations(stepDefinition.operations, { kind: "background" })) return;
      }
      emitted.push({ type: "sequence-changed" });
    }
  }

  function chooseAlternative(alternative: number): void {
    const activity = state.activity;
    if (activity?.type !== "sequence" || activity.active?.kind !== "choice") return;
    if (!activity.active.eligibleAlternatives.includes(alternative)) return;
    const definition = data.sequences[activity.sequence]!;
    const stepDefinition = resolvePath(definition, activity.active.path) as Extract<SequenceStep, { type: "choice" }>;
    const container =
      alternative === -1
        ? `${activity.active.path}/fallback/steps`
        : `${activity.active.path}/alternatives/${alternative}/steps`;
    activity.pendingPaths.unshift(...pathsForContainer(definition, container));
    activity.active = null;
    advanceSequence();
  }

  function conditionMatches(condition?: InteractionCondition): boolean {
    return conditionMatchesState(condition, state);
  }

  function readVariable(name: string): boolean {
    if (!(name in state.variables)) throw new Error(`Unknown Game Variable '${name}'.`);
    return state.variables[name]!;
  }

  function hotspotAvailable(hotspot: HotspotDefinition): boolean {
    return hotspotAvailableInState(hotspot, state);
  }

  function failOperation(message: string, cause?: unknown): void {
    status = "failed";
    state.activity = null;
    failureDiagnostics = [
      {
        code: "state.operation.invalid",
        family: "state",
        path: "Game Session.operation",
        message,
        cause,
      },
    ];
  }

  function failBehavior(cause: unknown): void {
    status = "failed";
    state.activity = null;
    failureDiagnostics = [
      {
        code: "behavior.threw",
        family: "behavior",
        path: "Game Session.behavior",
        message: "A Game Behavior threw before its requested operations could commit.",
        cause,
      },
    ];
  }

  return session;
}

function initialState(data: GameProjectData): GameState {
  const characters = Object.fromEntries(
    Object.entries(data.characters).map(([id, definition]) => [
      id,
      {
        scene: definition.initialScene,
        groundPoint: { ...definition.initialGroundPoint },
        facing: definition.initialFacing,
        appearance: definition.initialAppearance,
      },
    ]),
  );
  const objects = Object.fromEntries(
    Object.entries(data.objects).map(([id, definition]) => [
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
  );
  const scenery = Object.fromEntries(
    Object.entries(data.scenes).map(([sceneId, scene]) => [
      sceneId,
      Object.fromEntries(
        Object.entries(scene.scenery ?? {}).map(([id, definition]) => [id, definition.initialAppearance]),
      ),
    ]),
  );
  return {
    currentScene: data.initialScene,
    characters,
    scenery,
    objects,
    inventory: { objects: [], selected: null },
    variables: { ...data.variables },
    activity: null,
    tick: 0,
  };
}

function topLevelPaths(sequence: SequenceDefinition): string[] {
  return sequence.steps.map((_, index) => `steps/${index}`);
}

function pathsForContainer(sequence: SequenceDefinition, path: string): string[] {
  const steps = resolvePath(sequence, path) as readonly SequenceStep[];
  return steps.map((_, index) => `${path}/${index}`);
}

function resolvePath(value: unknown, path: string): unknown {
  return path.split("/").reduce<unknown>((current, segment) => {
    if (current === null || typeof current !== "object") return undefined;
    return (current as Record<string, unknown>)[segment];
  }, value);
}

function facingAlong(dx: number, dy: number): Facing {
  if (Math.abs(dx) * 1.4 >= Math.abs(dy)) return dx < 0 ? "left" : "right";
  return dy > 0 ? "front" : "back";
}
