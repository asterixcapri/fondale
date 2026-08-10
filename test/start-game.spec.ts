import { expect, test } from "@playwright/test";

test("startGame resolves after drawing a pixel-scaled Scene with letterbox", async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 700 });
  await page.goto("/test/fixtures/start-game.html");
  await page.waitForFunction(() => window.__startTest !== undefined);

  const frame = page.locator("[data-fondale-frame]");
  await expect(frame).toHaveCSS("width", "852px");
  await expect(frame).toHaveCSS("height", "480px");
  await expect(page.locator("#game")).toHaveCSS("background-color", "rgb(36, 27, 47)");
  await expect(frame.locator("canvas")).toHaveCount(1);
});

test("a Game Session owns its target and stop is idempotent and terminal", async ({ page }) => {
  await page.goto("/test/fixtures/start-game.html");
  await page.waitForFunction(() => window.__startTest !== undefined);

  const message = await page.evaluate(async () => {
    const { session, target } = window.__startTest!;
    const occupied = await window.__startTest!.trySecondStart();
    session.stop();
    session.stop();
    return { occupied, children: target.childElementCount, status: session.getStatus() };
  });

  expect(message.children).toBe(0);
  expect(message.status).toBe("stopped");
  expect(message.occupied).toContain("environment.target.occupied");
});

test("asset dimension failure is diagnostic and leaves no partial mount", async ({ page }) => {
  await page.goto("/test/fixtures/invalid-asset.html");
  await page.waitForFunction(() => window.__invalidAsset !== undefined);
  expect(await page.evaluate(() => window.__invalidAsset)).toEqual({
    code: "asset.background.dimensions",
    message: "Background is 426×240; expected 640×360.",
    children: 0,
  });
});

test("WebGL absence rejects startup and cleans the target", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    const callOriginal = original as unknown as (
      this: HTMLCanvasElement,
      contextId: string,
      ...arguments_: unknown[]
    ) => unknown;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      contextId: string,
      ...arguments_: unknown[]
    ) {
      if (contextId === "webgl" || contextId === "webgl2") return null;
      return callOriginal.call(this, contextId, ...arguments_);
    } as typeof original;
  });
  await page.goto("/test/fixtures/start-game.html");
  await page.waitForFunction(() => window.__startError !== undefined);
  expect(await page.evaluate(() => window.__startError)).toBe("environment.webgl.unavailable");
  expect(await page.locator("#game").evaluate((target) => target.childElementCount)).toBe(0);
});
