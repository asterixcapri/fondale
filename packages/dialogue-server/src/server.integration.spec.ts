import assert from "node:assert/strict";
import { test } from "node:test";

import type { DialogueProvider } from "@asterixcapri/fondale";
import { HttpDialogueProvider } from "@asterixcapri/fondale";

import type { DialogueModel } from "./dialogue-model.js";
import { createDialogueServer } from "./server.js";

const databaseUrl = process.env.DIALOGUE_ADAPTER_TEST_DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DIALOGUE_ADAPTER_TEST_DATABASE_URL is required for server integration verification.");
}

test("a new Dialogue Server handler recovers a session's visible history", async () => {
  const model = historyReportingModel();
  const sessionId = crypto.randomUUID();
  const firstServer = await createDialogueServer({
    databaseUrl,
    host: "127.0.0.1",
    port: 0,
    model,
  });
  const provider = new HttpDialogueProvider({
    endpoint: firstServer.url,
    sessionId,
  });

  try {
    const context = { turnId: "turn-1", signal: new AbortController().signal };
    const request = {
      narrativeContext: "A historical mystery in the harbour of Capri in 1535.",
      playerInput: "Where is the lantern?",
      speaker: "antonio",
      listener: "michele",
      candidates: [{
        id: "lantern-location",
        proposition: "The lantern is below the harbour stairs.",
      }],
    } as const;
    assert.deepEqual(await provider.interpret(request, context), {
      factId: "lantern-location",
    });
    assert.equal(await provider.verbalize({
      narrativeContext: request.narrativeContext,
      playerInput: request.playerInput,
      speaker: request.speaker,
      listener: request.listener,
      strategy: "answer",
      fact: request.candidates[0],
      profile: {},
    }, context), "The lantern is below the harbour stairs. [history:0]");
    assert.deepEqual(await provider.reflect({
      narrativeContext: request.narrativeContext,
      playerInput: "What do I know?",
      character: "michele",
      facts: [],
      testimonies: [],
      relationships: [],
    }, { turnId: "reflection-1", signal: context.signal }), { summary: "[history:0]" });
  } finally {
    await firstServer.close();
  }

  const restartedServer = await createDialogueServer({
    databaseUrl,
    host: "127.0.0.1",
    port: 0,
    model,
  });
  const recoveredProvider = new HttpDialogueProvider({
    endpoint: restartedServer.url,
    sessionId,
  });
  try {
    assert.match(await recoveredProvider.verbalize({
      narrativeContext: "A historical mystery in the harbour of Capri in 1535.",
      playerInput: "Remind me where it is.",
      speaker: "antonio",
      listener: "michele",
      strategy: "answer",
      fact: {
        id: "lantern-location",
        proposition: "The lantern is below the harbour stairs.",
      },
      profile: {},
    }, { turnId: "turn-2", signal: new AbortController().signal }),
    /\[history:2\]$/);
    assert.deepEqual(await recoveredProvider.reflect({
      narrativeContext: "A historical mystery in the harbour of Capri in 1535.",
      playerInput: "What else do I know?",
      character: "michele",
      facts: [],
      testimonies: [],
      relationships: [],
    }, turnContext("reflection-2")), { summary: "[history:2]" });
    await recoveredProvider.reset();
  } finally {
    await restartedServer.close();
  }
});

test("one public Dialogue Server serves different Game Projects without sharing Character history", async () => {
  const server = await createDialogueServer({
    databaseUrl,
    host: "127.0.0.1",
    port: 0,
    model: {
      interpret: () => Promise.resolve({ factId: null, reason: "no-relevant-fact" }),
      verbalize(request, history) {
        return Promise.resolve(`${request.narrativeContext} [history:${history.length}]`);
      },
      reflect: () => Promise.resolve({ summary: "unused" }),
    },
  });
  const capriSession = new HttpDialogueProvider({
    endpoint: server.url,
    sessionId: crypto.randomUUID(),
  });
  const marsSession = new HttpDialogueProvider({
    endpoint: server.url,
    sessionId: crypto.randomUUID(),
  });

  try {
    assert.equal(await answer(
      capriSession,
      "antonio",
      "What happened here?",
      "capri-turn-1",
      "A historical mystery in the harbour of Capri in 1535.",
    ), "A historical mystery in the harbour of Capri in 1535. [history:0]");
    assert.equal(await answer(
      marsSession,
      "antonio",
      "What happened here?",
      "mars-turn-1",
      "A scientific mystery on Mars in 2248.",
    ), "A scientific mystery on Mars in 2248. [history:0]");
    assert.equal(await answer(
      capriSession,
      "antonio",
      "What did I ask?",
      "capri-turn-2",
      "A historical mystery in the harbour of Capri in 1535.",
    ), "A historical mystery in the harbour of Capri in 1535. [history:2]");
  } finally {
    await capriSession.reset();
    await marsSession.reset();
    await server.close();
  }
});

test("the public Dialogue Server isolates sessions, Characters and dialogue modes", async () => {
  const server = await createDialogueServer({
    databaseUrl,
    host: "127.0.0.1",
    port: 0,
    model: historyReportingModel(),
  });
  const firstSession = new HttpDialogueProvider({
    endpoint: server.url,
    sessionId: crypto.randomUUID(),
  });
  const secondSession = new HttpDialogueProvider({
    endpoint: server.url,
    sessionId: crypto.randomUUID(),
  });

  try {
    assert.match(await answer(firstSession, "antonio", "First Antonio question", "turn-a1"),
      /\[history:0\]$/);
    assert.match(await answer(firstSession, "raffaele", "First Raffaele question", "turn-r1"),
      /\[history:0\]$/);
    assert.match(await answer(secondSession, "antonio", "Other session question", "turn-b1"),
      /\[history:0\]$/);

    const reflectionRequest = {
      narrativeContext: "A historical mystery in the harbour of Capri in 1535.",
      playerInput: "What do I know?",
      character: "michele",
      facts: [],
      testimonies: [],
      relationships: [],
    } as const;
    assert.deepEqual(await firstSession.reflect(
      reflectionRequest,
      turnContext("reflection-1"),
    ), { summary: "[history:0]" });
    assert.deepEqual(await firstSession.reflect(
      { ...reflectionRequest, playerInput: "Antonio reflects.", character: "antonio" },
      turnContext("reflection-antonio-1"),
    ), { summary: "[history:0]" });
    assert.deepEqual(await firstSession.reflect(
      { ...reflectionRequest, playerInput: "What else?" },
      turnContext("reflection-2"),
    ), { summary: "[history:2]" });
    assert.deepEqual(await secondSession.reflect(
      reflectionRequest,
      turnContext("reflection-other-1"),
    ), { summary: "[history:0]" });

    assert.match(await answer(firstSession, "antonio", "Second Antonio question", "turn-a2"),
      /\[history:2\]$/);
    await firstSession.reset();
    assert.match(await answer(firstSession, "antonio", "After reset", "turn-a3"),
      /\[history:0\]$/);
    assert.deepEqual(await firstSession.reflect(
      { ...reflectionRequest, playerInput: "After reset" },
      turnContext("reflection-after-reset"),
    ), { summary: "[history:0]" });
    assert.match(await answer(secondSession, "antonio", "Still remembered", "turn-b2"),
      /\[history:2\]$/);
    assert.deepEqual(await secondSession.reflect(
      { ...reflectionRequest, playerInput: "Still reflected" },
      turnContext("reflection-other-2"),
    ), { summary: "[history:2]" });
  } finally {
    await firstSession.reset();
    await secondSession.reset();
    await server.close();
  }
});

function historyReportingModel(): DialogueModel {
  return {
    interpret(request) {
      const factId = request.candidates[0]?.id;
      return Promise.resolve(factId
        ? { factId }
        : { factId: null, reason: "no-relevant-fact" });
    },
    verbalize(request, history) {
      return Promise.resolve(
        `${request.fact?.proposition ?? request.strategy} [history:${history.length}]`,
      );
    },
    reflect(_request, history) {
      return Promise.resolve({ summary: `[history:${history.length}]` });
    },
  };
}

function answer(
  provider: DialogueProvider,
  speaker: string,
  playerInput: string,
  turnId: string,
  narrativeContext = "A historical mystery in the harbour of Capri in 1535.",
): Promise<string> {
  return provider.verbalize({
    narrativeContext,
    playerInput,
    speaker,
    listener: "michele",
    strategy: "answer",
    fact: { id: "fact", proposition: "An authorised fact." },
    profile: {},
  }, turnContext(turnId));
}

function turnContext(turnId: string) {
  return { turnId, signal: new AbortController().signal };
}
