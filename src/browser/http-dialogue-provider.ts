import type {
  DialogueInterpretation,
  DialogueInterpretationRequest,
  DialogueProvider,
  DialogueTurnContext,
  DialogueVerbalizationRequest,
  ReflectionRequest,
  ReflectionResponse,
} from "../capabilities/dialogue";

import type { DialogueHttpRequest, DialogueHttpResponse } from "./dialogue-http-protocol";

export class HttpDialogueProvider implements DialogueProvider {
  private readonly endpoint: string;
  private readonly sessionId: string;

  constructor(options: { readonly endpoint: string; readonly sessionId: string }) {
    this.endpoint = options.endpoint;
    this.sessionId = options.sessionId;
  }

  interpret(
    request: DialogueInterpretationRequest,
    context: DialogueTurnContext,
  ): Promise<DialogueInterpretation> {
    return this.send({
      operation: "interpret",
      sessionId: this.sessionId,
      turnId: context.turnId,
      request,
    }, context.signal);
  }

  verbalize(
    request: DialogueVerbalizationRequest,
    context: DialogueTurnContext,
  ): Promise<string> {
    return this.send({
      operation: "verbalize",
      sessionId: this.sessionId,
      turnId: context.turnId,
      request,
    }, context.signal);
  }

  reflect(
    request: ReflectionRequest,
    context: DialogueTurnContext,
  ): Promise<ReflectionResponse> {
    return this.send({
      operation: "reflect",
      sessionId: this.sessionId,
      turnId: context.turnId,
      request,
    }, context.signal);
  }

  reset(): Promise<void> {
    return this.send({ operation: "reset", sessionId: this.sessionId });
  }

  private async send<T>(body: DialogueHttpRequest, signal?: AbortSignal): Promise<T> {
    let response: Response;
    try {
      response = await fetch(this.endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
        ...(signal ? { signal } : {}),
      });
    } catch (cause) {
      if (signal?.aborted && "turnId" in body) {
        await this.notifyCancellation(body.turnId);
        throw signal.reason ?? cause;
      }
      throw cause;
    }
    const payload: unknown = await response.json();
    if (!isDialogueResponse(payload)) {
      throw new Error("The Dialogue Provider returned an invalid response.");
    }
    if (!response.ok || !payload.ok) {
      throw new Error(payload.ok ? "The Dialogue Provider request failed." : payload.error);
    }
    return payload.value as T;
  }

  private async notifyCancellation(turnId: string): Promise<void> {
    await fetch(this.endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        operation: "cancel",
        sessionId: this.sessionId,
        turnId,
      } satisfies DialogueHttpRequest),
    }).catch(() => undefined);
  }
}

function isDialogueResponse(value: unknown): value is DialogueHttpResponse {
  if (typeof value !== "object" || value === null || !("ok" in value)) return false;
  if ((value as { readonly ok?: unknown }).ok === true) return true;
  return (value as { readonly ok?: unknown }).ok === false &&
    "error" in value && typeof (value as { readonly error?: unknown }).error === "string";
}
