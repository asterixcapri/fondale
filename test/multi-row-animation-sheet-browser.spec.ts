import { expect, test, type Page } from "@playwright/test";

import type { Facing } from "../src/index";
import { clickLogical, renderedPixel, renderedPixels } from "./browser-support";

/**
 * Multi-row sheets, inspected under a clock the test owns.
 *
 * Every frame of the fixture's sheets is one flat colour, so a single pixel of
 * the rendered Scene names the frame on screen. The difficulty is that reading
 * that pixel is slow — a screenshot, a PNG encode, a decode — while the
 * Animation advances a frame every 500ms. Sampling a running Animation from
 * outside therefore compares one frame's picture with another frame's colour as
 * soon as the machine is busy, which is how these tests used to fail in a full
 * suite run and pass on their own.
 *
 * So the clock is stopped instead. Playwright's fake timers replace
 * `requestAnimationFrame` and `performance.now`, the two things the Engine's
 * frame loop runs on, and `runFor` advances simulated time by an exact amount.
 * Nothing moves while a screenshot is taken, and one `runFor(FRAME_MS)` is
 * exactly one Animation frame — so these assertions are exact rather than
 * probable, on a fast machine and a slow one alike.
 */

const FRAME_COLORS = [
  [255, 0, 0, 255],
  [0, 255, 0, 255],
  [0, 0, 255, 255],
  [255, 255, 0, 255],
  [255, 0, 255, 255],
];
const TICKS_PER_FRAME = 30;
const FRAME_MS = 500;
const ANIMATION_CYCLE_TICKS = FRAME_COLORS.length * TICKS_PER_FRAME;
const BACKGROUND = [32, 32, 32, 255];

/** The frame of a looping five-frame Animation at this tick. */
function frameAt(tick: number): number {
  return Math.floor((tick % ANIMATION_CYCLE_TICKS) / TICKS_PER_FRAME);
}

/** The frame of the non-looping Scenery Animation, which rests on its last. */
function sceneryFrameAt(tick: number): number {
  return Math.min(Math.floor(tick / TICKS_PER_FRAME), FRAME_COLORS.length - 1);
}

async function playerState(page: Page) {
  const state = await page.evaluate(
    () => window.__multiRowAnimationSheet!.session.createSaveSnapshot().state,
  );
  return { tick: state.tick, activity: state.activity, player: state.characters.player! };
}

/**
 * Opens the fixture and stops time.
 *
 * The clock is installed before navigating and paused only once the Game
 * Session exists: timers have to run normally while the page loads, or startup
 * never finishes.
 */
async function openFixture(page: Page): Promise<void> {
  await page.clock.install({ time: new Date("2026-01-01T10:00:00Z") });
  await page.goto("/test/fixtures/multi-row-animation-sheet.html");
  await page.waitForFunction(
    () => window.__multiRowAnimationSheet !== undefined ||
      window.__multiRowAnimationSheetError !== undefined,
  );
  const error = await page.evaluate(() => window.__multiRowAnimationSheetError);
  if (error) throw new Error(error);
  await page.clock.pauseAt(new Date("2026-01-01T10:00:02Z"));
}

/** Advances simulated time until the condition holds, and fails rather than hang. */
async function advanceUntil(
  page: Page,
  expectation: string,
  holds: () => Promise<boolean>,
  stepMs = 100,
  limit = 200,
): Promise<void> {
  for (let step = 0; step < limit; step += 1) {
    if (await holds()) return;
    await page.clock.runFor(stepMs);
  }
  throw new Error(`${expectation} did not happen within ${limit * stepMs}ms of simulated time.`);
}

const OBJECT_POINTS = [{ x: 104, y: 170 }, { x: 91, y: 161 }, { x: 89, y: 159 }];
const SCENERY_POINTS = [{ x: 300, y: 175 }, { x: 296, y: 171 }, { x: 294, y: 169 }];

test("startGame presents a five-frame multi-row Object sheet in row-major order and loops", async ({ page }) => {
  await openFixture(page);

  // Six frames covers the whole sheet and the return to its first. The fifth
  // frame is alone on the second row, so a wrong row-major mapping shows up
  // either there or on the wrap.
  for (let step = 0; step < 6; step += 1) {
    const { tick } = await playerState(page);
    const [cell, anchor, outside] = await renderedPixels(page, OBJECT_POINTS);
    expect(cell, `frame ${frameAt(tick)} of the looping Object sheet`)
      .toEqual(FRAME_COLORS[frameAt(tick)]);
    expect(FRAME_COLORS).toContainEqual(anchor);
    expect(outside).toEqual(BACKGROUND);
    await page.clock.runFor(FRAME_MS);
  }

  // The single-frame Scenery beside it has nothing to advance to.
  expect(await renderedPixel(page, 350, 175)).toEqual([0, 255, 255, 255]);
  await page.clock.runFor(FRAME_MS * 3);
  expect(await renderedPixel(page, 350, 175)).toEqual([0, 255, 255, 255]);
});

test("a non-looping multi-row Scenery sheet stops at its incomplete final row without anchor drift", async ({ page }) => {
  await openFixture(page);

  // Walk the whole Animation and two frames past its end: a non-looping sheet
  // must rest on its last frame rather than wrap or blank.
  for (let step = 0; step < FRAME_COLORS.length + 2; step += 1) {
    const { tick } = await playerState(page);
    const [cell, anchor, outside] = await renderedPixels(page, SCENERY_POINTS);
    expect(cell, `frame ${sceneryFrameAt(tick)} of the non-looping Scenery sheet`)
      .toEqual(FRAME_COLORS[sceneryFrameAt(tick)]);
    expect(FRAME_COLORS).toContainEqual(anchor);
    expect(outside).toEqual(BACKGROUND);
    await page.clock.runFor(FRAME_MS);
  }
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

  /**
   * Checks one presentation, and that its phase still follows the clock.
   *
   * Preserved phase means the Animation stays in step with the session clock
   * rather than restarting on a Facing change, so the cell is compared with the
   * frame its own tick names rather than with a colour read earlier.
   */
  const expectPresentation = async (facing: Facing) => {
    const { player, tick } = await playerState(page);
    expect(player.facing).toBe(facing);
    const { x, y } = player.groundPoint;
    // Five points out of one screenshot: they describe a single rendered frame,
    // so they have to come from a single picture of it.
    const [marker, upper, lower, rightOfCell, belowGround] = await renderedPixels(page, [
      { x: x - 6, y: y - 16 },
      { x: x + 4, y: y - 10 },
      { x: x + 8, y: y - 2 },
      { x: x + 11, y: y - 2 },
      { x, y: y + 1 },
    ]);
    expect(marker).toEqual(markerColors[facing]);
    expect(upper, `${facing} at frame ${frameAt(tick)}`).toEqual(FRAME_COLORS[frameAt(tick)]);
    expect(FRAME_COLORS).toContainEqual(lower);
    expect(rightOfCell).toEqual(BACKGROUND);
    expect(belowGround).toEqual(BACKGROUND);
  };

  await expectPresentation("front");
  for (const [facing, destination] of [
    ["left", { x: 193, y: 180 }],
    ["right", { x: 233, y: 180 }],
    ["back", { x: 233, y: 150 }],
    ["front", { x: 233, y: 190 }],
  ] as const) {
    await clickLogical(page, destination.x, destination.y);
    await advanceUntil(page, `the Character faces ${facing} at rest`, async () => {
      const state = await playerState(page);
      return state.player.facing === facing && state.activity === null;
    });
    await expectPresentation(facing);
  }

  // One more walk, checked on both sides: a Facing change must not restart the
  // Animation, so the phase still follows the clock after it.
  const before = await playerState(page);
  await clickLogical(page, before.player.groundPoint.x - 30, before.player.groundPoint.y);
  await advanceUntil(page, "the Character finishes walking left", async () => {
    const state = await playerState(page);
    return state.player.facing === "left" && state.activity === null;
  });
  await expectPresentation("left");
});
