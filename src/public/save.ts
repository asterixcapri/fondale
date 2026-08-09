import type { GameState } from "../internal/core";
import { conditionMatchesState, hotspotAvailableInState } from "../internal/state-queries";
import { AuthoringError, type AuthoringDiagnostic } from "./diagnostics";
import {
  getGameProjectData,
  type GameProject,
  type GameProjectData,
  type SequenceDefinition,
  type SequenceStep,
} from "./definitions";

/** JSON-safe representation of the latest committed Game State. */
export interface SaveSnapshot {
  readonly formatVersion: 1;
  readonly projectIdentity: string;
  readonly projectVersion: string;
  readonly state: GameState;
}

declare const validatedSaveSnapshotBrand: unique symbol;

/** A Save Snapshot proven compatible with one Game Project. */
export interface ValidatedSaveSnapshot extends SaveSnapshot {
  readonly [validatedSaveSnapshotBrand]: true;
}

export type SaveSnapshotValidation =
  | { readonly ok: true; readonly snapshot: ValidatedSaveSnapshot }
  | { readonly ok: false; readonly diagnostics: readonly AuthoringDiagnostic[] };

const validatedSnapshots = new WeakSet<object>();

/** Validates untrusted stored data without throwing for expected incompatibility. */
export function validateSaveSnapshot(
  project: GameProject,
  value: unknown,
): SaveSnapshotValidation {
  const data = getGameProjectData(project);
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
    if (value.projectIdentity !== data.identity) {
      diagnostics.push(saveDiagnostic("save.project.identity", "Save Snapshot belongs to another Game Project."));
    }
    if (value.projectVersion !== data.version) {
      diagnostics.push(saveDiagnostic("save.project.version", "Save Snapshot uses another Project Version."));
    }
    if (!validStateShape(value.state, data)) {
      diagnostics.push(saveDiagnostic("save.state.invalid", "Save Snapshot contains an invalid Game State."));
    }
  }
  if (diagnostics.length > 0) {
    return { ok: false, diagnostics: Object.freeze(diagnostics.sort((a, b) => a.code.localeCompare(b.code))) };
  }
  const snapshot = deepFreeze(structuredClone(value)) as ValidatedSaveSnapshot;
  validatedSnapshots.add(snapshot);
  return { ok: true, snapshot };
}

/** @internal Creates a snapshot only from a committed core state. */
export function createSaveSnapshot(data: GameProjectData, state: GameState): SaveSnapshot {
  return deepFreeze({
    formatVersion: 1 as const,
    projectIdentity: data.identity,
    projectVersion: data.version,
    state: structuredClone(state),
  });
}

/** @internal Reads state only from the branded validation result. */
export function getValidatedSaveState(snapshot: ValidatedSaveSnapshot): GameState {
  if (!validatedSnapshots.has(snapshot)) {
    throw new AuthoringError([
      saveDiagnostic(
        "save.validation.required",
        "Only the successful result of validateSaveSnapshot can restore a Game Session.",
      ),
    ]);
  }
  return structuredClone(snapshot.state);
}

function validStateShape(value: unknown, data: GameProjectData): value is GameState {
  if (!isRecord(value) || !hasExactKeys(value, ["currentScene", "characters", "scenery", "objects", "inventory", "command", "variables", "activity", "tick"])) return false;
  if (typeof value.currentScene !== "string" || !(value.currentScene in data.scenes)) return false;
  if (!Number.isInteger(value.tick) || (value.tick as number) < 0) return false;
  if (!isRecord(value.characters) || !sameKeys(value.characters, data.characters)) return false;
  for (const [id, character] of Object.entries(value.characters)) {
    const definition = data.characters[id]!;
    if (!isRecord(character) || !hasExactKeys(character, ["scene", "groundPoint", "facing", "appearance"])) return false;
    if (typeof character.scene !== "string" || !(character.scene in data.scenes)) return false;
    if (!validPoint(character.groundPoint) || !["front", "back", "left", "right"].includes(String(character.facing))) return false;
    if (typeof character.appearance !== "string" || !(character.appearance in definition.appearances)) return false;
  }
  if (!isRecord(value.scenery) || !sameKeys(value.scenery, data.scenes)) return false;
  for (const [sceneId, selections] of Object.entries(value.scenery)) {
    if (!isRecord(selections) || !sameKeys(selections, data.scenes[sceneId]!.scenery ?? {})) return false;
    for (const [sceneryId, appearance] of Object.entries(selections)) {
      if (typeof appearance !== "string" || !(appearance in data.scenes[sceneId]!.scenery![sceneryId]!.appearances)) return false;
    }
  }
  if (!isRecord(value.objects) || !sameKeys(value.objects, data.objects)) return false;
  const inventoryLocations: string[] = [];
  for (const [id, object] of Object.entries(value.objects)) {
    const definition = data.objects[id]!;
    if (!isRecord(object) || !hasExactKeys(object, ["location", "appearance"])) return false;
    if (typeof object.appearance !== "string" || !(object.appearance in definition.appearances)) return false;
    if (!isRecord(object.location) || typeof object.location.kind !== "string") return false;
    if (object.location.kind === "inventory") {
      if (!hasExactKeys(object.location, ["kind"])) return false;
      inventoryLocations.push(id);
    } else if (object.location.kind === "consumed") {
      if (!hasExactKeys(object.location, ["kind"])) return false;
    } else if (object.location.kind === "scene") {
      if (!hasExactKeys(object.location, ["kind", "scene", "groundPoint"])) return false;
      if (typeof object.location.scene !== "string" || !(object.location.scene in data.scenes) || !validPoint(object.location.groundPoint)) return false;
    } else return false;
  }
  if (!isRecord(value.inventory) || !hasExactKeys(value.inventory, ["objects"]) || !Array.isArray(value.inventory.objects)) return false;
  if (!value.inventory.objects.every((id): id is string => typeof id === "string" && id in data.objects)) return false;
  if (new Set(value.inventory.objects).size !== value.inventory.objects.length) return false;
  if (!sameValues(value.inventory.objects, inventoryLocations)) return false;
  if (!isRecord(value.command) || !hasExactKeys(value.command, ["verb", "firstNoun"])) return false;
  if (!["walk-to", "open", "pick-up", "push", "close", "look-at", "pull", "give", "talk-to", "use"].includes(String(value.command.verb))) return false;
  if (value.command.firstNoun !== null) {
    if (!isRecord(value.command.firstNoun) || !hasExactKeys(value.command.firstNoun, ["kind", "object"])) return false;
    if (value.command.firstNoun.kind !== "object" || typeof value.command.firstNoun.object !== "string") return false;
    if (!value.inventory.objects.includes(value.command.firstNoun.object)) return false;
  }
  if (!isRecord(value.variables) || !sameKeys(value.variables, data.variables)) return false;
  if (!Object.values(value.variables).every((variable) => typeof variable === "boolean")) return false;
  if (!validActivity(value.activity, data, value as unknown as GameState)) return false;
  return isJsonSafe(value);
}

function validActivity(value: unknown, data: GameProjectData, state: GameState): boolean {
  if (value === null) return true;
  if (!isRecord(value) || typeof value.type !== "string") return false;
  if (value.type === "player-intent") {
    if (!hasExactKeys(value, ["type", "destination", "intent"], ["finalFacing", "fast"])) return false;
    if (!validPoint(value.destination) || !validOptionalFacing(value.finalFacing)) return false;
    if (value.fast !== undefined && value.fast !== true) return false;
    if (!isRecord(value.intent) || typeof value.intent.kind !== "string") return false;
    if (value.intent.kind === "move") return hasExactKeys(value.intent, ["kind"]);
    if (value.intent.kind === "interaction") {
      if (!hasExactKeys(value.intent, ["kind", "scene", "hotspot"], ["command"])) return false;
      if (value.intent.scene !== state.currentScene || !Number.isInteger(value.intent.hotspot)) return false;
      const hotspot = data.scenes[state.currentScene]!.hotspots?.[value.intent.hotspot as number];
      if (!hotspot || !hotspotAvailableInState(hotspot, state)) return false;
      if (value.intent.command !== undefined) {
        if (!isRecord(value.intent.command) || !hasExactKeys(value.intent.command, ["verb"], ["firstNoun", "preserveState"])) return false;
        if (!["open", "pick-up", "push", "close", "look-at", "pull", "give", "talk-to", "use"].includes(String(value.intent.command.verb))) return false;
        if (value.intent.command.preserveState !== undefined && typeof value.intent.command.preserveState !== "boolean") return false;
        if (value.intent.command.firstNoun !== undefined &&
            (typeof value.intent.command.firstNoun !== "string" || !state.inventory.objects.includes(value.intent.command.firstNoun))) return false;
      }
      return true;
    }
    if (value.intent.kind === "passage") {
      if (!hasExactKeys(value.intent, ["kind", "scene", "passage"])) return false;
      if (value.intent.scene !== state.currentScene || !Number.isInteger(value.intent.passage)) return false;
      const passage = data.scenes[state.currentScene]!.passages?.[value.intent.passage as number];
      return passage !== undefined && conditionMatchesState(passage.when, state);
    }
    return false;
  }
  if (value.type === "sequence") {
    if (!hasExactKeys(value, ["type", "sequence", "pendingPaths", "active"])) return false;
    if (typeof value.sequence !== "string" || !(value.sequence in data.sequences)) return false;
    const definition = data.sequences[value.sequence]!;
    if (
      !Array.isArray(value.pendingPaths) ||
      !value.pendingPaths.every(
        (path) => typeof path === "string" && isSequenceStep(resolvePath(definition, path)),
      )
    ) return false;
    if (value.active === null) return false;
    if (!isRecord(value.active) || typeof value.active.kind !== "string" || typeof value.active.path !== "string") return false;
    const step = resolvePath(definition, value.active.path);
    const expectedPending = expectedPendingPaths(definition, value.active.path);
    if (value.active.kind === "line") {
      if (!hasExactKeys(value.active, ["kind", "path"], ["choiceText", "choiceCharacter"])) return false;
      if (value.active.choiceText !== undefined) {
        if (typeof value.active.choiceText !== "string" || !isSequenceStep(step) || step.type !== "choice") return false;
        if (value.active.choiceCharacter !== undefined &&
            (typeof value.active.choiceCharacter !== "string" || !(value.active.choiceCharacter in data.characters))) return false;
        return true;
      }
      return expectedPending !== null &&
        sameOrderedStrings(value.pendingPaths as string[], expectedPending) &&
        isSequenceStep(step) && step.type === "line";
    }
    if (expectedPending === null || !sameOrderedStrings(value.pendingPaths as string[], expectedPending)) return false;
    if (
      value.active.kind !== "choice" ||
      !hasExactKeys(value.active, ["kind", "path", "eligibleAlternatives"]) ||
      !isSequenceStep(step) || step.type !== "choice" ||
      !Array.isArray(value.active.eligibleAlternatives) ||
      !value.active.eligibleAlternatives.every((index) => Number.isInteger(index))
    ) return false;
    const eligible = step.alternatives
      .map((alternative, index) => conditionMatchesState(alternative.when, state) ? index : -1)
      .filter((index) => index >= 0);
    const expected = eligible.length > 0 ? eligible : [-1];
    return sameNumbers(value.active.eligibleAlternatives as number[], expected);
  }
  return false;
}

function validOptionalFacing(value: unknown): boolean {
  return value === undefined || ["front", "back", "left", "right"].includes(String(value));
}

function resolvePath(sequence: SequenceDefinition, path: string): unknown {
  return path.split("/").reduce<unknown>((current, segment) => {
    if (current === null || typeof current !== "object") return undefined;
    return (current as Record<string, unknown>)[segment];
  }, sequence);
}

function isSequenceStep(value: unknown): value is SequenceStep {
  return isRecord(value) && ["line", "operations", "choice", "branch"].includes(String(value.type));
}

function expectedPendingPaths(sequence: SequenceDefinition, activePath: string): string[] | null {
  const segments = activePath.split("/");
  const ancestors: { containerPath: string; index: number; steps: readonly SequenceStep[] }[] = [];
  for (let segmentIndex = 0; segmentIndex < segments.length; segmentIndex += 1) {
    const index = Number(segments[segmentIndex]);
    if (!Number.isInteger(index) || String(index) !== segments[segmentIndex]) continue;
    const containerPath = segments.slice(0, segmentIndex).join("/");
    const container = resolvePath(sequence, containerPath);
    if (!Array.isArray(container) || !isSequenceStep(container[index])) continue;
    ancestors.push({ containerPath, index, steps: container as readonly SequenceStep[] });
  }
  if (ancestors.length === 0 || ancestors.at(-1)?.containerPath + `/${ancestors.at(-1)?.index}` !== activePath) {
    return null;
  }
  return ancestors.reverse().flatMap(({ containerPath, index, steps }) =>
    steps.slice(index + 1).map((_, offset) => `${containerPath}/${index + offset + 1}`),
  );
}

function saveDiagnostic(code: string, message: string): AuthoringDiagnostic {
  return { code, family: "save", path: "Save Snapshot", message };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validPoint(value: unknown): boolean {
  return isRecord(value) && hasExactKeys(value, ["x", "y"]) &&
    typeof value.x === "number" && Number.isFinite(value.x) &&
    typeof value.y === "number" && Number.isFinite(value.y);
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

function sameOrderedStrings(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function sameNumbers(left: readonly number[], right: readonly number[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
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
