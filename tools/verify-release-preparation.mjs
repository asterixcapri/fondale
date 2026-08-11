import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const architecturePath = "docs/engine-architecture.html";
const migrationPath = "docs/public/migration-0.4.md";

export function verifyReleasePreparation({ readme, migration, packageVersion }) {
  if (packageVersion !== "0.4.0" || !readme.includes("Fondale 0.4")) {
    throw new Error("Package metadata and public documentation must identify Fondale 0.4.0.");
  }
  for (const link of [architecturePath, migrationPath]) {
    if (!readme.includes(link)) throw new Error(`README.md: missing release documentation link '${link}'.`);
  }
  for (const migrationFact of [
    "DirectStep",
    "0.3 Save Snapshots",
    "No compatibility alias or runtime shim is provided.",
  ]) {
    if (!migration.includes(migrationFact)) {
      throw new Error(`${migrationPath}: missing migration fact '${migrationFact}'.`);
    }
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  verifyReleasePreparation({
    readme: readFileSync("README.md", "utf8"),
    migration: readFileSync(migrationPath, "utf8"),
    packageVersion: JSON.parse(readFileSync("package.json", "utf8")).version,
  });
  console.log("Coherent Fondale 0.4 release preparation verified.");
}
