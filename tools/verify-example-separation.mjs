import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const repository = resolve(import.meta.dirname, "..");
const example = join(repository, "examples/capri-1535");
const packageJson = JSON.parse(readFileSync(join(example, "package.json"), "utf8"));
const lock = readFileSync(join(example, "package-lock.json"), "utf8");
const source = readFileSync(join(example, "src/main.ts"), "utf8");
const viteConfig = readFileSync(join(example, "vite.config.ts"), "utf8");
const tarball = "vendor/asterixcapri-fondale-1.0.0.tgz";

if (packageJson.dependencies?.["@asterixcapri/fondale"] !== `file:${tarball}`) {
  throw new Error("The Example must install Fondale from its vendored distributable tarball.");
}
for (const script of ["dev", "typecheck", "build", "preview"]) {
  if (!packageJson.scripts?.[script]) throw new Error(`The Example is missing its '${script}' script.`);
}
if (!existsSync(join(example, tarball))) {
  throw new Error("The Example's vendored Fondale tarball is missing.");
}
if (!lock.includes(`file:${tarball}`)) {
  throw new Error("The Example lockfile does not pin its vendored Fondale tarball.");
}
const expectedIntegrity = `sha512-${createHash("sha512")
  .update(readFileSync(join(example, tarball)))
  .digest("base64")}`;
if (!lock.includes(expectedIntegrity)) {
  throw new Error("The Example lockfile integrity does not match its vendored Fondale tarball.");
}
if (/from\s+["']\.\.\//.test(source) || source.includes("/src/") || source.includes("/art/")) {
  throw new Error("The Example source reaches outside its own project or into Fondale internals.");
}
if (viteConfig.includes("../") || !viteConfig.includes('outDir: "dist"')) {
  throw new Error("The Example build output must remain inside the Example project.");
}

console.log("Example separation gate passed: local assets, local tooling, packaged Fondale dependency.");
