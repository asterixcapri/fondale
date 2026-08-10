import { AuthoringError, type AuthoringDiagnostic } from "../public/diagnostics";
import type { CommandResponse, CommandVerb, NounDefinition, Verb } from "../public/commands";
import {
  getGameProjectData,
  type Facing,
  type GameOperation,
  type GameProject,
  type GameProjectData,
  type HotspotDefinition,
  type HotspotTarget,
  type InteractionCondition,
  type Line,
  type Point,
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
  fast?: true;
  intent:
    | { kind: "move" }
    | {
        kind: "interaction";
        scene: string;
        hotspot: number;
        command?: { verb: CommandVerb; firstNoun?: string; preserveState?: boolean };
      }
    | {
        kind: "passage-command";
        scene: string;
        passage: number;
        command: { verb: CommandVerb; firstNoun?: string; preserveState?: boolean };
      }
    | { kind: "passage"; scene: string; passage: number };
}

export type SequenceActiveState =
  | { kind: "line"; path: string; choiceText?: string; choiceCharacter?: string }
  | { kind: "narration"; path: string }
  | { kind: "choice"; path: string; eligibleAlternatives: number[] };

export interface SequenceActivityState {
  type: "sequence";
  sequence: string;
  pendingPaths: string[];
  active: SequenceActiveState | null;
}

export interface LineActivityState {
  type: "line";
  line: Omit<Line, "audio"> & { audio?: string };
}

export type GameActivityState = PlayerIntentState | SequenceActivityState | LineActivityState;

export interface GameState {
  currentScene: string;
  characters: Record<string, CharacterState>;
  scenery: Record<string, Record<string, string>>;
  objects: Record<string, ObjectState>;
  inventory: { objects: string[] };
  command: { verb: Verb; firstNoun: null | { kind: "object"; object: string } };
  variables: Record<string, boolean>;
  activity: GameActivityState | null;
  tick: number;
}

export type CoreInput =
  | { readonly type: "move"; readonly point: Point; readonly fast?: boolean }
  | { readonly type: "select-verb"; readonly verb: CommandVerb }
  | { readonly type: "activate-hotspot"; readonly hotspot: number }
  | { readonly type: "quick-hotspot"; readonly hotspot: number; readonly verb?: Verb }
  | { readonly type: "contextual-hotspot"; readonly hotspot: number; readonly action: "primary" | "secondary" }
  | { readonly type: "activate-passage"; readonly passage: number; readonly fast?: boolean; readonly forceWalk?: boolean }
  | { readonly type: "quick-passage"; readonly passage: number; readonly verb?: Verb }
  | { readonly type: "contextual-passage"; readonly passage: number; readonly action: "primary" | "secondary" }
  | { readonly type: "activate-object"; readonly object: string }
  | { readonly type: "select-object"; readonly object: string }
  | { readonly type: "contextual-object"; readonly object: string; readonly action: "primary" | "secondary" }
  | { readonly type: "escape" }
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

export type CoreWorldTarget =
  | { readonly kind: "hotspot"; readonly index: number }
  | { readonly kind: "passage"; readonly index: number };

export interface AvailableHotspot {
  readonly index: number;
  readonly area: readonly Point[];
  readonly label: string;
  readonly preferredVerb?: Verb;
  readonly secondaryVerb?: Verb;
  readonly objectVerb?: Verb;
}

export interface AvailableInventoryNoun {
  readonly object: string;
  readonly label: string;
  readonly preferredVerb: Verb;
  readonly secondaryVerb?: Verb;
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
  availableInventory(): readonly AvailableInventoryNoun[];
  availablePassages(): readonly AvailablePassage[];
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
        const noun = hotspotNoun(state.currentScene, hotspot);
        const label = conditionalValue(noun.labels).text;
        const preferredVerb = conditionalValue(noun.preferredVerbs).verb;
        const secondaryVerb = conditionalOptionalValue(noun.secondaryVerbs)?.verb;
        const objectVerb = conditionalOptionalValue(noun.objectVerbs)?.verb;
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
    availableInventory() {
      return state.inventory.objects.flatMap((object) => {
        const noun = data.objects[object]?.noun;
        if (!noun) return [];
        const secondaryVerb = conditionalOptionalValue(noun.secondaryVerbs)?.verb;
        return [{
          object,
          label: conditionalValue(noun.labels).text,
          preferredVerb: conditionalValue(noun.preferredVerbs).verb,
          ...(secondaryVerb ? { secondaryVerb } : {}),
        }];
      });
    },
    availablePassages() {
      const scene = data.scenes[state.currentScene]!;
      return (scene.passages ?? []).flatMap((passage, index) => {
        if (!conditionMatches(passage.when)) return [];
        const secondaryVerb = conditionalOptionalValue(passage.noun.secondaryVerbs)?.verb;
        const objectVerb = conditionalOptionalValue(passage.noun.objectVerbs)?.verb;
        return [{
          index,
          area: passage.area.map((point) => ({ ...point })),
          label: conditionalValue(passage.noun.labels).text,
          preferredVerb: conditionalValue(passage.noun.preferredVerbs).verb,
          ...(secondaryVerb ? { secondaryVerb } : {}),
          ...(objectVerb ? { objectVerb } : {}),
          direction: passage.direction,
        }];
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
        state.activity = null;
        emitted.push({ type: "sequence-changed" });
      }
      return;
    }

    if (input.type === "select-verb") {
      state.activity = null;
      state.command = { verb: input.verb, firstNoun: null };
    } else if (input.type === "move") {
      beginIntent({ kind: "move" }, input.point, undefined, input.fast);
    } else if (
      input.type === "activate-hotspot" ||
      input.type === "quick-hotspot" ||
      input.type === "contextual-hotspot"
    ) {
      const scene = data.scenes[state.currentScene]!;
      const hotspot = scene.hotspots?.[input.hotspot];
      if (hotspot && hotspotAvailable(hotspot)) {
        const noun = hotspotNoun(state.currentScene, hotspot);
        if (
          input.type === "activate-hotspot" &&
          state.command.verb === "give" &&
          !state.command.firstNoun
        ) return;
        if (input.type === "activate-hotspot" && state.command.verb === "walk-to") {
          beginIntent({ kind: "move" }, hotspot.approach.groundPoint, hotspot.approach.facing);
          return;
        }
        const quickVerb = input.type === "quick-hotspot"
          ? input.verb ?? conditionalValue(noun.preferredVerbs).verb
          : input.type === "contextual-hotspot"
            ? contextualVerb(noun, input.action)
            : undefined;
        if (input.type === "contextual-hotspot" && !quickVerb) return;
        const commandFirstNoun = quickVerb
          ? preferredFirstNoun(noun, quickVerb)
          : state.command.firstNoun?.object;
        if (quickVerb === "walk-to") {
          beginIntent({ kind: "move" }, hotspot.approach.groundPoint, hotspot.approach.facing);
          return;
        }
        beginIntent(
          {
            kind: "interaction",
            scene: state.currentScene,
            hotspot: input.hotspot,
            command: {
              verb: (quickVerb ?? state.command.verb) as CommandVerb,
              ...(commandFirstNoun
                ? { firstNoun: commandFirstNoun }
                : {}),
              ...(quickVerb ? { preserveState: true } : {}),
            },
          },
          hotspot.approach.groundPoint,
          hotspot.approach.facing,
        );
      }
    } else if (
      input.type === "activate-passage" ||
      input.type === "quick-passage" ||
      input.type === "contextual-passage"
    ) {
      const scene = data.scenes[state.currentScene]!;
      const passage = scene.passages?.[input.passage];
      if (passage && conditionMatches(passage.when)) {
        if (
          input.type === "activate-passage" &&
          state.command.verb === "give" &&
          !state.command.firstNoun
        ) return;
        const preferredVerb = input.type === "quick-passage"
          ? input.verb ?? conditionalValue(passage.noun.preferredVerbs).verb
          : input.type === "contextual-passage"
            ? contextualVerb(passage.noun, input.action)
            : undefined;
        if (input.type === "contextual-passage" && !preferredVerb) return;
        const commandFirstNoun = preferredVerb
          ? preferredFirstNoun(passage.noun, preferredVerb)
          : state.command.firstNoun?.object;
        const shouldWalk = input.type === "activate-passage" &&
          (input.forceWalk || state.command.verb === "walk-to") || preferredVerb === "walk-to";
        const intent: PlayerIntentState["intent"] = shouldWalk
          ? { kind: "passage", scene: state.currentScene, passage: input.passage }
          : {
              kind: "passage-command",
              scene: state.currentScene,
              passage: input.passage,
              command: {
                verb: (preferredVerb ?? state.command.verb) as CommandVerb,
                ...(commandFirstNoun
                  ? { firstNoun: commandFirstNoun }
                  : {}),
                ...(preferredVerb ? { preserveState: true } : {}),
              },
            };
        beginIntent(
          intent,
          passage.approach.groundPoint,
          passage.approach.facing,
          input.type === "activate-passage" && input.fast,
        );
      }
    } else if (input.type === "select-object") {
      if (!state.inventory.objects.includes(input.object)) return;
      state.activity = null;
      state.command = state.command.firstNoun?.object === input.object
        ? { verb: "walk-to", firstNoun: null }
        : { verb: "use", firstNoun: { kind: "object", object: input.object } };
    } else if (input.type === "contextual-object") {
      if (!state.inventory.objects.includes(input.object)) return;
      const noun = data.objects[input.object]?.noun;
      if (!noun) return;
      if (input.action === "primary") {
        state.activity = null;
        state.command = state.command.firstNoun?.object === input.object
          ? { verb: "walk-to", firstNoun: null }
          : { verb: "use", firstNoun: { kind: "object", object: input.object } };
        return;
      }
      const verb = conditionalOptionalValue(noun.secondaryVerbs)?.verb;
      if (!verb || verb === "walk-to") return;
      resolveCommand(noun, verb, { kind: "object", object: input.object }, true);
    } else if (input.type === "activate-object") {
      if (!state.inventory.objects.includes(input.object)) return;
      const noun = data.objects[input.object]?.noun;
      if (!noun || state.command.verb === "walk-to") return;
      if (state.command.verb === "give" && !state.command.firstNoun) {
        state.activity = null;
        state.command = { verb: state.command.verb, firstNoun: { kind: "object", object: input.object } };
        return;
      }
      if (state.command.verb === "use" && !state.command.firstNoun) {
        const unaryUse = noun.cases.some((candidate) =>
          candidate.verb === "use" &&
          candidate.firstNoun === undefined &&
          conditionMatches(candidate.when)
        );
        if (!unaryUse) {
          state.activity = null;
          state.command = { verb: "use", firstNoun: { kind: "object", object: input.object } };
          return;
        }
      }
      const firstNoun = state.command.firstNoun?.object;
      resolveCommand(noun, state.command.verb, { kind: "object", object: input.object }, false, firstNoun);
    } else if (input.type === "escape") {
      state.command = { verb: "walk-to", firstNoun: null };
    }
  }

  function beginIntent(
    intent: PlayerIntentState["intent"],
    requested: Point,
    finalFacing?: Facing,
    fast = false,
  ): void {
    const scene = data.scenes[state.currentScene]!;
    const destination = nearestPoint(scene.walkableRegion, requested);
    state.activity = {
      type: "player-intent",
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

  function preferredFirstNoun(noun: NounDefinition, verb: Verb): string | undefined {
    const firstNoun = state.command.firstNoun?.object;
    if (!firstNoun || verb === "walk-to") return undefined;
    if (verb === "give") return firstNoun;
    if (verb !== "use") return undefined;
    return noun.cases.some((candidate) =>
      candidate.verb === "use" &&
      candidate.firstNoun === firstNoun &&
      conditionMatches(candidate.when)
    ) ? firstNoun : undefined;
  }

  function contextualVerb(noun: NounDefinition, action: "primary" | "secondary"): Verb | undefined {
    if (state.command.firstNoun) {
      return action === "primary"
        ? conditionalOptionalValue(noun.objectVerbs)?.verb ?? "use"
        : conditionalValue(noun.preferredVerbs).verb;
    }
    return action === "primary"
      ? conditionalValue(noun.preferredVerbs).verb
      : conditionalOptionalValue(noun.secondaryVerbs)?.verb;
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
    const travel = (definition.movementSpeed / 60) * (activity.fast ? 3 : 1);
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
    if (activity.intent.kind === "passage-command") resolvePassageCommand(activity.intent);
    if (activity.intent.kind === "passage") resolvePassage(activity.intent);
  }

  function resolveInteraction(intent: Extract<PlayerIntentState["intent"], { kind: "interaction" }>): void {
    if (intent.scene !== state.currentScene) return;
    const hotspot = data.scenes[intent.scene]?.hotspots?.[intent.hotspot];
    if (!hotspot || !hotspotAvailable(hotspot)) {
      if (intent.command) state.command = { verb: "walk-to", firstNoun: null };
      return;
    }

    if (intent.command) {
      resolveCommand(
        hotspotNoun(intent.scene, hotspot),
        intent.command.verb,
        hotspot.target,
        intent.command.preserveState ?? false,
        intent.command.firstNoun,
      );
      return;
    }

  }

  function hotspotNoun(sceneId: string, hotspot: HotspotDefinition): NounDefinition {
    if (hotspot.target.kind === "background") return hotspot.noun!;
    if (hotspot.target.kind === "character") {
      return data.characters[hotspot.target.character]!.noun!;
    }
    if (hotspot.target.kind === "object") {
      return data.objects[hotspot.target.object]!.noun!;
    }
    return data.scenes[sceneId]!.scenery![hotspot.target.scenery]!.noun!;
  }

  function resolveCommand(
    noun: NounDefinition,
    verb: CommandVerb,
    target: HotspotTarget,
    preserveState: boolean,
    firstNoun?: string,
  ): void {
    if (firstNoun && !state.inventory.objects.includes(firstNoun)) {
      if (!preserveState) state.command = { verb: "walk-to", firstNoun: null };
      const response = noun.fallbacks?.[verb]?.response ?? data.commandFallbacks?.[verb];
      if (response) emitted.push({ type: "interaction-response", text: response.text, response });
      return;
    }
    const candidate = noun.cases.find((value) =>
      value.verb === verb && value.firstNoun === firstNoun && conditionMatches(value.when),
    );
    const fallback = candidate ? undefined : noun.fallbacks?.[verb];
    const globalFallback = candidate || fallback ? undefined : data.commandFallbacks?.[verb];
    if (!preserveState) state.command = { verb: "walk-to", firstNoun: null };
    if (globalFallback) {
      emitted.push({ type: "interaction-response", text: globalFallback.text, response: globalFallback });
      return;
    }
    const resolution = candidate ?? fallback;
    if (!resolution) return;
    const requested = [
      ...(resolution.operations ?? []),
      ...(resolution.sequence ? [{ type: "start-sequence" as const, sequence: resolution.sequence }] : []),
    ];
    if (!applyOperations(requested, target, firstNoun)) return;
    if (resolution.response) {
      emitted.push({
        type: "interaction-response",
        text: resolution.response.text,
        response: resolution.response,
      });
    } else if ("line" in resolution && resolution.line) {
      const { audio, ...line } = resolution.line;
      state.activity = {
        type: "line",
        line: {
          ...line,
          ...(audio ? { audio: audio instanceof URL ? audio.href : audio } : {}),
        },
      };
    }
  }

  function resolvePassageCommand(
    intent: Extract<PlayerIntentState["intent"], { kind: "passage-command" }>,
  ): void {
    if (intent.scene !== state.currentScene) return;
    const passage = data.scenes[intent.scene]?.passages?.[intent.passage];
    if (!passage || !conditionMatches(passage.when)) {
      if (!intent.command.preserveState) state.command = { verb: "walk-to", firstNoun: null };
      return;
    }
    resolveCommand(
      passage.noun,
      intent.command.verb,
      { kind: "background" },
      intent.command.preserveState ?? false,
      intent.command.firstNoun,
    );
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

  function applyOperations(
    operations: readonly GameOperation[],
    target: HotspotTarget,
    firstNounObject?: string,
  ): boolean {
    const draft = structuredClone(state);
    try {
      for (const operation of operations) applyOperation(draft, operation, target, firstNounObject);
    } catch (cause) {
      failOperation(cause instanceof Error ? cause.message : String(cause), cause);
      return false;
    }
    state = draft;
    if (
      state.command.firstNoun &&
      !state.inventory.objects.includes(state.command.firstNoun.object)
    ) {
      state.command = { verb: "walk-to", firstNoun: null };
    }
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
      const selected = firstNounObject;
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
    } else if (operation.type === "consume-selected-object") {
      const selected = firstNounObject;
      if (!selected || !draft.inventory.objects.includes(selected)) throw new Error("No Object is selected.");
      draft.objects[selected]!.location = { kind: "consumed" };
      draft.inventory.objects = draft.inventory.objects.filter((id) => id !== selected);
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
    const choice = alternative === -1 ? stepDefinition.fallback : stepDefinition.alternatives[alternative]!;
    if (choice.spoken !== false && data.playerCharacter) {
      activity.active = {
        kind: "line",
        path: activity.active.path,
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

  function conditionalValue<T extends { readonly when?: InteractionCondition }>(values: readonly T[]): T {
    return values.find((value) => conditionMatches(value.when)) ?? values.at(-1)!;
  }

  function conditionalOptionalValue<T extends { readonly when?: InteractionCondition }>(
    values: readonly T[] | undefined,
  ): T | undefined {
    return values?.find((value) => conditionMatches(value.when)) ?? values?.at(-1);
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
