import type { DialogueModel } from "./dialogue-model.js";
import {
  createDialogueProvider,
  verifyDialogueStorage,
} from "./dialogue-provider.js";
import {
  createDialogueAdapterServer,
  type DialogueAdapterServer,
} from "./http-server.js";

/** The running Node.js server that exposes Fondale's Dialogue Provider seam. */
export type DialogueServer = DialogueAdapterServer;

/** Everything one deployment supplies to the deep Dialogue Server module. */
export interface DialogueServerOptions {
  readonly databaseUrl: string;
  readonly host: string;
  readonly port: number;
  readonly model: DialogueModel;
  readonly allowedOrigins?: readonly string[];
}

/** Starts one reusable server whose internal providers are isolated by Game Session. */
export async function createDialogueServer(
  options: DialogueServerOptions,
): Promise<DialogueServer> {
  await verifyDialogueStorage(options.databaseUrl);
  return createDialogueAdapterServer({
    host: options.host,
    port: options.port,
    ...(options.allowedOrigins ? { allowedOrigins: options.allowedOrigins } : {}),
    createProvider(sessionId) {
      return createDialogueProvider({
        databaseUrl: options.databaseUrl,
        sessionId,
        model: options.model,
      });
    },
  });
}
