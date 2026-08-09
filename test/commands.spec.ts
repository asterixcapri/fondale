import { expect, test } from "@playwright/test";

test("the public browser completes Look At → Noun → Command Response", async ({ page }) => {
  await page.goto("/test/fixtures/commands.html");
  const frame = page.locator("[data-fondale-frame]");
  await expect(frame).toBeVisible();

  await frame.locator('[data-fondale-verb="look-at"]').click();
  const canvas = frame.locator("canvas");
  const bounds = await canvas.boundingBox();
  if (!bounds) throw new Error("missing canvas bounds");
  await page.mouse.click(
    bounds.x + (230 / 426) * bounds.width,
    bounds.y + (110 / 240) * bounds.height,
  );

  await expect(frame.locator("[aria-live=polite]")).toHaveText("Un vecchio portone.");
  await expect(frame.locator('[data-fondale-verb="look-at"]')).toHaveAttribute("aria-pressed", "false");
});
