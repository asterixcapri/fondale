import type {
  DialogueInterpretation,
  DialogueInterpretationRequest,
  DialogueVerbalizationRequest,
  ReflectionRequest,
  ReflectionResponse,
} from "@asterixcapri/fondale";

import {
  composePrologueReflection,
  readPrologueQuestion,
  speakPrologueResponse,
} from "../../src/prologue-knowledge";
import { throwIfAborted } from "./cancellation";
import type { DialogueModel, VisibleDialogueLine } from "./dialogue-model";

/**
 * The Dialogue Model this adapter speaks through when no live model is
 * configured, and therefore the one an ordinary `npm run dev` meets.
 *
 * It follows a script: fixed keywords read the question, fixed wording answers
 * it, so the Example's own prologue works without a key, a network or a token
 * cost. `DeterministicDialogueModel` stays what it has always been: a test
 * device that reports the visible history it was given.
 */
export class ScriptedDialogueModel implements DialogueModel {
  interpret(
    request: DialogueInterpretationRequest,
    _history: readonly VisibleDialogueLine[],
    signal: AbortSignal,
  ): Promise<DialogueInterpretation> {
    throwIfAborted(signal);
    return Promise.resolve(readPrologueQuestion(request.playerInput, request.candidates));
  }

  verbalize(
    request: DialogueVerbalizationRequest,
    _history: readonly VisibleDialogueLine[],
    signal: AbortSignal,
  ): Promise<string> {
    throwIfAborted(signal);
    return Promise.resolve(speakPrologueResponse(request));
  }

  reflect(
    request: ReflectionRequest,
    _history: readonly VisibleDialogueLine[],
    signal: AbortSignal,
  ): Promise<ReflectionResponse> {
    throwIfAborted(signal);
    return Promise.resolve({ summary: composePrologueReflection(request.facts) });
  }
}
