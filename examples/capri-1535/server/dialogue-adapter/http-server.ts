import { createServer, type IncomingMessage, type ServerResponse } from "node:http";

import type { DialogueProvider, DialogueTurnContext } from "@asterixcapri/fondale";

import type {
  LocalDialogueRequest,
  LocalDialogueResponse,
} from "../../src/local-dialogue-protocol";

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
  const providers = new Map<string, Promise<ClosableDialogueProvider>>();
  const allowedOrigins = new Set(options.allowedOrigins ?? [
    "http://127.0.0.1:5173",
    "http://localhost:5173",
  ]);
  const server = createServer(async (request, response) => {
    try {
      if (!allowOrigin(request, response, allowedOrigins)) return;
      if (request.method === "OPTIONS") {
        response.writeHead(204).end();
        return;
      }
      if (request.method !== "POST" || request.url !== "/dialogue") {
        writeJson(response, 404, { ok: false, error: "Not found." });
        return;
      }
      const body = await readJson(request);
      if (!isLocalDialogueRequest(body)) {
        writeJson(response, 400, { ok: false, error: "Invalid Dialogue Provider request." });
        return;
      }
      let providerPromise = providers.get(body.sessionId);
      if (!providerPromise) {
        providerPromise = options.createProvider(body.sessionId);
        providers.set(body.sessionId, providerPromise);
      }
      const provider = await providerPromise;
      const controller = new AbortController();
      request.once("aborted", () => controller.abort(new DOMException("Aborted", "AbortError")));
      response.once("close", () => {
        if (!response.writableEnded) controller.abort(new DOMException("Aborted", "AbortError"));
      });
      const value = await execute(provider, body, controller.signal);
      if (!controller.signal.aborted) writeJson(response, 200, { ok: true, value });
    } catch {
      if (!response.headersSent) {
        writeJson(response, 500, {
          ok: false,
          error: "Dialogue Provider request failed.",
        });
      }
    }
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(options.port, options.host, resolve);
  });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Dialogue adapter has no TCP address.");

  return {
    url: `http://${options.host}:${address.port}/dialogue`,
    async close() {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
      });
      const settledProviders = await Promise.allSettled(providers.values());
      await Promise.all(settledProviders.flatMap((result) =>
        result.status === "fulfilled" && result.value.close ? [result.value.close()] : []
      ));
    },
  };
}

async function execute(
  provider: DialogueProvider,
  body: LocalDialogueRequest,
  signal: AbortSignal,
): Promise<unknown> {
  if (body.operation === "reset") return provider.reset();
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

function allowOrigin(
  request: IncomingMessage,
  response: ServerResponse,
  allowedOrigins: ReadonlySet<string>,
): boolean {
  const origin = request.headers.origin;
  if (!origin) return true;
  if (!allowedOrigins.has(origin)) {
    writeJson(response, 403, { ok: false, error: "Origin is not allowed." });
    return false;
  }
  response.setHeader("access-control-allow-origin", origin);
  response.setHeader("vary", "origin");
  response.setHeader("access-control-allow-methods", "POST, OPTIONS");
  response.setHeader("access-control-allow-headers", "content-type");
  return true;
}

async function readJson(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.byteLength;
    if (size > 1_000_000) throw new Error("Dialogue Provider request is too large.");
    chunks.push(buffer);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
}

function isLocalDialogueRequest(value: unknown): value is LocalDialogueRequest {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.sessionId !== "string" || !candidate.sessionId.trim() ||
      candidate.sessionId.length > 200) return false;
  if (candidate.operation === "reset") return true;
  return (candidate.operation === "interpret" || candidate.operation === "verbalize" ||
      candidate.operation === "reflect") &&
    typeof candidate.turnId === "string" && candidate.turnId.length > 0 &&
    typeof candidate.request === "object" && candidate.request !== null;
}

function writeJson(response: ServerResponse, status: number, body: LocalDialogueResponse): void {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}
