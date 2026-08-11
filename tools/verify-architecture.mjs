import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, normalize, relative, resolve } from "node:path";

const root = process.cwd();
const sourceRoot = join(root, "src");
const capabilityRoot = join(sourceRoot, "capabilities");
const historical = [join(sourceRoot, "public"), join(sourceRoot, "internal")];
const failures = [];

for (const directory of historical) {
  if (existsSync(directory) && sourceFiles(directory).length > 0) {
    failures.push(`${relative(root, directory)} is a retired horizontal ownership directory.`);
  }
}
if (existsSync(join(capabilityRoot, "shared"))) {
  failures.push("src/capabilities/shared is forbidden; put policy in its owning capability.");
}

for (const file of sourceFiles(capabilityRoot)) {
  const owner = relative(capabilityRoot, file).split("/")[0];
  const text = readFileSync(file, "utf8");
  for (const match of text.matchAll(/from\s+["']([^"']+)["']/g)) {
    const specifier = match[1];
    if (!specifier.startsWith(".")) continue;
    const target = resolveImport(file, specifier);
    const targetRelative = relative(capabilityRoot, target);
    if (targetRelative.startsWith("..")) continue;
    const targetOwner = targetRelative.split("/")[0];
    if (owner === targetOwner) continue;
    const interfaceFile = join(capabilityRoot, targetOwner, "index.ts");
    const diagnosticInterface = join(capabilityRoot, "game-project", "diagnostics.ts");
    if (target !== interfaceFile && target !== diagnosticInterface) {
      failures.push(
        `${relative(root, file)} imports private ${targetOwner} implementation ${relative(root, target)}.`,
      );
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log("Capability ownership and interface imports verified.");
}

function sourceFiles(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? sourceFiles(path) : path.endsWith(".ts") ? [path] : [];
  });
}

function resolveImport(file, specifier) {
  const candidate = normalize(resolve(dirname(file), specifier));
  if (existsSync(`${candidate}.ts`)) return `${candidate}.ts`;
  if (existsSync(join(candidate, "index.ts"))) return join(candidate, "index.ts");
  return candidate;
}
