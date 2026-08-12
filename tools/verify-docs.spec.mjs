import { test } from "node:test";
import assert from "node:assert/strict";
import { findObsoleteAuthoringContract } from "./obsolete-authoring-contract.mjs";

test("rejects removed builder instructions without requiring a call", () => {
  assert.match(
    String(findObsoleteAuthoringContract("Use `defineGame` to author the project.")),
    /define/,
  );
});

test("rejects legacy Save pre-validation instructions in recipe text", () => {
  assert.match(
    String(findObsoleteAuthoringContract("// Call validateSaveSnapshot before startGame.")),
    /validateSaveSnapshot/,
  );
});

test("accepts the declarative startGame authoring contract", () => {
  assert.equal(
    findObsoleteAuthoringContract("Pass an ordinary GameProject object directly to startGame."),
    undefined,
  );
});
