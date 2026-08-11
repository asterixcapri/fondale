export {
  AuthoringError,
  type AuthoringDiagnostic,
  type AuthoringDiagnosticFamily,
  type AuthoringDiagnosticOwner,
} from "./capabilities/game-project";
export {
  commandVerbs,
  defineCommandLexicon,
  defineNoun,
  type CommandCase,
  type CommandFallback,
  type CommandLexicon,
  type CommandResponse,
  type CommandVerb,
  type InteractionCondition,
  type NounDefinition,
  type NounLabel,
  type PreferredVerbCase,
  type SelectedObjectVerbCase,
  type Verb,
} from "./capabilities/interaction";
export {
  defineHUDTheme,
  type HUDTheme,
  type PassageDirection,
} from "./capabilities/hud";
export {
  type AnimationDefinition,
  type AnimationFrames,
  type AnimationRoles,
  type AnimationStrip,
  type Appearance,
} from "./capabilities/animation";
export {
  defineGame,
  type GameInput,
  type GameProject,
  type LogicalResolution,
  type GameOperation,
} from "./capabilities/game-project";
export {
  defineCharacter,
  defineObject,
  defineScene,
  type ArrivalSequenceRule,
  type CharacterDefinition,
  type Facing,
  type HotspotDefinition,
  type ObjectDefinition,
  type Point,
  type SceneDefinition,
  type SceneSize,
} from "./capabilities/world";
export {
  defineSequence,
  type AnimationDirection,
  type BranchStep,
  type ChoiceAlternative,
  type ChoiceStep,
  type CueStart,
  type DirectionStep,
  type DirectedSubject,
  type Line,
  type LineStep,
  type MotionDirection,
  type NarrationStep,
  type OperationsStep,
  type SequenceDirection,
  type SequenceDefinition,
  type SequenceStep,
} from "./capabilities/sequence";
export { type CameraDirection } from "./capabilities/camera";
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
} from "./capabilities/save";
