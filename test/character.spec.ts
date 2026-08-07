import { test } from "@playwright/test";

import { expect, openGame, shoot } from "./harness";

/** Walks Michele somewhere and waits for him to actually arrive. */
async function walkTo(page: import("@playwright/test").Page, x: number, y: number) {
  await page.evaluate(([x, y]) => window.__game!.walkTo(x!, y!), [x, y]);
  await page.waitForFunction(() => window.__game!.isWalking() === false, undefined, {
    timeout: 15_000,
  });
}

test("Michele scales with depth and passes behind the jar", async ({ page }) => {
  const { errors } = await openGame(page);

  // Standing at the front of the alley: full height.
  await walkTo(page, 150, 236);
  await shoot(page, "michele-vicino");

  // Deep in the alley by the archway: he should read as much smaller.
  await walkTo(page, 205, 150);
  await shoot(page, "michele-lontano");

  // Squarely behind the jar and beyond its footing, so it should hide his legs.
  await walkTo(page, 251, 184);
  await shoot(page, "michele-dietro-giara");

  // Same column, nearer the camera than the jar's footing: now he covers it.
  await walkTo(page, 251, 196);
  await shoot(page, "michele-davanti-giara");

  expect(errors).toEqual([]);
});

test("a click outside the walkable area still moves him somewhere he can stand", async ({
  page,
}) => {
  await openGame(page);

  // Straight at the sky.
  await walkTo(page, 213, 20);

  const where = await page.evaluate(() => window.__game!.where());
  expect(where.y).toBeGreaterThan(140);
});
