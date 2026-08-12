import assert from "node:assert/strict";
import { test } from "node:test";

import {
  DeterministicDialogueModel,
  createPostgresDialogueProvider,
  type DialogueModel,
} from "./postgres-dialogue-provider";

const databaseUrl = process.env.DIALOGUE_ADAPTER_TEST_DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DIALOGUE_ADAPTER_TEST_DATABASE_URL is required for adapter integration verification.");
}

test("the PostgreSQL adapter persists only visible Dialogue Lines across restarts", async () => {
  const sessionId = crypto.randomUUID();
  const model = new DeterministicDialogueModel({
    interpretations: {
      "Where is the lantern?": "lantern-location",
      "Remind me where it is.": "lantern-location",
    },
  });
  const firstProvider = await createPostgresDialogueProvider({
    databaseUrl,
    sessionId,
    model,
  });

  try {
    const interpretation = await firstProvider.interpret({
      playerInput: "Where is the lantern?",
      speaker: "antonio",
      listener: "michele",
      candidates: [{
        id: "lantern-location",
        proposition: "The lantern is under the harbour stairs.",
      }],
    }, turnContext("turn-1"));
    assert.deepEqual(interpretation, { factId: "lantern-location" });

    const response = await firstProvider.verbalize({
      playerInput: "Where is the lantern?",
      speaker: "antonio",
      listener: "michele",
      strategy: "answer",
      fact: {
        id: "lantern-location",
        proposition: "The lantern is under the harbour stairs.",
      },
      profile: {},
    }, turnContext("turn-1"));
    assert.equal(response, "The lantern is under the harbour stairs. [no earlier visible Lines]");
  } finally {
    await firstProvider.close();
  }

  const restartedProvider = await createPostgresDialogueProvider({
    databaseUrl,
    sessionId,
    model,
  });
  try {
    const response = await restartedProvider.verbalize({
      playerInput: "Remind me where it is.",
      speaker: "antonio",
      listener: "michele",
      strategy: "answer",
      fact: {
        id: "lantern-location",
        proposition: "The lantern is under the harbour stairs.",
      },
      profile: {},
    }, turnContext("turn-2"));
    assert.equal(
      response,
      "The lantern is under the harbour stairs. " +
        "[earlier visible Lines: Player: Where is the lantern? | " +
        "Character: The lantern is under the harbour stairs. [no earlier visible Lines]]",
    );
  } finally {
    await restartedProvider.reset();
    await restartedProvider.close();
  }
});

test("Conversation, Reflection and Game Sessions use isolated PostgreSQL threads", async () => {
  const firstSessionId = crypto.randomUUID();
  const secondSessionId = crypto.randomUUID();
  const model = new DeterministicDialogueModel({ interpretations: {} });
  const firstSession = await createPostgresDialogueProvider({
    databaseUrl, sessionId: firstSessionId, model,
  });
  const secondSession = await createPostgresDialogueProvider({
    databaseUrl, sessionId: secondSessionId, model,
  });

  try {
    assert.match(await answer(firstSession, "antonio", "First Antonio question", "turn-a1"),
      /no earlier visible Lines/);
    assert.match(await answer(firstSession, "raffaele", "First Raffaele question", "turn-r1"),
      /no earlier visible Lines/);
    assert.match(await answer(secondSession, "antonio", "Other session question", "turn-b1"),
      /no earlier visible Lines/);

    const reflection = await firstSession.reflect({
      playerInput: "What do I know?",
      character: "michele",
      facts: [{ id: "harbour", proposition: "The harbour is below." }],
      testimonies: [],
      relationships: [],
    }, turnContext("reflection-1"));
    assert.match(reflection.summary, /no earlier visible Lines/);
    assert.doesNotMatch(reflection.summary, /First Antonio question/);

    assert.match(await answer(firstSession, "antonio", "Second Antonio question", "turn-a2"),
      /First Antonio question/);
    await firstSession.reset();
    assert.match(await answer(firstSession, "antonio", "After reset", "turn-a3"),
      /no earlier visible Lines/);
    assert.match(await answer(secondSession, "antonio", "Still remembered", "turn-b2"),
      /Other session question/);
  } finally {
    await firstSession.reset();
    await secondSession.reset();
    await firstSession.close();
    await secondSession.close();
  }
});

test("failed and cancelled turns leave no visible half-turn in memory", async () => {
  const sessionId = crypto.randomUUID();
  const deterministic = new DeterministicDialogueModel({ interpretations: {} });
  const model: DialogueModel = {
    interpret: (...arguments_) => deterministic.interpret(...arguments_),
    reflect: (...arguments_) => deterministic.reflect(...arguments_),
    verbalize(request, history, signal) {
      if (request.playerInput === "Fail now") return Promise.reject(new Error("model failed"));
      if (request.playerInput === "Wait forever") {
        return new Promise((_resolve, reject) => {
          signal.addEventListener("abort", () => reject(signal.reason), { once: true });
        });
      }
      return deterministic.verbalize(request, history, signal);
    },
  };
  const provider = await createPostgresDialogueProvider({
    databaseUrl, sessionId, model,
  });

  try {
    await answer(provider, "antonio", "Committed question", "turn-1");
    await assert.rejects(answer(provider, "antonio", "Fail now", "turn-2"), /model failed/);

    const controller = new AbortController();
    const cancelled = answer(
      provider,
      "antonio",
      "Wait forever",
      "turn-3",
      controller.signal,
    );
    controller.abort(new DOMException("Cancelled", "AbortError"));
    await assert.rejects(cancelled, { name: "AbortError" });

    const nextResponse = await answer(provider, "antonio", "Next question", "turn-4");
    assert.match(nextResponse, /Committed question/);
    assert.doesNotMatch(nextResponse, /Fail now|Wait forever/);
  } finally {
    await provider.reset();
    await provider.close();
  }
});

function answer(
  provider: Awaited<ReturnType<typeof createPostgresDialogueProvider>>,
  speaker: string,
  playerInput: string,
  turnId: string,
  signal = new AbortController().signal,
): Promise<string> {
  return provider.verbalize({
    playerInput,
    speaker,
    listener: "michele",
    strategy: "answer",
    fact: { id: "fact", proposition: "An authorised fact." },
    profile: {},
  }, { turnId, signal });
}

function turnContext(turnId: string) {
  return { turnId, signal: new AbortController().signal };
}
