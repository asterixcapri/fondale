import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

test("the package development command starts only the source Dialogue Server", async () => {
  const manifest = JSON.parse(
    await readFile(new URL("../package.json", import.meta.url), "utf8"),
  ) as { readonly scripts?: Readonly<Record<string, string>> };
  const command = manifest.scripts?.dev;

  assert.ok(command, "packages/dialogue-server must declare npm run dev");
  assert.match(command, /--env-file-if-exists=\.env\.local/);
  assert.match(command, /src\/main\.ts/);
  assert.doesNotMatch(command, /docker|compose/i);
});
