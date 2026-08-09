import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const project = resolve(import.meta.dirname, "..");
const tarballPath = join(project, "vendor/asterixcapri-fondale-1.0.0.tgz");
const lockPath = join(project, "package-lock.json");
const lock = JSON.parse(readFileSync(lockPath, "utf8"));
const fondale = lock.packages?.["node_modules/@asterixcapri/fondale"];

if (!fondale) {
  throw new Error("Install the Example dependencies once before synchronizing Fondale.");
}

fondale.resolved = "file:vendor/asterixcapri-fondale-1.0.0.tgz";
fondale.integrity = `sha512-${createHash("sha512").update(readFileSync(tarballPath)).digest("base64")}`;
writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`);
