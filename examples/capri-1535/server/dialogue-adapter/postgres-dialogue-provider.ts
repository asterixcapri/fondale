import { createHash, randomUUID } from "node:crypto";

import type { MastraDBMessage } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { PostgresStore } from "@mastra/pg";
import type {
  DialogueInterpretation,
  DialogueInterpretationRequest,
  DialogueProvider,
  DialogueTurnContext,
  DialogueVerbalizationRequest,
  ReflectionRequest,
  ReflectionResponse,
} from "@asterixcapri/fondale";

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

export interface PostgresDialogueProvider extends DialogueProvider {
  close(): Promise<void>;
}

export async function createPostgresDialogueProvider(options: {
  readonly databaseUrl: string;
  readonly sessionId: string;
  readonly model: DialogueModel;
}): Promise<PostgresDialogueProvider> {
  if (!options.databaseUrl.trim()) throw new Error("DATABASE_URL must not be empty.");
  if (!options.sessionId.trim()) throw new Error("Game Session identity must not be empty.");

  const storage = new PostgresStore({
    id: `fondale-dialogue-${digest(options.sessionId)}`,
    connectionString: options.databaseUrl,
  });
  await storage.init();
  const memory = new Memory({
    storage,
    options: { lastMessages: 100 },
  });
  const resourceId = `fondale-dialogue-session:${options.sessionId}`;

  return {
    async interpret(request, context) {
      const history = await recallVisibleLines(
        memory,
        threadIdentity(options.sessionId, "conversation", request.speaker),
      );
      throwIfAborted(context.signal);
      return options.model.interpret(request, history, context.signal);
    },

    async verbalize(request, context) {
      const thread = threadIdentity(options.sessionId, "conversation", request.speaker);
      const history = await recallVisibleLines(memory, thread);
      throwIfAborted(context.signal);
      const response = (await options.model.verbalize(request, history, context.signal)).trim();
      throwIfAborted(context.signal);
      if (!response) throw new Error("Dialogue model returned an empty Character Line.");
      await persistVisibleExchange({
        memory,
        resourceId,
        thread,
        mode: "conversation",
        character: request.speaker,
        playerLine: request.playerInput,
        characterLine: response,
        context,
      });
      return response;
    },

    async reflect(request, context) {
      const thread = threadIdentity(options.sessionId, "reflection", request.character);
      const history = await recallVisibleLines(memory, thread);
      throwIfAborted(context.signal);
      const response = await options.model.reflect(request, history, context.signal);
      throwIfAborted(context.signal);
      if (!response.summary.trim()) throw new Error("Dialogue model returned an empty Reflection.");
      await persistVisibleExchange({
        memory,
        resourceId,
        thread,
        mode: "reflection",
        character: request.character,
        playerLine: request.playerInput,
        characterLine: formatReflection(response),
        context,
      });
      return response;
    },

    async reset() {
      const { threads } = await memory.listThreads({
        filter: { resourceId },
        perPage: false,
      });
      await Promise.all(threads.map(({ id }) => memory.deleteThread(id)));
    },

    close() {
      return storage.close();
    },
  };
}

async function recallVisibleLines(
  memory: Memory,
  threadId: string,
): Promise<readonly VisibleDialogueLine[]> {
  const thread = await memory.getThreadById({ threadId });
  if (!thread) return [];
  const { messages } = await memory.recall({ threadId, perPage: false });
  return messages.flatMap((message) => {
    if (message.role !== "user" && message.role !== "assistant") return [];
    const text = message.content.parts
      .filter((part): part is Extract<typeof part, { readonly type: "text" }> =>
        part.type === "text"
      )
      .map((part) => part.text)
      .join("")
      .trim();
    if (!text) return [];
    return [{ role: message.role === "user" ? "player" : "character", text } as const];
  });
}

async function persistVisibleExchange(options: {
  readonly memory: Memory;
  readonly resourceId: string;
  readonly thread: string;
  readonly mode: "conversation" | "reflection";
  readonly character: string;
  readonly playerLine: string;
  readonly characterLine: string;
  readonly context: DialogueTurnContext;
}): Promise<void> {
  const existingThread = await options.memory.getThreadById({ threadId: options.thread });
  if (!existingThread) {
    await options.memory.createThread({
      threadId: options.thread,
      resourceId: options.resourceId,
      title: `${options.mode}:${options.character}`,
      metadata: { mode: options.mode, character: options.character },
    });
  }

  const exchangeStartedAt = Date.now();
  const playerMessage = visibleMessage({
    role: "user",
    text: options.playerLine,
    threadId: options.thread,
    resourceId: options.resourceId,
    createdAt: new Date(exchangeStartedAt),
  });
  const characterMessage = visibleMessage({
    role: "assistant",
    text: options.characterLine,
    threadId: options.thread,
    resourceId: options.resourceId,
    createdAt: new Date(exchangeStartedAt + 1),
  });
  const messageIds = [playerMessage.id, characterMessage.id];

  try {
    throwIfAborted(options.context.signal);
    await options.memory.saveMessages({ messages: [playerMessage, characterMessage] });
    if (options.context.signal.aborted) {
      await options.memory.deleteMessages(messageIds);
      throw options.context.signal.reason;
    }
  } catch (cause) {
    await options.memory.deleteMessages(messageIds).catch(() => undefined);
    if (!existingThread) {
      const { messages } = await options.memory.recall({
        threadId: options.thread,
        perPage: false,
      }).catch(() => ({ messages: [] }));
      if (messages.length === 0) {
        await options.memory.deleteThread(options.thread).catch(() => undefined);
      }
    }
    throw cause;
  }
}

function visibleMessage(options: {
  readonly role: "user" | "assistant";
  readonly text: string;
  readonly threadId: string;
  readonly resourceId: string;
  readonly createdAt: Date;
}): MastraDBMessage {
  return {
    id: randomUUID(),
    role: options.role,
    createdAt: options.createdAt,
    threadId: options.threadId,
    resourceId: options.resourceId,
    content: {
      format: 2,
      parts: [{ type: "text", text: options.text }],
    },
  };
}

function threadIdentity(
  sessionId: string,
  mode: "conversation" | "reflection",
  character: string,
): string {
  return `fondale-${mode}-${digest(`${sessionId}\0${character}`)}`;
}

function digest(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 32);
}

function throwIfAborted(signal: AbortSignal): void {
  if (signal.aborted) throw signal.reason ?? new DOMException("Aborted", "AbortError");
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

function formatReflection(response: ReflectionResponse): string {
  return [
    response.summary,
    ...(response.hypotheses?.map((hypothesis) => `Perhaps ${hypothesis}`) ?? []),
    ...(response.suggestions ?? []),
  ].join(" ");
}
