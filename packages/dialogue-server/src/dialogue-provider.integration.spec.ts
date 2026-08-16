import assert from "node:assert/strict";
import { test } from "node:test";

import type {
  DialogueInterpretation,
  DialogueInterpretationRequest,
  DialogueVerbalizationRequest,
  ReflectionRequest,
  ReflectionResponse,
} from "@asterixcapri/fondale";

import { throwIfAborted } from "./cancellation.js";
import type { DialogueModel, VisibleDialogueLine } from "./dialogue-model.js";
import {
  createDialogueProvider,
} from "./dialogue-provider.js";

const databaseUrl = process.env.DIALOGUE_ADAPTER_TEST_DATABASE_URL;
const narrativeContext = "A historical mystery in the harbour of Capri in 1535.";
if (!databaseUrl) {
  throw new Error("DIALOGUE_ADAPTER_TEST_DATABASE_URL is required for adapter integration verification.");
}

test("the PostgreSQL adapter persists only visible Dialogue Lines across restarts", async () => {
  const sessionId = crypto.randomUUID();
  const model = new EchoingDialogueModel({
    interpretations: {
      "Where is the lantern?": "lantern-location",
      "Remind me where it is.": "lantern-location",
    },
  });
  const firstProvider = await createDialogueProvider({
    databaseUrl,
    sessionId,
    model,
  });

  try {
    const interpretation = await firstProvider.interpret({
      narrativeContext,
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
      narrativeContext,
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

  const restartedProvider = await createDialogueProvider({
    databaseUrl,
    sessionId,
    model,
  });
  try {
    const response = await restartedProvider.verbalize({
      narrativeContext,
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
  const model = new EchoingDialogueModel({ interpretations: {} });
  const firstSession = await createDialogueProvider({
    databaseUrl, sessionId: firstSessionId, model,
  });
  const secondSession = await createDialogueProvider({
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
      narrativeContext,
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
  const echoing = new EchoingDialogueModel({ interpretations: {} });
  const model: DialogueModel = {
    interpret: (...arguments_) => echoing.interpret(...arguments_),
    reflect: (...arguments_) => echoing.reflect(...arguments_),
    verbalize(request, history, signal) {
      if (request.playerInput === "Fail now") return Promise.reject(new Error("model failed"));
      if (request.playerInput === "Wait forever") {
        return new Promise((_resolve, reject) => {
          signal.addEventListener("abort", () => reject(signal.reason), { once: true });
        });
      }
      return echoing.verbalize(request, history, signal);
    },
  };
  const provider = await createDialogueProvider({
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

test("reset invalidates an in-flight turn before acknowledging completion", async () => {
  const sessionId = crypto.randomUUID();
  let release!: () => void;
  let markStarted!: () => void;
  const started = new Promise<void>((resolve) => {
    markStarted = resolve;
  });
  const echoing = new EchoingDialogueModel({ interpretations: {} });
  const model: DialogueModel = {
    interpret: (...arguments_) => echoing.interpret(...arguments_),
    reflect: (...arguments_) => echoing.reflect(...arguments_),
    async verbalize(request, history, signal) {
      if (request.playerInput !== "Pending before reset") {
        return echoing.verbalize(request, history, signal);
      }
      markStarted();
      await new Promise<void>((resolve) => {
        release = resolve;
      });
      return "Late Character Line.";
    },
  };
  const provider = await createDialogueProvider({ databaseUrl, sessionId, model });

  try {
    const pending = answer(provider, "antonio", "Pending before reset", "turn-1");
    await started;
    const resetting = provider.reset();
    const resetOutcome = await Promise.race([
      resetting.then(() => "completed"),
      new Promise<string>((resolve) => setTimeout(() => resolve("pending"), 50)),
    ]);
    release();
    const pendingOutcome = await pending.then(() => "resolved", (cause: unknown) => cause);
    await resetting;
    assert.equal(resetOutcome, "pending");
    assert(pendingOutcome instanceof DOMException);
    assert.equal(pendingOutcome.name, "AbortError");
    assert.match(await answer(provider, "antonio", "After reset", "turn-2"),
      /no earlier visible Lines/);
  } finally {
    release?.();
    await provider.reset();
    await provider.close();
  }
});

test("Mastra bounds the visible context supplied to the model", async () => {
  const sessionId = crypto.randomUUID();
  const model: DialogueModel = {
    interpret: () => Promise.resolve({ factId: null, reason: "no-relevant-fact" }),
    verbalize: (_request, history) => Promise.resolve(`history:${history.length}`),
    reflect: () => Promise.resolve({ summary: "unused" }),
  };
  const provider = await createDialogueProvider({ databaseUrl, sessionId, model });

  try {
    for (let index = 0; index < 51; index += 1) {
      await answer(provider, "antonio", `Question ${index}`, `turn-${index}`);
    }
    assert.equal(await answer(provider, "antonio", "Bounded question", "turn-51"),
      "history:100");
  } finally {
    await provider.reset();
    await provider.close();
  }
});

test("Reflection memory stores the exact Character Line shown by Fondale", async () => {
  const sessionId = crypto.randomUUID();
  const reflectionHistories: (readonly import("./dialogue-model").VisibleDialogueLine[])[] = [];
  const model: DialogueModel = {
    interpret: () => Promise.resolve({ factId: null, reason: "no-relevant-fact" }),
    verbalize: () => Promise.resolve("unused"),
    reflect: (_request, history) => {
      reflectionHistories.push(history);
      return Promise.resolve({
        summary: "I remember the harbour.",
        hypotheses: ["the lantern may be a signal"],
        suggestions: ["inspect the harbour stairs"],
      });
    },
  };
  const provider = await createDialogueProvider({ databaseUrl, sessionId, model });
  const request = {
    narrativeContext,
    playerInput: "First reflection",
    character: "michele",
    facts: [{ id: "harbour", proposition: "The harbour is below." }],
    testimonies: [],
    relationships: [],
  } as const;

  try {
    await provider.reflect(request, turnContext("reflection-1"));
    await provider.reflect({ ...request, playerInput: "Second reflection" },
      turnContext("reflection-2"));
    assert.deepEqual(reflectionHistories[1], [
      { role: "player", text: "First reflection" },
      {
        role: "character",
        text: "I remember the harbour. " +
          "Uncertain hypothesis: the lantern may be a signal " +
          "Possible investigation: inspect the harbour stairs",
      },
    ]);
  } finally {
    await provider.reset();
    await provider.close();
  }
});

function answer(
  provider: Awaited<ReturnType<typeof createDialogueProvider>>,
  speaker: string,
  playerInput: string,
  turnId: string,
  signal = new AbortController().signal,
): Promise<string> {
  return provider.verbalize({
    narrativeContext,
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

/**
 * A Dialogue Model that answers with the visible history it was handed.
 *
 * Nothing else can see what the Dialogue Provider passed to a model, so these
 * tests read it back out of the answer itself.
 */
class EchoingDialogueModel implements DialogueModel {
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
