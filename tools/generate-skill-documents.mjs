#!/usr/bin/env node
// `npx skills` installs one skill directory and nothing else, so a fabrication
// skill cannot read prose out of another one and every installed SKILL.md has
// to be complete on its own. The fabrication cycle is therefore written once in
// `skills/shared/fabrication-cycle.md` and rendered into each skill's SKILL.md
// here, from the skill's own source document and its values.
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const sources = "skills/shared/sources";
const cyclePath = "skills/shared/fabrication-cycle.md";
// The marker names no path: an installed skill is one directory, and a pointer
// at a file the reader cannot open is worse than none.
const banner = "<!-- Generated. Hand edits are overwritten by the next generation. -->";

// The values document is Markdown a human reads and edits beside the prose it
// feeds, so a value is a `## key` section and its body is everything until the
// next one.
function parseValues(text) {
  const values = new Map();
  let key;
  let fenced = false;
  for (const line of text.split("\n")) {
    if (line.startsWith("```")) fenced = !fenced;
    const heading = fenced ? null : line.match(/^## (.+)$/);
    if (heading) {
      key = heading[1].trim();
      values.set(key, []);
    } else if (key !== undefined) {
      values.get(key).push(line);
    }
  }
  return new Map([...values].map(([name, lines]) => [name, lines.join("\n").trim()]));
}

// A substituted value lands mid-sentence, so the prose around it has to be
// rewrapped or the source's line breaks would show through as ragged ones.
// Only plain paragraphs are rewrapped: a table, a fenced command and a list all
// mean something by their line breaks.
const width = 80;

function wrap(paragraph) {
  const lines = [];
  for (const word of paragraph.split(/\s+/)) {
    const line = lines.at(-1);
    if (line === undefined || line.length + 1 + word.length > width) lines.push(word);
    else lines[lines.length - 1] = `${line} ${word}`;
  }
  return lines;
}

function rewrapProse(text) {
  const rewrapped = [];
  let paragraph = [];
  let fenced = false;
  const flush = () => {
    if (paragraph.length === 0) return;
    const prose = paragraph.every((line) => !/^([#|>\-*+\s]|\d+\.)/.test(line));
    rewrapped.push(...(prose ? wrap(paragraph.join(" ")) : paragraph));
    paragraph = [];
  };
  for (const line of text.split("\n")) {
    if (line.startsWith("```")) fenced = !fenced;
    else if (!fenced && line.trim() !== "") {
      paragraph.push(line);
      continue;
    }
    flush();
    rewrapped.push(line);
  }
  flush();
  return rewrapped.join("\n");
}

// Steps are numbered here rather than in the sources, because a skill decides
// how many steps of its own it puts before the shared cycle and neither source
// can know what the other contributes.
function numberSteps(text) {
  let inWorkflow = false;
  let fenced = false;
  let step = 0;
  return text
    .split("\n")
    .map((line) => {
      if (line.startsWith("```")) fenced = !fenced;
      if (fenced) return line;
      if (line.startsWith("## ")) inWorkflow = line === "## Workflow";
      if (!inWorkflow || !line.startsWith("### ")) return line;
      return `### ${(step += 1)}. ${line.slice("### ".length)}`;
    })
    .join("\n");
}

export function renderSkillDocument({ document, values, cycle }) {
  const substitutions = parseValues(values);
  const used = new Set();
  const rendered = document
    .replace(/^\{\{ fabrication-cycle \}\}$/m, () => cycle.trim())
    .replace(/\{\{ ([^}]+) \}\}/g, (_, name) => {
      const key = name.trim();
      if (!substitutions.has(key)) throw new Error(`No value for the placeholder {{ ${key} }}.`);
      used.add(key);
      return substitutions.get(key);
    });
  const unused = [...substitutions.keys()].filter((key) => !used.has(key));
  if (unused.length > 0) throw new Error(`Values nothing uses: ${unused.join(", ")}.`);
  const frontmatter = rendered.indexOf("\n---\n", 4) + "\n---\n".length;
  const body = rewrapProse(rendered.slice(frontmatter).replace(/^\n*/, "\n"));
  return numberSteps(`${rendered.slice(0, frontmatter)}\n${banner}\n${body}`);
}

export function generatedSkillDocuments(root) {
  const cycle = readFileSync(resolve(root, cyclePath), "utf8");
  const documents = new Map();
  for (const name of readdirSync(resolve(root, sources)).sort()) {
    if (!name.endsWith(".md") || name.endsWith(".values.md")) continue;
    const skill = name.slice(0, -".md".length);
    documents.set(
      `skills/${skill}/SKILL.md`,
      renderSkillDocument({
        document: readFileSync(resolve(root, sources, name), "utf8"),
        values: readFileSync(resolve(root, sources, `${skill}.values.md`), "utf8"),
        cycle,
      }),
    );
  }
  return documents;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  for (const [path, contents] of generatedSkillDocuments(".")) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, contents);
    console.log(`Generated ${path}.`);
  }
}
