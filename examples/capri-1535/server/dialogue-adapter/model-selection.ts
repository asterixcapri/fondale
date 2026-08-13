import { type DialogueModel } from "./dialogue-model";
import {
  createLiveDialogueModelFromEnvironment,
  type LiveDialogueDiagnostic,
} from "./live-dialogue-model";
import { ScriptedDialogueModel } from "./scripted-dialogue-model";

/**
 * Chooses the Dialogue Model this adapter process speaks through.
 *
 * The scripted model stays the default so the Example, its verification and a
 * fresh checkout never need credentials or network access, and so an ordinary
 * `npm run dev` answers a typed question rather than shrugging at it.
 *
 * The choice names where the words come from, never which vendor hosts them:
 * that stays in `DIALOGUE_MODEL_*`, so changing vendor changes no code.
 */
export function selectDialogueModel(
  environment: Readonly<Record<string, string | undefined>>,
  onDiagnostic?: (diagnostic: LiveDialogueDiagnostic) => void,
): DialogueModel {
  const selection = environment.DIALOGUE_ADAPTER_MODEL?.trim() || "scripted";
  if (selection === "scripted") return new ScriptedDialogueModel();
  if (selection === "live") {
    return createLiveDialogueModelFromEnvironment(environment, onDiagnostic);
  }
  throw new Error("DIALOGUE_ADAPTER_MODEL must be 'scripted' or 'live'.");
}
