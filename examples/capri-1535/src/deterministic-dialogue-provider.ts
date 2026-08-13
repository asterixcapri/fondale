import type {
  DialogueInterpretation,
  DialogueInterpretationRequest,
  DialogueProvider,
  DialogueVerbalizationRequest,
  ReflectionRequest,
  ReflectionResponse,
} from "@asterixcapri/fondale";

import {
  composePrologueReflection,
  readPrologueQuestion,
  speakPrologueResponse,
} from "./prologue-knowledge";

/**
 * The Dialogue Provider the Example's acceptance build injects.
 *
 * It reaches no model, database or network, and reads and speaks through the
 * same prologue tables the local adapter uses, so the suite drives the real
 * entry point and hears what a Player hears.
 */
export class DeterministicDialogueProvider implements DialogueProvider {
  interpret(request: DialogueInterpretationRequest): Promise<DialogueInterpretation> {
    return Promise.resolve(readPrologueQuestion(request.playerInput, request.candidates));
  }

  verbalize(request: DialogueVerbalizationRequest): Promise<string> {
    return Promise.resolve(speakPrologueResponse(request));
  }

  reflect(request: ReflectionRequest): Promise<ReflectionResponse> {
    return Promise.resolve({ summary: composePrologueReflection(request.facts) });
  }

  reset(): Promise<void> {
    return Promise.resolve();
  }
}
