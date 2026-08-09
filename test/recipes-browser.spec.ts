import { expect, test, type Locator, type Page } from "@playwright/test";

async function clickLogical(page: Page, target: Locator, x: number, y: number): Promise<void> {
  const box = await target.locator("canvas").boundingBox();
  if (!box) throw new Error("Recipe canvas is not visible.");
  await page.mouse.click(box.x + (x / 100) * box.width, box.y + (y / 100) * box.height);
}

test("behavioral recipes execute through the installed public package", async ({ page }) => {
  await page.goto("/test/fixtures/recipes.html");
  const interaction = page.locator('[data-recipe-target="interaction"]');
  const sequenceInventory = page.locator('[data-recipe-target="sequence-inventory"]');
  await expect(page.locator("[data-fondale-frame]")).toHaveCount(2, { timeout: 20_000 });

  await clickLogical(page, interaction, 20, 20);
  await expect(interaction.locator("[aria-live=polite]")).toHaveText("The door opens.");
  await clickLogical(page, interaction, 20, 20);
  await expect(interaction.locator("[aria-live=polite]")).toHaveText("The door is open.");

  await clickLogical(page, sequenceInventory, 20, 20);
  await expect(sequenceInventory.locator("[data-fondale-line]")).toContainText("finite conversation");
  await sequenceInventory.locator("[data-fondale-line]").click();
  await expect(sequenceInventory.locator("[data-fondale-choice]")).toBeVisible();
  await page.locator("#restore-choice").click();
  await expect(sequenceInventory.locator("[data-fondale-choice]")).toBeVisible();
  await sequenceInventory.locator("[data-fondale-choice] button").click();
  await expect(sequenceInventory.locator("[data-fondale-line]")).toContainText("eligible branch");
  await sequenceInventory.locator("[data-fondale-line]").click();
  await expect(sequenceInventory.locator("[data-fondale-line]")).toHaveCount(0);

  await clickLogical(page, sequenceInventory, 40, 80);
  const inventoryKey = sequenceInventory.locator('[data-fondale-inventory-object="key"]');
  await expect(inventoryKey).toBeVisible();
  await inventoryKey.click();
  await clickLogical(page, sequenceInventory, 80, 80);
  await expect(sequenceInventory.locator("[aria-live=polite]")).toHaveText("The key turns.");
  await expect(inventoryKey).toHaveCount(0);
});
