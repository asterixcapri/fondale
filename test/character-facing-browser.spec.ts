import { expect, test, type Page } from "@playwright/test";

import { clickLogical, renderedPixel } from "./browser-support";

type Facing = "left" | "right" | "front" | "back";

async function state(page: Page) {
  return page.evaluate(() => window.__characterFacing!.session.createSaveSnapshot().state);
}

async function openFixture(page: Page, query = ""): Promise<void> {
  await page.goto(`/test/fixtures/character-facing.html${query}`);
  await page.waitForFunction(() => window.__characterFacing !== undefined || window.__characterFacingError !== undefined);
  const error = await page.evaluate(() => window.__characterFacingError);
  if (error) throw new Error(error);
}

async function expectFacingPresentation(page: Page, facing: Facing): Promise<void> {
  const current = await state(page);
  const character = current.characters.player!;
  expect(character.facing).toBe(facing);
  const { x, y } = character.groundPoint;
  const probes = {
    left: { marker: [x - 4, y - 5], fill: [x + 3, y - 5], markerColor: [255, 0, 0, 255], fillColor: [0, 255, 0, 255] },
    right: { marker: [x + 3, y - 5], fill: [x - 4, y - 5], markerColor: [255, 255, 0, 255], fillColor: [0, 0, 255, 255] },
    front: { marker: [x - 4, y - 9], fill: [x + 3, y - 9], markerColor: [0, 255, 255, 255], fillColor: [255, 0, 255, 255] },
    back: { marker: [x + 3, y - 2], fill: [x - 4, y - 2], markerColor: [255, 255, 255, 255], fillColor: [255, 128, 0, 255] },
  } satisfies Record<Facing, {
    marker: [number, number]; fill: [number, number]; markerColor: number[]; fillColor: number[];
  }>;
  const probe = probes[facing];
  expect(await renderedPixel(page, ...probe.marker)).toEqual(probe.markerColor);
  expect(await renderedPixel(page, ...probe.fill)).toEqual(probe.fillColor);
}

test("startGame selects each authored Character presentation without reflection or anchor drift", async ({ page }) => {
  await openFixture(page);

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
  await openFixture(page, "?directed");

  const initial = (await state(page)).characters.player!;
  await clickLogical(page, 300, 180);
  await expect.poll(async () => {
    const activity = (await state(page)).activity;
    return activity?.type === "sequence" && activity.active?.kind === "direction";
  }).toBe(true);
  const started = await state(page);
  const startedTick = started.activity?.type === "sequence" &&
      started.activity.active?.kind === "direction"
    ? started.tick - started.activity.active.elapsedTicks
    : undefined;
  expect(startedTick).toBeDefined();
  await expect.poll(
    async () => (await state(page)).characters.player?.facing,
    { timeout: 7_000 },
  ).toBe("right");
  await expect.poll(async () => {
    const current = await state(page);
    const character = current.characters.player!;
    const color = await renderedPixel(
      page,
      character.groundPoint.x - 4,
      character.groundPoint.y - 5,
    );
    return current.activity?.type === "sequence" &&
      character.facing === "right" &&
      JSON.stringify(color) !== JSON.stringify([0, 0, 255, 255]);
  }).toBe(true);

  const during = await state(page);
  const player = during.characters.player!;
  expect(player.groundPoint).toEqual({ x: 223, y: 180 });
  expect(await renderedPixel(page, player.groundPoint.x + 3, player.groundPoint.y - 5)).toEqual([255, 255, 0, 255]);

  await expect.poll(async () => {
    const current = await state(page);
    const elapsed = current.activity?.type === "sequence" &&
        current.activity.active?.kind === "direction"
      ? current.activity.active.elapsedTicks
      : undefined;
    if (elapsed === undefined || elapsed < 360 || elapsed >= 480) return false;
    const character = current.characters.player!;
    return JSON.stringify(await renderedPixel(
      page,
      character.groundPoint.x - 4,
      character.groundPoint.y - 5,
    )) === JSON.stringify([0, 0, 255, 255]);
  }, { timeout: 10_000, intervals: [10] }).toBe(true);

  await expect.poll(async () => (await state(page)).activity, { timeout: 12_000 }).toBeNull();
  const completed = await state(page);
  expect(completed.characters.player!.groundPoint).toEqual({ x: 223, y: 180 });
  expect(completed.tick - startedTick!).toBeGreaterThanOrEqual(540);
  expect(initial.groundPoint).toEqual({ x: 213, y: 180 });
});
