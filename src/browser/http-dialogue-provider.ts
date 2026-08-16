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

type DialogueHttpFailure = "unreachable" | "invalid-response" | "request-failed";

/** @internal Classifies transport failures without exposing server details at startup. */
export class DialogueHttpError extends Error {
  constructor(
    readonly kind: DialogueHttpFailure,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
  }
}

export class HttpDialogueProvider implements DialogueProvider {
  private readonly endpoint: string;
  private readonly sessionId: string;
  private readonly turnNamespace = crypto.randomUUID();

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
      turnId: this.transportTurnId(context.turnId),
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
      turnId: this.transportTurnId(context.turnId),
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
      turnId: this.transportTurnId(context.turnId),
      request,
    }, context.signal);
  }

  reset(): Promise<void> {
    return this.send({ operation: "reset", sessionId: this.sessionId });
  }

  /** Checks server reachability without opening or changing provider memory. */
  ready(): Promise<void> {
    return this.send({ operation: "ready", sessionId: this.sessionId });
  }

  private transportTurnId(turnId: string): string {
    return `${this.turnNamespace}:${turnId}`;
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
      throw new DialogueHttpError(
        "unreachable",
        "The Dialogue Server could not be reached.",
        { cause },
      );
    }
    let payload: unknown;
    try {
      payload = await response.json();
    } catch (cause) {
      throw invalidDialogueResponse(cause);
    }
    if (!isDialogueResponse(payload)) {
      throw invalidDialogueResponse();
    }
    if (!response.ok || !payload.ok) {
      throw new DialogueHttpError(
        "request-failed",
        payload.ok ? "The Dialogue Provider request failed." : payload.error,
      );
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

function invalidDialogueResponse(cause?: unknown): DialogueHttpError {
  return new DialogueHttpError(
    "invalid-response",
    "The Dialogue Provider returned an invalid response.",
    cause === undefined ? undefined : { cause },
  );
}

function isDialogueResponse(value: unknown): value is DialogueHttpResponse {
  if (typeof value !== "object" || value === null || !("ok" in value)) return false;
  if ((value as { readonly ok?: unknown }).ok === true) return true;
  return (value as { readonly ok?: unknown }).ok === false &&
    "error" in value && typeof (value as { readonly error?: unknown }).error === "string";
}
