import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, normalize, relative, resolve } from "node:path";
import ts from "typescript";

const root = process.cwd();
const sourceRoot = join(root, "src");
const capabilityRoot = join(sourceRoot, "capabilities");
const historical = [join(sourceRoot, "public"), join(sourceRoot, "internal")];
const capabilityOwners = new Set([
  "animation",
  "camera",
  "dialogue",
  "game-project",
  "game-session",
  "hud",
  "interaction",
  "save",
  "sequence",
  "world",
]);
const failures = [];
const packageManifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const packageExports = packageManifest.exports && typeof packageManifest.exports === "object"
  ? Object.keys(packageManifest.exports)
  : [];

if (packageExports.length !== 1 || packageExports[0] !== ".") {
  failures.push("package.json must expose exactly the '.' public root entry point.");
}

for (const file of sourceFiles(sourceRoot)) {
  const sourcePath = relative(sourceRoot, file);
  const sourceOwner = sourcePath.split("/")[0];
  const isRootContract = sourcePath === "index.ts" || sourcePath === "vite-env.d.ts";
  if (!isRootContract && sourceOwner !== "capabilities" && sourceOwner !== "browser") {
    failures.push(`${relative(root, file)} has no declared production owner.`);
  }
}

for (const directory of historical) {
  if (existsSync(directory) && sourceFiles(directory).length > 0) {
    failures.push(`${relative(root, directory)} is a retired horizontal ownership directory.`);
  }
}
for (const owner of capabilityOwners) {
  if (!existsSync(join(capabilityRoot, owner, "index.ts"))) {
    failures.push(`src/capabilities/${owner} must declare its interface in index.ts.`);
  }
}
for (const owner of directories(capabilityRoot)) {
  if (!capabilityOwners.has(owner)) {
    failures.push(`src/capabilities/${owner} is not a declared Engine Capability owner.`);
  }
}
for (const file of sourceFiles(capabilityRoot)) {
  if (!relative(capabilityRoot, file).includes("/")) {
    failures.push(`${relative(root, file)} has no declared Engine Capability owner.`);
  }
}

for (const file of sourceFiles(sourceRoot)) {
  const sourceRelative = relative(capabilityRoot, file);
  const sourceOwner = sourceRelative.startsWith("..") ? undefined : sourceRelative.split("/")[0];
  for (const specifier of moduleSpecifiers(file)) {
    if (!specifier.startsWith(".")) continue;
    const target = resolveImport(file, specifier);
    const targetSourceRelative = relative(sourceRoot, target);
    if (sourceOwner && targetSourceRelative === "index.ts") {
      failures.push(
        `${relative(root, file)} imports package root ${relative(root, target)}.`,
      );
      continue;
    }
    if (sourceOwner && targetSourceRelative.split("/")[0] === "browser") {
      failures.push(
        `${relative(root, file)} imports browser adapter ${relative(root, target)}.`,
      );
      continue;
    }
    const targetRelative = relative(capabilityRoot, target);
    if (targetRelative.startsWith("..")) continue;
    const targetOwner = targetRelative.split("/")[0];
    if (sourceOwner === targetOwner) continue;
    const interfaceFile = join(capabilityRoot, targetOwner, "index.ts");
    if (target !== interfaceFile) {
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
    return statSync(path).isDirectory() ? sourceFiles(path) : /\.(?:[cm]?ts|tsx)$/.test(path) ? [path] : [];
  });
}

function directories(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory).filter((name) => statSync(join(directory, name)).isDirectory());
}

function resolveImport(file, specifier) {
  const candidate = normalize(resolve(dirname(file), specifier));
  if (existsSync(`${candidate}.ts`)) return `${candidate}.ts`;
  if (existsSync(join(candidate, "index.ts"))) return join(candidate, "index.ts");
  return candidate;
}

function moduleSpecifiers(file) {
  const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
  const specifiers = [];
  visit(source);
  return specifiers;

  function visit(node) {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
        node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      specifiers.push(node.moduleSpecifier.text);
    } else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument) &&
        ts.isStringLiteral(node.argument.literal)) {
      specifiers.push(node.argument.literal.text);
    } else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword &&
        node.arguments.length === 1 && ts.isStringLiteral(node.arguments[0])) {
      specifiers.push(node.arguments[0].text);
    }
    ts.forEachChild(node, visit);
  }
}
