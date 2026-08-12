import type {
  DialogueInterpretation,
  DialogueInterpretationRequest,
  DialogueVerbalizationRequest,
  ReflectionRequest,
  ReflectionResponse,
} from "@asterixcapri/fondale";

import { throwIfAborted } from "./cancellation";

export interface VisibleDialogueLine {
  readonly role: "player" | "character";
  readonly text: string;
}

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

export class DeterministicDialogueModel implements DialogueModel {
  constructor(private readonly configuration: {
    readonly interpretations: Readonly<Record<
      string,
      string | null | { readonly reason: "ambiguous" | "no-relevant-fact" }
    >>;
  }) {}

  interpret(
    request: DialogueInterpretationRequest,
    _history: readonly VisibleDialogueLine[],
    signal: AbortSignal,
  ): Promise<DialogueInterpretation> {
    throwIfAborted(signal);
    const configured = this.configuration.interpretations[request.playerInput];
    if (typeof configured === "string") return Promise.resolve({ factId: configured });
    return Promise.resolve({
      factId: null,
      reason: configured?.reason ?? "no-relevant-fact",
    });
  }

  verbalize(
    request: DialogueVerbalizationRequest,
    history: readonly VisibleDialogueLine[],
    signal: AbortSignal,
  ): Promise<string> {
    throwIfAborted(signal);
    const authorisedText = request.fact?.proposition ?? request.claim?.proposition ??
      strategyLine(request.strategy);
    return Promise.resolve(`${authorisedText} ${historyDescription(history)}`);
  }

  reflect(
    request: ReflectionRequest,
    history: readonly VisibleDialogueLine[],
    signal: AbortSignal,
  ): Promise<ReflectionResponse> {
    throwIfAborted(signal);
    const remembered = [
      ...request.facts.map(({ proposition }) => proposition),
      ...request.testimonies.map(({ speaker, claim }) => `${speaker} said: ${claim.proposition}`),
    ];
    return Promise.resolve({
      summary: `${remembered.join(" ")} ${historyDescription(history)}`.trim(),
    });
  }
}

function historyDescription(history: readonly VisibleDialogueLine[]): string {
  if (history.length === 0) return "[no earlier visible Lines]";
  return `[earlier visible Lines: ${history.map(({ role, text }) =>
    `${role === "player" ? "Player" : "Character"}: ${text}`
  ).join(" | ")}]`;
}

function strategyLine(strategy: DialogueVerbalizationRequest["strategy"]): string {
  switch (strategy) {
    case "clarify":
      return "Could you clarify your question?";
    case "cover-story":
      return "I cannot answer that.";
    case "evade":
      return "That is not important right now.";
    case "refuse":
      return "I will not discuss that.";
    case "withhold":
      return "I cannot tell you that.";
    case "answer":
      return "I do not have an authorised fact to answer with.";
  }
}
