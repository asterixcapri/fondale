import { test } from "node:test";
import assert from "node:assert/strict";
import { verifyArchitectureDocument } from "./verify-architecture-doc.mjs";

const routes = [
  "Browser adapter → Game Session",
  "Game Session → Interaction / World / Sequence",
  "Sequence → Animation / World / Camera",
  "Capability → browser adapter",
  "Game Session ↔ Save",
  "Game Project ↔ capability validators",
];
const terms = [
  "Game Project", "CoreSession", "Game State", "Interaction", "World", "Sequence",
  "Animation", "Camera", "HUD", "Save", "restore", "localStorage", "Direction Step",
];
const valid = `<html lang="it"><style>@media (max-width: 780px) {}</style>${terms.join(" ")} ${routes.join(" ")}</html>`;

test("accepts the complete offline architecture document", () => {
  assert.doesNotThrow(() => verifyArchitectureDocument(valid));
});

test("requires every allowed communication path", () => {
  for (const route of routes) {
    assert.throws(
      () => verifyArchitectureDocument(valid.replace(route, "")),
      new RegExp(`missing allowed communication route '${escapeRegExp(route)}'`),
    );
  }
});

test("rejects an external resource from the offline document", () => {
  assert.throws(
    () => verifyArchitectureDocument(`${valid}<link href="https://example.com/font.css">`),
    /must not load remote or embedded resources/,
  );
});

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
