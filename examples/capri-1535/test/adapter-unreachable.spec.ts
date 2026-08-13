import { expect, test } from "@playwright/test";

import { ordinaryPort } from "./ports";

/**
 * The ordinary build needs the local Dialogue Provider adapter. This drives
 * that build with the adapter address refused, which is what a first-time human
 * meets before starting the dialogue stack.
 */
test("the ordinary build explains an unreachable adapter without leaking configuration", async ({
  page,
}) => {
  await page.route("http://127.0.0.1:4315/**", (route) => route.abort());

  await page.goto(`http://localhost:${ordinaryPort}/`);

  const error = page.locator("#error");
  await expect(error).toContainText("Il Dialogue Provider locale non risponde", {
    timeout: 20_000,
  });
  await expect(error).toContainText("npm run dev:dialogue-adapter");
  await expect(error).toContainText("compose.dialogue-adapter.yml");

  // Nothing is playable, and nothing of the server comes with the explanation.
  await expect(page.locator("[data-fondale-frame]")).toHaveCount(0);
  const explanation = await error.textContent() ?? "";
  for (const secret of ["DATABASE_URL", "DIALOGUE_MODEL_API_KEY", "postgres", "fondale_dialogue"]) {
    expect(explanation).not.toContain(secret);
  }
});
