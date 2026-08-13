import { type DialogueModel } from "./dialogue-model";
import {
  createOpenRouterDialogueModelFromEnvironment,
  type LiveDialogueDiagnostic,
} from "./openrouter-dialogue-model";
import { PrologueDialogueModel } from "./prologue-dialogue-model";

/**
 * Chooses the Dialogue Model this adapter process speaks through.
 *
 * The deterministic prologue model stays the default so the Example, its
 * verification and a fresh checkout never need credentials or network access,
 * and so an ordinary `npm run dev` answers a typed question rather than
 * shrugging at it.
 */
export function selectDialogueModel(
  environment: Readonly<Record<string, string | undefined>>,
  onDiagnostic?: (diagnostic: LiveDialogueDiagnostic) => void,
): DialogueModel {
  const selection = environment.DIALOGUE_ADAPTER_MODEL?.trim() || "deterministic";
  if (selection === "deterministic") return new PrologueDialogueModel();
  if (selection === "openrouter") {
    return createOpenRouterDialogueModelFromEnvironment(environment, onDiagnostic);
  }
  throw new Error("DIALOGUE_ADAPTER_MODEL must be 'deterministic' or 'openrouter'.");
}
