import { readFileSync } from "node:fs";

const path = "docs/engine-architecture.html";
const html = readFileSync(path, "utf8");

for (const term of [
  "Game Project", "CoreSession", "Game State", "Interaction", "World", "Sequence",
  "Animation", "Camera", "HUD", "Save", "restore", "localStorage", "Direction Step",
]) {
  if (!html.includes(term)) throw new Error(`${path}: missing architecture term '${term}'.`);
}
if (/<(?:script|link|img|iframe)\b/i.test(html) || /(?:src|href)=["']https?:/i.test(html)) {
  throw new Error(`${path}: architecture document must not load remote or embedded resources.`);
}
if (!/<html lang="it">/.test(html) || !/@media \(max-width: 780px\)/.test(html)) {
  throw new Error(`${path}: missing Italian-language or responsive-document contract.`);
}

console.log("Offline Engine architecture document verified.");
