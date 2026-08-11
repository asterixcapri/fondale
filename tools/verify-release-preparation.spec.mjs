import { test } from "node:test";
import assert from "node:assert/strict";
import { verifyReleasePreparation } from "./verify-release-preparation.mjs";

const valid = {
  readme: "Fondale 0.4 docs/engine-architecture.html docs/public/migration-0.4.md",
  migration: "DirectStep; 0.3 Save Snapshots; No compatibility alias or runtime shim is provided.",
  packageVersion: "0.4.0",
};

test("accepts the coherent 0.4 release handoff", () => {
  assert.doesNotThrow(() => verifyReleasePreparation(valid));
});

test("rejects an incomplete 0.4 migration handoff", () => {
  assert.throws(
    () => verifyReleasePreparation({ ...valid, migration: valid.migration.replace("0.3 Save Snapshots", "") }),
    /missing migration fact '0\.3 Save Snapshots'/,
  );
});

test("rejects mismatched package metadata", () => {
  assert.throws(
    () => verifyReleasePreparation({ ...valid, packageVersion: "0.3.0" }),
    /must identify Fondale 0\.4\.0/,
  );
});
