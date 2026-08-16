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

test("the isolated drifting-boat package boards, explores every clue and reaches the sailor", async ({
  page,
}) => {
  const runtimeAssets = new Set<string>();
  page.on("requestfinished", (request) => {
    const path = new URL(request.url()).pathname;
    if (
      path.endsWith(".png") &&
      (path.includes("/src/scenes/drifting-boat/") || path.includes("/characters/wounded-sailor/"))
    ) {
      runtimeAssets.add(path.split("/").at(-1) ?? "");
    }
  });

  const { errors } = await openGame(page, "/test/fixtures/drifting-boat.html");
  const frame = page.locator("[data-fondale-frame]");
  const canvas = frame.locator("canvas");

  await expect(frame).toHaveAttribute("data-fondale-scene", "fortification");
  await clickSceneSpace(page, 1180, 540, sceneSize);
  await expect(frame).toHaveAttribute("data-fondale-scene", "driftingBoat", { timeout: 12_000 });
  expect(await canvas.evaluate((element) => ({
    width: (element as HTMLCanvasElement).width,
    height: (element as HTMLCanvasElement).height,
  }))).toEqual(sceneSize);
  await expect.poll(() => [...runtimeAssets].sort()).toEqual([
    "background.png",
    "static.png",
  ]);

  const presentations: Buffer[] = [];
  for (const [x, y] of [
    [300, 525],
    [680, 565],
    [840, 605],
  ] as const) {
    await clickSceneSpace(page, x, y, sceneSize);
    await page.waitForTimeout(3_500);
    const presentation = await canvas.screenshot();
    expect(presentations.some((candidate) => candidate.equals(presentation))).toBe(false);
    presentations.push(presentation);
  }

  await page.keyboard.down("Tab");
  await expect(page.locator("[data-fondale-revealed-hotspot]")).toHaveCount(5);
  await expect(page.locator("[data-fondale-revealed-passage]")).toHaveCount(1);
  await page.keyboard.up("Tab");

  for (const [x, y, expected] of [
    [225, 285, "tagliate"],
    [585, 420, "forzato"],
    [820, 360, "abraso"],
    [930, 505, "sangue"],
  ] as const) {
    await hoverSceneSpace(page, x, y, sceneSize);
    await expect(page.locator("[data-fondale-primary-action] [data-fondale-action-text]"))
      .toContainText("Guarda");
    await clickSceneSpace(page, x, y, sceneSize);
    await expect(page.locator("[aria-live=polite]")).toContainText(expected, { timeout: 8_000 });
  }

  await hoverSceneSpace(page, 1110, 435, sceneSize);
  await expect(page.locator("[data-fondale-primary-action] [data-fondale-action-text]"))
    .toContainText("Guarda");
  await clickSceneSpace(page, 1110, 435, sceneSize);
  await expect(page.locator("[aria-live=polite]")).toContainText("Respira", { timeout: 12_000 });

  await shoot(page, "drifting-boat-sailor-handoff");
  expect(errors).toEqual([]);
});
