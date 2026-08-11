import { AuthoringError, type AuthoringDiagnostic } from "../game-project";
import {
  createInteraction,
  conditionMatchesState,
  conditionalOptionalValue,
  conditionalValue,
  isInventoryOperation,
  type CommandState,
  type CommandResponse,
  type CommandVerb,
  type InteractionDecision,
  type InteractionCondition,
  type InteractionInput,
  type InteractionTargetView,
  type InventoryPresentation,
  type PlayerIntent,
  type PlayerIntentState,
  type Verb,
} from "../interaction";
import {
  getGameProjectData,
  type GameOperation,
  type GameProject,
  type GameProjectData,
  type Line,
  type SequenceDefinition,
  type SequenceStep,
} from "../game-project";
import {
  createSaveSnapshot,
  getValidatedSaveState,
  type SaveSnapshot,
  type ValidatedSaveSnapshot,
} from "../save";
import {
  characterMotionReachedDestination,
  createWorld,
  type CharacterState,
  type Facing,
  type HotspotTarget,
  type ObjectLocation,
  type ObjectState,
  type Point,
  type WorldPresentation,
  type WorldState,
  type WorldTarget,
} from "../world";
import {
  interpretDirectionStep,
  resolveSequencePath,
  secondsToTicks,
  type DirectionStep,
  type DirectedSubject,
  type MotionDirection,
} from "../sequence";
import {
  appearanceForSubject,
  objectHasAppearance,
  type AnimationDefinition,
} from "../animation";
import { Camera, type CameraPresentation } from "../camera";

export type { CharacterState, ObjectLocation, ObjectState } from "../world";

export type SequenceActiveState =
  | { kind: "line"; path: string; animationStartedTick: number; choiceText?: string; choiceCharacter?: string }
  | { kind: "narration"; path: string }
  | { kind: "choice"; path: string; eligibleAlternatives: number[] }
  | { kind: "direction"; path: string; elapsedTicks: number };

export interface SequenceActivityState {
  type: "sequence";
  sequence: string;
  pendingPaths: string[];
  active: SequenceActiveState | null;
}

export interface LineActivityState {
  type: "line";
  animationStartedTick: number;
  line: Omit<Line, "audio"> & { audio?: string };
}

export type GameActivityState = PlayerIntentState | SequenceActivityState | LineActivityState;

export interface GameState extends WorldState {
  inventory: { objects: string[] };
  command: CommandState;
  variables: Record<string, boolean>;
  activity: GameActivityState | null;
  tick: number;
}

export type CoreInput = InteractionInput
  | { readonly type: "move"; readonly point: Point; readonly fast?: boolean }
  | { readonly type: "advance-sequence" }
  | { readonly type: "advance-line" }
  | { readonly type: "skip-sequence" }
  | { readonly type: "choose"; readonly alternative: number };

export type CoreEffect =
  | { readonly type: "movement-started"; readonly destination: Point; readonly fast?: true }
  | { readonly type: "movement-finished"; readonly destination: Point }
  | { readonly type: "interaction-response"; readonly text: string; readonly response?: CommandResponse }
  | { readonly type: "scene-changed"; readonly scene: string }
  | { readonly type: "sequence-changed" };

export type CoreWorldTarget = WorldTarget;

export interface AvailableHotspot {
  readonly index: number;
  readonly area: readonly Point[];
  readonly label: string;
  readonly preferredVerb?: Verb;
  readonly secondaryVerb?: Verb;
  readonly objectVerb?: Verb;
}

export interface AvailablePassage {
  readonly index: number;
  readonly area: readonly Point[];
  readonly label: string;
  readonly preferredVerb: Verb;
  readonly secondaryVerb?: Verb;
  readonly objectVerb?: Verb;
  readonly direction: "left" | "right" | "up" | "down" | "enter";
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
  inventory(): InventoryPresentation;
  availablePassages(): readonly AvailablePassage[];
  world(): WorldPresentation;
  camera(): CameraPresentation;
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
  const world = createWorld(data);
  const interaction = createInteraction(data, {
    canPlaceObject: (scene, point) => world.canPlaceObject(scene, point),
    objectHasAppearance: (object, appearance) => objectHasAppearance(data, object, appearance),
  });
  let state = restored ? getValidatedSaveState(restored) : initialState(data, world.initialState());
  let status: "running" | "failed" | "stopped" = "running";
  let failureDiagnostics: readonly AuthoringDiagnostic[] = [];
  const inputs: CoreInput[] = [];
  const emitted: CoreEffect[] = [];
  const camera = new Camera();
  let cameraPresentation: CameraPresentation;

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
      return world.hitTest(state, point, conditionMatches);
    },
    availableHotspots() {
      return world.hotspots(state, conditionMatches).flatMap(({ definition: hotspot, index }) => {
        const noun = interaction.nounForHotspot(state.currentScene, hotspot);
        if (!noun) return [];
        const label = conditionalValue(noun.labels, state).text;
        const preferredVerb = conditionalValue(noun.preferredVerbs, state).verb;
        const secondaryVerb = conditionalOptionalValue(noun.secondaryVerbs, state)?.verb;
        const objectVerb = conditionalOptionalValue(noun.objectVerbs, state)?.verb;
        return [{
          index,
          area: hotspot.area.map((point) => ({ ...point })),
          label,
          ...(preferredVerb ? { preferredVerb } : {}),
          ...(secondaryVerb ? { secondaryVerb } : {}),
          ...(objectVerb ? { objectVerb } : {}),
        }];
      });
    },
    inventory() {
      return interaction.inventory(state);
    },
    availablePassages() {
      return world.passages(state, conditionMatches).map(({ definition: passage, index }) => {
        const secondaryVerb = conditionalOptionalValue(passage.noun.secondaryVerbs, state)?.verb;
        const objectVerb = conditionalOptionalValue(passage.noun.objectVerbs, state)?.verb;
        return {
          index,
          area: passage.area.map((point) => ({ ...point })),
          label: conditionalValue(passage.noun.labels, state).text,
          preferredVerb: conditionalValue(passage.noun.preferredVerbs, state).verb,
          ...(secondaryVerb ? { secondaryVerb } : {}),
          ...(objectVerb ? { objectVerb } : {}),
          direction: passage.direction,
        };
      });
    },
    world() {
      return world.presentation(state, (scenery) => directedSubjectPoint(
        { kind: "scenery", scenery },
        activeDirectionPresentation(),
      ));
    },
    camera() {
      return cameraPresentation;
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
    advanceDirectedStep();
    advancePlayerIntent();
    state.tick += 1;
    advanceCamera();
  }

  function handleInput(input: CoreInput): void {
    if (state.activity?.type === "line") {
      if (input.type === "advance-line") state.activity = null;
      return;
    }
    if (state.activity?.type === "sequence") {
      if (
        input.type === "advance-sequence" &&
        (state.activity.active?.kind === "line" || state.activity.active?.kind === "narration")
      ) {
        state.activity.active = null;
        advanceSequence();
      } else if (input.type === "choose" && state.activity.active?.kind === "choice") {
        chooseAlternative(input.alternative);
      } else if (input.type === "skip-sequence" && data.sequences[state.activity.sequence]?.skippable) {
        applySkipOutcome(data.sequences[state.activity.sequence]!);
      }
      return;
    }

    if (input.type === "move") {
      beginIntent({ kind: "move" }, input.point, undefined, input.fast);
    } else if (isInteractionInput(input)) {
      handleInteractionDecision(interaction.input(input, state, interactionTarget(input)));
    }
  }

  function interactionTarget(
    value: InteractionInput | PlayerIntent,
  ): InteractionTargetView | undefined {
    const scene = "scene" in value ? value.scene : state.currentScene;
    if (scene !== state.currentScene) return undefined;
    if ("hotspot" in value) {
      const definition = world.hotspots(state, conditionMatches)
        .find(({ index }) => index === value.hotspot)?.definition;
      const noun = definition ? interaction.nounForHotspot(scene, definition) : undefined;
      if (!definition || !noun) return undefined;
      return {
        kind: "hotspot",
        scene,
        index: value.hotspot,
        noun,
        target: definition.target,
      };
    }
    if ("passage" in value) {
      const definition = world.passages(state, conditionMatches)
        .find(({ index }) => index === value.passage)?.definition;
      if (!definition) return undefined;
      return {
        kind: "passage",
        scene,
        index: value.passage,
        noun: definition.noun,
        target: { kind: "background" },
      };
    }
    return undefined;
  }

  function handleInteractionDecision(decision: InteractionDecision): void {
    if (decision.type === "ignored") return;
    if (decision.type === "command") {
      if (decision.cancelActivity) state.activity = null;
      state.command = structuredClone(decision.command);
      return;
    }
    if (decision.type === "request-approach") {
      const approach = world.approach(state, decision.target, conditionMatches);
      if (!approach) return;
      beginIntent(
        decision.intent,
        approach.groundPoint,
        approach.facing,
        decision.fast,
      );
      return;
    }
    if (decision.type === "passage") {
      resolvePassage({ kind: "passage", scene: state.currentScene, passage: decision.passage });
      return;
    }
    if (!decision.resolution) {
      if (decision.commandStateDisposition === "reset") {
        state.command = { verb: "walk-to", firstNoun: null };
      }
      return;
    }
    if (!applyOperations(
      decision.resolution.operations,
      decision.target,
      decision.firstNoun,
      decision.commandStateDisposition,
    )) return;
    if (decision.resolution.response) {
      emitted.push({
        type: "interaction-response",
        text: decision.resolution.response.text,
        response: decision.resolution.response,
      });
    } else if (decision.resolution.line) {
      const { audio, ...line } = decision.resolution.line;
      state.activity = {
        type: "line",
        animationStartedTick: state.tick + 1,
        line: {
          ...line,
          ...(audio ? { audio: audio instanceof URL ? audio.href : audio } : {}),
        },
      };
    }
  }

  function applySkipOutcome(sequence: SequenceDefinition): void {
    const draft = structuredClone(state);
    try {
      for (const operation of sequence.skipOutcome ?? []) {
        applyOperation(draft, operation, { kind: "background" });
      }
    } catch (cause) {
      failOperation(cause instanceof Error ? cause.message : String(cause), cause);
      return;
    }
    draft.activity = null;
    state = draft;
    emitted.push({ type: "sequence-changed" });
  }

  function beginIntent(
    intent: PlayerIntent,
    requested: Point,
    finalFacing?: Facing,
    fast = false,
  ): void {
    const destination = world.navigationDestination(state, requested);
    state.activity = {
      type: "player-intent",
      animationStartedTick: state.tick + 1,
      destination,
      intent,
      ...(finalFacing === undefined ? {} : { finalFacing }),
      ...(fast ? { fast: true as const } : {}),
    };
    emitted.push({
      type: "movement-started",
      destination: { ...destination },
      ...(fast ? { fast: true as const } : {}),
    });
  }

  function advancePlayerIntent(): void {
    const activity = state.activity;
    if (activity?.type !== "player-intent") return;
    const playerId = data.playerCharacter;
    const player = playerId ? state.characters[playerId] : undefined;
    const definition = playerId ? data.characters[playerId] : undefined;
    if (!playerId || !player || !definition) {
      state.activity = null;
      return;
    }
    const progress = world.advanceCharacter(state, {
      character: playerId,
      destination: activity.destination,
      ...(activity.finalFacing ? { finalFacing: activity.finalFacing } : {}),
      ...(activity.fast ? { speedMultiplier: 3 } : {}),
    });
    commitWorldState(progress.state);
    if (!progress.complete) return;
    state.activity = null;
    emitted.push({ type: "movement-finished", destination: { ...activity.destination } });
    handleInteractionDecision(
      interaction.resume(activity.intent, state, interactionTarget(activity.intent)),
    );
  }

  function resolvePassage(intent: Extract<PlayerIntent, { kind: "passage" }>): void {
    if (intent.scene !== state.currentScene) return;
    const playerId = data.playerCharacter;
    if (!playerId) {
      failOperation("A Scene Passage destination is not available.");
      return;
    }
    const transition = world.transitionPassage(
      state,
      { passage: intent.passage, character: playerId },
      (condition, worldState) => conditionMatchesState(condition, { ...state, ...worldState }),
    );
    if (transition.status === "unavailable") return;
    if (transition.status === "invalid") {
      failOperation(transition.message);
      return;
    }
    state = { ...state, ...transition.state, activity: null };
    if (transition.arrivalSequence) {
      state.activity = {
        type: "sequence",
        sequence: transition.arrivalSequence,
        pendingPaths: topLevelPaths(data.sequences[transition.arrivalSequence]!),
        active: null,
      };
    }
    emitted.push({ type: "scene-changed", scene: state.currentScene });
    if (state.activity?.type === "sequence") advanceSequence();
  }

  function applyOperations(
    operations: readonly GameOperation[],
    target: HotspotTarget,
    firstNounObject?: string,
    commandStateDisposition: "preserve" | "reset" = "preserve",
  ): boolean {
    const draft = structuredClone(state);
    if (commandStateDisposition === "reset") {
      draft.command = { verb: "walk-to", firstNoun: null };
    }
    try {
      for (const operation of operations) applyOperation(draft, operation, target, firstNounObject);
    } catch (cause) {
      failOperation(cause instanceof Error ? cause.message : String(cause), cause);
      return false;
    }
    state = draft;
    if (state.activity?.type === "sequence") advanceSequence();
    return true;
  }

  function applyOperation(
    draft: GameState,
    operation: GameOperation,
    target: HotspotTarget,
    firstNounObject?: string,
  ): void {
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
      if (data.sequences[operation.sequence]!.scene !== undefined && data.sequences[operation.sequence]!.scene !== draft.currentScene) throw new Error(`Sequence '${operation.sequence}' belongs to another Scene.`);
      if (draft.activity?.type === "sequence") throw new Error("A Sequence cannot start another Sequence.");
      draft.activity = {
        type: "sequence",
        sequence: operation.sequence,
        pendingPaths: topLevelPaths(data.sequences[operation.sequence]!),
        active: null,
      };
    } else if (isInventoryOperation(operation)) {
      const result = interaction.applyInventoryOperation(
        operation,
        draft,
        {
          target,
          ...(firstNounObject ? { firstNounObject } : {}),
        },
      );
      if (result.status === "invalid") throw new Error(result.message);
      draft.objects = structuredClone(result.state.objects) as Record<string, ObjectState>;
      draft.inventory = { objects: [...result.state.inventory.objects] };
      draft.command = structuredClone(result.state.command);
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
      const stepDefinition = resolveSequencePath(definition, path) as SequenceStep;
      if (stepDefinition.type === "line") {
        activity.active = { kind: "line", path, animationStartedTick: state.tick + 1 };
      } else if (stepDefinition.type === "narration") {
        activity.active = { kind: "narration", path };
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
      } else if (stepDefinition.type === "direction") {
        if (!directedSubjectsAreAvailable(stepDefinition)) {
          failOperation("A directed subject is not available in the Sequence Scene.");
          return;
        }
        activity.active = { kind: "direction", path, elapsedTicks: 0 };
      }
      emitted.push({ type: "sequence-changed" });
    }
  }

  function advanceDirectedStep(): void {
    const activity = state.activity;
    if (activity?.type !== "sequence" || activity.active?.kind !== "direction") return;
    const definition = data.sequences[activity.sequence]!;
    const directionStep = resolveSequencePath(definition, activity.active.path) as DirectionStep;
    activity.active.elapsedTicks += 1;
    let interpretation = interpretDirectionStep(
      directionStep,
      activity.active.elapsedTicks,
      directedAnimation,
      characterMotionComplete,
    );
    applyDirectedMotions(directionStep, interpretation.directions.map(({ localTick }) => localTick));
    interpretation = interpretDirectionStep(
      directionStep,
      activity.active.elapsedTicks,
      directedAnimation,
      characterMotionComplete,
    );
    if (!interpretation.complete) return;
    activity.active = null;
    advanceSequence();
  }

  function directedSubjectsAreAvailable(step: DirectionStep): boolean {
    return step.directions.every((direction) => {
      if (direction.type === "camera" && direction.mode !== "follow") return true;
      return world.hasDirectedSubject(state, direction.subject);
    });
  }

  function characterMotionComplete(direction: MotionDirection): boolean {
    if (direction.subject.kind !== "character") return false;
    const character = state.characters[direction.subject.character];
    return characterMotionReachedDestination(direction, character?.groundPoint);
  }

  function directedAnimation(subject: DirectedSubject, animationName: string): AnimationDefinition | undefined {
    const appearance = appearanceForSubject(data, state, subject);
    return appearance?.animations[animationName];
  }

  function activeDirectionPresentation(): {
    readonly step: DirectionStep;
    readonly interpretation: ReturnType<typeof interpretDirectionStep>;
  } | undefined {
    if (state.activity?.type !== "sequence" || state.activity.active?.kind !== "direction") return undefined;
    const step = resolveSequencePath(
      data.sequences[state.activity.sequence],
      state.activity.active.path,
    ) as DirectionStep;
    return {
      step,
      interpretation: interpretDirectionStep(
        step,
        state.activity.active.elapsedTicks,
        directedAnimation,
        characterMotionComplete,
      ),
    };
  }

  function advanceCamera(): void {
    const scene = data.scenes[state.currentScene]!;
    const active = activeDirectionPresentation();
    const player = data.playerCharacter === undefined
      ? undefined
      : state.characters[data.playerCharacter];
    cameraPresentation = camera.update({
      tick: state.tick,
      scene: state.currentScene,
      viewport: data.logicalResolution,
      sceneSize: scene.size,
      ...(player?.scene === state.currentScene ? { player: player.groundPoint } : {}),
      directions: active?.step.directions.flatMap((direction, index) =>
        direction.type === "camera"
          ? [{
              direction,
              ...active.interpretation.directions[index]!,
              ...(direction.mode === "move"
                ? { durationTicks: secondsToTicks(direction.duration) }
                : {}),
            }]
          : [],
      ) ?? [],
      pointForSubject: (subject) => directedSubjectPoint(subject, active),
    });
  }

  function directedSubjectPoint(
    subject: DirectedSubject,
    active: ReturnType<typeof activeDirectionPresentation>,
  ): Point | undefined {
    if (subject.kind === "scenery" && active) {
      for (let index = active.step.directions.length - 1; index >= 0; index -= 1) {
        const direction = active.step.directions[index]!;
        const timing = active.interpretation.directions[index]!;
        if (direction.type !== "motion" || direction.subject.kind !== "scenery" ||
            direction.subject.scenery !== subject.scenery || !timing.presented) continue;
        return world.motionPoint(direction, {
          localTick: timing.localTick,
          durationTicks: secondsToTicks(direction.duration!),
        });
      }
    }
    return world.pointForSubject(state, subject);
  }

  function applyDirectedMotions(step: DirectionStep, localTicks: readonly number[]): void {
    step.directions.forEach((direction, index) => {
      if (direction.type !== "motion") return;
      const localTick = localTicks[index]!;
      if (localTick <= 0) return;
      const progress = world.advanceMotion(state, direction, {
        localTick,
        durationTicks: direction.subject.kind === "character"
          ? 0
          : secondsToTicks(direction.duration!),
      });
      commitWorldState(progress.state);
    });
  }

  function commitWorldState(worldState: WorldState): void {
    state = { ...state, ...worldState };
  }

  function chooseAlternative(alternative: number): void {
    const activity = state.activity;
    if (activity?.type !== "sequence" || activity.active?.kind !== "choice") return;
    if (!activity.active.eligibleAlternatives.includes(alternative)) return;
    const definition = data.sequences[activity.sequence]!;
    const stepDefinition = resolveSequencePath(definition, activity.active.path) as Extract<SequenceStep, { type: "choice" }>;
    const container =
      alternative === -1
        ? `${activity.active.path}/fallback/steps`
        : `${activity.active.path}/alternatives/${alternative}/steps`;
    activity.pendingPaths.unshift(...pathsForContainer(definition, container));
    const choice = alternative === -1 ? stepDefinition.fallback : stepDefinition.alternatives[alternative]!;
    if (choice.spoken !== false && data.playerCharacter) {
      activity.active = {
        kind: "line",
        path: activity.active.path,
        animationStartedTick: state.tick + 1,
        choiceText: choice.text,
        choiceCharacter: data.playerCharacter,
      };
      emitted.push({ type: "sequence-changed" });
    } else {
      activity.active = null;
      advanceSequence();
    }
  }

  function conditionMatches(condition?: InteractionCondition): boolean {
    return conditionMatchesState(condition, state);
  }

  function failOperation(message: string, cause?: unknown): void {
    status = "failed";
    state.activity = null;
    failureDiagnostics = [
      {
        code: "state.operation.invalid",
        family: "state", owner: "game-session",
        path: "Game Session.operation",
        message,
        cause,
      },
    ];
  }

  advanceCamera();
  return session;
}

function initialState(data: GameProjectData, world: WorldState): GameState {
  return {
    ...world,
    inventory: { objects: [] },
    command: { verb: "walk-to", firstNoun: null },
    variables: { ...data.variables },
    activity: null,
    tick: 0,
  };
}

function topLevelPaths(sequence: SequenceDefinition): string[] {
  return sequence.steps.map((_, index) => `steps/${index}`);
}

function pathsForContainer(sequence: SequenceDefinition, path: string): string[] {
  const steps = resolveSequencePath(sequence, path) as readonly SequenceStep[];
  return steps.map((_, index) => `${path}/${index}`);
}

function isInteractionInput(input: CoreInput): input is InteractionInput {
  return input.type !== "move" &&
    input.type !== "advance-sequence" &&
    input.type !== "advance-line" &&
    input.type !== "skip-sequence" &&
    input.type !== "choose";
}
