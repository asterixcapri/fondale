import { expect, test, type Page } from "@playwright/test";

import { clickLogical, logicalPoint, renderedPixel } from "./browser-support";

const characterPixel: [number, number] = [211, 175];
const sealPixel = [17, 136, 170, 255];

async function openFixture(page: Page): Promise<void> {
  await page.goto("/test/fixtures/detail-view.html");
  await page.waitForFunction(
    () => window.__detailView !== undefined || window.__detailViewError !== undefined,
  );
  const error = await page.evaluate(() => window.__detailViewError);
  if (error) throw new Error(error);
}

test("a presented Detail View replaces the world, draws no Character, and still advertises", async ({ page }) => {
  await openFixture(page);
  const frame = page.locator("[data-fondale-frame]");
  await expect(frame).not.toHaveAttribute("data-fondale-detail-view", /.*/);
  expect(await renderedPixel(page, ...characterPixel)).toEqual([255, 0, 255, 255]);

  await clickLogical(page, 355, 210);
  await expect(frame).toHaveAttribute("data-fondale-detail-view", "seal");
  expect(await renderedPixel(page, ...characterPixel)).toEqual(sealPixel);
  await expect(frame.locator("[data-fondale-inventory-trigger]")).toBeVisible();

  const seal = await logicalPoint(frame.locator("canvas"), 90, 90);
  await page.mouse.move(seal.x, seal.y);
  await expect(frame.locator("[data-fondale-primary-action] [data-fondale-action-text]"))
    .toHaveText("Guarda Sigillo");

  await clickLogical(page, 90, 90);
  await expect(frame.locator("[aria-live=polite]")).toHaveText("La ceralacca è spezzata.");
});

test("dismissing a Detail View returns the Player to the world exactly as it was", async ({ page }) => {
  await openFixture(page);
  const frame = page.locator("[data-fondale-frame]");
  const before = await page.evaluate(
    () => window.__detailView!.session.createSaveSnapshot().state.characters.player,
  );

  await clickLogical(page, 355, 210);
  await expect(frame).toHaveAttribute("data-fondale-detail-view", "seal");

  await clickLogical(page, 350, 90);
  await expect(frame).not.toHaveAttribute("data-fondale-detail-view", /.*/);
  expect(await renderedPixel(page, ...characterPixel)).toEqual([255, 0, 255, 255]);
  expect(await page.evaluate(
    () => window.__detailView!.session.createSaveSnapshot().state.characters.player,
  )).toEqual(before);
});

/** Reads the presented Detail View the browser stored as Continuation State. */
async function continuedDetailView(page: Page): Promise<string | undefined> {
  return page.evaluate(() => {
    const key = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index)
    ).find((candidate) => candidate?.startsWith("fondale.continuation."));
    if (!key) return undefined;
    return (JSON.parse(localStorage.getItem(key)!) as {
      snapshot: { state: { detailView?: string } };
    }).snapshot.state.detailView;
  });
}

test("reloading the browser returns to the presented Detail View", async ({ page }) => {
  await openFixture(page);
  const frame = page.locator("[data-fondale-frame]");
  await clickLogical(page, 355, 210);
  await expect(frame).toHaveAttribute("data-fondale-detail-view", "seal");
  await expect.poll(() => continuedDetailView(page)).toBe("seal");
  const before = await page.evaluate(
    () => window.__detailView!.session.createSaveSnapshot().state.characters.player,
  );

  await page.reload();
  const startup = page.locator("[data-fondale-continuation]");
  await startup.getByRole("button", { name: "Continue" }).click();

  await expect(frame).toHaveAttribute("data-fondale-detail-view", "seal");
  expect(await renderedPixel(page, ...characterPixel)).toEqual(sealPixel);
  expect(await page.evaluate(
    () => window.__detailView!.session.createSaveSnapshot().state.characters.player,
  )).toEqual(before);
  await clickLogical(page, 90, 90);
  await expect(frame.locator("[aria-live=polite]")).toHaveText("La ceralacca è spezzata.");
});
