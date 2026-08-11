import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const architecturePath = "docs/engine-architecture.html";
const requiredTerms = [
  "Game Project", "CoreSession", "Game State", "Interaction", "World", "Sequence",
  "Animation", "Camera", "HUD", "Save", "restore", "localStorage", "Direction Step",
];
const requiredRoutes = [
  "Browser adapter → Game Session",
  "Game Session → Interaction / World / Sequence",
  "Sequence → Animation / World / Camera",
  "Capability → browser adapter",
  "Game Session ↔ Save",
  "Game Project ↔ capability validators",
];

export function verifyArchitectureDocument(html) {
  for (const term of requiredTerms) {
    if (!html.includes(term)) {
      throw new Error(`${architecturePath}: missing architecture term '${term}'.`);
    }
  }
  for (const route of requiredRoutes) {
    if (!html.includes(route)) {
      throw new Error(`${architecturePath}: missing allowed communication route '${route}'.`);
    }
  }
  if (/<(?:script|link|img|iframe)\b/i.test(html) ||
      /(?:src|href)=["'](?:https?:)?\/\//i.test(html) ||
      /url\(\s*["']?(?:https?:)?\/\//i.test(html)) {
    throw new Error(`${architecturePath}: architecture document must not load remote or embedded resources.`);
  }
  if (!/<html lang="it">/.test(html) || !/@media \(max-width: 780px\)/.test(html)) {
    throw new Error(`${architecturePath}: missing Italian-language or responsive-document contract.`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  verifyArchitectureDocument(readFileSync(architecturePath, "utf8"));
  console.log("Offline Engine architecture document verified.");
}
