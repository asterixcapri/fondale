import { expect, test, type Locator, type Page } from "@playwright/test";

import { clickLogical as clickCanvasLogical } from "./browser-support";

async function clickLogical(page: Page, target: Locator, x: number, y: number): Promise<void> {
  await clickCanvasLogical(page, x, y, 1280, 720, target.locator("canvas"));
}

/**
 * The published recipes, played in a real browser through the installed package.
 *
 * The Camera stays at the left edge of the quay throughout, so viewport
 * coordinates and Scene Space coordinates coincide for every click below.
 */
test("the recipe game runs through the installed public package", async ({ page }) => {
  await page.goto("/test/fixtures/recipes.html");
  const game = page.locator('[data-recipe-target="lantern"]');
  await expect(page.locator("[data-fondale-frame]")).toHaveCount(1, { timeout: 20_000 });

  await game.locator("[data-fondale-frame]").focus();
  await page.keyboard.press("F5");
  await expect(game.getByLabel("Speech volume")).toHaveCount(0);
  await page.keyboard.press("Escape");

  await clickLogical(page, game, 545, 625);
  await expect(game).toContainText("Heavier than it looks");

  await game.locator("[data-fondale-inventory-trigger]").click();
  const carriedLantern = game.locator('[data-fondale-inventory-object="lantern"]');
  await expect(carriedLantern).toBeVisible();

  await page.locator("#restore-choice").click();
  await expect(page.locator("[data-fondale-frame]")).toHaveCount(1, { timeout: 20_000 });
  await game.locator("[data-fondale-inventory-trigger]").click();
  await expect(game.locator('[data-fondale-inventory-object="lantern"]')).toBeVisible();
});
