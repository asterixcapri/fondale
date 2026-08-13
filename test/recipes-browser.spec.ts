import { expect, test, type Locator, type Page } from "@playwright/test";

import { clickLogical as clickCanvasLogical } from "./browser-support";

async function clickLogical(page: Page, target: Locator, x: number, y: number): Promise<void> {
  await clickCanvasLogical(page, x, y, 100, 100, target.locator("canvas"));
}

test("Command recipes execute through the installed public package", async ({ page }) => {
  await page.goto("/test/fixtures/recipes.html");
  const interaction = page.locator('[data-recipe-target="interaction"]');
  const sequenceInventory = page.locator('[data-recipe-target="sequence-inventory"]');
  await expect(page.locator("[data-fondale-frame]")).toHaveCount(2, { timeout: 20_000 });

  await interaction.locator("[data-fondale-frame]").focus();
  await page.keyboard.press("F5");
  await expect(interaction.getByLabel("Speech volume")).toHaveCount(0);
  await page.keyboard.press("Escape");

  await clickLogical(page, interaction, 20, 20);
  await expect(interaction).toContainText("Open Door");

  await clickLogical(page, sequenceInventory, 20, 20);
  await expect(sequenceInventory.locator("[data-fondale-line]")).toContainText("tide is turning");
  await sequenceInventory.locator("[data-fondale-frame]").focus();
  await page.keyboard.press(".");
  await expect(sequenceInventory.locator("[data-fondale-narration]")).toContainText("finite conversation");
  await page.keyboard.press(".");
  await expect(sequenceInventory.locator("[data-fondale-choice]")).toBeVisible();
  await page.locator("#restore-choice").click();
  await expect(sequenceInventory.locator("[data-fondale-choice]")).toBeVisible();
  await sequenceInventory.locator("[data-fondale-frame]").focus();
  await page.keyboard.press("1");
  await expect(sequenceInventory.locator("[data-fondale-line]")).toHaveText("Continue");
  await page.keyboard.press(".");
  await expect(sequenceInventory.locator("[data-fondale-narration]")).toContainText("eligible branch");
  await page.keyboard.press(".");
  await expect(sequenceInventory.locator("[data-fondale-narration]")).toHaveCount(0);

  await clickLogical(page, sequenceInventory, 40, 25);
  await sequenceInventory.locator("[data-fondale-inventory-trigger]").click();
  const inventoryKey = sequenceInventory.locator('[data-fondale-inventory-object="key"]');
  await expect(inventoryKey).toBeVisible();
  await inventoryKey.click();
  await clickLogical(page, sequenceInventory, 80, 22);
  await expect(inventoryKey).toHaveCount(0);
});
