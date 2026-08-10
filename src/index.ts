export {
  AuthoringError,
  type AuthoringDiagnostic,
  type AuthoringDiagnosticFamily,
} from "./public/diagnostics";
export {
  commandVerbs,
  defineCommandLexicon,
  defineNoun,
  type CommandCase,
  type CommandFallback,
  type CommandLexicon,
  type CommandResponse,
  type CommandVerb,
  type NounDefinition,
  type NounLabel,
  type PreferredVerbCase,
  type SelectedObjectVerbCase,
  type Verb,
} from "./public/commands";
export {
  defineHUDTheme,
  type HUDTheme,
  type PassageDirection,
} from "./public/hud-theme";
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
  type GameOperation,
  type InteractionCondition,
  type Line,
  type NarrationStep,
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
