import { test, type Page } from "@playwright/test";

import { clickWorld, expect, openGame, shoot } from "./harness";

test.setTimeout(60_000);

async function reachHarbour(page: Page): Promise<void> {
  await clickWorld(page, 295, 150);
  await expect(page.locator("[data-fondale-line]")).toContainText("vecchia serratura", {
    timeout: 8_000,
  });
  await page.keyboard.press("Enter");
  await expect(page.locator("[data-fondale-choice] button")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("[data-fondale-line]")).toContainText("chiave dev'essere qui vicino");
  await page.keyboard.press("Space");
  await expect(page.locator("[data-fondale-line]")).toHaveCount(0);

  await clickWorld(page, 118, 200);
  const inventoryKey = page.locator('[data-fondale-inventory-object="key"]');
  await expect(inventoryKey).toBeVisible({ timeout: 8_000 });
  await inventoryKey.click();

  await clickWorld(page, 295, 150);
  await expect(page.locator("[aria-live=polite]")).toHaveText(
    "La chiave non può aiutarti qui.",
    { timeout: 8_000 },
  );
  await expect(inventoryKey).toHaveAttribute("aria-pressed", "true");

  await clickWorld(page, 210, 150);
  await expect(page.locator("[aria-live=polite]")).toHaveText(
    "La chiave d'ottone apre il cancello.",
    { timeout: 8_000 },
  );
  await expect(inventoryKey).toHaveCount(0);

  // The same obvious arch area becomes the Scene Passage after it opens.
  await clickWorld(page, 210, 150);
  await page.waitForTimeout(1_500);
}

async function meetRaffaele(
  page: Page,
  choice: "Quanto mi dai per sistemarlo?" | "Dipende: il mare paga meglio di te?",
  restoreAtChoice = false,
): Promise<void> {
  await clickWorld(page, 360, 180);
  await expect(page.locator("[data-fondale-line]")).toContainText("guardare il mare", {
    timeout: 8_000,
  });
  await page.keyboard.press("Enter");
  const choices = page.locator("[data-fondale-choice]");
  await expect(choices.getByRole("button")).toHaveCount(2);

  if (restoreAtChoice) {
    await page.locator("#restore").click();
    await expect(page.locator("[data-fondale-choice]")).toBeVisible({ timeout: 8_000 });
    await expect(page.locator("#restore")).toHaveText("Salva e ripristina");
  }

  await page.getByRole("button", { name: choice, exact: true }).click();
  await expect(page.locator("[data-fondale-line]")).toBeVisible();
  await page.keyboard.press("Space");
  await expect(page.locator("[data-fondale-line]")).toContainText("argano");
  await page.keyboard.press("Space");
  await expect(page.locator("[data-fondale-line]")).toContainText("olio e la manovella");
  await page.keyboard.press("Space");
  await expect(page.locator("[data-fondale-line]")).toHaveCount(0);
}

async function repairWinch(page: Page): Promise<void> {
  await clickWorld(page, 55, 228);
  const handle = page.locator('[data-fondale-inventory-object="winchHandle"]');
  await expect(handle).toBeVisible({ timeout: 8_000 });
  await handle.click();

  await clickWorld(page, 250, 205);
  await expect(page.locator("[aria-live=polite]")).toHaveText(
    "Il meccanismo è troppo secco. Prima serve dell'olio.",
    { timeout: 8_000 },
  );
  await expect(handle).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Escape");

  await clickWorld(page, 388, 214);
  const oil = page.locator('[data-fondale-inventory-object="oilFlask"]');
  await expect(oil).toBeVisible({ timeout: 8_000 });
  await oil.click();
  await clickWorld(page, 250, 205);
  await expect(page.locator("[aria-live=polite]")).toHaveText(
    "L'olio libera lentamente gli ingranaggi.",
    { timeout: 8_000 },
  );
  await expect(oil).toHaveCount(0);

  await handle.click();
  await clickWorld(page, 250, 205);
  await expect(page.locator("[aria-live=polite]")).toHaveText(
    "La manovella entra al suo posto. Il gozzo può partire.",
    { timeout: 8_000 },
  );
  await expect(handle).toHaveCount(0);
}

async function sailToLookoutAndReadConclusion(page: Page, expected: string): Promise<void> {
  await clickWorld(page, 95, 185);
  await page.waitForTimeout(1_500);
  await clickWorld(page, 215, 120);
  await expect(page.locator("[data-fondale-line]")).toContainText("Dal parapetto", {
    timeout: 8_000,
  });
  await page.keyboard.press("Enter");
  await expect(page.locator("[data-fondale-line]")).toContainText(expected);
  await page.keyboard.press("Space");
  await expect(page.locator("[data-fondale-line]")).toHaveCount(0);
}

test("the packaged Example completes the professional harbour puzzle through real input", async ({
  page,
}) => {
  const { errors } = await openGame(page);
  const canvas = page.locator("[data-fondale-frame] canvas");
  const opening = await canvas.screenshot();

  await reachHarbour(page);
  const harbour = await canvas.screenshot();
  expect(harbour.equals(opening)).toBe(false);

  await meetRaffaele(page, "Quanto mi dai per sistemarlo?", true);
  await repairWinch(page);
  await shoot(page, "capri-1535-harbour-repaired");

  await page.locator("#restore").click();
  await expect(page.locator('[data-fondale-inventory-object="oilFlask"]')).toHaveCount(0);
  await expect(page.locator('[data-fondale-inventory-object="winchHandle"]')).toHaveCount(0);

  await sailToLookoutAndReadConclusion(page, "Raffaele dovrà ammettere");
  await page.locator("#restore").click();
  await clickWorld(page, 215, 120);
  await expect(page.locator("[aria-live=polite]")).toHaveText(
    "All'orizzonte il mare continua a fingere di essere innocente.",
    { timeout: 8_000 },
  );
  const lookout = await canvas.screenshot();
  expect(lookout.equals(harbour)).toBe(false);
  await shoot(page, "capri-1535-lookout");

  await clickWorld(page, 335, 105);
  await page.waitForTimeout(1_500);
  const returned = await canvas.screenshot();
  expect(returned.equals(lookout)).toBe(false);
  expect(errors).toEqual([]);
});

test("the ironic answer reaches a distinct lookout conclusion", async ({ page }) => {
  const { errors } = await openGame(page);
  await reachHarbour(page);
  await meetRaffaele(page, "Dipende: il mare paga meglio di te?");
  await repairWinch(page);
  await sailToLookoutAndReadConclusion(page, "Raffaele detrarrà");
  expect(errors).toEqual([]);
});

test("pixel scaling and the Engine overlay remain usable in a smaller letterboxed window", async ({
  page,
}) => {
  await page.setViewportSize({ width: 900, height: 700 });
  const { errors } = await openGame(page);
  const frame = page.locator("[data-fondale-frame]");
  await expect(frame).toHaveCSS("width", "852px");
  await expect(frame).toHaveCSS("height", "480px");
  const reveal = page.getByRole("button", { name: "Reveal hotspots" });
  await reveal.click();
  await expect(page.locator("[data-fondale-revealed-hotspot]")).toHaveCount(3);
  await expect(reveal).toHaveAttribute("aria-pressed", "true");

  await clickWorld(page, 295, 150);
  await expect(page.locator("[data-fondale-line]")).toBeVisible({ timeout: 8_000 });
  await page.keyboard.press("Enter");
  await expect(page.locator("[data-fondale-choice] button")).toBeFocused();
  await shoot(page, "capri-1535-letterbox-choice");
  expect(errors).toEqual([]);
});
