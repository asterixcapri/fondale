import { readAdapterConfiguration } from "./configuration";
import { createDialogueAdapterServer } from "./http-server";
import { selectDialogueModel } from "./model-selection";
import { createDialogueProvider } from "./dialogue-provider";

const { databaseUrl, host, port } = readAdapterConfiguration(process.env);

// Technical observations stay on the server console: latency, model and token
// cost never travel to the browser and never enter Game State.
const model = selectDialogueModel(process.env, (diagnostic) => {
  console.log(
    `dialogue ${diagnostic.phase} via ${diagnostic.modelId} in ${diagnostic.latencyMs}ms` +
      ` (in ${diagnostic.inputTokens ?? "?"} / out ${diagnostic.outputTokens ?? "?"} tokens` +
      `${diagnostic.cost === undefined ? "" : `, cost ${diagnostic.cost}`})`,
  );
});
const server = await createDialogueAdapterServer({
  host,
  port,
  createProvider(sessionId) {
    return createDialogueProvider({ databaseUrl, sessionId, model });
  },
});

console.log(`Fondale local Dialogue Provider listening at ${server.url}`);

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    void server.close().finally(() => process.exit(0));
  });
}
