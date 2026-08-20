// The fabrication skills' SKILL.md files are rendered from one source, so a
// hand edit to one of them is a change that the next generation silently throws
// away. This is the check that every generated file on disk is still what its
// source generates.
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { generatedSkillDocuments } from "./generate-skill-documents.mjs";

export function findGeneratedSkillDocumentDrift(root) {
  const drifted = [];
  for (const [path, contents] of generatedSkillDocuments(root)) {
    const onDisk = resolve(root, path);
    if (!existsSync(onDisk) || readFileSync(onDisk, "utf8") !== contents) drifted.push(path);
  }
  return drifted;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const drifted = findGeneratedSkillDocumentDrift(".");
  if (drifted.length > 0) {
    console.error(`Generated skill documents differ from their source: ${drifted.join(", ")}.`);
    console.error(`Edit skills/shared/ and run \`npm run generate:skill-documents\`.`);
    process.exitCode = 1;
  } else {
    console.log("Generated skill documents verified.");
  }
}
