import assert from "node:assert/strict";
import { test } from "node:test";

import type { DialogueProvider } from "fondale";

import { HttpDialogueProvider } from "fondale";
import { createDialogueAdapterServer } from "./http-server.js";

test("startup readiness does not open or reset provider memory", async () => {
  let providersCreated = 0;
  const server = await createDialogueAdapterServer({
    host: "127.0.0.1",
    port: 0,
    createProvider: () => {
      providersCreated += 1;
      return Promise.reject(new Error("readiness must not open a provider"));
    },
  });
  const client = new HttpDialogueProvider({
    endpoint: server.url,
    sessionId: "continued-session",
  });

  try {
    await client.ready();
    assert.equal(providersCreated, 0);
  } finally {
    await server.close();
  }
});

test("the local transport forwards the Dialogue Provider contract to one Game Session", async () => {
  const calls: string[] = [];
  const provider: DialogueProvider & { close(): Promise<void> } = {
    interpret(request, context) {
      calls.push(`interpret:${request.narrativeContext}:${request.playerInput}:${context.turnId}`);
      return Promise.resolve({ factId: request.candidates[0]!.id });
    },
    verbalize(request, context) {
      calls.push(`verbalize:${request.narrativeContext}:${request.fact!.id}:${context.turnId}`);
      return Promise.resolve(request.fact!.proposition);
    },
    reflect(request, context) {
      calls.push(`reflect:${request.narrativeContext}:${request.character}:${context.turnId}`);
      return Promise.resolve({ summary: request.facts[0]!.proposition });
    },
    reset() {
      calls.push("reset");
      return Promise.resolve();
    },
    close() {
      calls.push("close");
      return Promise.resolve();
    },
  };
  const sessions: string[] = [];
  const server = await createDialogueAdapterServer({
    host: "127.0.0.1",
    port: 0,
    createProvider(sessionId) {
      sessions.push(sessionId);
      return Promise.resolve(provider);
    },
  });
  const client = new HttpDialogueProvider({
    endpoint: server.url,
    sessionId: "game-session-1",
  });

  try {
    const context = { turnId: "turn-1", signal: new AbortController().signal };
    const interpretation = await client.interpret({
      narrativeContext: "A storm-bound lighthouse mystery.",
      playerInput: "Where is it?",
      speaker: "antonio",
      listener: "michele",
      candidates: [{ id: "lantern", proposition: "The lantern is below." }],
    }, context);
    assert.deepEqual(interpretation, { factId: "lantern" });
    assert.equal(await client.verbalize({
      narrativeContext: "A storm-bound lighthouse mystery.",
      playerInput: "Where is it?",
      speaker: "antonio",
      listener: "michele",
      strategy: "answer",
      fact: { id: "lantern", proposition: "The lantern is below." },
      profile: {},
    }, context), "The lantern is below.");
    assert.deepEqual(await client.reflect({
      narrativeContext: "A storm-bound lighthouse mystery.",
      playerInput: "What do I know?",
      character: "michele",
      facts: [{ id: "lantern", proposition: "The lantern is below." }],
      testimonies: [],
      relationships: [],
    }, context), { summary: "The lantern is below." });
    await client.reset();

    assert.deepEqual(sessions, [
      "game-session-1",
      "game-session-1",
      "game-session-1",
      "game-session-1",
    ]);
    const transportTurnId = calls[0]!.slice(
      "interpret:A storm-bound lighthouse mystery.:Where is it?:".length,
    );
    assert.match(transportTurnId, /^[0-9a-f-]{36}:turn-1$/);
    assert.deepEqual(calls, [
      `interpret:A storm-bound lighthouse mystery.:Where is it?:${transportTurnId}`,
      "close",
      `verbalize:A storm-bound lighthouse mystery.:lantern:${transportTurnId}`,
      "close",
      `reflect:A storm-bound lighthouse mystery.:michele:${transportTurnId}`,
      "close",
      "reset",
      "close",
    ]);
  } finally {
    await server.close();
  }
});

test("transport retries preserve the session, Dialogue Turn and provider operation", async () => {
  const calls: string[] = [];
  const provider: DialogueProvider = {
    interpret(_request, context) {
      calls.push(`interpret:${context.turnId}`);
      return Promise.resolve({ factId: "fact" });
    },
    verbalize(_request, context) {
      calls.push(`verbalize:${context.turnId}`);
      return Promise.resolve("Authorised answer.");
    },
    reflect: () => Promise.reject(new Error("unused")),
    reset: () => Promise.resolve(),
  };
  const sessions: string[] = [];
  const server = await createDialogueAdapterServer({
    host: "127.0.0.1",
    port: 0,
    createProvider(sessionId) {
      sessions.push(sessionId);
      return Promise.resolve(provider);
    },
  });
  const client = new HttpDialogueProvider({ endpoint: server.url, sessionId: "session-1" });
  const context = { turnId: "turn-1", signal: new AbortController().signal };
  const interpretationRequest = {
    narrativeContext: "A storm-bound lighthouse mystery.",
    playerInput: "Where is it?",
    speaker: "antonio",
    listener: "michele",
    candidates: [{ id: "fact", proposition: "It is below." }],
  } as const;
  const verbalizationRequest = {
    narrativeContext: interpretationRequest.narrativeContext,
    playerInput: interpretationRequest.playerInput,
    speaker: interpretationRequest.speaker,
    listener: interpretationRequest.listener,
    strategy: "answer",
    fact: interpretationRequest.candidates[0],
    profile: {},
  } as const;

  try {
    await client.interpret(interpretationRequest, context);
    await client.interpret(interpretationRequest, context);
    await client.verbalize(verbalizationRequest, context);
    await client.verbalize(verbalizationRequest, context);

    assert.deepEqual(sessions, ["session-1", "session-1", "session-1", "session-1"]);
    const transportTurnId = calls[0]!.slice("interpret:".length);
    assert.match(transportTurnId, /^[0-9a-f-]{36}:turn-1$/);
    assert.deepEqual(calls, [
      `interpret:${transportTurnId}`,
      `interpret:${transportTurnId}`,
      `verbalize:${transportTurnId}`,
      `verbalize:${transportTurnId}`,
    ]);
  } finally {
    await server.close();
  }
});

test("the local transport never exposes server-side failure details", async () => {
  const provider: DialogueProvider = {
    interpret: () => Promise.reject(new Error("DATABASE_URL=postgresql://user:secret@database")),
    verbalize: () => Promise.reject(new Error("unused")),
    reflect: () => Promise.reject(new Error("unused")),
    reset: () => Promise.resolve(),
  };
  const server = await createDialogueAdapterServer({
    host: "127.0.0.1",
    port: 0,
    createProvider: () => Promise.resolve(provider),
  });
  const client = new HttpDialogueProvider({
    endpoint: server.url,
    sessionId: "game-session-1",
  });

  try {
    await assert.rejects(
      client.interpret({
        narrativeContext: "A storm-bound lighthouse mystery.",
        playerInput: "Where is it?",
        speaker: "antonio",
        listener: "michele",
        candidates: [],
      }, { turnId: "turn-1", signal: new AbortController().signal }),
      new Error("Dialogue Provider request failed."),
    );
  } finally {
    await server.close();
  }
});

test("cancelling while a Game Session provider initializes never starts the turn", async () => {
  let resolveProvider!: (provider: DialogueProvider) => void;
  const providerReady = new Promise<DialogueProvider>((resolve) => {
    resolveProvider = resolve;
  });
  let interpretations = 0;
  const provider: DialogueProvider = {
    interpret: () => {
      interpretations += 1;
      return Promise.resolve({ factId: null, reason: "no-relevant-fact" });
    },
    verbalize: () => Promise.reject(new Error("unused")),
    reflect: () => Promise.reject(new Error("unused")),
    reset: () => Promise.resolve(),
  };
  const server = await createDialogueAdapterServer({
    host: "127.0.0.1",
    port: 0,
    createProvider: () => providerReady,
  });
  const client = new HttpDialogueProvider({
    endpoint: server.url,
    sessionId: "game-session-1",
  });
  const controller = new AbortController();

  try {
    const pending = client.interpret({
      narrativeContext: "A storm-bound lighthouse mystery.",
      playerInput: "Where is it?",
      speaker: "antonio",
      listener: "michele",
      candidates: [],
    }, { turnId: "turn-1", signal: controller.signal });
    await new Promise((resolve) => setTimeout(resolve, 10));
    controller.abort(new DOMException("Cancelled", "AbortError"));
    await assert.rejects(pending, { name: "AbortError" });

    resolveProvider(provider);
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(interpretations, 0);
  } finally {
    resolveProvider(provider);
    await server.close();
  }
});

test("reset cancels an active Dialogue Turn before it acknowledges completion", async () => {
  let markStarted!: () => void;
  const started = new Promise<void>((resolve) => {
    markStarted = resolve;
  });
  let resets = 0;
  const provider: DialogueProvider = {
    interpret: () => Promise.reject(new Error("unused")),
    verbalize(_request, context) {
      markStarted();
      return new Promise((_resolve, reject) => {
        context.signal.addEventListener("abort", () => reject(context.signal.reason), {
          once: true,
        });
      });
    },
    reflect: () => Promise.reject(new Error("unused")),
    reset() {
      resets += 1;
      return Promise.resolve();
    },
  };
  const server = await createDialogueAdapterServer({
    host: "127.0.0.1",
    port: 0,
    createProvider: () => Promise.resolve(provider),
  });
  const client = new HttpDialogueProvider({
    endpoint: server.url,
    sessionId: "game-session-1",
  });
  const controller = new AbortController();

  try {
    const pendingOutcome = client.verbalize({
      narrativeContext: "A storm-bound lighthouse mystery.",
      playerInput: "Wait for me.",
      speaker: "antonio",
      listener: "michele",
      strategy: "refuse",
      profile: {},
    }, { turnId: "turn-1", signal: controller.signal })
      .then(() => "completed", () => "cancelled");
    await started;
    await client.reset();

    assert.equal(resets, 1);
    assert.equal(await Promise.race([
      pendingOutcome,
      new Promise<string>((resolve) => setTimeout(() => resolve("pending"), 50)),
    ]), "cancelled");
  } finally {
    controller.abort(new DOMException("Cancelled", "AbortError"));
    await server.close();
  }
});
