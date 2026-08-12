export {
  AuthoringError,
  type AuthoringDiagnostic,
  type AuthoringDiagnosticFamily,
  type AuthoringDiagnosticOwner,
} from "./capabilities/game-project";
export {
  commandVerbs,
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
  type CharacterDialogueDefinition,
  type CharacterKnowledgeDefinition,
  type GameProject,
  type LogicalResolution,
  type GameOperation,
  type LearnNarrativeFactOperation,
  type NarrativeFactDefinition,
  type OpenDisclosure,
} from "./capabilities/game-project";
export {
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
export { type SaveSnapshot } from "./capabilities/save";
