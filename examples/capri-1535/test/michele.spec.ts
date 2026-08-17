import { test, type Locator, type Page } from "@playwright/test";

import { expect, openGame, shoot } from "./harness";
import {
  activateHotspot,
  advance,
  clickCanvas,
  conversation,
  inventoryObject,
  leaveConversation,
  line,
  logicalResolution,
  type Point,
  response,
  scene,
} from "./prologue";

/**
 * Michele's motion review.
 *
 * The Player Character is the one Appearance on screen in every Scene, so his
 * walk cycle and his directed Animations are the demo's most visible artwork.
 * This spec drives him the way a Player does and reads back only the drawn
 * canvas: it proves that each required Facing is drawn from its own sheet and
 * that the cycles genuinely animate rather than freezing on one frame.
 *
 * What a machine cannot judge — whether the motion looks right, and how large
 * a Perspective Scale band draws him — is what the named screenshots under
 * `test/shots/` are for; the Engine renders through WebGL, so the suite can
 * compare rendered frames but never measure a sprite. Every assertion here
 * exists so that a broken sheet, a missing Facing or a stalled cycle fails the
 * run instead of quietly waiting for somebody to notice it in a shot.
 */

test.setTimeout(240_000);

/** Every sheet the workwear Appearance has to load to be portrayed at all. */
const workwearSheets = [
  "runtime-workwear-idle-back.png",
  "runtime-workwear-idle-front.png",
  "runtime-workwear-idle-left.png",
  "runtime-workwear-idle-right.png",
  "runtime-workwear-mechanism-use-back.png",
  "runtime-workwear-mechanism-use-front.png",
  "runtime-workwear-mechanism-use-left.png",
  "runtime-workwear-mechanism-use-right.png",
  "runtime-workwear-pick-up-back.png",
  "runtime-workwear-pick-up-front.png",
  "runtime-workwear-pick-up-left.png",
  "runtime-workwear-pick-up-right.png",
  "runtime-workwear-speaking-back.png",
  "runtime-workwear-speaking-front.png",
  "runtime-workwear-speaking-left.png",
  "runtime-workwear-speaking-right.png",
  "runtime-workwear-walking-back.png",
  "runtime-workwear-walking-front.png",
  "runtime-workwear-walking-left.png",
  "runtime-workwear-walking-right.png",
];

/**
 * Proves the presentation is moving, not stuck on one frame.
 *
 * A sheet that fails to decode, a timing block with no frames or a stalled
 * clock all present a perfectly plausible still image. Re-sampling the canvas
 * is the only way to tell that apart from an Animation that is running.
 */
async function expectMoving(canvas: Locator, samples = 6): Promise<void> {
  const first = await canvas.screenshot();
  for (let sample = 0; sample < samples; sample += 1) {
    await canvas.page().waitForTimeout(120);
    if (!(await canvas.screenshot()).equals(first)) return;
  }
  throw new Error("The presentation never changed: no Animation is running");
}

/** Walks Michele to a Logical Resolution point and lets him arrive. */
async function walkTo(page: Page, point: Point): Promise<void> {
  await clickCanvas(page, point);
  await page.waitForTimeout(3_600);
}

/**
 * Collects the frames of one whole looping cycle.
 *
 * Michele's idle runs 16 frames at 8 per second, so sampling for rather more
 * than two seconds sees every frame the loop has. Two cycles drawn from the
 * same sheet, at the same place, over the same Background therefore encode to
 * some byte-identical frame in common; two cycles drawn from different sheets
 * cannot. Comparing whole cycles is what makes that a real test — a single
 * screenshot each would differ merely because the loop had moved on.
 */
async function sampleCycle(canvas: Locator, samples = 20): Promise<readonly Buffer[]> {
  const frames: Buffer[] = [];
  for (let sample = 0; sample < samples; sample += 1) {
    frames.push(await canvas.screenshot());
    await canvas.page().waitForTimeout(130);
  }
  return frames;
}

function sharesAFrame(one: readonly Buffer[], other: readonly Buffer[]): boolean {
  return one.some((frame) => other.some((candidate) => candidate.equals(frame)));
}

test("Michele walks and turns through the four authored Facings", async ({ page }) => {
  const runtimeAssets = new Set<string>();
  page.on("requestfinished", (request) => {
    const fileName = new URL(request.url()).pathname.split("/").at(-1);
    if (fileName?.startsWith("runtime-workwear-")) runtimeAssets.add(fileName);
  });

  const { errors } = await openGame(page);
  const canvas = scene(page).locator("canvas");

  // Actual size: the canvas is the project's Logical Resolution, so every shot
  // below is inspected at the scale the artwork was authored for.
  expect(await canvas.evaluate((element) => ({
    width: (element as HTMLCanvasElement).width,
    height: (element as HTMLCanvasElement).height,
  }))).toEqual(logicalResolution);

  await expect.poll(() => [...runtimeAssets].sort()).toEqual(workwearSheets);

  // Every Facing is reviewed at the same spot on the quay. Michele walks out to
  // a waypoint and back, so he arrives at `meetingPoint` from a different side
  // each time and comes to rest facing that way. Comparing the four arrivals is
  // then a comparison of the artwork alone: he is drawn at the same place, at
  // the same Perspective Scale, over the same pixels of Background. Walking to
  // four *different* places would have compared four different pictures, and a
  // build that drew one sheet for all four Facings would have passed.
  //
  // Every point stays left of the viewport centre, so the Camera never scrolls,
  // and clear of every Hotspot, so a click is a plain walk rather than a
  // Command.
  const meetingPoint = { x: 400, y: 560 } as const;
  await walkTo(page, meetingPoint);

  const cycles = new Map<string, readonly Buffer[]>();
  for (const [facing, waypoint] of [
    ["left", { x: 640, y: 560 }],
    ["right", { x: 160, y: 600 }],
    ["front", { x: 400, y: 510 }],
    ["back", { x: 400, y: 630 }],
  ] as const) {
    await walkTo(page, waypoint);

    // The walk back is where the walk cycle itself is reviewed: it has to be
    // moving, and nothing but the walk may be on screen while it is.
    await clickCanvas(page, meetingPoint);
    await expectMoving(canvas);
    await expect(response(page)).toBeEmpty();
    await expect(page.locator("[data-fondale-line]")).toHaveCount(0);
    await shoot(page, `michele-${facing}-walking`);
    await page.waitForTimeout(3_600);

    // Arrival hands the presentation back to the idle role, facing the way he
    // came. This whole cycle is what the four Facings are compared on.
    const cycle = await sampleCycle(canvas);
    expect(cycle.some((frame) => !frame.equals(cycle[0]!))).toBe(true);
    for (const [other, drawn] of cycles) {
      expect(sharesAFrame(cycle, drawn),
        `${facing} and ${other} are drawn from the same sheet`).toBe(false);
    }
    cycles.set(facing, cycle);
    await shoot(page, `michele-${facing}-idle`);
  }

  expect(errors).toEqual([]);
});

test("Perspective Scale portrays Michele differently at every walkable depth", async ({ page }) => {
  const { errors } = await openGame(page);
  const canvas = scene(page).locator("canvas");

  // The harbour declares three Perspective Scale bands between y 400 and y 650.
  // Michele stands in each in turn, in the same column of quay, and the shots
  // are the review: how large he is drawn is a measurement of his sprite, and
  // the Engine renders through WebGL, so the suite cannot read those pixels
  // back. What is asserted here is the weaker, honest thing — the three
  // presentations are not the same picture — and `michele-far-band-idle` beside
  // `michele-near-band-idle` is what a person compares.
  //
  // The far band doubles as the review of the walkable region's far edge: it is
  // the highest point of quay Michele can stand on in this column, so a region
  // that reached back into the water would put him in the sea in that shot.
  const presentations: Buffer[] = [];
  for (const [band, y] of [["far", 475], ["middle", 545], ["near", 620]] as const) {
    await walkTo(page, { x: 600, y });
    const presentation = await canvas.screenshot();
    expect(presentations.some((candidate) => candidate.equals(presentation))).toBe(false);
    presentations.push(presentation);
    await shoot(page, `michele-${band}-band-idle`);
  }

  expect(errors).toEqual([]);
});

test("the directed Animations play where the prologue asks for them", async ({ page }) => {
  const { errors } = await openGame(page);
  const canvas = scene(page).locator("canvas");

  // Speaking: the role belongs to whoever holds the Line, so both sides of one
  // exchange are reviewed. Michele asks first, in his own words.
  await activateHotspot(page, "Raffaele");
  const open = conversation(page);
  await expect(open.locator("[data-fondale-dialogue-input]")).toBeVisible({ timeout: 15_000 });
  await open.locator("[data-fondale-dialogue-input]").fill("Perché l'argano non gira?");
  await open.getByRole("button", { name: "Ask" }).click();
  await expect(line(page, "michele")).toContainText("Perché l'argano non gira?", {
    timeout: 15_000,
  });
  await expectMoving(canvas);
  await shoot(page, "michele-speaking");
  await advance(page);

  await expect(line(page, "raffaele")).toContainText("manca la manovella", { timeout: 15_000 });
  await expectMoving(canvas);
  await shoot(page, "raffaele-speaking");
  await advance(page);
  await leaveConversation(page);

  // Pick-up: the nets Sequence directs the gesture and waits on its `contact`
  // cue before the nets move, so the Animation is what drives the reveal. The
  // Inventory trigger is the Player-visible sign that the Sequence has taken
  // play — before that Michele is still only walking to the heap.
  const trigger = page.locator("[data-fondale-inventory-trigger]");
  await activateHotspot(page, "Reti da pesca");
  await expect(trigger).toBeHidden({ timeout: 20_000 });
  await shoot(page, "michele-pick-up");
  await expectMoving(canvas);
  await expect(line(page, "michele")).toContainText("reti", { timeout: 15_000 });
  await advance(page);

  // Mechanism-use is directed twice on the canonical route — at the cloister
  // well and at the harbour winch. `harbour-opening.spec.ts` owns the proof
  // that its `contact` cue is what commits each repair; here it is enough that
  // the flask the gesture uncovers really reached Michele's hands.
  await activateHotspot(page, "Ampolla d'olio");
  await expect(inventoryObject(page, "oilFlask")).toHaveCount(1, { timeout: 20_000 });

  expect(errors).toEqual([]);
});
