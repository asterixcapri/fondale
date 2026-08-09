export {
  AuthoringError,
  type AuthoringDiagnostic,
  type AuthoringDiagnosticFamily,
} from "./public/diagnostics";
export {
  defineGame,
  defineCharacter,
  defineScene,
  defineObject,
  defineSequence,
  type CharacterDefinition,
  type Facing,
  type GameProject,
  type LogicalResolution,
  type GameBehavior,
  type GameBehaviorContext,
  type GameOperation,
  type InteractionCondition,
  type ObjectDefinition,
  type Point,
  type SceneDefinition,
  type SequenceDefinition,
  type StaticAppearance,
} from "./public/definitions";
export {
  startGame,
  type GameSession,
  type StartGameOptions,
} from "./browser/start-game";
export {
  validateSaveSnapshot,
  type SaveSnapshot,
  type SaveSnapshotValidation,
  type ValidatedSaveSnapshot,
} from "./public/save";
