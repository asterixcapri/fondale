import assert from "node:assert/strict";
import { test } from "node:test";

import type { DialogueModel } from "./dialogue-model.js";
import { createDialogueServer } from "./server.js";

const unusedModel: DialogueModel = {
  interpret: () => Promise.reject(new Error("unused")),
  verbalize: () => Promise.reject(new Error("unused")),
  reflect: () => Promise.reject(new Error("unused")),
};

test("the Dialogue Server refuses to listen when PostgreSQL is unavailable", async () => {
  await assert.rejects(
    async () => {
      const unexpectedlyStartedServer = await createDialogueServer({
        databaseUrl: "postgresql://fondale:fondale@127.0.0.1:1/fondale_dialogue",
        host: "127.0.0.1",
        port: 0,
        model: unusedModel,
      });
      await unexpectedlyStartedServer.close();
      throw new Error("The Dialogue Server listened without PostgreSQL.");
    },
    /Dialogue Server could not connect to PostgreSQL/,
  );
});
