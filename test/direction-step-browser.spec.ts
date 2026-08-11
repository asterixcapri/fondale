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

async function clickLogical(page: Page, x: number, y: number): Promise<void> {
  const box = await page.locator("[data-fondale-frame] canvas").boundingBox();
  if (!box) throw new Error("Direction Step canvas is not visible.");
  await page.mouse.click(
    box.x + x / 426 * box.width,
    box.y + y / 240 * box.height,
  );
}

async function liveState(page: Page) {
  return page.evaluate(() => window.__directionStepLive!.session.createSaveSnapshot().state);
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
  const cameraPixelDuring = await renderedPixel(page, 400, 120);
  expect(cameraPixelDuring).not.toEqual(cameraPixelBefore);

  await page.evaluate(() => window.__directionStepTest!.advance(1));
  expect(await page.evaluate(() => window.__directionStepTest!.elapsedTicks())).toBe(4);
  expect(await renderedPixel(page, 400, 120)).not.toEqual(cameraPixelDuring);
});

test("startGame saves, restores, and skips an active Direction Step through browser input", async ({ page }) => {
  await page.goto("/test/fixtures/direction-step.html?live");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForFunction(() => window.__directionStepLive !== undefined || window.__directionStepError !== undefined);
  const error = await page.evaluate(() => window.__directionStepError);
  if (error) throw new Error(error);

  const frame = page.locator("[data-fondale-frame]");
  await clickLogical(page, 213, 180);
  await expect.poll(async () => (await liveState(page)).activity?.type).toBe("sequence");

  await frame.focus();
  await page.keyboard.press("Control+s");
  const save = frame.locator('[data-fondale-modal="save"]');
  await save.locator("[data-fondale-save-name]").fill("During direction");
  await save.locator("[data-fondale-save-confirm]").click();
  const savedElapsed = await page.evaluate(() => {
    const slots = JSON.parse(localStorage.getItem("fondale.save-slots") ?? "[]") as Array<{
      snapshot: { state: { activity?: { active?: { elapsedTicks?: number } } } };
    }>;
    return slots[0]!.snapshot.state.activity?.active?.elapsedTicks;
  });
  expect(savedElapsed).toBeGreaterThan(0);

  await frame.focus();
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);
  await page.keyboard.press("Control+l");
  await frame.locator('[data-fondale-load-slot="0"]').click();
  await expect.poll(async () => {
    const activity = (await liveState(page)).activity;
    return activity?.type === "sequence" && activity.active?.kind === "direction"
      ? activity.active.elapsedTicks
      : undefined;
  }).toBe(savedElapsed);

  await frame.focus();
  await page.keyboard.press("Escape");
  await expect.poll(async () => (await liveState(page)).activity).toBeNull();
  expect((await liveState(page)).variables).toEqual({ completed: false, skipped: true });
});

test("startGame presents a Direction Step through its natural completion", async ({ page }) => {
  await page.goto("/test/fixtures/direction-step.html?live");
  await page.waitForFunction(() => window.__directionStepLive !== undefined || window.__directionStepError !== undefined);
  const error = await page.evaluate(() => window.__directionStepError);
  if (error) throw new Error(error);

  await clickLogical(page, 213, 180);
  await expect.poll(async () => (await liveState(page)).activity?.type).toBe("sequence");
  await expect.poll(async () => (await liveState(page)).activity, { timeout: 6_000 }).toBeNull();
  expect((await liveState(page)).variables).toEqual({ completed: true, skipped: false });
});
