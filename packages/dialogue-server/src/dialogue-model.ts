import type {
  DialogueInterpretation,
  DialogueInterpretationRequest,
  DialogueVerbalizationRequest,
  ReflectionRequest,
  ReflectionResponse,
} from "fondale";

/** One Line of a Conversation as the Player actually saw it. */
export interface VisibleDialogueLine {
  readonly role: "player" | "character";
  readonly text: string;
}

/**
 * How an adapter turns free-form speech into an Engine-authorised answer.
 *
 * A Dialogue Model owns wording alone: the history arrives as an argument, so
 * it never reads or writes conversational memory. That belongs to the Dialogue
 * Provider that wraps it.
 */
export interface DialogueModel {
  interpret(
    request: DialogueInterpretationRequest,
    history: readonly VisibleDialogueLine[],
    signal: AbortSignal,
  ): Promise<DialogueInterpretation>;
  verbalize(
    request: DialogueVerbalizationRequest,
    history: readonly VisibleDialogueLine[],
    signal: AbortSignal,
  ): Promise<string>;
  reflect(
    request: ReflectionRequest,
    history: readonly VisibleDialogueLine[],
    signal: AbortSignal,
  ): Promise<ReflectionResponse>;
}
