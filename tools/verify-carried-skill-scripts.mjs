// `npx skills` installs one skill directory and nothing else, so a script more
// than one fabrication skill needs is kept once in `skills/shared/scripts/` and
// carried into each skill that ships it. This is the check that the carried
// copies are still the one source, byte for byte.
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const shared = "skills/shared/scripts";

export function findCarriedSkillScriptDrift(root) {
  const sources = readdirSync(resolve(root, shared)).filter((name) => !name.endsWith(".spec.mjs"));
  const drifted = [];
  for (const skill of readdirSync(resolve(root, "skills")).sort()) {
    for (const name of sources) {
      const carried = `skills/${skill}/scripts/${name}`;
      if (skill === "shared" || !existsSync(resolve(root, carried))) continue;
      if (!readFileSync(resolve(root, carried)).equals(readFileSync(resolve(root, shared, name)))) {
        drifted.push(carried);
      }
    }
  }
  return drifted;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const drifted = findCarriedSkillScriptDrift(".");
  if (drifted.length > 0) {
    console.error(`Carried skill scripts differ from ${shared}: ${drifted.join(", ")}.`);
    console.error(`Edit the shared source and copy it back into each skill that carries it.`);
    process.exitCode = 1;
  } else {
    console.log("Carried skill scripts verified.");
  }
}
