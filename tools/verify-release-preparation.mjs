import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const architecturePath = "docs/engine-architecture.html";

export function verifyReleasePreparation({ readme, packageVersion }) {
  const series = /^(\d+)\.(\d+)\.\d+/.exec(packageVersion);
  if (!series) throw new Error(`package.json: '${packageVersion}' is not a version to release.`);
  const [, major, minor] = series;
  if (!readme.includes(`Fondale ${major}.${minor}`)) {
    throw new Error(
      `Package metadata and public documentation must identify Fondale ${major}.${minor}.`,
    );
  }
  for (const link of [architecturePath]) {
    if (!readme.includes(link)) throw new Error(`README.md: missing release documentation link '${link}'.`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  verifyReleasePreparation({
    readme: readFileSync("README.md", "utf8"),
    packageVersion: JSON.parse(readFileSync("package.json", "utf8")).version,
  });
  console.log("Coherent Fondale 0.4 release preparation verified.");
}
