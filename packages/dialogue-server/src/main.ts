#!/usr/bin/env node

import { readDialogueServerConfiguration } from "./configuration.js";
import { createLiveDialogueModelFromEnvironment } from "./live-dialogue-model.js";
import { createDialogueServer } from "./server.js";

const { databaseUrl, host, port, allowedOrigins } = readDialogueServerConfiguration(process.env);

// Technical observations stay on the server console: latency, model and token
// cost never travel to the browser and never enter Game State.
const model = createLiveDialogueModelFromEnvironment(process.env, (diagnostic) => {
  console.log(
    `dialogue ${diagnostic.phase} via ${diagnostic.modelId} in ${diagnostic.latencyMs}ms` +
      ` (in ${diagnostic.inputTokens ?? "?"} / out ${diagnostic.outputTokens ?? "?"} tokens` +
      `${diagnostic.cost === undefined ? "" : `, cost ${diagnostic.cost}`})`,
  );
});
const server = await createDialogueServer({
  databaseUrl,
  host,
  port,
  model,
  ...(allowedOrigins ? { allowedOrigins } : {}),
});

console.log(`Fondale Dialogue Server listening at ${server.url}`);

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    void server.close().finally(() => process.exit(0));
  });
}
