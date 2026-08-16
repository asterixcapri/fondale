import { createHash, randomUUID } from "node:crypto";

import type { MastraDBMessage } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { PostgresStore, type PoolClient, type TxClient } from "@mastra/pg";
import type {
  DialogueProvider,
  DialogueTurnContext,
  ReflectionResponse,
} from "@asterixcapri/fondale";

import { throwIfAborted } from "./cancellation.js";
import type { DialogueModel, VisibleDialogueLine } from "./dialogue-model.js";

type DialogueProviderOperation = "interpret" | "verbalize" | "reflect";

interface PendingVisibleExchange {
  readonly messages: readonly [MastraDBMessage, MastraDBMessage];
  discardEmptyThread(): Promise<void>;
}

interface PendingProviderOperation<T> {
  readonly value: T;
  readonly exchange?: PendingVisibleExchange;
}

const operationsTable = "fondale_dialogue_operations";
const messagesTable = "mastra_messages";
const threadsTable = "mastra_threads";

export interface AdapterDialogueProvider extends DialogueProvider {
  close(): Promise<void>;
}

/** Durable Mastra resource that owns every conversational thread of one Game Session. */
export function dialogueResourceId(sessionId: string): string {
  return `fondale-dialogue-session:${sessionId}`;
}

/** Proves the configured provider storage is ready before the HTTP port opens. */
export async function verifyDialogueStorage(databaseUrl: string): Promise<void> {
  const storage = new PostgresStore({
    id: `fondale-dialogue-startup-${randomUUID()}`,
    connectionString: databaseUrl,
  });
  try {
    await storage.init();
  } catch (cause) {
    throw new Error(
      "Dialogue Server could not connect to PostgreSQL. Check DATABASE_URL and start PostgreSQL separately with `docker compose up -d`.",
      { cause },
    );
  } finally {
    await storage.close().catch(() => undefined);
  }
}

/** Opens one request-scoped view of a Game Session's PostgreSQL-backed memory. */
export async function createDialogueProvider(options: {
  readonly databaseUrl: string;
  readonly sessionId: string;
  readonly model: DialogueModel;
}): Promise<AdapterDialogueProvider> {
  if (!options.databaseUrl.trim()) throw new Error("DATABASE_URL must not be empty.");
  if (!options.sessionId.trim()) throw new Error("Game Session identity must not be empty.");

  const storage = new PostgresStore({
    id: `fondale-dialogue-${digest(options.sessionId)}`,
    connectionString: options.databaseUrl,
  });
  await storage.init();
  await ensureOperationsTable(storage);
  const memory = new Memory({
    storage,
    options: { lastMessages: 100 },
  });
  const resourceId = dialogueResourceId(options.sessionId);
  const activeOperations = new Set<Promise<unknown>>();
  let lifecycleController = new AbortController();
  let resetQueue = Promise.resolve();

  async function runProviderOperation<T>(
    operationName: DialogueProviderOperation,
    context: DialogueTurnContext,
    execute: (context: DialogueTurnContext) => Promise<PendingProviderOperation<T>>,
  ): Promise<T> {
    await resetQueue;
    const signal = AbortSignal.any([context.signal, lifecycleController.signal]);
    const operationPromise = executeIdempotently({
      storage,
      sessionId: options.sessionId,
      operation: operationName,
      context: { turnId: context.turnId, signal },
      execute,
    });
    activeOperations.add(operationPromise);
    try {
      return await operationPromise;
    } finally {
      activeOperations.delete(operationPromise);
    }
  }

  async function resetMemory(): Promise<void> {
    lifecycleController.abort(new DOMException("Dialogue Provider memory was reset.", "AbortError"));
    lifecycleController = new AbortController();
    await Promise.allSettled([...activeOperations]);
    await withSessionLock(storage, options.sessionId, "exclusive", async () => {
      const { threads } = await memory.listThreads({
        filter: { resourceId },
        perPage: false,
      });
      await Promise.all(threads.map(({ id }) => memory.deleteThread(id)));
      await storage.db.none(
        `DELETE FROM ${operationsTable} WHERE session_id = $1`,
        [options.sessionId],
      );
    });
  }

  return {
    interpret(request, context) {
      return runProviderOperation("interpret", context, async (turnContext) => {
        const history = await recallVisibleLines(
          memory,
          threadIdentity(options.sessionId, "conversation", request.speaker),
        );
        throwIfAborted(turnContext.signal);
        return {
          value: await options.model.interpret(request, history, turnContext.signal),
        };
      });
    },

    verbalize(request, context) {
      return runProviderOperation("verbalize", context, async (turnContext) => {
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
        const exchange = await prepareVisibleExchange({
          memory,
          resourceId,
          thread,
          mode: "conversation",
          character: request.speaker,
          playerLine: request.playerInput,
          characterLine: response,
          operation: "verbalize",
          context: turnContext,
        });
        return { value: response, exchange };
      });
    },

    reflect(request, context) {
      return runProviderOperation("reflect", context, async (turnContext) => {
        const thread = threadIdentity(options.sessionId, "reflection", request.character);
        const history = await recallVisibleLines(memory, thread);
        throwIfAborted(turnContext.signal);
        const response = await options.model.reflect(request, history, turnContext.signal);
        throwIfAborted(turnContext.signal);
        if (!response.summary.trim()) throw new Error("Dialogue model returned an empty Reflection.");
        const exchange = await prepareVisibleExchange({
          memory,
          resourceId,
          thread,
          mode: "reflection",
          character: request.character,
          playerLine: request.playerInput,
          characterLine: formatReflection(response),
          operation: "reflect",
          context: turnContext,
        });
        return { value: response, exchange };
      });
    },

    reset() {
      resetQueue = resetQueue.then(resetMemory, resetMemory);
      return resetQueue;
    },

    async close() {
      lifecycleController.abort(new DOMException("Dialogue Provider closed.", "AbortError"));
      await Promise.allSettled([...activeOperations]);
      await storage.close();
    },
  };
}

async function ensureOperationsTable(storage: PostgresStore): Promise<void> {
  await storage.db.none(`
    CREATE TABLE IF NOT EXISTS ${operationsTable} (
      session_id text NOT NULL,
      turn_id text NOT NULL,
      operation text NOT NULL CHECK (operation IN ('interpret', 'verbalize', 'reflect')),
      result jsonb NOT NULL,
      completed_at timestamptz NOT NULL DEFAULT now(),
      PRIMARY KEY (session_id, turn_id, operation)
    )
  `);
}

async function executeIdempotently<T>(options: {
  readonly storage: PostgresStore;
  readonly sessionId: string;
  readonly operation: DialogueProviderOperation;
  readonly context: DialogueTurnContext;
  readonly execute: (
    context: DialogueTurnContext,
  ) => Promise<PendingProviderOperation<T>>;
}): Promise<T> {
  return withSessionLock(options.storage, options.sessionId, "shared", async (client) => {
    const operationIdentity = JSON.stringify([
      options.sessionId,
      options.context.turnId,
      options.operation,
    ]);
    await client.query(
      "SELECT pg_advisory_lock(hashtextextended($1, 0))",
      [`fondale-dialogue-operation:${operationIdentity}`],
    );
    try {
      throwIfAborted(options.context.signal);
      const completed = await options.storage.db.oneOrNone<{ readonly result: T }>(`
        SELECT result
        FROM ${operationsTable}
        WHERE session_id = $1 AND turn_id = $2 AND operation = $3
      `, [options.sessionId, options.context.turnId, options.operation]);
      if (completed) return completed.result;

      const pending = await options.execute(options.context);
      try {
        throwIfAborted(options.context.signal);
        await options.storage.db.tx(async (transaction) => {
          if (pending.exchange) {
            await saveVisibleMessages(transaction, pending.exchange.messages);
          }
          await transaction.none(`
            INSERT INTO ${operationsTable} (session_id, turn_id, operation, result)
            VALUES ($1, $2, $3, $4::jsonb)
          `, [
            options.sessionId,
            options.context.turnId,
            options.operation,
            JSON.stringify(pending.value),
          ]);
        });
        return pending.value;
      } catch (cause) {
        await pending.exchange?.discardEmptyThread();
        throw cause;
      }
    } finally {
      await client.query(
        "SELECT pg_advisory_unlock(hashtextextended($1, 0))",
        [`fondale-dialogue-operation:${operationIdentity}`],
      );
    }
  });
}

async function saveVisibleMessages(
  transaction: TxClient,
  messages: readonly [MastraDBMessage, MastraDBMessage],
): Promise<void> {
  for (const message of messages) {
    const createdAt = message.createdAt ?? new Date();
    await transaction.none(`
      INSERT INTO ${messagesTable}
        (id, thread_id, content, "createdAt", "createdAtZ", role, type, "resourceId")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE SET
        thread_id = EXCLUDED.thread_id,
        content = EXCLUDED.content,
        role = EXCLUDED.role,
        type = EXCLUDED.type,
        "resourceId" = EXCLUDED."resourceId"
    `, [
      message.id,
      message.threadId,
      typeof message.content === "string" ? message.content : JSON.stringify(message.content),
      createdAt,
      createdAt,
      message.role,
      message.type ?? "v2",
      message.resourceId,
    ]);
  }
  const updatedAt = new Date();
  await transaction.none(`
    UPDATE ${threadsTable}
    SET "updatedAt" = $1, "updatedAtZ" = $2
    WHERE id = $3
  `, [updatedAt, updatedAt, messages[0].threadId]);
}

async function withSessionLock<T>(
  storage: PostgresStore,
  sessionId: string,
  mode: "shared" | "exclusive",
  execute: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await storage.pool.connect();
  const lockFunction = mode === "shared" ? "pg_advisory_lock_shared" : "pg_advisory_lock";
  const unlockFunction = mode === "shared" ? "pg_advisory_unlock_shared" : "pg_advisory_unlock";
  const identity = `fondale-dialogue-session:${sessionId}`;
  try {
    await client.query(`SELECT ${lockFunction}(hashtextextended($1, 0))`, [identity]);
    try {
      return await execute(client);
    } finally {
      await client.query(`SELECT ${unlockFunction}(hashtextextended($1, 0))`, [identity]);
    }
  } finally {
    client.release();
  }
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

async function prepareVisibleExchange(options: {
  readonly memory: Memory;
  readonly resourceId: string;
  readonly thread: string;
  readonly mode: "conversation" | "reflection";
  readonly character: string;
  readonly playerLine: string;
  readonly characterLine: string;
  readonly operation: "verbalize" | "reflect";
  readonly context: DialogueTurnContext;
}): Promise<PendingVisibleExchange> {
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
    id: visibleMessageId(options.thread, options.context.turnId, options.operation, "player"),
    role: "user",
    text: options.playerLine,
    threadId: options.thread,
    resourceId: options.resourceId,
    createdAt: new Date(exchangeStartedAt),
  });
  const characterMessage = visibleMessage({
    id: visibleMessageId(options.thread, options.context.turnId, options.operation, "character"),
    role: "assistant",
    text: options.characterLine,
    threadId: options.thread,
    resourceId: options.resourceId,
    createdAt: new Date(exchangeStartedAt + 1),
  });
  return {
    messages: [playerMessage, characterMessage],
    async discardEmptyThread() {
      if (existingThread) return;
      const { messages } = await options.memory.recall({
        threadId: options.thread,
        perPage: false,
      }).catch(() => ({ messages: [] }));
      if (messages.length === 0) {
        await options.memory.deleteThread(options.thread).catch(() => undefined);
      }
    },
  };
}

function visibleMessage(options: {
  readonly id: string;
  readonly role: "user" | "assistant";
  readonly text: string;
  readonly threadId: string;
  readonly resourceId: string;
  readonly createdAt: Date;
}): MastraDBMessage {
  return {
    id: options.id,
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

function visibleMessageId(
  thread: string,
  turnId: string,
  operation: "verbalize" | "reflect",
  role: "player" | "character",
): string {
  return `fondale-${digest(`${thread}\0${turnId}\0${operation}\0${role}`)}`;
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
