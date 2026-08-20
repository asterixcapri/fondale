import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { findCarriedSkillScriptDrift } from "./verify-carried-skill-scripts.mjs";

function skills(carried) {
  const root = mkdtempSync(join(tmpdir(), "carried-skill-scripts-"));
  mkdirSync(join(root, "skills/shared/scripts"), { recursive: true });
  writeFileSync(join(root, "skills/shared/scripts/normalise-runtime-asset.mjs"), "the one source\n");
  writeFileSync(join(root, "skills/shared/scripts/normalise-runtime-asset.spec.mjs"), "the tests\n");
  for (const [path, content] of Object.entries(carried)) {
    mkdirSync(join(root, "skills", path, "scripts"), { recursive: true });
    for (const [name, text] of Object.entries(content)) {
      writeFileSync(join(root, "skills", path, "scripts", name), text);
    }
  }
  return root;
}

test("accepts a skill carrying the shared script unchanged", () => {
  const root = skills({ "define-character": { "normalise-runtime-asset.mjs": "the one source\n" } });
  assert.deepEqual(findCarriedSkillScriptDrift(root), []);
});

test("reports a carried copy that has drifted from the shared source", () => {
  const root = skills({ "define-character": { "normalise-runtime-asset.mjs": "a hand edit\n" } });
  assert.deepEqual(findCarriedSkillScriptDrift(root), [
    "skills/define-character/scripts/normalise-runtime-asset.mjs",
  ]);
});

test("ignores a script a skill owns alone", () => {
  const root = skills({ "define-character": { "audit-walk-strip.py": "not shared\n" } });
  assert.deepEqual(findCarriedSkillScriptDrift(root), []);
});

test("ignores a skill that carries no script at all", () => {
  assert.deepEqual(findCarriedSkillScriptDrift(skills({})), []);
});

test("reports every drifted copy across every skill", () => {
  const root = skills({
    "define-character": { "normalise-runtime-asset.mjs": "a hand edit\n" },
    "define-scene": { "normalise-runtime-asset.mjs": "another hand edit\n" },
    "define-object": { "normalise-runtime-asset.mjs": "the one source\n" },
  });
  assert.deepEqual(findCarriedSkillScriptDrift(root), [
    "skills/define-character/scripts/normalise-runtime-asset.mjs",
    "skills/define-scene/scripts/normalise-runtime-asset.mjs",
  ]);
});
