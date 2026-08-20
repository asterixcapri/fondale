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

test("accepts any release series the package declares", () => {
  assert.doesNotThrow(() =>
    verifyReleasePreparation({
      readme: "Fondale 1.2 docs/engine-architecture.html",
      packageVersion: "1.2.3",
    }),
  );
});

test("rejects a README without the architecture handoff", () => {
  assert.throws(
    () => verifyReleasePreparation({ ...valid, readme: "Fondale 0.4" }),
    /missing release documentation link 'docs\/engine-architecture\.html'/,
  );
});

test("rejects a README naming a different series than the package", () => {
  assert.throws(
    () => verifyReleasePreparation({ ...valid, packageVersion: "0.5.0" }),
    /must identify Fondale 0\.5/,
  );
});

test("rejects a version the release series cannot be read from", () => {
  assert.throws(
    () => verifyReleasePreparation({ ...valid, packageVersion: "nightly" }),
    /'nightly' is not a version/,
  );
});
