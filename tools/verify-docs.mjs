import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import ts from "typescript";
import { findObsoleteAuthoringContract } from "./obsolete-authoring-contract.mjs";

const repository = resolve(import.meta.dirname, "..");
const reference = readFileSync(join(repository, "docs/public/contract-index.md"), "utf8");
// A public name is public wherever it is documented: the guides carry the ones
// an Author meets while building, the reference carries the exhaustive contract.
const publicDocumentation = markdownFiles(join(repository, "docs/public"))
  .map((file) => readFileSync(file, "utf8"))
  .join("\n");
// Read the entry points with the compiler rather than a name pattern. A pattern
// has to guess which identifiers are exports, and the obvious guess — anything
// capitalised — silently lets every lower-case function through the gate. Both
// declared entry points are read: a public name is public wherever it is
// published from.
const publicNames = [...new Set(["src/index.ts", "src/testing.ts"].flatMap((relativePath) => {
  const path = join(repository, relativePath);
  return exportedNames(
    ts.createSourceFile(path, readFileSync(path, "utf8"), ts.ScriptTarget.Latest, true),
  );
}))];
const undocumented = publicNames.filter((name) => !publicDocumentation.includes(`\`${name}\``));
if (undocumented.length > 0) {
  throw new Error(`Public exports missing from the documentation: ${undocumented.join(", ")}`);
}

const contractSources = [
  "src/capabilities/game-project/index.ts",
  "src/capabilities/dialogue/index.ts",
  "src/capabilities/interaction/index.ts",
  "src/capabilities/sequence/index.ts",
  "src/capabilities/hud/index.ts",
  "src/capabilities/game-project/diagnostics.ts",
  "src/capabilities/save/index.ts",
  "src/browser/start-game.ts",
];
const contractNames = new Set();
const contractFields = new Set();
for (const relativePath of contractSources) {
  const path = join(repository, relativePath);
  const source = ts.createSourceFile(path, readFileSync(path, "utf8"), ts.ScriptTarget.Latest, true);
  for (const statement of source.statements) {
    const exported = statement.modifiers?.some(({ kind }) => kind === ts.SyntaxKind.ExportKeyword);
    const namedContract = ts.isInterfaceDeclaration(statement) ||
      ts.isTypeAliasDeclaration(statement) || ts.isClassDeclaration(statement);
    if (!exported || !namedContract || !statement.name || hasInternalTag(statement)) continue;
    contractNames.add(statement.name.text);
    collectFields(statement, contractFields);
  }
}
const undocumentedContracts = [...contractNames].filter((name) => !publicDocumentation.includes(`\`${name}\``));
const undocumentedFields = [...contractFields].filter((name) => !publicDocumentation.includes(`\`${name}\``));
if (undocumentedContracts.length > 0 || undocumentedFields.length > 0) {
  throw new Error([
    undocumentedContracts.length > 0 ? `nested structures: ${undocumentedContracts.join(", ")}` : "",
    undocumentedFields.length > 0 ? `nested fields: ${undocumentedFields.join(", ")}` : "",
  ].filter(Boolean).join("; "));
}
const contractRows = new Map(
  reference.split("\n").flatMap((line) => {
    const cells = line.split("|").slice(1, -1).map((cell) => cell.trim());
    const match = cells[0]?.match(/^`([A-Za-z]\w+)`$/);
    return match ? [[match[1], cells]] : [];
  }),
);
for (const name of contractNames) {
  const cells = contractRows.get(name);
  if (!cells || cells.length !== 6 || cells.slice(1, 5).some((cell) => cell.length < 8) ||
      !/\[[^\]]+\]\([^)]+\)/.test(cells[5])) {
    throw new Error(`Contract matrix needs purpose, values, invariants, errors and example: ${name}`);
  }
}

const sourceText = contractSources
  .concat(["src/browser/assets.ts", "src/capabilities/game-session/index.ts"])
  .map((path) => readFileSync(join(repository, path), "utf8"))
  .join("\n");
// Only whole codes: every stable code carries its family prefix, so a helper
// like `profileDiagnostic("biography", …)` contributes its family-qualified
// result, not the bare subject it was called with.
const diagnosticCodes = [...sourceText.matchAll(
  /["'](?:definition|reference|state|save|asset|environment)\.[a-z0-9.-]+["']/g,
)]
  .map((match) => match[0].slice(1, -1))
  .filter((code, index, codes) => codes.indexOf(code) === index);
const diagnosticsPath = join(repository, "docs/public/diagnostics.md");
const diagnosticsGuide = readFileSync(diagnosticsPath, "utf8");
const undocumentedCodes = diagnosticCodes.filter((code) => !diagnosticsGuide.includes(`\`${code}\``));
if (undocumentedCodes.length > 0) {
  throw new Error(`Stable diagnostic codes missing from diagnostics.md: ${undocumentedCodes.join(", ")}`);
}
// The reverse direction, which nothing checked before: a code the documentation
// promises but no capability ever emits is a code an Author will wait for in
// vain. Families built from a template contribute their prefix instead.
const engineSource = typeScriptSources(join(repository, "src"))
  .map((file) => readFileSync(file, "utf8"))
  .join("\n");
const templatePrefixes = [...engineSource.matchAll(
  /`((?:definition|reference|state|save|asset|environment)\.[a-z-]+)\.\$\{/g,
)].map((match) => match[1]);
const emitted = new Set([...engineSource.matchAll(
  /["'`]((?:definition|reference|state|save|asset|environment)\.[a-z0-9.-]+)["'`]/g,
)].map((match) => match[1]));
const invented = [...diagnosticsGuide.matchAll(
  /`((?:definition|reference|state|save|asset|environment)\.[a-z0-9.-]+)`/g,
)]
  .map((match) => match[1])
  .filter((code) => !emitted.has(code) &&
    !templatePrefixes.some((prefix) => code.startsWith(`${prefix}.`)))
  .filter((code, index, codes) => codes.indexOf(code) === index);
if (invented.length > 0) {
  throw new Error(`Documented diagnostic codes no capability emits: ${invented.join(", ")}`);
}

for (const invariant of [
  "defaults to `#000000`",
  "omission means scale `1`",
  "Registry keys are identities",
  "either commit together or",
  "latest committed Game State",
  "omission defaults to Logical Resolution",
  "Camera position, hover, pointer position and Player Preferences are not saved",
]) {
  if (!publicDocumentation.includes(invariant)) {
    throw new Error(`Missing documented default/invariant: ${invariant}`);
  }
}

const docs = [join(repository, "README.md"), ...markdownFiles(join(repository, "docs/public"))];
const characterAuthoringGuide = readFileSync(
  join(repository, "docs/public/authoring/character.md"),
  "utf8",
);
for (const [description, pattern] of [
  ["all four Facing presentations", /`left`, `right`, `front`, and `back`/],
  ["no mirroring or fallback", /never mirrors or falls back/],
  ["common Runtime cell dimensions", /common Runtime\s+cell dimensions/],
  ["loop transition inspection", /first-to-last transition/],
  ["handed action inspection", /handed actions/],
  ["Scene lighting continuity", /Scene's light source/],
]) {
  if (!pattern.test(characterAuthoringGuide)) {
    throw new Error(`Missing four-Facing Character authoring guidance: ${description}`);
  }
}
for (const obsoleteFixedSceneClaim of [
  "A Scene fills the fixed Logical Resolution",
  "Coordinates use the shared Logical Resolution",
  "Background must be a decodable PNG exactly matching the Logical Resolution",
]) {
  for (const file of docs) {
    if (readFileSync(file, "utf8").includes(obsoleteFixedSceneClaim)) {
      throw new Error(`${file}: obsolete fixed-size Scene claim: ${obsoleteFixedSceneClaim}`);
    }
  }
}

const authoringDocumentation = [
  ...docs,
  ...readdirSync(join(repository, "docs/public/recipes"))
    .filter((name) => name.endsWith(".ts"))
    .map((name) => join(repository, "docs/public/recipes", name)),
];
for (const file of authoringDocumentation) {
  const source = readFileSync(file, "utf8");
  const obsolete = findObsoleteAuthoringContract(source);
  if (obsolete) {
    throw new Error(`${file}: obsolete authoring contract: ${obsolete}`);
  }
}

for (const file of docs) {
  const markdown = readFileSync(file, "utf8");
  for (const match of markdown.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const target = match[1].split("#")[0];
    if (!target || /^(https?:|mailto:)/.test(target)) continue;
    const resolved = resolve(dirname(file), target);
    if (!existsSync(resolved)) throw new Error(`${file}: broken link to ${target}`);
  }
}

// The recipes are one playable game, so each required file is a part of it.
const requiredRecipes = [
  "game.ts",
  "world.ts",
  "characters.ts",
  "lantern.ts",
  "sequences.ts",
  "notice.ts",
  "commands.ts",
  "save.ts",
];
for (const recipe of requiredRecipes) {
  if (!existsSync(join(repository, "docs/public/recipes", recipe))) {
    throw new Error(`Missing verified recipe: ${recipe}`);
  }
}

const recipeTest = readFileSync(join(repository, "test/recipes.spec.ts"), "utf8");
if (!recipeTest.includes("docs/public/recipes/game")) {
  throw new Error("The packaged-recipe test must play the assembled recipe game.");
}
// Each recipe has to be part of that one game, not a file that merely compiles
// beside it: either the game imports it, or it imports the game.
const assembledGame = readFileSync(join(repository, "docs/public/recipes/game.ts"), "utf8");
for (const recipe of requiredRecipes) {
  const source = readFileSync(join(repository, "docs/public/recipes", recipe), "utf8");
  const importsPackage = source.includes('from "@asterixcapri/fondale"');
  if (!importsPackage || source.includes("/src/")) {
    throw new Error(`Recipe must consume only the distributable package root: ${recipe}`);
  }
  const part = recipe.replace(/\.ts$/, "");
  if (part !== "game" && !assembledGame.includes(`from "./${part}"`) &&
      !source.includes('from "./game"')) {
    throw new Error(`Recipe is not part of the assembled recipe game: ${recipe}`);
  }
}
const browserRecipeProof = ["test/fixtures/recipes.ts", "test/recipes-browser.spec.ts"]
  .map((path) => readFileSync(join(repository, path), "utf8"))
  .join("\n");
for (const requiredBehavior of [
  "recipes/game",
  "snapshot: raw",
  "Heavier than it looks",
  "data-fondale-inventory-object=\"lantern\"",
]) {
  if (!browserRecipeProof.includes(requiredBehavior)) {
    throw new Error(`Packaged browser recipe proof is missing behavior: ${requiredBehavior}`);
  }
}

const recipeSource = readdirSync(join(repository, "docs/public/recipes"))
  .filter((name) => name.endsWith(".ts"))
  .map((name) => readFileSync(join(repository, "docs/public/recipes", name), "utf8"))
  .join("\n");
for (const callable of ["startGame"]) {
  if (!new RegExp(`\\b${callable}\\s*\\(`).test(recipeSource)) {
    throw new Error(`Public callable has no compiled recipe example: ${callable}`);
  }
}

console.log(`Documentation gate passed for ${publicNames.length} root exports and ${docs.length} Markdown files.`);

function typeScriptSources(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) return typeScriptSources(path);
    return path.endsWith(".ts") && !path.endsWith(".spec.ts") ? [path] : [];
  });
}

function markdownFiles(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? markdownFiles(path) : path.endsWith(".md") ? [path] : [];
  });
}

/** Every name `src/index.ts` exports, whether re-exported, declared or aliased. */
function exportedNames(source) {
  const names = [];
  for (const statement of source.statements) {
    if (ts.isExportDeclaration(statement)) {
      const bindings = statement.exportClause;
      if (bindings && ts.isNamedExports(bindings)) {
        for (const element of bindings.elements) names.push(element.name.text);
      }
      continue;
    }
    if (!statement.modifiers?.some(({ kind }) => kind === ts.SyntaxKind.ExportKeyword)) continue;
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) names.push(declaration.name.text);
      }
      continue;
    }
    if (statement.name && ts.isIdentifier(statement.name)) names.push(statement.name.text);
  }
  return names;
}

function hasInternalTag(node) {
  return ts.getJSDocTags(node).some(({ tagName }) => tagName.text === "internal");
}

function collectFields(node, fields) {
  if (ts.isPropertySignature(node) && ts.isIdentifier(node.name)) fields.add(node.name.text);
  if (ts.isPropertyDeclaration(node) && ts.isIdentifier(node.name)) fields.add(node.name.text);
  ts.forEachChild(node, (child) => collectFields(child, fields));
}
