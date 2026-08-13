import { expect, test } from "@playwright/test";

test("startGame resolves after drawing a pixel-scaled Scene with letterbox", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1000, height: 700 });
  await page.goto("/test/fixtures/start-game.html");
  await page.waitForFunction(() => window.__startTest !== undefined);

  const frame = page.locator("[data-fondale-frame]");
  await expect(frame).toHaveCSS("width", "852px");
  await expect(frame).toHaveCSS("height", "480px");
  await expect(page.locator("#game")).toHaveCSS(
    "background-color",
    "rgb(36, 27, 47)",
  );
  await expect(frame.locator("canvas")).toHaveCount(1);
});

test("the browser frame refits when its display target is resized", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1000, height: 700 });
  await page.goto("/test/fixtures/start-game.html");
  await page.waitForFunction(() => window.__startTest !== undefined);
  const frame = page.locator("[data-fondale-frame]");

  await expect(frame).toHaveCSS("width", "852px");
  await page.setViewportSize({ width: 700, height: 700 });

  await expect(frame).toHaveCSS("width", "426px");
  await expect(frame).toHaveCSS("height", "240px");
});

test("a Game Session owns its target and stop is idempotent and terminal", async ({
  page,
}) => {
  await page.goto("/test/fixtures/start-game.html");
  await page.waitForFunction(() => window.__startTest !== undefined);

  const message = await page.evaluate(async () => {
    const { session, target } = window.__startTest!;
    const occupied = await window.__startTest!.trySecondStart();
    session.stop();
    session.stop();
    return {
      occupied,
      children: target.childElementCount,
      status: session.getStatus(),
    };
  });

  expect(message.children).toBe(0);
  expect(message.status).toBe("stopped");
  expect(message.occupied).toContain("environment.target.occupied");
});

test("stop releases the target for a new independent Game Session", async ({
  page,
}) => {
  await page.goto("/test/fixtures/start-game.html");
  await page.waitForFunction(() => window.__startTest !== undefined);

  const result = await page.evaluate(async () => {
    const fixture = window.__startTest!;
    fixture.session.stop();
    const replacement = await fixture.restart();
    const mountedChildren = fixture.target.childElementCount;
    replacement.stop();
    return {
      mountedChildren,
      replacementStatus: replacement.getStatus(),
      finalChildren: fixture.target.childElementCount,
    };
  });

  expect(result).toEqual({
    mountedChildren: 1,
    replacementStatus: "stopped",
    finalChildren: 0,
  });
});

test("each startGame call captures an isolated project snapshot", async ({
  page,
}) => {
  await page.goto("/test/fixtures/start-game.html");
  await page.waitForFunction(() => window.__startTest !== undefined);

  const result = await page.evaluate(async () => {
    const fixture = window.__startTest!;
    fixture.mutateProject();
    const first =
      fixture.session.createSaveSnapshot().state.variables.changedAfterStart;
    fixture.session.stop();
    const secondSession = await fixture.restart();
    const second =
      secondSession.createSaveSnapshot().state.variables.changedAfterStart;
    secondSession.stop();
    return { first, second };
  });

  expect(result).toEqual({ first: false, second: true });
});

test("asset dimension failure is diagnostic and leaves no partial mount", async ({
  page,
}) => {
  await page.goto("/test/fixtures/invalid-asset.html");
  await page.waitForFunction(() => window.__invalidAsset !== undefined);
  expect(await page.evaluate(() => window.__invalidAsset)).toEqual({
    code: "asset.background.dimensions",
    message: "Background is 426×240; expected 640×360.",
    children: 0,
  });
});

test("Character Animations reject different Runtime cell dimensions at startup", async ({
  page,
}) => {
  await page.goto(
    "/test/fixtures/character-animation-dimensions.html?case=dimensions",
  );
  await page.waitForFunction(
    () => window.__characterAnimationDimensions !== undefined,
  );
  expect(
    await page.evaluate(() => window.__characterAnimationDimensions),
  ).toEqual({
    code: "asset.animation-strip.dimensions",
    path: "characters.player.appearances.normal.animations.speaking.frames.back",
    children: 0,
  });
});

test("Character Facing asset failures report their authored path at startup", async ({
  page,
}) => {
  await page.goto(
    "/test/fixtures/character-animation-dimensions.html?case=invalid-asset",
  );
  await page.waitForFunction(
    () => window.__characterAnimationDimensions !== undefined,
  );
  expect(
    await page.evaluate(() => window.__characterAnimationDimensions),
  ).toEqual({
    code: "asset.load.failed",
    path: "characters.player.appearances.normal.animations.speaking.frames.left",
    children: 0,
  });
});

test("a missing Character Facing reports its authored path at startup", async ({ page }) => {
  await page.goto(
    "/test/fixtures/character-animation-dimensions.html?case=missing-facing",
  );
  await page.waitForFunction(
    () => window.__characterAnimationDimensions !== undefined,
  );
  expect(
    await page.evaluate(() => window.__characterAnimationDimensions),
  ).toEqual({
    code: "definition.animation.facing-presentation",
    path: "characters.player.appearances.normal.animations.idle.frames.back",
    children: 0,
  });
});

test("Character Visual Anchors reject coordinates outside Runtime cells at startup", async ({
  page,
}) => {
  await page.goto(
    "/test/fixtures/character-animation-dimensions.html?case=anchor",
  );
  await page.waitForFunction(
    () => window.__characterAnimationDimensions !== undefined,
  );
  expect(
    await page.evaluate(() => window.__characterAnimationDimensions),
  ).toEqual({
    code: "asset.visual-anchor.bounds",
    path: "characters.player.appearances.normal.visualAnchor",
    children: 0,
  });
});

test("WebGL absence rejects startup and cleans the target", async ({
  page,
}) => {
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
  expect(await page.evaluate(() => window.__startError)).toBe(
    "environment.webgl.unavailable",
  );
  expect(
    await page.locator("#game").evaluate((target) => target.childElementCount),
  ).toBe(0);
});

test("environment checks precede Runtime Asset loading", async ({ page }) => {
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
  await page.goto("/test/fixtures/invalid-asset.html");
  await page.waitForFunction(() => window.__invalidAsset !== undefined);
  expect(await page.evaluate(() => window.__invalidAsset)).toEqual({
    code: "environment.webgl.unavailable",
    message:
      "Fondale requires WebGL in the current Chrome desktop Support Baseline.",
    children: 0,
  });
});
