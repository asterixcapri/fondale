import assert from "node:assert/strict";
import { test } from "node:test";

import type { DialogueProvider } from "@asterixcapri/fondale";

import { HttpDialogueProvider } from "../../src/http-dialogue-provider";
import { createDialogueAdapterServer } from "./http-server";

test("the local transport forwards the Dialogue Provider contract to one Game Session", async () => {
  const calls: string[] = [];
  const provider: DialogueProvider = {
    interpret(request, context) {
      calls.push(`interpret:${request.playerInput}:${context.turnId}`);
      return Promise.resolve({ factId: request.candidates[0]!.id });
    },
    verbalize(request, context) {
      calls.push(`verbalize:${request.fact!.id}:${context.turnId}`);
      return Promise.resolve(request.fact!.proposition);
    },
    reflect(request, context) {
      calls.push(`reflect:${request.character}:${context.turnId}`);
      return Promise.resolve({ summary: request.facts[0]!.proposition });
    },
    reset() {
      calls.push("reset");
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
      playerInput: "Where is it?",
      speaker: "antonio",
      listener: "michele",
      candidates: [{ id: "lantern", proposition: "The lantern is below." }],
    }, context);
    assert.deepEqual(interpretation, { factId: "lantern" });
    assert.equal(await client.verbalize({
      playerInput: "Where is it?",
      speaker: "antonio",
      listener: "michele",
      strategy: "answer",
      fact: { id: "lantern", proposition: "The lantern is below." },
      profile: {},
    }, context), "The lantern is below.");
    assert.deepEqual(await client.reflect({
      playerInput: "What do I know?",
      character: "michele",
      facts: [{ id: "lantern", proposition: "The lantern is below." }],
      testimonies: [],
      relationships: [],
    }, context), { summary: "The lantern is below." });
    await client.reset();

    assert.deepEqual(sessions, ["game-session-1"]);
    assert.deepEqual(calls, [
      "interpret:Where is it?:turn-1",
      "verbalize:lantern:turn-1",
      "reflect:michele:turn-1",
      "reset",
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
