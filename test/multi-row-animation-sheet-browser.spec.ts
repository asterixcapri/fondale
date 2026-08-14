import { expect, test, type Page } from "@playwright/test";

import type { Facing } from "../src/index";
import { clickLogical, renderedPixel } from "./browser-support";

const FRAME_COLORS = [
  [255, 0, 0, 255],
  [0, 255, 0, 255],
  [0, 0, 255, 255],
  [255, 255, 0, 255],
  [255, 0, 255, 255],
];
const TICKS_PER_FRAME = 30;
const ANIMATION_CYCLE_TICKS = FRAME_COLORS.length * TICKS_PER_FRAME;

function isFrameWindow(
  tick: number,
  frameIndex: number,
  firstOffset: number,
  lastOffset: number,
): boolean {
  const phaseTick = tick % ANIMATION_CYCLE_TICKS;
  return Math.floor(phaseTick / TICKS_PER_FRAME) === frameIndex &&
    phaseTick % TICKS_PER_FRAME >= firstOffset &&
    phaseTick % TICKS_PER_FRAME <= lastOffset;
}

async function playerState(page: Page) {
  const state = await page.evaluate(
    () => window.__multiRowAnimationSheet!.session.createSaveSnapshot().state,
  );
  return { tick: state.tick, activity: state.activity, player: state.characters.player! };
}

async function openFixture(page: Page): Promise<void> {
  await page.goto("/test/fixtures/multi-row-animation-sheet.html");
  await page.waitForFunction(
    () => window.__multiRowAnimationSheet !== undefined ||
      window.__multiRowAnimationSheetError !== undefined,
  );
  const error = await page.evaluate(() => window.__multiRowAnimationSheetError);
  if (error) throw new Error(error);
}

async function expectLoopingObjectFrame(page: Page, frameIndex: number): Promise<void> {
  await expect.poll(async () => {
    return isFrameWindow((await playerState(page)).tick, frameIndex, 8, 16);
  }, { timeout: 4_000, intervals: [10] }).toBe(true);
  expect(await renderedPixel(page, 104, 170)).toEqual(FRAME_COLORS[frameIndex]);
}

test("startGame presents a five-frame multi-row Object sheet in row-major order and loops", async ({ page }) => {
  await openFixture(page);

  for (const frameIndex of [0, 1, 2, 3, 4, 0]) {
    await expectLoopingObjectFrame(page, frameIndex);
    expect(FRAME_COLORS).toContainEqual(await renderedPixel(page, 91, 161));
    expect(await renderedPixel(page, 89, 159)).toEqual([32, 32, 32, 255]);
  }

  await expect.poll(() => renderedPixel(page, 350, 175)).toEqual([0, 255, 255, 255]);
  await page.waitForTimeout(600);
  expect(await renderedPixel(page, 350, 175)).toEqual([0, 255, 255, 255]);
});

test("a non-looping multi-row Scenery sheet stops at its incomplete final row without anchor drift", async ({ page }) => {
  await openFixture(page);

  const observed: number[][] = [];
  await expect.poll(async () => {
    const color = await renderedPixel(page, 300, 175);
    if (JSON.stringify(color) !== JSON.stringify(observed.at(-1))) observed.push(color);
    expect(FRAME_COLORS).toContainEqual(await renderedPixel(page, 296, 171));
    expect(await renderedPixel(page, 294, 169)).toEqual([32, 32, 32, 255]);
    return observed;
  }, { timeout: 5_000, intervals: [25] }).toEqual(FRAME_COLORS);

  await page.waitForTimeout(750);
  expect(await renderedPixel(page, 300, 175)).toEqual(FRAME_COLORS.at(-1));
});

test("Character multi-row sheets preserve phase across all authored Facings, anchors, and Perspective Scale", async ({ page }) => {
  await openFixture(page);

  const markerColors = {
    front: [0, 255, 255, 255],
    left: [255, 255, 255, 255],
    right: [255, 128, 0, 255],
    back: [128, 128, 128, 255],
  } satisfies Record<Facing, number[]>;
  const expectPresentation = async (facing: Facing) => {
    const { player } = await playerState(page);
    expect(player.facing).toBe(facing);
    const { x, y } = player.groundPoint;
    expect(await renderedPixel(page, x - 6, y - 16)).toEqual(markerColors[facing]);
    expect(FRAME_COLORS).toContainEqual(await renderedPixel(page, x + 4, y - 10));
    expect(FRAME_COLORS).toContainEqual(await renderedPixel(page, x + 8, y - 2));
    expect(await renderedPixel(page, x + 11, y - 2)).toEqual([32, 32, 32, 255]);
    expect(await renderedPixel(page, x, y + 1)).toEqual([32, 32, 32, 255]);
  };

  await expectPresentation("front");
  for (const [facing, destination] of [
    ["left", { x: 193, y: 180 }],
    ["right", { x: 233, y: 180 }],
    ["back", { x: 233, y: 150 }],
    ["front", { x: 233, y: 190 }],
  ] as const) {
    await clickLogical(page, destination.x, destination.y);
    await expect.poll(async () => (await playerState(page)).player.facing).toBe(facing);
    await expect.poll(async () => (await playerState(page)).activity).toBeNull();
    await expectPresentation(facing);
  }

  await expect.poll(async () => {
    return isFrameWindow((await playerState(page)).tick, 2, 5, 10);
  }, {
    timeout: 6_000,
    intervals: [10],
  }).toBe(true);
  const before = await playerState(page);
  const phaseBefore = await renderedPixel(
    page,
    before.player.groundPoint.x + 4,
    before.player.groundPoint.y - 10,
  );
  expect(phaseBefore).toEqual(FRAME_COLORS[2]);
  await clickLogical(page, before.player.groundPoint.x - 30, before.player.groundPoint.y);
  await expect.poll(async () => (await playerState(page)).player.facing).toBe("left");
  await expect.poll(async () => (await playerState(page)).activity).toBeNull();
  const during = await playerState(page);
  expect(await renderedPixel(
    page,
    during.player.groundPoint.x + 4,
    during.player.groundPoint.y - 10,
  )).toEqual(phaseBefore);
});
