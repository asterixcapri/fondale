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
  response,
  scene,
} from "./prologue";

/**
 * Michele's motion review.
 *
 * The Player Character is the one Appearance on screen in every Scene, so his
 * walk cycle and his directed Animations are the demo's most visible artwork.
 * This spec drives him the way a Player does and reads back only the drawn
 * canvas: it proves that each required Facing is portrayed differently, that
 * the cycles genuinely animate rather than freezing on one frame, and that
 * Perspective Scale changes the portrayal with depth.
 *
 * What a machine cannot judge — whether the motion looks right — is what the
 * named screenshots under `test/shots/` are for. Every assertion here exists so
 * that a broken sheet, a missing Facing or a stalled cycle fails the run
 * instead of quietly waiting for somebody to notice it in a shot.
 */

test.setTimeout(120_000);

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

/** Walks Michele to a Scene Space point and lets him arrive. */
async function walkTo(page: Page, x: number, y: number): Promise<void> {
  await clickCanvas(page, { x, y });
  await page.waitForTimeout(3_600);
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

  // Each Facing is portrayed by its own artwork, and each walk cycle runs. The
  // destinations are chained so that one axis dominates every leg — Michele
  // opens at (330, 625) — and all four stay on open quay, clear of every
  // Hotspot: a click that lands on one walks to its approach point and answers
  // with a Command instead of the plain walk this case is reviewing.
  const presentations: Buffer[] = [];
  for (const [facing, x, y] of [
    ["right", 600, 615],
    ["back", 615, 480],
    ["front", 630, 615],
    ["left", 150, 645],
  ] as const) {
    await clickCanvas(page, { x, y });
    await expectMoving(canvas);
    // Nothing but the walk is on screen, so the frames that just changed are
    // the walk cycle and not a Command's answer arriving over it.
    await expect(response(page)).toBeEmpty();
    await expect(page.locator("[data-fondale-line]")).toHaveCount(0);
    const presentation = await canvas.screenshot();
    expect(presentations.some((candidate) => candidate.equals(presentation))).toBe(false);
    presentations.push(presentation);
    await shoot(page, `michele-${facing}-walking`);
    await page.waitForTimeout(3_600);
  }

  // Arrival hands the presentation back to the idle role, which keeps breathing.
  const arrived = await canvas.screenshot();
  expect(presentations.some((candidate) => candidate.equals(arrived))).toBe(false);
  await expectMoving(canvas);
  await shoot(page, "michele-front-idle");

  expect(errors).toEqual([]);
});

test("Perspective Scale portrays Michele differently at every walkable depth", async ({ page }) => {
  const { errors } = await openGame(page);
  const canvas = scene(page).locator("canvas");

  // The harbour declares three Perspective Scale bands between y 400 and y 650.
  // Michele stands in each in turn, on the same stretch of quay, so the only
  // thing that changes between the shots is how large he is drawn. The column
  // is chosen so that the Camera never scrolls: at x 600 Michele stays left of
  // the viewport centre, and every band is dry quay there.
  const presentations: Buffer[] = [];
  for (const [band, y] of [["far", 475], ["middle", 545], ["near", 620]] as const) {
    await walkTo(page, 600, y);
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
