import { test } from "@playwright/test";

import {
  clickSceneSpace,
  expect,
  hoverSceneSpace,
  openGame,
  shoot,
} from "./harness";

test.setTimeout(90_000);

const sceneSize = { width: 1280, height: 720 } as const;

test("the isolated cloister package exercises its entrance, stage, targets and passage", async ({
  page,
}) => {
  const runtimeAssets = new Set<string>();
  page.on("requestfinished", (request) => {
    const path = new URL(request.url()).pathname;
    if (
      path.endsWith(".png") &&
      (path.includes("/src/scenes/cloister/") || path.includes("/characters/brother-elia/"))
    ) {
      runtimeAssets.add(path.split("/").at(-1) ?? "");
    }
  });

  const { errors } = await openGame(page, "/test/fixtures/cloister.html");
  const frame = page.locator("[data-fondale-frame]");
  const canvas = frame.locator("canvas");

  await expect(frame).toHaveAttribute("data-fondale-scene", "harbour");
  await clickSceneSpace(page, 1200, 600, sceneSize);
  await expect(frame).toHaveAttribute("data-fondale-scene", "cloister", { timeout: 8_000 });
  expect(await canvas.evaluate((element) => ({
    width: (element as HTMLCanvasElement).width,
    height: (element as HTMLCanvasElement).height,
  }))).toEqual(sceneSize);
  await expect.poll(() => [...runtimeAssets].sort()).toEqual([
    "background.png",
    "idle.png",
    "well-seized.png",
  ]);

  const presentations: Buffer[] = [];
  for (const [name, x, y] of [
    ["far", 420, 480],
    ["middle", 620, 570],
    ["near", 790, 675],
  ] as const) {
    await clickSceneSpace(page, x, y, sceneSize);
    await page.waitForTimeout(3_500);
    const presentation = await canvas.screenshot();
    expect(presentations.some((candidate) => candidate.equals(presentation))).toBe(false);
    presentations.push(presentation);
    await shoot(page, `cloister-${name}`);
  }

  await page.keyboard.down("Tab");
  await expect(page.locator("[data-fondale-revealed-hotspot]")).toHaveCount(2);
  await expect(page.locator("[data-fondale-revealed-passage]")).toHaveCount(1);
  await page.keyboard.up("Tab");

  await hoverSceneSpace(page, 1000, 450, sceneSize);
  await expect(page.locator("[data-fondale-primary-action] [data-fondale-action-text]"))
    .toContainText("Guarda");
  await clickSceneSpace(page, 1000, 450, sceneSize);
  await expect(page.locator("[aria-live=polite]")).toContainText("corda è in tensione", {
    timeout: 8_000,
  });

  await hoverSceneSpace(page, 790, 500, sceneSize);
  await expect(page.locator("[data-fondale-primary-action] [data-fondale-action-text]"))
    .toContainText("Parla con");
  await clickSceneSpace(page, 790, 500, sceneSize);
  await expect(page.locator("[aria-live=polite]")).toContainText(
    "Non sembra incline alla conversazione",
    { timeout: 8_000 },
  );

  await clickSceneSpace(page, 200, 500, sceneSize);
  await page.waitForTimeout(6_500);
  await shoot(page, "cloister-left-arcade-occlusion");

  await clickSceneSpace(page, 60, 400, sceneSize);
  await expect(frame).toHaveAttribute("data-fondale-scene", "harbour", { timeout: 12_000 });
  expect(errors).toEqual([]);
});
