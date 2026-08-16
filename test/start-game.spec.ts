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

test("a Project without dialogue can Continue its automatic browser state", async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 700 });
  await page.goto("/test/fixtures/start-game.html");
  await page.waitForFunction(() => window.__startTest !== undefined);

  await page.reload();
  const startup = page.locator("[data-fondale-continuation]");
  await expect(startup.getByRole("button", { name: "Continue" })).toBeVisible();
  await expect(startup).toHaveCSS("width", "852px");
  await expect(startup).toHaveCSS("height", "480px");
  await expect(startup.locator("canvas")).toHaveCount(0);
  await startup.getByRole("button", { name: "Continue" }).click();
  await page.waitForFunction(() => window.__startTest !== undefined);
  await expect(page.locator("[data-fondale-frame] canvas")).toBeVisible();
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

test("Character Appearances reject different Runtime cell dimensions at startup", async ({
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
    code: "definition.animation.cell-dimensions",
    path: "characters.player.appearances.normal.animations.speaking.sheets.back.frames[0]",
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
    path: "characters.player.appearances.normal.animations.speaking.sheets.left.image",
    children: 0,
  });
});

test("Animation frames outside a decoded Runtime Asset report their authored index", async ({
  page,
}) => {
  await page.goto(
    "/test/fixtures/character-animation-dimensions.html?case=bounds",
  );
  await page.waitForFunction(
    () => window.__characterAnimationDimensions !== undefined,
  );
  expect(
    await page.evaluate(() => window.__characterAnimationDimensions),
  ).toEqual({
    code: "asset.animation-sheet.frame-bounds",
    path: "characters.player.appearances.normal.animations.speaking.sheets.left.frames[0]",
    children: 0,
  });
});

test("an empty Animation Sheet is rejected through startGame", async ({ page }) => {
  await page.goto(
    "/test/fixtures/character-animation-dimensions.html?case=empty",
  );
  await page.waitForFunction(
    () => window.__characterAnimationDimensions !== undefined,
  );
  expect(
    await page.evaluate(() => window.__characterAnimationDimensions),
  ).toEqual({
    code: "definition.animation.frames",
    path: "characters.player.appearances.normal.animations.idle.sheets.back.frames",
    children: 0,
  });
});

for (const invalidCase of [
  {
    name: "a negative frame coordinate",
    query: "coordinate",
    code: "definition.animation.frame-coordinate",
    path: "characters.player.appearances.normal.animations.speaking.sheets.left.frames[0].x",
  },
  {
    name: "a non-positive frame dimension",
    query: "frame-dimension",
    code: "definition.animation.frame-dimension",
    path: "characters.player.appearances.normal.animations.speaking.sheets.left.frames[0].width",
  },
  {
    name: "invalid Animation Timing",
    query: "timing",
    code: "definition.animation.frames-per-second",
    path: "characters.player.appearances.normal.animations.speaking.timing.framesPerSecond",
  },
  {
    name: "an Animation Cue outside the duration",
    query: "cue",
    code: "definition.animation.cue",
    path: "characters.player.appearances.normal.animations.speaking.timing.cues.late",
  },
  {
    name: "unequal directional frame counts",
    query: "unequal-frame-count",
    code: "definition.animation.directional-frame-count",
    path: "characters.player.appearances.normal.animations.speaking.sheets.left.frames[1]",
  },
] as const) {
  test(`${invalidCase.name} is rejected through startGame`, async ({ page }) => {
    await page.goto(
      `/test/fixtures/character-animation-dimensions.html?case=${invalidCase.query}`,
    );
    await page.waitForFunction(
      () => window.__characterAnimationDimensions !== undefined,
    );
    expect(
      await page.evaluate(() => window.__characterAnimationDimensions),
    ).toEqual({
      code: invalidCase.code,
      path: invalidCase.path,
      children: 0,
    });
  });
}

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
    path: "characters.player.appearances.normal.animations.idle.sheets.back",
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
