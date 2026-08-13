import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve, sep } from "node:path";

const project = resolve(import.meta.dirname, "..");
const packageJson = JSON.parse(readFileSync(join(project, "package.json"), "utf8"));
const lock = readFileSync(join(project, "package-lock.json"), "utf8");
const viteConfig = readFileSync(join(project, "vite.config.ts"), "utf8");
const tarball = "vendor/asterixcapri-fondale-0.4.0.tgz";
const retiredArtDirectories = ["concept", "example", "rooms", "sprites"];
const retiredSourceFiles = ["src/nouns.ts"];

function findTypeScriptFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return findTypeScriptFiles(path);
    return entry.isFile() && path.endsWith(".ts") ? [path] : [];
  });
}

if (packageJson.dependencies?.["@asterixcapri/fondale"] !== `file:${tarball}`) {
  throw new Error("The Example must install Fondale from its vendored distributable tarball.");
}
for (const script of ["dev", "dev:acceptance", "typecheck", "build", "preview", "verify"]) {
  if (!packageJson.scripts?.[script]) throw new Error(`The Example is missing its '${script}' script.`);
}
if (!existsSync(join(project, tarball))) {
  throw new Error("The Example's vendored Fondale tarball is missing.");
}
for (const directory of retiredArtDirectories) {
  if (existsSync(join(project, "art", directory))) {
    throw new Error(`The art library contains retired non-master directory '${directory}'.`);
  }
}
for (const file of retiredSourceFiles) {
  if (existsSync(join(project, file))) {
    throw new Error(`The Example still contains retired source file '${file}'.`);
  }
}
if (!lock.includes(`file:${tarball}`)) {
  throw new Error("The Example lockfile does not pin its vendored Fondale tarball.");
}
const expectedIntegrity = `sha512-${createHash("sha512")
  .update(readFileSync(join(project, tarball)))
  .digest("base64")}`;
if (!lock.includes(expectedIntegrity)) {
  throw new Error("The Example lockfile integrity does not match its vendored Fondale tarball.");
}
const projectPrefix = `${project}${sep}`;
for (const sourceFile of findTypeScriptFiles(join(project, "src"))) {
  const source = readFileSync(sourceFile, "utf8");
  const imports = source.matchAll(/(?:from\s+|import\s*\(\s*)["']([^"']+)["']/g);

  for (const [, specifier] of imports) {
    if (specifier.startsWith(".") && !resolve(dirname(sourceFile), specifier).startsWith(projectPrefix)) {
      throw new Error(`The Example source reaches outside its project from ${sourceFile}.`);
    }
    if (specifier.startsWith("@asterixcapri/fondale/")) {
      throw new Error(`The Example imports Fondale internals from ${sourceFile}.`);
    }
  }

  if (source.includes("/art/")) {
    throw new Error(`The Example source reaches into repository art from ${sourceFile}.`);
  }
}
// A Player has one experience: the Dialogue Provider belongs to the build, not
// to a query parameter anybody can type into the address bar.
const entryPoint = readFileSync(join(project, "src/main.ts"), "utf8");
if (/\.get\(\s*["']dialogue["']\s*\)/.test(entryPoint)) {
  throw new Error("The Example must not let a Player select a Dialogue Provider.");
}
if (!entryPoint.includes('import.meta.env.MODE === "acceptance"')) {
  throw new Error("The Example must select its Dialogue Provider when it is built.");
}
if (viteConfig.includes("../") || !viteConfig.includes('outDir: "dist"')) {
  throw new Error("The Example build output must remain inside the Example project.");
}

console.log("Example separation gate passed: local assets, local tooling, packaged Fondale dependency.");
