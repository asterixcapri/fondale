import { expect, test, type Page } from "@playwright/test";

async function renderedPixel(page: Page, x: number, y: number): Promise<number[]> {
  const screenshot = await page.locator("[data-fondale-frame] canvas").screenshot();
  return page.evaluate(async ({ dataUrl, x, y }) => {
    const image = new Image();
    image.src = dataUrl;
    await image.decode();
    const copy = document.createElement("canvas");
    copy.width = image.width;
    copy.height = image.height;
    const context = copy.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("A 2D canvas is required to inspect the rendered pixel.");
    context.drawImage(image, 0, 0);
    return [...context.getImageData(x, y, 1, 1).data];
  }, { dataUrl: `data:image/png;base64,${screenshot.toString("base64")}`, x, y });
}

test("Animation and Camera present the shared Cue-local Direction timing", async ({ page }) => {
  await page.goto("/test/fixtures/direction-step.html");
  await page.waitForFunction(() => window.__directionStepTest !== undefined || window.__directionStepError !== undefined);
  const error = await page.evaluate(() => window.__directionStepError);
  if (error) throw new Error(error);

  await page.evaluate(() => window.__directionStepTest!.advance(2));
  expect(await page.evaluate(() => window.__directionStepTest!.elapsedTicks())).toBe(2);
  expect(await renderedPixel(page, 213, 175)).toEqual([0, 0, 255, 255]);

  const cameraPixelBefore = await renderedPixel(page, 400, 120);
  await page.evaluate(() => window.__directionStepTest!.advance(1));
  expect(await renderedPixel(page, 400, 120)).not.toEqual(cameraPixelBefore);
});
