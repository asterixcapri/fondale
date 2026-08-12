import assert from "node:assert/strict";
import { test } from "node:test";

import { readAdapterConfiguration } from "./configuration";

test("the adapter listens locally on its documented defaults", () => {
  assert.deepEqual(
    readAdapterConfiguration({ DATABASE_URL: "postgresql://fondale@127.0.0.1:54329/dialogue" }),
    {
      databaseUrl: "postgresql://fondale@127.0.0.1:54329/dialogue",
      host: "127.0.0.1",
      port: 4315,
    },
  );
});

test("the environment can move the adapter to another local address", () => {
  assert.deepEqual(
    readAdapterConfiguration({
      DATABASE_URL: "postgresql://fondale@127.0.0.1:54329/dialogue",
      DIALOGUE_ADAPTER_HOST: "0.0.0.0",
      DIALOGUE_ADAPTER_PORT: "4400",
    }),
    {
      databaseUrl: "postgresql://fondale@127.0.0.1:54329/dialogue",
      host: "0.0.0.0",
      port: 4400,
    },
  );
});

test("missing or unusable configuration is refused before the server starts", () => {
  assert.throws(() => readAdapterConfiguration({}), /DATABASE_URL/);
  assert.throws(
    () => readAdapterConfiguration({ DATABASE_URL: "postgresql://x", DIALOGUE_ADAPTER_PORT: "0" }),
    /DIALOGUE_ADAPTER_PORT/,
  );
});
