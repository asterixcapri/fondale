import {
  AuthoringError,
  type AuthoringDiagnostic,
} from "../game-project";
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
  type HUDAdapterFacts,
  type HUDInput,
  type HUDInputResult,
  type HUDNounView,
  type HUDPresentation,
  type HUDPresentationContext,
} from "../hud";
import {
  getGameSessionCompositionView,
  type GameOperation,
  type CompiledGameProject,
  type GameSessionGameProjectView,
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
  animationPresentationForSubject,
  appearanceForSubject,
  objectHasAppearance,
  validateAppearanceOperationReference,
  type AnimationDefinition,
  type AnimationPresentation,
} from "../animation";
import { Camera, type CameraPresentation } from "../camera";
import {
  createKnowledgeDrivenDialogue,
  dialogueInputMaxLength,
  isDialogueGameOperation,
  type CharacterKnowledgeState,
  type CharacterDialogueState,
  type DialogueProvider,
  type DialogueTurnContext,
  type KnowledgeDrivenDialogueState,
  type LearnNarrativeFactOperation,
  type RecordTestimonyOperation,
  type RelationshipState,
  type Testimony,
} from "../dialogue";

export type { CharacterState, ObjectLocation, ObjectState } from "../world";

export interface LineActivityState {
  type: "line";
  animationStartedTick: number;
  line: Omit<Line, "audio"> & { audio?: string };
}

export interface ConversationActivityState {
  readonly type: "conversation";
  readonly character: string;
}

export interface ReflectionActivityState {
  readonly type: "reflection";
}

export type GameActivityState = PlayerIntentState
  | SequenceActivityState
  | LineActivityState
  | ConversationActivityState
  | ReflectionActivityState;

export interface GameState extends WorldState {
  inventory: { objects: string[] };
  command: CommandState;
  variables: Record<string, boolean>;
  characterKnowledge: CharacterKnowledgeState;
  relationships: RelationshipState;
  dialogueStates: CharacterDialogueState;
  testimonies: Testimony[];
  conversationContinuation?: ConversationActivityState;
  activity: GameActivityState | null;
  tick: number;
}

export type CoreInput = InteractionInput
  | { readonly type: "move"; readonly point: Point; readonly fast?: boolean }
  | { readonly type: "advance-sequence" }
  | { readonly type: "advance-line" }
  | { readonly type: "advance-conversation-line" }
  | { readonly type: "advance-reflection-line" }
  | { readonly type: "skip-sequence" }
  | { readonly type: "choose"; readonly alternative: number };

export type CoreEffect =
  | { readonly type: "movement-started"; readonly destination: Point; readonly fast?: true }
  | { readonly type: "movement-finished"; readonly destination: Point }
  | { readonly type: "interaction-response"; readonly text: string; readonly response?: CommandResponse }
  | { readonly type: "scene-changed"; readonly scene: string }
  | { readonly type: "sequence-changed" }
  | { readonly type: "conversation-changed" }
  | { readonly type: "reflection-changed" };

export interface ConversationPresentation {
  readonly character: string;
  readonly status: "ready" | "pending" | "line" | "error";
  readonly maxInputLength: number;
  readonly error?: string;
}

export interface ReflectionPresentation {
  readonly status: "ready" | "pending" | "line" | "error";
  readonly maxInputLength: number;
  readonly error?: string;
}

export type DialogueSubmissionResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly message: string };

interface DialogueTurnContent {
  readonly character: string;
  readonly playerInput: string;
  readonly response: string;
  readonly playerCharacter: string;
}

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
  hud(facts?: HUDAdapterFacts): HUDPresentation;
  hudInput(input: HUDInput, facts?: HUDAdapterFacts): HUDInputResult;
  world(): WorldPresentation;
  animation(subject: DirectedSubject): AnimationPresentation | undefined;
  camera(): CameraPresentation;
  sequence(): SequencePresentation | null;
  conversation(): ConversationPresentation | null;
  reflection(): ReflectionPresentation | null;
  startReflection(): boolean;
  submitDialogue(playerInput: string): Promise<DialogueSubmissionResult>;
  submitReflection(playerInput: string): Promise<DialogueSubmissionResult>;
  stop(): void;
}

export function createCoreSession(
  project: CompiledGameProject,
  restored?: ValidatedSaveSnapshot,
  dialogueProvider?: DialogueProvider,
): CoreSession {
  const projectViews = getGameSessionCompositionView(project);
  const world = createWorld(projectViews.world);
  const interaction = createInteraction(projectViews.interaction, {
    canPlaceObject: (scene, point) => world.canPlaceObject(scene, point),
    objectHasAppearance: (object, appearance) =>
      objectHasAppearance(projectViews.animation, object, appearance),
  });
  const hud = createHUD(projectViews.hud);
  const sequenceCapability = createSequence(projectViews.sequences);
  const dialogue = createKnowledgeDrivenDialogue(projectViews.dialogue);
  if (dialogue.requiresProvider() && !dialogueProvider) {
    throw new TypeError("A Dialogue Provider is required by this Game Project.");
  }
  const save = createSave(project);
  let state = restored
    ? save.restore(restored)
    : initialState(projectViews.gameProject, world.initialState(), dialogue.initialState());
  let status: "running" | "failed" | "stopped" = "running";
  let failureDiagnostics: readonly AuthoringDiagnostic[] = [];
  const inputs: CoreInput[] = [];
  const emitted: CoreEffect[] = [];
  const camera = new Camera();
  let cameraPresentation: CameraPresentation;
  let dialogueTurn: DialogueTurnContent & {
    phase: "player" | "character";
  } | null = null;
  let conversationStatus: ConversationPresentation["status"] = "ready";
  let conversationError: string | undefined;
  let dialogueCompletion: DialogueTurnContent & {
    readonly operation?: LearnNarrativeFactOperation | RecordTestimonyOperation;
  } | null = null;
  let pendingProviderTurn: {
    readonly mode: "conversation" | "reflection";
    readonly turnId: string;
    readonly controller: AbortController;
  } | null = null;
  let providerTurnSequence = 0;
  let reflectionTurn: { readonly response: string; readonly playerCharacter: string } | null = null;
  let reflectionStatus: ReflectionPresentation["status"] = "ready";
  let reflectionError: string | undefined;
  let reflectionCompletion: {
    readonly response: string;
    readonly playerCharacter: string;
  } | null = null;

  const session: CoreSession = {
    input(input) {
      if (status !== "running") return;
      if (input.type === "escape" && state.activity?.type === "conversation") {
        invalidateProviderTurn("conversation");
      } else if (input.type === "escape" && state.activity?.type === "reflection") {
        invalidateProviderTurn("reflection");
      }
      inputs.push(structuredClone(input));
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
      invalidateProviderTurn();
      return save.createSnapshot(state);
    },
    lifecycle: () => status,
    diagnostics: () => structuredClone(failureDiagnostics),
    hitTest(point) {
      return world.hitTest(state, point, conditionMatches);
    },
    hud(facts) {
      return hud.presentation(hudContext(facts));
    },
    hudInput(input, facts) {
      if (status !== "running") return { focus: null };
      const result = hud.input(input, hudContext(facts));
      if (result.interaction) inputs.push(structuredClone(result.interaction));
      if (result.session) inputs.push(structuredClone(result.session));
      return result;
    },
    world() {
      return world.presentation(state, (scenery) => directedSubjectPoint(
        { kind: "scenery", scenery },
        activeDirectionPresentation(),
      ));
    },
    animation(subject) {
      const direction = activeDirectionPresentation();
      const line = activeLineAnimation();
      return animationPresentationForSubject(projectViews.animation, state, subject, {
        ...(direction ? { direction } : {}),
        ...(line ? { line } : {}),
      });
    },
    camera() {
      return cameraPresentation;
    },
    sequence() {
      return activeSequencePresentation() ?? null;
    },
    conversation() {
      if (state.activity?.type !== "conversation") return null;
      return structuredClone({
        character: state.activity.character,
        status: conversationStatus,
        maxInputLength: dialogueInputMaxLength,
        ...(conversationError ? { error: conversationError } : {}),
      });
    },
    reflection() {
      if (state.activity?.type !== "reflection") return null;
      return structuredClone({
        status: reflectionStatus,
        maxInputLength: dialogueInputMaxLength,
        ...(reflectionError ? { error: reflectionError } : {}),
      });
    },
    startReflection() {
      const playerCharacter = projectViews.world.playerCharacter;
      if (status !== "running" || state.activity !== null || !playerCharacter ||
          !dialogueProvider || !dialogue.hasProfile(playerCharacter)) return false;
      state.activity = { type: "reflection" };
      reflectionTurn = null;
      reflectionCompletion = null;
      reflectionStatus = "ready";
      reflectionError = undefined;
      emitted.push({ type: "reflection-changed" });
      return true;
    },
    async submitDialogue(playerInput) {
      const activity = state.activity;
      const playerCharacter = projectViews.world.playerCharacter;
      if (activity?.type !== "conversation" || !playerCharacter || !dialogueProvider) {
        return { ok: false, message: "No Conversation is ready for Player speech." };
      }
      if (conversationStatus !== "ready" && conversationStatus !== "error") {
        return { ok: false, message: "The Conversation is not ready for Player speech." };
      }
      conversationStatus = "pending";
      conversationError = undefined;
      return runProviderTurn(
        "conversation",
        "Dialogue Turn was cancelled.",
        (context) => dialogue.respond(state, {
          speaker: activity.character,
          listener: playerCharacter,
          playerInput,
        }, dialogueProvider, context),
        (turn) => {
          dialogueCompletion = {
            character: activity.character,
            playerInput: turn.playerInput,
            response: turn.response,
            ...(turn.operation ? { operation: turn.operation } : {}),
            playerCharacter,
          };
        },
        (message) => {
          conversationStatus = "error";
          conversationError = message;
        },
      );
    },
    async submitReflection(playerInput) {
      const playerCharacter = projectViews.world.playerCharacter;
      if (state.activity?.type !== "reflection" || !playerCharacter || !dialogueProvider) {
        return { ok: false, message: "No Reflection is ready for Player speech." };
      }
      if (reflectionStatus !== "ready" && reflectionStatus !== "error") {
        return { ok: false, message: "Reflection is not ready for Player speech." };
      }
      reflectionStatus = "pending";
      reflectionError = undefined;
      return runProviderTurn(
        "reflection",
        "Reflection turn was cancelled.",
        (context) => dialogue.reflect(state, {
          character: playerCharacter,
          playerInput,
        }, dialogueProvider, context),
        (turn) => {
          reflectionCompletion = { response: turn.response, playerCharacter };
        },
        (message) => {
          reflectionStatus = "error";
          reflectionError = message;
        },
      );
    },
    stop() {
      if (status === "stopped") return;
      invalidateProviderTurn();
      status = "stopped";
      inputs.length = 0;
    },
  };

  function assertRunning(): void {
    if (status !== "running") throw new Error(`Game Session is ${status}.`);
  }

  function beginProviderTurn(mode: "conversation" | "reflection") {
    const turn = {
      mode,
      turnId: `${mode === "conversation" ? "dialogue" : "reflection"}-turn-${
        providerTurnSequence += 1
      }`,
      controller: new AbortController(),
    } as const;
    pendingProviderTurn = turn;
    return turn;
  }

  async function runProviderTurn<T>(
    mode: "conversation" | "reflection",
    cancellationMessage: string,
    execute: (context: DialogueTurnContext) => Promise<T>,
    complete: (result: T) => void,
    fail: (message: string) => void,
  ): Promise<DialogueSubmissionResult> {
    const currentTurn = beginProviderTurn(mode);
    const context = { turnId: currentTurn.turnId, signal: currentTurn.controller.signal };
    try {
      const result = await execute(context);
      if (providerTurnWasCancelled(currentTurn)) {
        return { ok: false, message: cancellationMessage };
      }
      complete(result);
      return { ok: true };
    } catch (cause) {
      if (providerTurnWasCancelled(currentTurn)) {
        return { ok: false, message: cancellationMessage };
      }
      pendingProviderTurn = null;
      const message = cause instanceof Error ? cause.message : String(cause);
      fail(message);
      return { ok: false, message };
    }
  }

  function invalidateProviderTurn(mode?: "conversation" | "reflection"): void {
    const pending = pendingProviderTurn;
    const hadDialogueCompletion = dialogueCompletion !== null;
    const hadReflectionCompletion = reflectionCompletion !== null;
    if (pending && (mode === undefined || pending.mode === mode)) {
      pendingProviderTurn = null;
      pending.controller.abort();
    }
    if ((mode === undefined || mode === "conversation") && dialogueCompletion) {
      dialogueCompletion = null;
    }
    if ((mode === undefined || mode === "reflection") && reflectionCompletion) {
      reflectionCompletion = null;
    }
    if (state.activity?.type === "conversation" &&
        (mode === undefined || mode === "conversation") &&
        (pending?.mode === "conversation" || hadDialogueCompletion)) {
      conversationStatus = "ready";
      conversationError = undefined;
    }
    if (state.activity?.type === "reflection" &&
        (mode === undefined || mode === "reflection") &&
        (pending?.mode === "reflection" || hadReflectionCompletion)) {
      reflectionStatus = "ready";
      reflectionError = undefined;
    }
  }

  function providerTurnWasCancelled(turn: NonNullable<typeof pendingProviderTurn>): boolean {
    return pendingProviderTurn !== turn || turn.controller.signal.aborted;
  }

  function hudContext(facts: HUDAdapterFacts = {}): HUDPresentationContext {
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
      ...facts,
      narrative: activeNarrativeFacts(),
      sequenceActive: state.activity?.type === "sequence",
      world: world.presentation(state, (scenery) => directedSubjectPoint(
        { kind: "scenery", scenery },
        activeDirectionPresentation(),
      )),
      camera: cameraPresentation,
      inventorySuspended:
        state.activity?.type === "sequence" && state.activity.active?.kind === "choice",
    };
  }

  function activeNarrativeFacts(): HUDPresentationContext["narrative"] {
    if (state.activity?.type === "reflection" && reflectionTurn) {
      return {
        kind: "line",
        source: "reflection",
        character: reflectionTurn.playerCharacter,
        text: reflectionTurn.response,
      };
    }
    if (state.activity?.type === "conversation" && dialogueTurn) {
      return dialogueTurn.phase === "player"
        ? {
            kind: "line",
            source: "conversation",
            character: dialogueTurn.playerCharacter,
            text: dialogueTurn.playerInput,
          }
        : {
            kind: "line",
            source: "conversation",
            character: dialogueTurn.character,
            text: dialogueTurn.response,
          };
    }
    if (state.activity?.type === "line") {
      return {
        kind: "line",
        source: "line",
        character: state.activity.line.character,
        text: state.activity.line.text,
        ...(state.activity.line.audio ? { audio: state.activity.line.audio } : {}),
      };
    }
    const presentation = activeSequencePresentation();
    if (presentation?.kind === "line") {
      return {
        kind: "line",
        source: "sequence",
        character: presentation.character,
        text: presentation.text,
        ...(presentation.audio ? { audio: presentation.audio } : {}),
      };
    }
    if (presentation?.kind === "narration") return presentation;
    if (presentation?.kind === "choice") return presentation;
    return undefined;
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
    commitDialogueCompletion();
    commitReflectionCompletion();
    for (const input of inputs.splice(0)) {
      handleInput(input);
      if (status !== "running") return;
    }
    advanceDirectedStep();
    if (status !== "running") return;
    advancePlayerIntent();
    if (status !== "running") return;
    state.tick += 1;
    advanceCamera();
  }

  function commitDialogueCompletion(): void {
    const completion = dialogueCompletion;
    if (!completion) return;
    dialogueCompletion = null;
    pendingProviderTurn = null;
    if (state.activity?.type !== "conversation" ||
        state.activity.character !== completion.character) return;
    const draft = structuredClone(state);
    if (completion.operation) {
      Object.assign(draft, dialogue.applyOperation(draft, completion.operation));
    }
    state = draft;
    const { operation: _committedOperation, ...content } = completion;
    dialogueTurn = {
      ...content,
      phase: "player",
    };
    conversationStatus = "line";
    emitted.push({ type: "conversation-changed" });
  }

  function commitReflectionCompletion(): void {
    const completion = reflectionCompletion;
    if (!completion) return;
    reflectionCompletion = null;
    pendingProviderTurn = null;
    if (state.activity?.type !== "reflection") return;
    reflectionTurn = completion;
    reflectionStatus = "line";
    emitted.push({ type: "reflection-changed" });
  }

  function handleInput(input: CoreInput): void {
    if (state.activity?.type === "reflection") {
      if (input.type === "escape") {
        invalidateProviderTurn("reflection");
        reflectionTurn = null;
        state.activity = null;
      } else if (input.type === "advance-reflection-line" && reflectionTurn) {
        reflectionTurn = null;
        reflectionStatus = "ready";
      }
      emitted.push({ type: "reflection-changed" });
      return;
    }
    if (state.activity?.type === "conversation") {
      if (input.type === "escape") {
        invalidateProviderTurn("conversation");
        dialogueTurn = null;
        closeOrHandoffConversation(state.activity.character);
      } else if (input.type === "advance-conversation-line" && dialogueTurn) {
        if (dialogueTurn.phase === "player") {
          dialogueTurn.phase = "character";
        } else {
          dialogueTurn = null;
          if (!startConversationHandoff(state.activity.character)) {
            conversationStatus = "ready";
          }
        }
        emitted.push({ type: "conversation-changed" });
      }
      return;
    }
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
      hud.notify({ type: "command-response", text: decision.resolution.response.text });
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
    finishSequence(draft);
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
    const playerId = projectViews.world.playerCharacter;
    const player = playerId ? state.characters[playerId] : undefined;
    const definition = playerId ? projectViews.world.characters[playerId] : undefined;
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
    const target = interactionTarget(activity.intent);
    if (openConversation(activity.intent, target)) return;
    handleInteractionDecision(interaction.resume(activity.intent, state, target));
  }

  function openConversation(
    intent: PlayerIntent,
    target: InteractionTargetView | undefined,
  ): boolean {
    if (intent.kind !== "interaction" || intent.command?.verb !== "talk-to" ||
        target?.target.kind !== "character" || !dialogue.hasProfile(target.target.character)) {
      return false;
    }
    if (!intent.command.preserveState) {
      state.command = { verb: "walk-to", firstNoun: null };
    }
    state.activity = { type: "conversation", character: target.target.character };
    dialogueTurn = null;
    dialogueCompletion = null;
    conversationStatus = "ready";
    conversationError = undefined;
    emitted.push({ type: "conversation-changed" });
    return true;
  }

  function closeOrHandoffConversation(character: string): void {
    if (!startConversationHandoff(character)) {
      state.activity = null;
      emitted.push({ type: "conversation-changed" });
    }
  }

  function startConversationHandoff(character: string): boolean {
    const handoff = dialogue.handoff(character, conditionMatches);
    if (!handoff) return false;
    invalidateProviderTurn("conversation");
    dialogueTurn = null;
    if (handoff.after === "resume") {
      state.conversationContinuation = { type: "conversation", character };
    } else {
      delete state.conversationContinuation;
    }
    state.activity = sequenceCapability.start(handoff.sequence, state.currentScene);
    emitted.push({ type: "sequence-changed" });
    advanceSequence();
    return true;
  }

  function resolvePassage(intent: Extract<PlayerIntent, { kind: "passage" }>): void {
    if (intent.scene !== state.currentScene) return;
    const playerId = projectViews.world.playerCharacter;
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
      state.activity = sequenceCapability.start(transition.arrivalSequence, state.currentScene);
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
    if (isDialogueGameOperation(operation)) {
      Object.assign(draft, dialogue.applyOperation(draft, operation));
    } else if (operation.type === "set-variable") {
      if (!(operation.variable in projectViews.gameProject.variables)) throw new Error(`Unknown Game Variable '${operation.variable}'.`);
      draft.variables[operation.variable] = operation.value;
    } else if (operation.type === "set-appearance") {
      const [diagnostic] = validateAppearanceOperationReference(
        operation,
        "Game Session.operation",
        projectViews.animation,
      );
      if (diagnostic) throw new Error(diagnostic.message);
      const { target: appearanceTarget } = operation;
      if (appearanceTarget.kind === "character") {
        const current = draft.characters[appearanceTarget.character];
        if (!current) {
          throw new Error("Invalid Character Appearance operation.");
        }
        current.appearance = operation.appearance;
      } else if (appearanceTarget.kind === "object") {
        const current = draft.objects[appearanceTarget.object];
        if (!current) {
          throw new Error("Invalid Object Appearance operation.");
        }
        current.appearance = operation.appearance;
      } else {
        const current = draft.scenery[appearanceTarget.scene];
        if (!current || !(appearanceTarget.scenery in current)) {
          throw new Error("Invalid Scenery Appearance operation.");
        }
        current[appearanceTarget.scenery] = operation.appearance;
      }
    } else if (operation.type === "start-sequence") {
      if (draft.activity?.type === "sequence") throw new Error("A Sequence cannot start another Sequence.");
      draft.activity = sequenceCapability.start(operation.sequence, draft.currentScene);
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
      finishSequence(state);
      emitted.push({ type: "sequence-changed" });
      return;
    }
    state.activity = structuredClone(decision.activity);
    emitted.push({ type: "sequence-changed" });
    if (decision.type === "apply-operations") {
      applyOperations(decision.operations, { kind: "background" });
    }
  }

  function finishSequence(next: GameState): void {
    const continuation = next.conversationContinuation;
    delete next.conversationContinuation;
    next.activity = continuation ?? null;
    state = next;
    if (!continuation) return;
    prepareResumedConversation();
  }

  function prepareResumedConversation(): void {
    dialogueTurn = null;
    dialogueCompletion = null;
    conversationStatus = "ready";
    conversationError = undefined;
    emitted.push({ type: "conversation-changed" });
  }

  function sequenceRuntimeContext() {
    return {
      tick: state.tick,
      ...(projectViews.world.playerCharacter
        ? { playerCharacter: projectViews.world.playerCharacter }
        : {}),
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
    const appearance = appearanceForSubject(projectViews.animation, state, subject);
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

  function activeLineAnimation(): { readonly character: string; readonly animation?: string } | undefined {
    if (state.activity?.type === "conversation" && dialogueTurn) {
      return {
        character: dialogueTurn.phase === "player"
          ? dialogueTurn.playerCharacter
          : dialogueTurn.character,
      };
    }
    if (state.activity?.type === "line") return state.activity.line;
    const presentation = activeSequencePresentation();
    return presentation?.kind === "line"
      ? {
          character: presentation.character,
          ...(presentation.animation ? { animation: presentation.animation } : {}),
        }
      : undefined;
  }

  function activeDirectionPresentation(): Extract<SequencePresentation, { kind: "direction" }> | undefined {
    const presentation = activeSequencePresentation();
    return presentation?.kind === "direction" ? presentation : undefined;
  }

  function advanceCamera(): void {
    const scene = projectViews.world.scenes[state.currentScene]!;
    const active = activeDirectionPresentation();
    const player = projectViews.world.playerCharacter === undefined
      ? undefined
      : state.characters[projectViews.world.playerCharacter];
    cameraPresentation = camera.update({
      tick: state.tick,
      scene: state.currentScene,
      viewport: projectViews.world.logicalResolution,
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
    inputs.length = 0;
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

function initialState(
  data: GameSessionGameProjectView,
  world: WorldState,
  dialogueState: KnowledgeDrivenDialogueState,
): GameState {
  return {
    ...world,
    inventory: { objects: [] },
    command: { verb: "walk-to", firstNoun: null },
    variables: { ...data.variables },
    ...dialogueState,
    activity: null,
    tick: 0,
  };
}

function isInteractionInput(input: CoreInput): input is InteractionInput {
  return input.type !== "move" &&
    input.type !== "advance-sequence" &&
    input.type !== "advance-line" &&
    input.type !== "advance-conversation-line" &&
    input.type !== "advance-reflection-line" &&
    input.type !== "skip-sequence" &&
    input.type !== "choose";
}
