import { test } from "@playwright/test";

import { clickSceneSpace, expect, openGame, shoot } from "./harness";

test.setTimeout(90_000);

test("Michele walks and turns through four authored Facings at the project Logical Resolution", async ({
  page,
}) => {
  const runtimeAssets = new Set<string>();
  page.on("requestfinished", (request) => {
    const fileName = new URL(request.url()).pathname.split("/").at(-1);
    if (fileName?.startsWith("v3-workwear-")) runtimeAssets.add(fileName);
  });

  const { errors } = await openGame(page);
  const canvas = page.locator("[data-fondale-frame] canvas");
  expect(await canvas.evaluate((element) => ({
    width: (element as HTMLCanvasElement).width,
    height: (element as HTMLCanvasElement).height,
  }))).toEqual({ width: 1280, height: 720 });

  await expect.poll(() => [...runtimeAssets].sort()).toEqual([
    "v3-workwear-idle-back.png",
    "v3-workwear-idle-front.png",
    "v3-workwear-idle-left.png",
    "v3-workwear-idle-right.png",
    "v3-workwear-speaking-back.png",
    "v3-workwear-speaking-front.png",
    "v3-workwear-speaking-left.png",
    "v3-workwear-speaking-right.png",
    "v3-workwear-walking-back.png",
    "v3-workwear-walking-front.png",
    "v3-workwear-walking-left.png",
    "v3-workwear-walking-right.png",
  ]);

  const presentations: Buffer[] = [];
  for (const [facing, x, y] of [
    ["left", 60, 625],
    ["right", 310, 625],
    ["back", 200, 400],
    ["front", 310, 680],
  ] as const) {
    await clickSceneSpace(page, x, y, { width: 1280, height: 720 });
    await page.waitForTimeout(250);
    const presentation = await canvas.screenshot();
    expect(presentations.some((candidate) => candidate.equals(presentation))).toBe(false);
    presentations.push(presentation);
    await shoot(page, `michele-${facing}-walking`);
    await page.waitForTimeout(3_600);
  }

  expect(errors).toEqual([]);
});
