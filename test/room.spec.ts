import { test } from "@playwright/test";

import { expect, openGame, shoot } from "./harness";

test("the alley renders at its logical resolution", async ({ page }) => {
  const { errors } = await openGame(page);

  await shoot(page, "vicolo");

  expect(errors).toEqual([]);
});
