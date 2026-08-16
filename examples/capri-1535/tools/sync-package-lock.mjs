import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const project = resolve(import.meta.dirname, "..");
const lockPath = join(project, "package-lock.json");
const lock = JSON.parse(readFileSync(lockPath, "utf8"));

const packages = [{
  name: "@asterixcapri/fondale",
  version: "0.4.0",
  tarball: "vendor/asterixcapri-fondale-0.4.0.tgz",
}, {
  name: "@asterixcapri/fondale-dialogue-server",
  version: "0.4.0",
  tarball: "vendor/asterixcapri-fondale-dialogue-server-0.4.0.tgz",
}];

for (const packageDefinition of packages) {
  const installed = lock.packages?.[`node_modules/${packageDefinition.name}`];
  if (!installed) {
    throw new Error(`Install the Example dependencies before synchronizing ${packageDefinition.name}.`);
  }
  const tarballPath = join(project, packageDefinition.tarball);
  installed.version = packageDefinition.version;
  installed.resolved = `file:${packageDefinition.tarball}`;
  installed.integrity = `sha512-${createHash("sha512").update(readFileSync(tarballPath)).digest("base64")}`;
}

writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`);
