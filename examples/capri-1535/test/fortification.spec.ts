import { test } from "@playwright/test";

import { clickSceneSpace, expect, openGame, shoot } from "./harness";

test.setTimeout(90_000);

async function waitForFixture(page: import("@playwright/test").Page): Promise<void> {
  await page.waitForFunction(() =>
    window.__fortificationTest !== undefined || window.__fortificationError !== undefined
  );
  const error = await page.evaluate(() => window.__fortificationError);
  if (error) throw new Error(error);
}

async function waitForIdle(page: import("@playwright/test").Page): Promise<void> {
  // Clicks that land on the lookout hotspot play authored Lines or the
  // sighting Sequence; drain their presentations before expecting idle.
  for (let step = 0; step < 8; step += 1) {
    const activity = await page.evaluate(() =>
      window.__fortificationTest!.session.createSaveSnapshot().state.activity,
    );
    if (activity === null) return;
    const frame = page.locator("[data-fondale-frame]");
    await frame.focus();
    await page.keyboard.press(".");
    await page.waitForTimeout(300);
  }
  await expect.poll(() => page.evaluate(() =>
    window.__fortificationTest!.session.createSaveSnapshot().state.activity,
  )).toBeNull();
}

async function clickViewport(
  page: import("@playwright/test").Page,
  x: number,
  y: number,
): Promise<void> {
  await clickSceneSpace(page, x, y, { width: 1280, height: 720 });
  await waitForIdle(page);
}

async function playerPoint(page: import("@playwright/test").Page): Promise<{ x: number; y: number }> {
  return page.evaluate(() =>
    window.__fortificationTest!.session.createSaveSnapshot().state.characters.michele!.groundPoint,
  );
}

async function lookoutTop(page: import("@playwright/test").Page): Promise<number> {
  const frame = page.locator("[data-fondale-frame]");
  await frame.focus();
  await page.keyboard.down("Tab");
  const hotspot = frame.locator("[data-fondale-revealed-hotspot]")
    .filter({ hasText: "Belvedere della fortificazione" });
  const points = await hotspot.getAttribute("points");
  await page.keyboard.up("Tab");
  return Number(points!.split(/[ ,]/)[1]);
}

test("the isolated fortification climbs through every vertical Camera band", async ({ page }) => {
  const requestedPackages = new Set<string>();
  page.on("requestfinished", (request) => {
    const path = new URL(request.url()).pathname;
    if (path.includes("/src/scenes/coastal-fortification/") && path.endsWith(".png")) {
      requestedPackages.add(path);
    }
  });

  const { errors } = await openGame(page, "/test/fixtures/fortification.html");
  await waitForFixture(page);
  const frame = page.locator("[data-fondale-frame]");
  const canvas = frame.locator("canvas");

  await expect(frame).toHaveAttribute("data-fondale-scene", "coastalFortification");
  expect(await canvas.evaluate((element) => ({
    width: (element as HTMLCanvasElement).width,
    height: (element as HTMLCanvasElement).height,
  }))).toEqual({ width: 1280, height: 720 });

  const opening = await canvas.screenshot();
  expect(await playerPoint(page)).toEqual({ x: 540, y: 1320 });
  expect(await lookoutTop(page)).toBe(-620);
  await shoot(page, "fortification-lower-band");

  await clickViewport(page, 220, 530);
  await expect.poll(() => playerPoint(page)).toEqual({ x: 220, y: 1250 });
  await shoot(page, "fortification-foreground-occlusion");
  await clickViewport(page, 540, 600);

  await clickViewport(page, 720, 190);
  await expect.poll(() => playerPoint(page)).toMatchObject({ x: 720, y: 910 });
  await page.waitForTimeout(800);
  await shoot(page, "fortification-middle-band");

  await clickViewport(page, 820, 80);
  await page.waitForTimeout(800);
  await clickViewport(page, 850, 80);
  for (let step = 0; step < 6 && (await playerPoint(page)).y > 230; step += 1) {
    await clickViewport(page, 850, 0);
    await page.waitForTimeout(500);
  }
  expect((await playerPoint(page)).y).toBeLessThanOrEqual(230);
  await page.waitForTimeout(1_000);
  expect(await lookoutTop(page)).toBe(100);
  expect((await canvas.screenshot()).equals(opening)).toBe(false);
  await shoot(page, "fortification-upper-band");

  await frame.focus();
  await page.keyboard.down("Tab");
  await expect(frame.locator("[data-fondale-revealed-hotspot]")).toHaveCount(3);
  await page.keyboard.up("Tab");

  // The Scene package is the contract; request order is a network race and
  // shifts as soon as the Project declares more content.
  expect([...requestedPackages].sort()).toEqual([
    expect.stringContaining("/src/scenes/coastal-fortification/background.png"),
    expect.stringContaining("/src/scenes/coastal-fortification/boat-rocking.png"),
    expect.stringContaining("/src/scenes/coastal-fortification/left-foreground.png"),
    expect.stringContaining("/src/scenes/coastal-fortification/right-foreground.png"),
  ]);
  expect(errors).toEqual([]);
});
