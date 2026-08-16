import { serve, type ServerType } from "@hono/node-server";
import { Hono, type Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { cors } from "hono/cors";

import type {
  DialogueHttpRequest,
  DialogueHttpResponse,
  DialogueProvider,
  DialogueTurnContext,
} from "@asterixcapri/fondale";

interface ClosableDialogueProvider extends DialogueProvider {
  close?: () => Promise<void>;
}

export interface DialogueAdapterServer {
  readonly url: string;
  close(): Promise<void>;
}

export async function createDialogueAdapterServer(options: {
  readonly host: string;
  readonly port: number;
  readonly createProvider: (sessionId: string) => Promise<ClosableDialogueProvider>;
  readonly allowedOrigins?: readonly string[];
}): Promise<DialogueAdapterServer> {
  const activeTurns = new Map<string, AbortController>();
  const allowedOrigins = options.allowedOrigins ?? [
    "http://127.0.0.1:5173",
    "http://localhost:5173",
  ];

  const app = new Hono();

  app.use(
    "/dialogue",
    cors({
      origin: (origin) => allowedOrigins.includes(origin) ? origin : null,
      allowMethods: ["POST", "OPTIONS"],
      allowHeaders: ["content-type"],
    }),
  );

  // A request that carries an Origin the Author did not allow is refused
  // before it can reach a Dialogue Provider, and learns nothing else.
  app.use("/dialogue", async (context, next) => {
    const origin = context.req.header("origin");
    if (origin !== undefined && !allowedOrigins.includes(origin)) {
      return json(context, 403, { ok: false, error: "Origin is not allowed." });
    }
    await next();
  });

  app.post("/dialogue", async (context) => {
    const body = await readJson(context.req.raw);
    if (!isDialogueRequest(body)) {
      return json(context, 400, { ok: false, error: "Invalid Dialogue Provider request." });
    }
    const turnKey = "turnId" in body ? `${body.sessionId}\0${body.turnId}` : undefined;
    if (body.operation === "cancel") {
      activeTurns.get(turnKey!)?.abort(new DOMException("Aborted", "AbortError"));
      return json(context, 200, { ok: true });
    }
    // The Web-standard request already aborts when the Player closes the
    // Conversation or the browser goes away, so the turn follows it directly.
    const controller = new AbortController();
    const abort = () => controller.abort(new DOMException("Aborted", "AbortError"));
    if (context.req.raw.signal.aborted) abort();
    else context.req.raw.signal.addEventListener("abort", abort, { once: true });
    if (turnKey) activeTurns.set(turnKey, controller);
    let provider: ClosableDialogueProvider | undefined;
    try {
      provider = await options.createProvider(body.sessionId);
      if (controller.signal.aborted) return abandoned(context);
      const value = await execute(provider, body, controller.signal);
      if (controller.signal.aborted) return abandoned(context);
      return json(context, 200, { ok: true, value });
    } finally {
      if (turnKey && activeTurns.get(turnKey) === controller) activeTurns.delete(turnKey);
      await provider?.close?.();
    }
  });

  app.all("/*", (context) => json(context, 404, { ok: false, error: "Not found." }));

  // The browser learns only that the turn failed; the cause stays on the
  // server console, where a local developer can actually read it.
  app.onError((cause, context) => {
    console.error("Dialogue Provider request failed.", cause);
    return json(context, 500, { ok: false, error: "Dialogue Provider request failed." });
  });

  const server = await new Promise<ServerType>((resolve, reject) => {
    const started = serve({ fetch: app.fetch, hostname: options.host, port: options.port }, () =>
      resolve(started)
    );
    started.once("error", reject);
  });
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Dialogue adapter has no TCP address.");
  }

  return {
    url: `http://${options.host}:${address.port}/dialogue`,
    async close() {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
        (server as { closeIdleConnections?: () => void }).closeIdleConnections?.();
      });
    },
  };
}

async function execute(
  provider: DialogueProvider,
  body: DialogueHttpRequest,
  signal: AbortSignal,
): Promise<unknown> {
  if (body.operation === "reset") return provider.reset();
  if (body.operation === "cancel") return;
  const context: DialogueTurnContext = { turnId: body.turnId, signal };
  switch (body.operation) {
    case "interpret":
      return provider.interpret(body.request, context);
    case "verbalize":
      return provider.verbalize(body.request, context);
    case "reflect":
      return provider.reflect(body.request, context);
  }
}

/**
 * A turn the Player abandoned owes its answer to nobody: the browser has
 * already stopped listening, so this only closes the exchange tidily.
 */
function abandoned(context: Context): Response {
  return json(context, 408, { ok: false, error: "Dialogue Turn was cancelled." });
}

function json(
  context: Context,
  status: ContentfulStatusCode,
  body: DialogueHttpResponse,
): Response {
  return context.json(body, status);
}

async function readJson(request: Request): Promise<unknown> {
  const raw = await request.text();
  if (raw.length > 1_000_000) throw new Error("Dialogue Provider request is too large.");
  return JSON.parse(raw) as unknown;
}

function isDialogueRequest(value: unknown): value is DialogueHttpRequest {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.sessionId !== "string" || !candidate.sessionId.trim() ||
      candidate.sessionId.length > 200) return false;
  if (candidate.operation === "reset") return true;
  if (candidate.operation === "cancel") {
    return typeof candidate.turnId === "string" && candidate.turnId.length > 0;
  }
  return (candidate.operation === "interpret" || candidate.operation === "verbalize" ||
      candidate.operation === "reflect") &&
    typeof candidate.turnId === "string" && candidate.turnId.length > 0 &&
    typeof candidate.request === "object" && candidate.request !== null;
}
