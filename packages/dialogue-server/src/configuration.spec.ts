import assert from "node:assert/strict";
import { test } from "node:test";

import { readDialogueServerConfiguration } from "./configuration.js";

test("the adapter listens locally on its documented defaults", () => {
  assert.deepEqual(
    readDialogueServerConfiguration({ DATABASE_URL: "postgresql://fondale@127.0.0.1:54329/dialogue" }),
    {
      databaseUrl: "postgresql://fondale@127.0.0.1:54329/dialogue",
      host: "127.0.0.1",
      port: 4315,
    },
  );
});

test("the environment can move the adapter to another local address", () => {
  assert.deepEqual(
    readDialogueServerConfiguration({
      DATABASE_URL: "postgresql://fondale@127.0.0.1:54329/dialogue",
      DIALOGUE_ADAPTER_HOST: "0.0.0.0",
      DIALOGUE_ADAPTER_PORT: "4400",
      DIALOGUE_ALLOWED_ORIGINS: "https://game.example, https://preview.example",
    }),
    {
      databaseUrl: "postgresql://fondale@127.0.0.1:54329/dialogue",
      host: "0.0.0.0",
      port: 4400,
      allowedOrigins: ["https://game.example", "https://preview.example"],
    },
  );
});

test("missing or unusable configuration is refused before the server starts", () => {
  assert.throws(() => readDialogueServerConfiguration({}), /DATABASE_URL/);
  assert.throws(
    () => readDialogueServerConfiguration({ DATABASE_URL: "postgresql://x", DIALOGUE_ADAPTER_PORT: "0" }),
    /DIALOGUE_ADAPTER_PORT/,
  );
  assert.throws(
    () => readDialogueServerConfiguration({
      DATABASE_URL: "postgresql://x",
      DIALOGUE_ALLOWED_ORIGINS: " , ",
    }),
    /DIALOGUE_ALLOWED_ORIGINS/,
  );
});
