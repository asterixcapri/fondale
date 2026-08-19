import { test } from "node:test";
import assert from "node:assert/strict";
import { verifyReleasePreparation } from "./verify-release-preparation.mjs";

const valid = {
  readme: "Fondale 0.4 docs/engine-architecture.html",
  packageVersion: "0.4.0",
};

test("accepts the coherent 0.4 release handoff", () => {
  assert.doesNotThrow(() => verifyReleasePreparation(valid));
});

test("rejects a README without the architecture handoff", () => {
  assert.throws(
    () => verifyReleasePreparation({ ...valid, readme: "Fondale 0.4" }),
    /missing release documentation link 'docs\/engine-architecture\.html'/,
  );
});

test("rejects mismatched package metadata", () => {
  assert.throws(
    () => verifyReleasePreparation({ ...valid, packageVersion: "0.3.0" }),
    /must identify Fondale 0\.4\.0/,
  );
});
