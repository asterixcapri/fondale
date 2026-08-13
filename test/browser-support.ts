import type { Page } from "@playwright/test";

export async function clickLogical(
  page: Page,
  x: number,
  y: number,
  width = 426,
  height = 240,
): Promise<void> {
  const box = await page.locator("[data-fondale-frame] canvas").boundingBox();
  if (!box) throw new Error("Fondale canvas is not visible.");
  await page.mouse.click(box.x + x / width * box.width, box.y + y / height * box.height);
}

export async function renderedPixel(page: Page, x: number, y: number): Promise<number[]> {
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
