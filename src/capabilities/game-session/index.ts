import { AuthoringError, type AuthoringDiagnostic } from "../game-project";
import {
  createInteraction,
  conditionMatchesState,
  isInventoryOperation,
  type CommandState,
  type CommandResponse,
  type CommandVerb,
  type InteractionDecision,
  type InteractionCondition,
  type InteractionInput,
  type InteractionTargetView,
  type PlayerIntent,
  type PlayerIntentState,
} from "../interaction";
import {
  createHUD,
  type HUDInput,
  type HUDInputResult,
  type HUDNounView,
  type HUDPresentation,
  type HUDPresentationContext,
} from "../hud";
import {
  getGameProjectData,
  type GameOperation,
  type GameProject,
  type GameProjectData,
} from "../game-project";
import {
  createSave,
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
  createSequence,
  secondsToTicks,
  type DirectedSubject,
  type DirectionStep,
  type MotionDirection,
  type SequenceActivityState,
  type SequenceDecision,
  type SequenceDirectionContext,
  type SequencePresentation,
} from "../sequence";
export type { SequenceActiveState, SequenceActivityState } from "../sequence";
import type { Line } from "../sequence";
import {
  appearanceForSubject,
  objectHasAppearance,
  type AnimationDefinition,
} from "../animation";
import { Camera, type CameraPresentation } from "../camera";

export type { CharacterState, ObjectLocation, ObjectState } from "../world";

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
  hud(): HUDPresentation;
  hudInput(input: HUDInput): HUDInputResult;
  world(): WorldPresentation;
  camera(): CameraPresentation;
  sequence(): SequencePresentation | null;
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
  const hud = createHUD({ commandLexicon: data.commandLexicon });
  const sequenceCapability = createSequence(data.sequences);
  const save = createSave(project);
  let state = restored
    ? save.restore(restored)
    : initialState(data, world.initialState());
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
      return save.createSnapshot(state);
    },
    lifecycle: () => status,
    diagnostics: () => failureDiagnostics,
    hitTest(point) {
      return world.hitTest(state, point, conditionMatches);
    },
    hud() {
      return hud.presentation(hudContext());
    },
    hudInput(input) {
      if (status !== "running") return { focus: null };
      const result = hud.input(input, hudContext());
      if (result.interaction) inputs.push(structuredClone(result.interaction));
      return result;
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
    sequence() {
      return activeSequencePresentation() ?? null;
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

  function hudContext(): HUDPresentationContext {
    const nouns: HUDNounView[] = world.hotspots(state, conditionMatches)
      .flatMap(({ definition: hotspot, index }) => {
        const noun = interaction.nounForHotspot(state.currentScene, hotspot);
        if (!noun) return [];
        return [nounView(
          { kind: "hotspot", index },
          hotspot.area,
          noun,
        )];
      });
    nouns.push(...world.passages(state, conditionMatches).map(({ definition: passage, index }) => ({
      ...nounView(
        { kind: "passage", index },
        passage.area,
        passage.noun,
      ),
      direction: passage.direction,
    })));
    return {
      state,
      nouns,
      inventory: interaction.inventory(state),
      inventorySuspended:
        state.activity?.type === "sequence" && state.activity.active?.kind === "choice",
    };
  }

  function nounView(
    target: WorldTarget,
    area: readonly Point[],
    noun: HUDNounView["noun"],
  ): HUDNounView {
    return {
      target,
      area: area.map((point) => ({ ...point })),
      noun,
    };
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
        applySequenceDecision(sequenceCapability.continue(
          state.activity,
          sequenceRuntimeContext(),
        ));
      } else if (input.type === "choose" && state.activity.active?.kind === "choice") {
        applySequenceDecision(sequenceCapability.choose(
          state.activity,
          input.alternative,
          sequenceRuntimeContext(),
        ));
      } else if (input.type === "skip-sequence") {
        const decision = sequenceCapability.skip(state.activity);
        if (decision.type === "apply-skip-outcome") applySkipOutcome(decision.operations);
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

  function applySkipOutcome(operations: readonly GameOperation[]): void {
    const draft = structuredClone(state);
    try {
      for (const operation of operations) {
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
      state.activity = sequenceCapability.start(transition.arrivalSequence);
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
      draft.activity = sequenceCapability.start(operation.sequence);
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
    if (state.activity?.type !== "sequence") return;
    applySequenceDecision(sequenceCapability.advance(
      state.activity,
      sequenceRuntimeContext(),
    ));
  }

  function applySequenceDecision(decision: SequenceDecision): void {
    if (decision.type === "invalid") {
      failOperation(decision.message);
      return;
    }
    if (decision.type === "complete") {
      state.activity = null;
      emitted.push({ type: "sequence-changed" });
      return;
    }
    state.activity = structuredClone(decision.activity);
    emitted.push({ type: "sequence-changed" });
    if (decision.type === "apply-operations") {
      applyOperations(decision.operations, { kind: "background" });
    }
  }

  function sequenceRuntimeContext() {
    return {
      tick: state.tick,
      ...(data.playerCharacter ? { playerCharacter: data.playerCharacter } : {}),
      conditionMatches,
      directedSubjectsAreAvailable,
    };
  }

  function advanceDirectedStep(): void {
    const activity = state.activity;
    if (activity?.type !== "sequence" || activity.active?.kind !== "direction") return;
    const ticked = sequenceCapability.tickDirection(activity);
    state.activity = ticked;
    let presentation = activeDirectionPresentation();
    if (!presentation) return;
    applyDirectedMotions(presentation);
    presentation = activeDirectionPresentation();
    if (!presentation?.complete) return;
    applySequenceDecision(sequenceCapability.completeDirection(
      ticked,
      sequenceRuntimeContext(),
    ));
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

  function sequenceDirectionContext(): SequenceDirectionContext {
    return {
      animationFor: directedAnimation,
      characterMotionComplete,
    };
  }

  function activeSequencePresentation(): SequencePresentation | undefined {
    if (state.activity?.type !== "sequence") return undefined;
    return sequenceCapability.presentation(state.activity, sequenceDirectionContext());
  }

  function activeDirectionPresentation(): Extract<SequencePresentation, { kind: "direction" }> | undefined {
    const presentation = activeSequencePresentation();
    return presentation?.kind === "direction" ? presentation : undefined;
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
      directions: active?.directions.flatMap(({ direction, timing }) =>
        direction.type === "camera"
          ? [{
              direction,
              ...timing,
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
      for (let index = active.directions.length - 1; index >= 0; index -= 1) {
        const { direction, timing } = active.directions[index]!;
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

  function applyDirectedMotions(
    presentation: Extract<SequencePresentation, { kind: "direction" }>,
  ): void {
    presentation.directions.forEach(({ direction, timing }) => {
      if (direction.type !== "motion") return;
      const { localTick } = timing;
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

function isInteractionInput(input: CoreInput): input is InteractionInput {
  return input.type !== "move" &&
    input.type !== "advance-sequence" &&
    input.type !== "advance-line" &&
    input.type !== "skip-sequence" &&
    input.type !== "choose";
}
