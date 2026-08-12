import { createHash, randomUUID } from "node:crypto";

import type { MastraDBMessage } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { PostgresStore } from "@mastra/pg";
import type {
  DialogueProvider,
  DialogueTurnContext,
  ReflectionResponse,
} from "@asterixcapri/fondale";

import type { DialogueModel, VisibleDialogueLine } from "./dialogue-model";

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
  const activeTurns = new Set<Promise<unknown>>();
  let lifecycleController = new AbortController();
  let resetQueue = Promise.resolve();

  async function runTurn<T>(
    context: DialogueTurnContext,
    execute: (context: DialogueTurnContext) => Promise<T>,
  ): Promise<T> {
    await resetQueue;
    const signal = AbortSignal.any([context.signal, lifecycleController.signal]);
    const operation = execute({ turnId: context.turnId, signal });
    activeTurns.add(operation);
    try {
      return await operation;
    } finally {
      activeTurns.delete(operation);
    }
  }

  async function resetMemory(): Promise<void> {
    lifecycleController.abort(new DOMException("Dialogue Provider memory was reset.", "AbortError"));
    lifecycleController = new AbortController();
    await Promise.allSettled([...activeTurns]);
    const { threads } = await memory.listThreads({
      filter: { resourceId },
      perPage: false,
    });
    await Promise.all(threads.map(({ id }) => memory.deleteThread(id)));
  }

  return {
    interpret(request, context) {
      return runTurn(context, async (turnContext) => {
        const history = await recallVisibleLines(
          memory,
          threadIdentity(options.sessionId, "conversation", request.speaker),
        );
        throwIfAborted(turnContext.signal);
        return options.model.interpret(request, history, turnContext.signal);
      });
    },

    verbalize(request, context) {
      return runTurn(context, async (turnContext) => {
        const thread = threadIdentity(options.sessionId, "conversation", request.speaker);
        const history = await recallVisibleLines(memory, thread);
        throwIfAborted(turnContext.signal);
        const response = (await options.model.verbalize(
          request,
          history,
          turnContext.signal,
        )).trim();
        throwIfAborted(turnContext.signal);
        if (!response) throw new Error("Dialogue model returned an empty Character Line.");
        await persistVisibleExchange({
          memory,
          resourceId,
          thread,
          mode: "conversation",
          character: request.speaker,
          playerLine: request.playerInput,
          characterLine: response,
          context: turnContext,
        });
        return response;
      });
    },

    reflect(request, context) {
      return runTurn(context, async (turnContext) => {
        const thread = threadIdentity(options.sessionId, "reflection", request.character);
        const history = await recallVisibleLines(memory, thread);
        throwIfAborted(turnContext.signal);
        const response = await options.model.reflect(request, history, turnContext.signal);
        throwIfAborted(turnContext.signal);
        if (!response.summary.trim()) throw new Error("Dialogue model returned an empty Reflection.");
        await persistVisibleExchange({
          memory,
          resourceId,
          thread,
          mode: "reflection",
          character: request.character,
          playerLine: request.playerInput,
          characterLine: formatReflection(response),
          context: turnContext,
        });
        return response;
      });
    },

    reset() {
      resetQueue = resetQueue.then(resetMemory, resetMemory);
      return resetQueue;
    },

    async close() {
      lifecycleController.abort(new DOMException("Dialogue Provider closed.", "AbortError"));
      await Promise.allSettled([...activeTurns]);
      await storage.close();
    },
  };
}

async function recallVisibleLines(
  memory: Memory,
  threadId: string,
): Promise<readonly VisibleDialogueLine[]> {
  const thread = await memory.getThreadById({ threadId });
  if (!thread) return [];
  const { messages } = await memory.getContext({ threadId });
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

function formatReflection(response: ReflectionResponse): string {
  return [
    response.summary.trim(),
    ...(response.hypotheses?.map((hypothesis) =>
      `Uncertain hypothesis: ${hypothesis.trim()}`
    ) ?? []),
    ...(response.suggestions?.map((suggestion) =>
      `Possible investigation: ${suggestion.trim()}`
    ) ?? []),
  ].join(" ");
}
