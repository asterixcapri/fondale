import assert from "node:assert/strict";
import { test } from "node:test";

import { HttpDialogueProvider } from "@asterixcapri/fondale";

import type { DialogueModel } from "./dialogue-model.js";
import { createDialogueServer } from "./server.js";

const databaseUrl = process.env.DIALOGUE_ADAPTER_TEST_DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DIALOGUE_ADAPTER_TEST_DATABASE_URL is required for server integration verification.");
}

test("the public Dialogue Server interface serves one complete remote turn", async () => {
  const model: DialogueModel = {
    interpret(request) {
      const factId = request.candidates[0]?.id;
      return Promise.resolve(factId
        ? { factId }
        : { factId: null, reason: "no-relevant-fact" });
    },
    verbalize(request) {
      return Promise.resolve(request.fact?.proposition ?? request.strategy);
    },
    reflect(request) {
      return Promise.resolve({
        summary: request.facts.map(({ proposition }) => proposition).join(" "),
      });
    },
  };
  const server = await createDialogueServer({
    databaseUrl,
    host: "127.0.0.1",
    port: 0,
    model,
  });
  const provider = new HttpDialogueProvider({
    endpoint: server.url,
    sessionId: crypto.randomUUID(),
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
    }, context), "The lantern is below the harbour stairs.");
    await provider.reset();
  } finally {
    await server.close();
  }
});
