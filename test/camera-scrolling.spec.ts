import { expect, test, type Page } from "@playwright/test";

async function clickViewport(page: Page, x: number, y: number): Promise<void> {
  const canvas = page.locator("[data-fondale-frame] canvas");
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Camera fixture canvas is not visible.");
  await page.mouse.click(box.x + (x / 426) * box.width, box.y + (y / 240) * box.height);
}

async function canvasPoint(page: Page, x: number, y: number): Promise<{ x: number; y: number }> {
  const box = await page.locator("[data-fondale-frame] canvas").boundingBox();
  if (!box) throw new Error("Camera fixture canvas is not visible.");
  return {
    x: box.x + (x / 426) * box.width,
    y: box.y + (y / 240) * box.height,
  };
}

async function playerPoint(page: Page): Promise<{ x: number; y: number }> {
  return page.evaluate(() =>
    window.__cameraTest!.session.createSaveSnapshot().state.characters.player!.groundPoint,
  );
}

async function waitForCameraFixture(page: Page): Promise<void> {
  await page.waitForFunction(() => window.__cameraTest !== undefined || window.__cameraError !== undefined);
  const error = await page.evaluate(() => window.__cameraError);
  if (error) throw new Error(error);
}

async function waitForIdle(page: Page): Promise<void> {
  await expect.poll(async () => page.evaluate(() =>
    window.__cameraTest!.session.createSaveSnapshot().state.activity,
  )).toBeNull();
}

async function moveViewport(page: Page, x: number, y: number): Promise<void> {
  const before = await playerPoint(page);
  await clickViewport(page, x, y);
  await expect.poll(async () => playerPoint(page)).not.toEqual(before);
  await waitForIdle(page);
}

test("an oversized Scene starts framed around the Player and projects repeated clicks", async ({
  page,
}) => {
  await page.goto("/test/fixtures/camera-scrolling.html");
  await waitForCameraFixture(page);

  const canvas = page.locator("[data-fondale-frame] canvas");
  const initial = await canvas.screenshot();
  await clickViewport(page, 380, 80);
  await expect.poll(async () => (await playerPoint(page)).x).toBeGreaterThan(370);
  await page.waitForTimeout(500);
  const scrolled = await canvas.screenshot();
  expect(scrolled.equals(initial)).toBe(false);

  await clickViewport(page, 380, 40);
  await expect.poll(async () => (await playerPoint(page)).x).toBeGreaterThan(450);
  await expect.poll(async () => (await playerPoint(page)).y).toBeLessThan(820);
});

test("Camera presentation does not add fields to a Save Snapshot", async ({ page }) => {
  await page.goto("/test/fixtures/camera-scrolling.html");
  await waitForCameraFixture(page);
  await clickViewport(page, 380, 80);
  await expect.poll(async () => (await playerPoint(page)).x).toBeGreaterThan(370);

  const stateKeys = await page.evaluate(() =>
    Object.keys(window.__cameraTest!.session.createSaveSnapshot().state).sort(),
  );
  expect(stateKeys).toEqual([
    "activity", "characters", "command", "currentScene", "inventory",
    "objects", "scenery", "tick", "variables",
  ]);
});

test("Camera presentation accelerates monotonically on whole logical pixels", async ({ page }) => {
  await page.goto("/test/fixtures/camera-scrolling.html");
  await waitForCameraFixture(page);
  const frame = page.locator("[data-fondale-frame]");
  await frame.focus();
  await page.keyboard.down("Tab");
  await clickViewport(page, 380, 80);
  const samples = await page.evaluate(async () => {
    const positions: number[] = [];
    for (let frameIndex = 0; frameIndex < 80; frameIndex += 1) {
      await new Promise(requestAnimationFrame);
      const points = document.querySelector('[data-fondale-revealed-hotspot="0"]')
        ?.getAttribute("points") ?? "";
      positions.push(Number(points.split(/[ ,]/)[0]));
    }
    return positions;
  });
  await page.keyboard.up("Tab");

  expect(samples.every(Number.isInteger)).toBe(true);
  const movement = samples.slice(1).map((value, index) => samples[index]! - value);
  expect(movement.every((amount) => amount >= 0)).toBe(true);
  const positive = movement.filter((amount) => amount > 0);
  expect(positive.length).toBeGreaterThan(3);
  expect(Math.max(...positive)).toBeGreaterThan(positive[0]!);
});

test("double click uses Scene Space after Camera scrolling", async ({ page }) => {
  await page.goto("/test/fixtures/camera-scrolling.html");
  await waitForCameraFixture(page);
  await moveViewport(page, 380, 80);
  await page.waitForTimeout(700);
  const before = await playerPoint(page);
  const target = await canvasPoint(page, 400, 110);
  await page.mouse.dblclick(target.x, target.y);
  await expect.poll(async () => (await playerPoint(page)).x).toBeGreaterThan(before.x + 100);
  await waitForIdle(page);
});

test("an oversized Scene without a Player Character remains at origin", async ({ page }) => {
  await page.goto("/test/fixtures/camera-scrolling.html?noPlayer");
  await waitForCameraFixture(page);
  const frame = page.locator("[data-fondale-frame]");
  await frame.focus();
  await page.keyboard.down("Tab");
  const points = await frame.locator('[data-fondale-revealed-hotspot="0"]').getAttribute("points");
  await page.keyboard.up("Tab");
  expect(points?.startsWith("480,760")).toBe(true);
  const canvas = frame.locator("canvas");
  const initial = await canvas.screenshot();
  await page.waitForTimeout(300);
  expect((await canvas.screenshot()).equals(initial)).toBe(true);
});

test("revealed world geometry and contextual input share the scrolled projection", async ({
  page,
}) => {
  await page.goto("/test/fixtures/camera-scrolling.html");
  await waitForCameraFixture(page);
  await clickViewport(page, 380, 80);
  await expect.poll(async () => (await playerPoint(page)).x).toBeGreaterThan(370);
  await page.waitForTimeout(700);
  await clickViewport(page, 380, 40);
  await expect.poll(async () => (await playerPoint(page)).x).toBeGreaterThan(450);
  await page.waitForTimeout(700);

  const frame = page.locator("[data-fondale-frame]");
  await frame.focus();
  await page.keyboard.down("Tab");
  const polygon = frame.locator('[data-fondale-revealed-hotspot="0"]');
  await expect(polygon).toBeVisible();
  const points = (await polygon.getAttribute("points"))!
    .split(" ")
    .map((pair) => pair.split(",").map(Number));
  expect(points.every(([x, y]) => x! >= 0 && x! <= 426 && y! >= 0 && y! <= 240)).toBe(true);

  const center = points.reduce(
    (sum, [x, y]) => ({ x: sum.x + x! / points.length, y: sum.y + y! / points.length }),
    { x: 0, y: 0 },
  );
  const canvas = frame.locator("canvas");
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Camera fixture canvas is not visible.");
  await page.keyboard.up("Tab");
  await page.mouse.move(
    box.x + (center.x / 426) * box.width,
    box.y + (center.y / 240) * box.height,
  );
  await expect(frame.locator("[data-fondale-primary-action]")).toContainText(
    "Look at Fortification marker",
  );
  const preview = await frame.locator("[data-fondale-command-preview]").boundingBox();
  expect(preview?.x).toBeGreaterThanOrEqual(box.x);
  expect(preview?.x).toBeLessThan(box.x + box.width);
  await page.mouse.click(
    box.x + (center.x / 426) * box.width,
    box.y + (center.y / 240) * box.height,
  );
  await expect(frame.locator("[aria-live=polite]")).toHaveText(
    "The projected marker is aligned.",
  );
});

test("Camera clamps both Scene Size axes and restoration snaps before presentation", async ({
  page,
}) => {
  await page.goto("/test/fixtures/camera-scrolling.html");
  await waitForCameraFixture(page);

  await moveViewport(page, 213, 239);
  await page.waitForTimeout(500);
  await moveViewport(page, 213, 0);
  expect((await playerPoint(page)).y).toBeCloseTo(752, 0);

  for (let step = 0; step < 9 && (await playerPoint(page)).x < 1500; step += 1) {
    await moveViewport(page, 425, 98);
    await page.waitForTimeout(350);
  }
  await page.waitForTimeout(800);
  await moveViewport(page, 0, 98);
  expect((await playerPoint(page)).x).toBeCloseTo(1160, 0);

  await page.waitForTimeout(800);
  await page.evaluate(() => window.__cameraTest!.restart({ x: 1400, y: 200 }));
  await expect.poll(async () => playerPoint(page)).toEqual({ x: 1400, y: 200 });
  const canvas = page.locator("[data-fondale-frame] canvas");
  const restored = await canvas.screenshot();
  await page.waitForTimeout(300);
  const settled = await canvas.screenshot();
  expect(settled.equals(restored)).toBe(true);
});

test("speech stays with a visible non-player speaker without taking Camera control", async ({
  page,
}) => {
  await page.goto("/test/fixtures/camera-scrolling.html");
  await waitForCameraFixture(page);
  await moveViewport(page, 380, 80);
  await page.waitForTimeout(700);
  await moveViewport(page, 380, 40);
  await page.waitForTimeout(700);

  const frame = page.locator("[data-fondale-frame]");
  await frame.focus();
  await page.keyboard.down("Tab");
  const points = (await frame.locator('[data-fondale-revealed-hotspot="0"]').getAttribute("points"))!
    .split(" ")
    .map((pair) => pair.split(",").map(Number));
  await page.keyboard.up("Tab");
  const center = points.reduce(
    (sum, [x, y]) => ({ x: sum.x + x! / points.length, y: sum.y + y! / points.length }),
    { x: 0, y: 0 },
  );
  const canvas = frame.locator("canvas");
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Camera fixture canvas is not visible.");
  await page.mouse.click(
    box.x + (center.x / 426) * box.width,
    box.y + (center.y / 240) * box.height,
    { button: "right" },
  );
  const line = frame.locator("[data-fondale-line]");
  await expect(line).toHaveText("The Camera still follows the Player.");
  const lineBounds = await line.boundingBox();
  expect(lineBounds?.x).toBeGreaterThanOrEqual(box.x);
  expect(lineBounds?.y).toBeGreaterThanOrEqual(box.y);
  expect((lineBounds?.x ?? 0) + (lineBounds?.width ?? 0)).toBeLessThanOrEqual(box.x + box.width);
  await page.waitForTimeout(1_000);
  const settledWithSpeech = await canvas.screenshot();
  await page.waitForTimeout(300);
  expect((await canvas.screenshot()).equals(settledWithSpeech)).toBe(true);
});
