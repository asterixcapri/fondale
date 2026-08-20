import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { generatedSkillDocuments } from "./generate-skill-documents.mjs";
import { findGeneratedSkillDocumentDrift } from "./verify-generated-skill-documents.mjs";

const frontmatter = ["---", "name: define-thing", "description: A thing.", "---", ""].join("\n");

function skill(contents) {
  const root = mkdtempSync(join(tmpdir(), "generated-skill-documents-"));
  mkdirSync(join(root, "skills/shared/sources"), { recursive: true });
  writeFileSync(join(root, "skills/shared/fabrication-cycle.md"), "### Anchor\n\nThe target.\n");
  writeFileSync(
    join(root, "skills/shared/sources/define-thing.md"),
    frontmatter + "## Workflow\n\n### Take stock\n\nRead.\n\n{{ fabrication-cycle }}\n",
  );
  writeFileSync(join(root, "skills/shared/sources/define-thing.values.md"), "");
  if (contents !== undefined) {
    mkdirSync(join(root, "skills/define-thing"), { recursive: true });
    writeFileSync(join(root, "skills/define-thing/SKILL.md"), contents);
  }
  return root;
}

test("accepts a SKILL.md that is what its source generates", () => {
  const root = skill("");
  const generated = generatedSkillDocuments(root);
  writeFileSync(join(root, "skills/define-thing/SKILL.md"), generated.get("skills/define-thing/SKILL.md"));
  assert.deepEqual(findGeneratedSkillDocumentDrift(root), []);
});

test("reports a SKILL.md that no longer matches its source", () => {
  assert.deepEqual(findGeneratedSkillDocumentDrift(skill("a hand edit\n")), ["skills/define-thing/SKILL.md"]);
});

test("reports a SKILL.md the source generates but nobody wrote", () => {
  assert.deepEqual(findGeneratedSkillDocumentDrift(skill()), ["skills/define-thing/SKILL.md"]);
});
