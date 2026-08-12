import { DeterministicDialogueModel } from "./dialogue-model";
import { createDialogueAdapterServer } from "./http-server";
import { createPostgresDialogueProvider } from "./postgres-dialogue-provider";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required.");

const host = process.env.DIALOGUE_ADAPTER_HOST ?? "127.0.0.1";
const configuredPort = Number(process.env.DIALOGUE_ADAPTER_PORT ?? "4315");
if (!Number.isInteger(configuredPort) || configuredPort < 1 || configuredPort > 65_535) {
  throw new Error("DIALOGUE_ADAPTER_PORT must be an integer between 1 and 65535.");
}

const model = new DeterministicDialogueModel({ interpretations: {} });
const server = await createDialogueAdapterServer({
  host,
  port: configuredPort,
  createProvider(sessionId) {
    return createPostgresDialogueProvider({ databaseUrl, sessionId, model });
  },
});

console.log(`Fondale local Dialogue Provider listening at ${server.url}`);

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    void server.close().finally(() => process.exit(0));
  });
}
