import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { renderSkillDocument, generatedSkillDocuments } from "./generate-skill-documents.mjs";

const frontmatter = ["---", "name: define-thing", "description: A thing.", "---", ""].join("\n");

function render(document, values, { cycle = "### Anchor\n\nThe target.\n", snippets } = {}) {
  return renderSkillDocument({ document: frontmatter + document, values, cycle, snippets });
}

test("puts the shared cycle where the source marks it", () => {
  const rendered = render("## Workflow\n\n### Take stock\n\nRead.\n\n{{ fabrication-cycle }}\n", "");
  assert.match(rendered, /### 1\. Take stock\n\nRead\.\n\n### 2\. Anchor\n\nThe target\.\n/);
});

test("numbers the workflow steps in order and leaves other headings alone", () => {
  const rendered = render(
    "## Workflow\n\n### Take stock\n\nRead.\n\n### Grill\n\nAsk.\n\n## Handoff\n\n### Report\n\nSay.\n",
    "",
  );
  assert.match(rendered, /### 1\. Take stock/);
  assert.match(rendered, /### 2\. Grill/);
  assert.match(rendered, /\n### Report\n/);
});

test("substitutes a value from the values document", () => {
  const rendered = render("## Workflow\n\n### Take stock\n\nRead about {{ asset }}.\n", "## asset\n\nthe Scene\n");
  assert.match(rendered, /Read about the Scene\./);
});

test("substitutes a value that spans several paragraphs", () => {
  const rendered = render(
    "## Workflow\n\n### Take stock\n\n{{ target }}\n",
    "## target\n\nOne line.\n\nAnother line.\n",
  );
  assert.match(rendered, /\nOne line\.\n\nAnother line\.\n/);
});

test("substitutes into the shared cycle as well as into the source", () => {
  const rendered = render(
    "## Workflow\n\n{{ fabrication-cycle }}\n",
    "## art directory\n\n`art/scenes/`\n",
    { cycle: "### Generate\n\nWrite to {{ art directory }}.\n" },
  );
  assert.match(rendered, /Write to `art\/scenes\/`\./);
});

test("rewraps a paragraph a substitution made too wide", () => {
  const rendered = render(
    "## Workflow\n\n### Take stock\n\nRead {{ asset }} and finish.\n",
    "## asset\n\nthe very long name of a Scene nobody would ever give a Scene in a real game\n",
  );
  for (const line of rendered.split("\n")) assert.ok(line.length <= 80, line);
  assert.match(rendered, /Read the very long name of a Scene nobody would ever give a Scene in a real game\nand finish\./);
});

test("leaves code blocks, tables and lists as the source wrote them", () => {
  const wide = "`--input a/very/long/path/that/nobody/should/rewrap.png --target-height 240`";
  const rendered = render(
    `## Documents\n\n| Reads | ${wide} |\n\n\`\`\`sh\nmagick ${wide}\n\`\`\`\n\n- a list item that is quite long ${wide}\n\n## Workflow\n\n### Take stock\n\nRead.\n`,
    "",
  );
  assert.match(rendered, new RegExp(`\\| Reads \\| ${wide.replace(/[.\-/]/g, "\\$&")} \\|`));
  assert.match(rendered, new RegExp(`magick ${wide.replace(/[.\-/]/g, "\\$&")}`));
  assert.match(rendered, new RegExp(`- a list item that is quite long ${wide.replace(/[.\-/]/g, "\\$&")}`));
});

test("leaves a heading inside a fenced block unnumbered", () => {
  const rendered = render(
    "## Workflow\n\n### Take stock\n\n```markdown\n### Not a step\n```\n\n### Grill\n\nAsk.\n",
    "",
  );
  assert.match(rendered, /### 1\. Take stock/);
  assert.match(rendered, /\n### Not a step\n/);
  assert.match(rendered, /### 2\. Grill/);
});

test("reads no value out of a fenced block in the values document", () => {
  const rendered = render(
    "## Workflow\n\n### Take stock\n\n{{ target }}\n",
    "## target\n\nThe shape:\n\n```markdown\n## Scale\n\n| Key | Value |\n```\n",
  );
  assert.match(rendered, /```markdown\n## Scale\n\n\| Key \| Value \|\n```/);
});

test("marks the rendered document as generated, under the frontmatter", () => {
  const rendered = render("## Workflow\n\n### Take stock\n\nRead.\n", "");
  const lines = rendered.split("\n");
  assert.equal(lines[3], "---");
  assert.match(lines[5], /^<!-- Generated\. Hand edits are overwritten/);
});

test("refuses a placeholder no value defines", () => {
  assert.throws(
    () => render("## Workflow\n\n### Take stock\n\n{{ asset }}\n", ""),
    /asset/,
  );
});

test("refuses a value the document never uses", () => {
  assert.throws(
    () => render("## Workflow\n\n### Take stock\n\nRead.\n", "## asset\n\nthe Scene\n"),
    /asset/,
  );
});

test("generates one SKILL.md per source document", () => {
  const root = mkdtempSync(join(tmpdir(), "generate-skill-documents-"));
  mkdirSync(join(root, "skills/shared/sources"), { recursive: true });
  writeFileSync(join(root, "skills/shared/fabrication-cycle.md"), "### Anchor\n\nThe target.\n");
  writeFileSync(
    join(root, "skills/shared/sources/define-thing.md"),
    frontmatter + "## Workflow\n\n### Take stock\n\nRead {{ asset }}.\n\n{{ fabrication-cycle }}\n",
  );
  writeFileSync(join(root, "skills/shared/sources/define-thing.values.md"), "## asset\n\nthe Thing\n");

  const generated = generatedSkillDocuments(root);
  assert.deepEqual([...generated.keys()], ["skills/define-thing/SKILL.md"]);
  assert.match(generated.get("skills/define-thing/SKILL.md"), /Read the Thing\.\n\n### 2\. Anchor/);
});

test("puts a shared snippet where the source marks it", () => {
  const rendered = render(
    "## Documents\n\n{{ paths }}\n\n## Workflow\n\n### Take stock\n\nRead.\n",
    "",
    { snippets: new Map([["paths", "Paths are literal.\n"]]) },
  );
  assert.match(rendered, /\nPaths are literal\.\n/);
});

test("substitutes a value inside a shared snippet", () => {
  const rendered = render(
    "## Workflow\n\n### Take stock\n\n{{ paths }}\n",
    "## asset\n\nthe Scene\n",
    { snippets: new Map([["paths", "Paths are relative to {{ asset }}.\n"]]) },
  );
  assert.match(rendered, /Paths are relative to the Scene\./);
});

test("leaves a snippet this skill never marks out of the rendered document", () => {
  const rendered = render(
    "## Workflow\n\n### Take stock\n\nRead.\n",
    "",
    { snippets: new Map([["paths", "Paths are literal.\n"]]) },
  );
  assert.doesNotMatch(rendered, /Paths are literal\./);
});

test("refuses a snippet whose name this skill also defines as a value", () => {
  assert.throws(
    () => render(
      "## Workflow\n\n### Take stock\n\n{{ paths }}\n",
      "## paths\n\nthe Scene\n",
      { snippets: new Map([["paths", "Paths are literal.\n"]]) },
    ),
    /paths/,
  );
});

test("carries every shared snippet into the sources that mark it", () => {
  const root = mkdtempSync(join(tmpdir(), "generate-skill-documents-"));
  mkdirSync(join(root, "skills/shared/sources"), { recursive: true });
  mkdirSync(join(root, "skills/shared/snippets"), { recursive: true });
  writeFileSync(join(root, "skills/shared/fabrication-cycle.md"), "### Anchor\n\nThe target.\n");
  writeFileSync(join(root, "skills/shared/snippets/paths.md"), "Paths are literal.\n");
  writeFileSync(
    join(root, "skills/shared/sources/define-thing.md"),
    frontmatter + "## Documents\n\n{{ paths }}\n\n## Workflow\n\n### Take stock\n\nRead.\n",
  );
  writeFileSync(join(root, "skills/shared/sources/define-thing.values.md"), "");

  const generated = generatedSkillDocuments(root);
  assert.match(generated.get("skills/define-thing/SKILL.md"), /\nPaths are literal\.\n/);
});

test("refuses a shared snippet no source marks", () => {
  const root = mkdtempSync(join(tmpdir(), "generate-skill-documents-"));
  mkdirSync(join(root, "skills/shared/sources"), { recursive: true });
  mkdirSync(join(root, "skills/shared/snippets"), { recursive: true });
  writeFileSync(join(root, "skills/shared/fabrication-cycle.md"), "### Anchor\n\nThe target.\n");
  writeFileSync(join(root, "skills/shared/snippets/paths.md"), "Paths are literal.\n");
  writeFileSync(
    join(root, "skills/shared/sources/define-thing.md"),
    frontmatter + "## Workflow\n\n### Take stock\n\nRead.\n",
  );
  writeFileSync(join(root, "skills/shared/sources/define-thing.values.md"), "");

  assert.throws(() => generatedSkillDocuments(root), /paths/);
});
