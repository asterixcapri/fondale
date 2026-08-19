import { afterEach, beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const verifier = resolve(import.meta.dirname, "verify-architecture.mjs");
const capabilityOwners = [
  "animation",
  "camera",
  "detail-view",
  "dialogue",
  "game-project",
  "game-session",
  "hud",
  "interaction",
  "save",
  "sequence",
  "world",
];

let fixtureRoot;

beforeEach(() => {
  fixtureRoot = mkdtempSync(join(tmpdir(), "fondale-architecture-"));
  write("package.json", JSON.stringify({
    exports: { ".": "./dist/index.js", "./testing": "./dist/testing.js" },
  }));
  write("src/index.ts", 'export * from "./capabilities/world";\n');
  write("src/testing.ts", 'export * from "./capabilities/game-session";\n');
  write("src/vite-env.d.ts", '/// <reference types="vite/client" />\n');
  write("src/browser/start-game.ts", "export function startGame() {}\n");
  for (const owner of capabilityOwners) write(`src/capabilities/${owner}/index.ts`, "export {};\n");
});

afterEach(() => rmSync(fixtureRoot, { recursive: true, force: true }));

test("accepts production sources with declared capability or browser ownership", () => {
  assertVerifierPasses();
});

test("rejects a production source without an explicit owner", () => {
  write("src/runtime/tick.ts", "export const tick = 1;\n");

  assertVerifierFails("src/runtime/tick.ts has no declared production owner");
});

test("rejects a capability outside the declared ownership map", () => {
  write("src/capabilities/shared/index.ts", "export const policy = true;\n");

  assertVerifierFails("src/capabilities/shared is not a declared Engine Capability owner");
});

test("requires one index interface for every capability", () => {
  rmSync(join(fixtureRoot, "src/capabilities/camera/index.ts"));
  write("src/capabilities/camera/private.ts", "export const focus = true;\n");

  assertVerifierFails("src/capabilities/camera must declare its interface in index.ts");
});

test("rejects private capability imports from another capability or browser adapter", () => {
  write("src/capabilities/world/geometry.ts", "export const origin = { x: 0, y: 0 };\n");
  write(
    "src/capabilities/camera/index.ts",
    'import { origin } from "../world/geometry";\nexport const focus = origin;\n',
  );
  write(
    "src/browser/start-game.ts",
    'import("../capabilities/world/geometry");\nexport function startGame() {}\n',
  );

  const result = verify();
  assert.notEqual(result.status, 0, result.stdout);
  assert.match(result.stderr, /src\/capabilities\/camera\/index\.ts imports private world implementation/);
  assert.match(result.stderr, /src\/browser\/start-game\.ts imports private world implementation/);
});

test("requires the package to expose exactly its two declared entry points", () => {
  write("package.json", JSON.stringify({
    exports: {
      ".": "./dist/index.js",
      "./testing": "./dist/testing.js",
      "./world": "./dist/world.js",
    },
  }));

  assertVerifierFails("package.json must expose exactly . and ./testing");
});

test("requires the testing entry point to be declared", () => {
  write("package.json", JSON.stringify({ exports: { ".": "./dist/index.js" } }));

  assertVerifierFails("package.json must expose exactly . and ./testing");
});

test("rejects a private capability import used only as a type", () => {
  write("src/capabilities/world/private.ts", "export interface Secret {}\n");
  write(
    "src/capabilities/camera/index.ts",
    'export type Leak = import("../world/private").Secret;\n',
  );

  assertVerifierFails("src/capabilities/camera/index.ts imports private world implementation");
});

test("rejects a capability dependency on a browser adapter", () => {
  write(
    "src/capabilities/camera/index.ts",
    'import { startGame } from "../../browser/start-game";\nexport const focus = startGame;\n',
  );

  assertVerifierFails("src/capabilities/camera/index.ts imports browser adapter");
});

test("rejects an unowned TSX production source", () => {
  write("src/runtime/policy.tsx", "export const Policy = () => null;\n");

  assertVerifierFails("src/runtime/policy.tsx has no declared production owner");
});

test("rejects a loose source file in the capability container", () => {
  write("src/capabilities/shared.ts", "export const policy = true;\n");

  assertVerifierFails("src/capabilities/shared.ts has no declared Engine Capability owner");
});

test("rejects a capability dependency on the package root aggregator", () => {
  write(
    "src/capabilities/camera/index.ts",
    'export { defineGame } from "../../index";\n',
  );

  assertVerifierFails("src/capabilities/camera/index.ts imports package root src/index.ts");
});

function write(relativePath, contents) {
  const path = join(fixtureRoot, relativePath);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents);
}

function verify() {
  return spawnSync(process.execPath, [verifier], { cwd: fixtureRoot, encoding: "utf8" });
}

function assertVerifierPasses() {
  const result = verify();
  assert.equal(result.status, 0, result.stderr);
}

function assertVerifierFails(message) {
  const result = verify();
  assert.notEqual(result.status, 0, result.stdout);
  assert.match(result.stderr, new RegExp(escapeRegExp(message)));
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
