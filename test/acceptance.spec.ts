import { test } from "@playwright/test";

import { clickWorld, expect, openGame, shoot } from "./harness";

test("the packaged Example completes through real mouse and keyboard input", async ({ page }) => {
  const { errors } = await openGame(page);
  const canvas = page.locator("[data-fondale-frame] canvas");
  const opening = await canvas.screenshot();

  await clickWorld(page, 295, 150);
  await expect(page.locator("[data-fondale-line]")).toContainText("old lock", { timeout: 8_000 });
  await page.keyboard.press("Enter");
  const choice = page.locator("[data-fondale-choice]");
  await expect(choice).toBeVisible();
  await expect(choice.locator("button")).toBeFocused();

  await page.locator("#restore").click();
  await expect(page.locator("[data-fondale-choice]")).toBeVisible({ timeout: 8_000 });
  await expect(page.locator("[data-fondale-choice] button")).toHaveText(
    "I will find a way through.",
  );
  await page.keyboard.press("Enter");
  await expect(page.locator("[data-fondale-line]")).toContainText("key must be nearby");
  await expect(page.locator("[data-fondale-line]")).toBeFocused();
  await page.keyboard.press("Space");
  await expect(page.locator("[data-fondale-line]")).toHaveCount(0);
  await expect(page.locator("#restore")).toBeFocused();

  await clickWorld(page, 118, 200);
  const inventoryKey = page.locator('[data-fondale-inventory-object="key"]');
  await expect(inventoryKey).toBeVisible({ timeout: 8_000 });
  await expect(inventoryKey).toHaveAttribute("aria-pressed", "false");

  await page.keyboard.press("Tab");
  await expect(inventoryKey).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(inventoryKey).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("[data-fondale-inventory-cursor]")).toBeVisible();

  await clickWorld(page, 295, 150);
  await expect(page.locator("[aria-live=polite]")).toHaveText("The key cannot help here.", {
    timeout: 8_000,
  });
  await expect(inventoryKey).toHaveAttribute("aria-pressed", "true");

  await clickWorld(page, 210, 150);
  await expect(page.locator("[aria-live=polite]")).toHaveText("The brass key opens the gate.", {
    timeout: 8_000,
  });
  await expect(inventoryKey).toHaveCount(0);

  await clickWorld(page, 210, 150);
  await expect(page.locator("[aria-live=polite]")).toContainText("harbour road is clear", {
    timeout: 8_000,
  });

  await clickWorld(page, 210, 125);
  await page.waitForTimeout(2_000);
  const ending = await canvas.screenshot();
  expect(ending.equals(opening)).toBe(false);
  await shoot(page, "fondale-1-finale");
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
  await shoot(page, "fondale-1-letterbox-choice");
  expect(errors).toEqual([]);
});
