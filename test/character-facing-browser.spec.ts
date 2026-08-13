import { expect, test, type Page } from "@playwright/test";

type Facing = "left" | "right" | "front" | "back";

async function clickLogical(page: Page, x: number, y: number): Promise<void> {
  const box = await page.locator("[data-fondale-frame] canvas").boundingBox();
  if (!box) throw new Error("Character Facing canvas is not visible.");
  await page.mouse.click(box.x + x / 426 * box.width, box.y + y / 240 * box.height);
}

async function pixel(page: Page, x: number, y: number): Promise<number[]> {
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

async function state(page: Page) {
  return page.evaluate(() => window.__characterFacing!.session.createSaveSnapshot().state);
}

async function expectFacingPresentation(page: Page, facing: Facing): Promise<void> {
  const current = await state(page);
  const character = current.characters.player!;
  expect(character.facing).toBe(facing);
  const { x, y } = character.groundPoint;
  const probes = {
    left: { marker: [x - 4, y - 5], fill: [x + 3, y - 5], markerColor: [255, 0, 0, 255], fillColor: [0, 255, 0, 255] },
    right: { marker: [x + 3, y - 5], fill: [x - 4, y - 5], markerColor: [255, 255, 0, 255], fillColor: [0, 0, 255, 255] },
    front: { marker: [x, y - 9], fill: [x, y - 2], markerColor: [0, 255, 255, 255], fillColor: [255, 0, 255, 255] },
    back: { marker: [x, y - 2], fill: [x, y - 9], markerColor: [255, 255, 255, 255], fillColor: [255, 128, 0, 255] },
  } satisfies Record<Facing, {
    marker: [number, number]; fill: [number, number]; markerColor: number[]; fillColor: number[];
  }>;
  const probe = probes[facing];
  expect(await pixel(page, ...probe.marker)).toEqual(probe.markerColor);
  expect(await pixel(page, ...probe.fill)).toEqual(probe.fillColor);
}

test("startGame selects each authored Character presentation without reflection or anchor drift", async ({ page }) => {
  await page.goto("/test/fixtures/character-facing.html");
  await page.waitForFunction(() => window.__characterFacing !== undefined || window.__characterFacingError !== undefined);
  const error = await page.evaluate(() => window.__characterFacingError);
  if (error) throw new Error(error);

  await expectFacingPresentation(page, "front");
  for (const [facing, destination] of [
    ["left", { x: 193, y: 180 }],
    ["right", { x: 233, y: 180 }],
    ["back", { x: 233, y: 150 }],
    ["front", { x: 233, y: 190 }],
  ] as const) {
    await clickLogical(page, destination.x, destination.y);
    await expect.poll(async () => (await state(page)).characters.player?.facing).toBe(facing);
    await expect.poll(async () => (await state(page)).activity).toBeNull();
    await expectFacingPresentation(page, facing);
  }
});

test("a directed Facing change keeps the Character Animation phase and Ground Point", async ({ page }) => {
  await page.goto("/test/fixtures/character-facing.html?directed");
  await page.waitForFunction(() => window.__characterFacing !== undefined || window.__characterFacingError !== undefined);
  const error = await page.evaluate(() => window.__characterFacingError);
  if (error) throw new Error(error);

  const initial = (await state(page)).characters.player!;
  await clickLogical(page, 300, 180);
  await expect.poll(async () => (await state(page)).activity?.type).toBe("sequence");
  await expect.poll(async () => (await state(page)).characters.player?.facing).toBe("right");

  const during = await state(page);
  const player = during.characters.player!;
  expect(player.groundPoint).toEqual(initial.groundPoint);
  expect(await pixel(page, player.groundPoint.x + 3, player.groundPoint.y - 5)).toEqual([255, 255, 0, 255]);
  expect([
    [0, 0, 128, 255],
    [128, 128, 255, 255],
  ]).toContainEqual(await pixel(page, player.groundPoint.x - 4, player.groundPoint.y - 5));

  await expect.poll(async () => (await state(page)).activity, { timeout: 5_000 }).toBeNull();
  expect((await state(page)).characters.player!.groundPoint).toEqual(initial.groundPoint);
});
