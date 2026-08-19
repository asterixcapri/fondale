import type { Locator, Page } from "@playwright/test";

export async function logicalPoint(
  canvas: Locator,
  x: number,
  y: number,
  width = 426,
  height = 240,
): Promise<{ x: number; y: number }> {
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Fondale canvas is not visible.");
  return {
    x: box.x + x / width * box.width,
    y: box.y + y / height * box.height,
  };
}

export async function clickLogical(
  page: Page,
  x: number,
  y: number,
  width = 426,
  height = 240,
  canvas = page.locator("[data-fondale-frame] canvas"),
): Promise<void> {
  const point = await logicalPoint(canvas, x, y, width, height);
  await page.mouse.click(point.x, point.y);
}

/**
 * Reads several pixels out of one screenshot.
 *
 * Screenshotting is the expensive half of an inspection, and a test that wants
 * three points from the same rendered frame must not take three screenshots of
 * a moving one: the later shots belong to a later frame.
 */
export async function renderedPixels(
  page: Page,
  points: readonly { readonly x: number; readonly y: number }[],
  width = 426,
  height = 240,
): Promise<number[][]> {
  const screenshot = await page.locator("[data-fondale-frame] canvas").screenshot();
  return page.evaluate(async ({ dataUrl, points, width, height }) => {
    const image = new Image();
    image.src = dataUrl;
    await image.decode();
    const copy = document.createElement("canvas");
    copy.width = image.width;
    copy.height = image.height;
    const context = copy.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("A 2D canvas is required to inspect the rendered pixel.");
    context.drawImage(image, 0, 0);
    return points.map((point) => [...context.getImageData(
      Math.round(point.x / width * image.width),
      Math.round(point.y / height * image.height),
      1,
      1,
    ).data]);
  }, {
    dataUrl: `data:image/png;base64,${screenshot.toString("base64")}`,
    points: points.map((point) => ({ x: point.x, y: point.y })),
    width,
    height,
  });
}

export async function renderedPixel(
  page: Page,
  x: number,
  y: number,
  width = 426,
  height = 240,
): Promise<number[]> {
  const [pixel] = await renderedPixels(page, [{ x, y }], width, height);
  return pixel!;
}
