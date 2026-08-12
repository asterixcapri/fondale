import type { GameState } from "../game-session";
import { createSequence, type Sequence } from "../sequence";
import {
  interactionSaveValidation,
  type InteractionCondition,
} from "../interaction";
import {
  isValidAnimationState,
  isValidLineAnimation,
  type AnimationProjectView,
} from "../animation";
import { AuthoringError, type AuthoringDiagnostic } from "../game-project";
import {
  getSaveCompositionView,
  type CompiledGameProject,
  type SaveGameProjectView,
} from "../game-project";
import { createWorld, type Point, type World } from "../world";
import {
  createKnowledgeDrivenDialogue,
  type KnowledgeDrivenDialogue,
} from "../dialogue";

/** JSON-safe representation of the latest committed Game State. */
export interface SaveSnapshot {
  readonly formatVersion: 1;
  readonly projectIdentity: string;
  readonly projectVersion: string;
  readonly state: GameState;
}

declare const validatedSaveSnapshotBrand: unique symbol;

/** @internal A Save Snapshot proven compatible with one compiled Game Project. */
export interface ValidatedSaveSnapshot extends SaveSnapshot {
  readonly [validatedSaveSnapshotBrand]: true;
}

/** @internal Ordinary result of validating one untrusted Save Snapshot. */
export type SaveSnapshotValidation =
  | { readonly ok: true; readonly snapshot: ValidatedSaveSnapshot }
  | { readonly ok: false; readonly diagnostics: readonly AuthoringDiagnostic[] };

const validatedSnapshots = new WeakSet<object>();
const projectSaves = new WeakMap<CompiledGameProject, Save>();

/** @internal Save-owned snapshot lifecycle behind one immutable module interface. */
export interface Save {
  validate(value: unknown): SaveSnapshotValidation;
  createSnapshot(state: GameState): SaveSnapshot;
  restore(snapshot: ValidatedSaveSnapshot): GameState;
}

interface SaveValidationContext {
  readonly project: SaveGameProjectView;
  readonly world: World;
  readonly animation: AnimationProjectView;
  readonly sequence: Sequence;
  readonly dialogue: KnowledgeDrivenDialogue;
}

/** Creates or returns the Save module composed for one Game Project. */
export function createSave(project: CompiledGameProject): Save {
  const existing = projectSaves.get(project);
  if (existing) return existing;

  const views = getSaveCompositionView(project);
  const context: SaveValidationContext = {
    project: views.gameProject,
    world: createWorld(views.world),
    animation: views.animation,
    sequence: createSequence(views.sequences),
    dialogue: createKnowledgeDrivenDialogue(views.dialogue),
  };
  const save: Save = Object.freeze({
    validate(value: unknown) {
      return validateSnapshot(value, context);
    },
    createSnapshot(state: GameState) {
      return deepFreeze({
        formatVersion: 1 as const,
        projectIdentity: context.project.identity,
        projectVersion: context.project.version,
        state: structuredClone(state),
      });
    },
    restore(snapshot: ValidatedSaveSnapshot) {
      if (!validatedSnapshots.has(snapshot)) {
        throw new AuthoringError([
          saveDiagnostic(
            "save.validation.required",
            "Only a Save Snapshot validated during startup can restore a Game Session.",
          ),
        ]);
      }
      if (
        snapshot.projectIdentity !== context.project.identity ||
        snapshot.projectVersion !== context.project.version
      ) {
        throw new AuthoringError([
          saveDiagnostic(
            "save.validation.project",
            "Save Snapshot was validated for another Game Project.",
          ),
        ]);
      }
      const validation = validateSnapshot(snapshot, context);
      if (!validation.ok) throw new AuthoringError(validation.diagnostics);
      return structuredClone(validation.snapshot.state);
    },
  });
  projectSaves.set(project, save);
  return save;
}

/** Validates untrusted stored data without throwing for expected incompatibility. */
function validateSnapshot(
  value: unknown,
  context: SaveValidationContext,
): SaveSnapshotValidation {
  const diagnostics: AuthoringDiagnostic[] = [];
  if (!isRecord(value)) {
    diagnostics.push(saveDiagnostic("save.shape", "Save Snapshot must be a JSON object."));
  } else {
    if (!hasExactKeys(value, ["formatVersion", "projectIdentity", "projectVersion", "state"])) {
      diagnostics.push(saveDiagnostic("save.fields.unexpected", "Save Snapshot has missing or unexpected fields."));
    }
    if (value.formatVersion !== 1) {
      diagnostics.push(saveDiagnostic("save.format.version", "Save Snapshot format is incompatible."));
    }
    if (value.projectIdentity !== context.project.identity) {
      diagnostics.push(saveDiagnostic("save.project.identity", "Save Snapshot belongs to another Game Project."));
    }
    if (value.projectVersion !== context.project.version) {
      diagnostics.push(saveDiagnostic("save.project.version", "Save Snapshot uses another Project Version."));
    }
    if (!validStateShape(value.state, context)) {
      diagnostics.push(
        invalidCommandStateDiagnostic(value.state) ??
        saveDiagnostic("save.state.invalid", "Save Snapshot contains an invalid Game State."),
      );
    }
  }
  if (diagnostics.length > 0) {
    return { ok: false, diagnostics: Object.freeze(diagnostics.sort((a, b) => a.code.localeCompare(b.code))) };
  }
  const snapshot = deepFreeze(structuredClone(value)) as ValidatedSaveSnapshot;
  validatedSnapshots.add(snapshot);
  return { ok: true, snapshot };
}

function validStateShape(
  value: unknown,
  context: SaveValidationContext,
): value is GameState {
  const { animation, project, world } = context;
  if (!isRecord(value) || !hasExactKeys(value, ["currentScene", "characters", "scenery", "objects", "inventory", "command", "variables", "characterKnowledge", "relationships", "dialogueStates", "testimonies", "activity", "tick"], ["conversationContinuation"])) return false;
  if (!Number.isInteger(value.tick) || (value.tick as number) < 0) return false;
  if (!world.isValidState(value) || !isValidAnimationState(animation, value)) return false;
  const inventoryLocations: string[] = [];
  for (const [id, object] of Object.entries(value.objects)) {
    if (object.location.kind === "inventory") {
      inventoryLocations.push(id);
    }
  }
  if (!isRecord(value.inventory) || !hasExactKeys(value.inventory, ["objects"]) || !Array.isArray(value.inventory.objects)) return false;
  if (!value.inventory.objects.every((id): id is string => typeof id === "string" && id in value.objects)) return false;
  if (new Set(value.inventory.objects).size !== value.inventory.objects.length) return false;
  if (!sameValues(value.inventory.objects, inventoryLocations)) return false;
  if (!interactionSaveValidation.isCommandState(value.command, value.inventory.objects)) return false;
  if (!isRecord(value.variables) || !sameKeys(value.variables, project.variables)) return false;
  if (!Object.values(value.variables).every((variable) => typeof variable === "boolean")) return false;
  if (!context.dialogue.isValidState({
    characterKnowledge: value.characterKnowledge,
    relationships: value.relationships,
    dialogueStates: value.dialogueStates,
    testimonies: value.testimonies,
  })) return false;
  if (value.conversationContinuation !== undefined) {
    if (!isRecord(value.conversationContinuation) ||
        !hasExactKeys(value.conversationContinuation, ["type", "character"]) ||
        value.conversationContinuation.type !== "conversation" ||
        typeof value.conversationContinuation.character !== "string" ||
        !world.hasCharacter(value.conversationContinuation.character) ||
        !context.dialogue.hasProfile(value.conversationContinuation.character) ||
        !isRecord(value.activity) || value.activity.type !== "sequence") return false;
  }
  if (!validActivity(value.activity, value as unknown as GameState, context)) return false;
  return isJsonSafe(value);
}

function validActivity(
  value: unknown,
  state: GameState,
  context: SaveValidationContext,
): boolean {
  const { animation, project, sequence, world } = context;
  if (value === null) return true;
  if (!isRecord(value) || typeof value.type !== "string") return false;
  if (value.type === "line") {
    if (!hasExactKeys(value, ["type", "animationStartedTick", "line"]) || !validAnimationStartedTick(value.animationStartedTick, state.tick) || !isRecord(value.line)) return false;
    if (!hasExactKeys(value.line, ["character", "text"], ["audio", "animation"])) return false;
    return typeof value.line.character === "string" && world.hasCharacter(value.line.character) &&
      typeof value.line.text === "string" && value.line.text.trim().length > 0 &&
      (value.line.audio === undefined || typeof value.line.audio === "string") &&
      (value.line.animation === undefined || typeof value.line.animation === "string") &&
      isValidLineAnimation(animation, state, value.line.character, value.line.animation as string | undefined);
  }
  if (value.type === "conversation") {
    return hasExactKeys(value, ["type", "character"]) &&
      typeof value.character === "string" &&
      world.hasCharacter(value.character) &&
      context.dialogue.hasProfile(value.character);
  }
  if (value.type === "player-intent") {
    if (!project.playerCharacter ||
        state.characters[project.playerCharacter]?.scene !== state.currentScene) return false;
    if (!hasExactKeys(value, ["type", "animationStartedTick", "destination", "intent"], ["finalFacing", "fast"]) || !validAnimationStartedTick(value.animationStartedTick, state.tick)) return false;
    if (!validPoint(value.destination) || !validOptionalFacing(value.finalFacing)) return false;
    const destination = value.destination;
    const canonicalDestination = world.navigationDestination(state, destination);
    if (Math.hypot(
      canonicalDestination.x - destination.x,
      canonicalDestination.y - destination.y,
    ) > 1e-8) return false;
    if (value.fast !== undefined && value.fast !== true) return false;
    if (!isRecord(value.intent) || typeof value.intent.kind !== "string") return false;
    const intent = value.intent;
    if (intent.kind === "move") {
      return hasExactKeys(intent, ["kind"]) && value.finalFacing === undefined;
    }
    const conditionMatches = (condition: InteractionCondition | undefined) =>
      interactionSaveValidation.conditionMatches(condition, state);
    const matchesApproach = (target: Parameters<World["approach"]>[1]): boolean => {
      const approach = world.approach(state, target, conditionMatches);
      return approach !== undefined &&
        samePoint(destination, approach.groundPoint) &&
        value.finalFacing === approach.facing;
    };
    if (intent.kind === "interaction") {
      if (!hasExactKeys(intent, ["kind", "scene", "hotspot"], ["command"])) return false;
      if (intent.scene !== state.currentScene || !Number.isInteger(intent.hotspot)) return false;
      const hotspot = world.hotspots(
        state,
        conditionMatches,
      ).find(({ index }) => index === intent.hotspot);
      if (!hotspot || !matchesApproach({ kind: "hotspot", index: intent.hotspot as number })) {
        return false;
      }
      if (intent.command !== undefined) {
        if (!interactionSaveValidation.isPendingCommand(
          intent.command,
          state.inventory.objects,
        )) return false;
      }
      return true;
    }
    if (intent.kind === "passage-command") {
      if (!hasExactKeys(intent, ["kind", "scene", "passage", "command"])) return false;
      if (intent.scene !== state.currentScene || !Number.isInteger(intent.passage)) return false;
      const passage = world.passages(
        state,
        conditionMatches,
      ).find(({ index }) => index === intent.passage);
      return passage !== undefined &&
        matchesApproach({ kind: "passage", index: intent.passage as number }) &&
        interactionSaveValidation.isPendingCommand(
        intent.command,
        state.inventory.objects,
      );
    }
    if (intent.kind === "passage") {
      if (!hasExactKeys(intent, ["kind", "scene", "passage"])) return false;
      if (intent.scene !== state.currentScene || !Number.isInteger(intent.passage)) return false;
      return world.passages(
        state,
        conditionMatches,
      ).some(({ index }) => index === intent.passage) &&
        matchesApproach({ kind: "passage", index: intent.passage as number });
    }
    return false;
  }
  if (value.type === "sequence") {
    return sequence.isValidActivity(value, {
      currentTick: state.tick,
      ...(project.playerCharacter ? { playerCharacter: project.playerCharacter } : {}),
      characterExists: (character) => world.hasCharacter(character),
      conditionMatches: (condition) => interactionSaveValidation.conditionMatches(condition, state),
    });
  }
  return false;
}

function validOptionalFacing(value: unknown): boolean {
  return value === undefined || ["front", "back", "left", "right"].includes(String(value));
}

function validAnimationStartedTick(value: unknown, currentTick: number): boolean {
  return Number.isInteger(value) && (value as number) >= 0 && (value as number) <= currentTick + 1;
}

function invalidCommandStateDiagnostic(
  value: unknown,
): AuthoringDiagnostic | undefined {
  if (!isRecord(value)) return undefined;
  const command = value.command;
  if (!isRecord(command) || !hasExactKeys(command, ["verb", "firstNoun"]) ||
      !interactionSaveValidation.isVerb(command.verb)) {
    return saveDiagnostic(
      "save.state.command",
      "Save Snapshot contains a malformed Command State.",
      "Save Snapshot.state.command",
    );
  }
  if (command.firstNoun === null) return invalidIntentCommandDiagnostic(value);
  if (
    !isRecord(command.firstNoun) ||
    !hasExactKeys(command.firstNoun, ["kind", "object"]) ||
    command.firstNoun.kind !== "object" ||
    typeof command.firstNoun.object !== "string"
  ) {
    return saveDiagnostic(
      "save.state.command",
      "Save Snapshot contains a malformed first Noun.",
      "Save Snapshot.state.command.firstNoun",
    );
  }
  const inventory = isRecord(value.inventory) && Array.isArray(value.inventory.objects)
    ? value.inventory.objects
    : [];
  const objects = isRecord(value.objects) ? value.objects : {};
  if (!(command.firstNoun.object in objects) || !inventory.includes(command.firstNoun.object)) {
    return saveDiagnostic(
      "save.state.command-noun",
      "Save Snapshot refers to a first Noun that is not available in the Inventory.",
      "Save Snapshot.state.command.firstNoun.object",
    );
  }
  return invalidIntentCommandDiagnostic(value);
}

function invalidIntentCommandDiagnostic(
  state: Record<string, unknown>,
): AuthoringDiagnostic | undefined {
  const activity = state.activity;
  if (!isRecord(activity) || activity.type !== "player-intent" || !isRecord(activity.intent)) return undefined;
  const intent = activity.intent;
  if (intent.kind !== "interaction" && intent.kind !== "passage-command") return undefined;
  const command = intent.command;
  if (command === undefined && intent.kind === "interaction") return undefined;
  if (
    !isRecord(command) ||
    !hasExactKeys(command, ["verb"], ["firstNoun", "preserveState"]) ||
    !interactionSaveValidation.isCommandVerb(command.verb) ||
    (command.preserveState !== undefined && typeof command.preserveState !== "boolean")
  ) {
    return saveDiagnostic(
      "save.state.intent-command",
      "Save Snapshot contains a malformed pending Command.",
      "Save Snapshot.state.activity.intent.command",
    );
  }
  if (command.firstNoun === undefined) return undefined;
  const inventory = isRecord(state.inventory) && Array.isArray(state.inventory.objects)
    ? state.inventory.objects
    : [];
  const objects = isRecord(state.objects) ? state.objects : {};
  if (
    typeof command.firstNoun !== "string" ||
    !(command.firstNoun in objects) ||
    !inventory.includes(command.firstNoun)
  ) {
    return saveDiagnostic(
      "save.state.intent-command-noun",
      "Save Snapshot refers to a pending first Noun that is not available in the Inventory.",
      "Save Snapshot.state.activity.intent.command.firstNoun",
    );
  }
  return undefined;
}

function saveDiagnostic(code: string, message: string, path = "Save Snapshot"): AuthoringDiagnostic {
  return { code, family: "save", owner: "save", path, message };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validPoint(value: unknown): value is Point {
  return isRecord(value) && hasExactKeys(value, ["x", "y"]) &&
    typeof value.x === "number" && Number.isFinite(value.x) &&
    typeof value.y === "number" && Number.isFinite(value.y);
}

function samePoint(left: Point, right: Point): boolean {
  return Math.hypot(left.x - right.x, left.y - right.y) <= 1e-8;
}

function hasExactKeys(
  value: Record<string, unknown>,
  required: readonly string[],
  optional: readonly string[] = [],
): boolean {
  const keys = Object.keys(value);
  return required.every((key) => keys.includes(key)) &&
    keys.every((key) => required.includes(key) || optional.includes(key));
}

function sameKeys(left: Record<string, unknown>, right: object): boolean {
  const leftKeys = Object.keys(left).sort();
  const rightKeys = Object.keys(right).sort();
  return leftKeys.length === rightKeys.length && leftKeys.every((key, index) => key === rightKeys[index]);
}

function sameValues(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value) => right.includes(value));
}

function isJsonSafe(value: unknown, seen = new Set<object>()): boolean {
  if (value === null || typeof value === "string" || typeof value === "boolean") return true;
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value !== "object" || seen.has(value)) return false;
  seen.add(value);
  const children = Array.isArray(value) ? value : Object.values(value);
  const safe = children.every((child) => isJsonSafe(child, seen));
  seen.delete(value);
  return safe;
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}
