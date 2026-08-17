import { test, type Page } from "@playwright/test";

import { expect, openGame, shoot } from "./harness";
import {
  activateHotspot,
  advance,
  clickCanvas,
  conversation,
  hoverCanvas,
  isRevealed,
  line,
  logicalResolution,
  panPoints,
  type Point,
  response,
  revealedNounLabels,
  revealedPoint,
  scene,
  type TargetKind,
  walkTowards,
} from "./prologue";

/**
 * The harbour Scene package, inspected at actual size.
 *
 * The harbour is the demo's opening Scene and its only panoramic one: 1920
 * points of quay seen through a 1280-point Camera. This spec inspects the
 * package itself — the artwork it loads, the Nouns it exposes, the Appearances
 * it swaps, the foreground occlusion and both Camera edges — rather than the
 * prologue that runs through it. The authored puzzle chain belongs to
 * `harbour-opening.spec.ts`, and the whole route to `acceptance.spec.ts`.
 */

test.setTimeout(180_000);

/**
 * Walks Michele that way until the Camera stops moving, and returns where the
 * reference target ended up on screen.
 *
 * Walking for a fixed number of seconds is what makes a Camera assertion
 * meaningless: it compares two scroll positions that are both still in flight,
 * and passes or fails on how fast the machine happened to be. Instead this
 * keeps asking Michele to walk until one target holds exactly the same screen
 * position across a whole interval, which is only true once the Camera has
 * reached the Scene edge and clamped there.
 */
async function walkToEdge(
  page: Page,
  pan: "left" | "right",
  reference: { readonly kind: TargetKind; readonly nounLabel: string },
): Promise<Point> {
  const step = panPoints[pan];
  let previous: Point | undefined;
  for (let attempt = 0; attempt < 12; attempt += 1) {
    await clickCanvas(page, step);
    await page.waitForTimeout(3_500);
    const current = await revealedPoint(page, reference.kind, reference.nounLabel);
    if (current && previous && current.x === previous.x && current.y === previous.y) return current;
    previous = current;
  }
  throw new Error(`The Camera never settled at the ${pan} edge of the harbour`);
}

test("the harbour package exposes its panoramic default state at actual size", async ({ page }) => {
  const runtimeAssets = new Set<string>();
  page.on("requestfinished", (request) => {
    const path = new URL(request.url()).pathname;
    if (!path.endsWith(".png")) return;
    if (path.includes("/src/scenes/harbour/") || path.includes("/characters/raffaele/")) {
      runtimeAssets.add(path.split("/").at(-1)!);
    }
  });

  const { errors } = await openGame(page);
  const frame = scene(page);
  const canvas = frame.locator("canvas");

  await expect(frame).toHaveAttribute("data-fondale-scene", "harbour");
  expect(await canvas.evaluate((element) => ({
    width: (element as HTMLCanvasElement).width,
    height: (element as HTMLCanvasElement).height,
  }))).toEqual(logicalResolution);

  // Entering the Scene loads its whole package, not only what is on screen:
  // every Appearance the nets and the winch can take, plus Raffaele's single
  // approved Runtime image. That is what keeps the later swaps instantaneous.
  await expect.poll(() => [...runtimeAssets].sort()).toEqual([
    "background.png",
    "gozzo.png",
    "idle.png",
    "nets-covering.png",
    "nets-moved.png",
    "nets-moving.png",
    "winch-installed.png",
    "winch-missing-handle.png",
  ]);

  // Every target the opening Scene offers, and only those: the flask is still
  // under the nets, so its Hotspot is not reachable yet.
  expect([...await revealedNounLabels(page, "hotspot")].sort()).toEqual([
    "Argano senza manovella",
    "Gozzo di Raffaele",
    "Raffaele",
    "Reti da pesca",
    "Zona di lavoro",
  ]);
  expect(await isRevealed(page, "hotspot", "Ampolla d'olio")).toBe(false);
  // Only the cloister is reachable on foot; the gozzo Passage waits on the
  // repaired winch.
  expect([...await revealedNounLabels(page, "passage")]).toEqual([
    "Passaggio verso il chiostro",
  ]);

  expect(errors).toEqual([]);
});

test("both Camera edges are reachable and clamp to the Scene", async ({ page }) => {
  const { errors } = await openGame(page);
  const canvas = scene(page).locator("canvas");

  // Michele opens between the two ends, with the quay's left half on Camera.
  const opening = await canvas.screenshot();
  expect(await revealedPoint(page, "hotspot", "Gozzo di Raffaele")).toBeDefined();
  expect(await revealedPoint(page, "hotspot", "Argano senza manovella")).toBeUndefined();

  // Walking right scrolls the Camera to the far end of the quay, where it
  // clamps: the cloister Passage holds its screen position however much
  // further right the Player asks to go. The winch has come on Camera by then,
  // and the gozzo, 1200 points behind it, has left.
  const rightEdge = await walkToEdge(page, "right", {
    kind: "passage",
    nounLabel: "Passaggio verso il chiostro",
  });
  expect(await revealedPoint(page, "hotspot", "Argano senza manovella")).toBeDefined();
  expect(await revealedPoint(page, "hotspot", "Gozzo di Raffaele")).toBeUndefined();
  await shoot(page, "harbour-right-camera-edge");

  // And back to the opposite edge, which clamps the same way on a different
  // picture entirely: the winch is gone and the gozzo is back.
  const leftEdgePoint = await walkToEdge(page, "left", {
    kind: "hotspot",
    nounLabel: "Gozzo di Raffaele",
  });
  expect(await revealedPoint(page, "hotspot", "Argano senza manovella")).toBeUndefined();
  expect(await revealedPoint(page, "hotspot", "Gozzo di Raffaele")).toEqual(leftEdgePoint);
  expect((await canvas.screenshot()).equals(opening)).toBe(false);
  await shoot(page, "harbour-left-camera-edge");

  expect(errors).toEqual([]);
});

test("the harbour Nouns answer, and pulling the nets swaps their Appearance", async ({ page }) => {
  const { errors } = await openGame(page);
  const canvas = scene(page).locator("canvas");

  // A look-at Noun on Scenery, and the same verb on a background-only Hotspot.
  await activateHotspot(page, "Gozzo di Raffaele", { pan: "left" });
  await expect(response(page)).toContainText("Il gozzo di Raffaele è pronto", { timeout: 15_000 });
  await activateHotspot(page, "Zona di lavoro");
  await expect(response(page)).toContainText("Ceste, corde e attrezzi", { timeout: 15_000 });

  // A Character Hotspot opens a Conversation instead of answering inline.
  await activateHotspot(page, "Raffaele");
  await expect(conversation(page)).toBeVisible({ timeout: 15_000 });
  await conversation(page).getByRole("button", { name: "Leave" }).click();
  await expect(conversation(page)).toHaveCount(0);

  await activateHotspot(page, "Argano senza manovella");
  await expect(response(page)).toContainText("Sul mozzo manca la manovella", { timeout: 15_000 });

  // The nets carry two verbs. The secondary one still describes the bulge.
  const netsPoint = await revealedPoint(page, "hotspot", "Reti da pesca");
  expect(netsPoint).toBeDefined();
  await hoverCanvas(page, netsPoint!);
  await expect(page.locator("[data-fondale-primary-action] [data-fondale-action-text]"))
    .toContainText("Tira");
  await activateHotspot(page, "Reti da pesca", { button: "right" });
  await expect(response(page)).toContainText("rigonfiamento", { timeout: 15_000 });
  const covering = await canvas.screenshot();

  // The primary verb plays the reveal Sequence, which swaps the Appearance for
  // good: the heap is drawn differently, answers to a new label, and the
  // Hotspot it was hiding is reachable.
  await activateHotspot(page, "Reti da pesca");
  await expect(line(page, "michele")).toContainText("reti", { timeout: 15_000 });
  await advance(page);
  expect((await canvas.screenshot()).equals(covering)).toBe(false);
  expect(await isRevealed(page, "hotspot", "Reti da pesca")).toBe(false);
  expect(await isRevealed(page, "hotspot", "Reti da pesca spostate")).toBe(true);
  expect(await isRevealed(page, "hotspot", "Ampolla d'olio")).toBe(true);
  await shoot(page, "harbour-nets-moved");

  expect(errors).toEqual([]);
});

/**
 * Depth sorting is the one Scene property no assertion can settle: whether the
 * right pixels ended up in front is something a person has to look at. Both
 * cases below therefore walk Michele into an occluder and leave a named shot
 * behind; what they assert is only that he got there and that the Scene was
 * redrawn around him.
 */
test("Michele passes behind the foreground rock and behind the quay Scenery", async ({ page }) => {
  const { errors } = await openGame(page);
  const canvas = scene(page).locator("canvas");

  // The quay's near left corner, where the foreground rock stands between the
  // Camera and the water. Michele walks into it rather than over it. The point
  // is kept clear of the Inventory trigger in the bottom-left of the HUD, which
  // would otherwise swallow the click and open a panel over the Scene.
  const opening = await canvas.screenshot();
  await clickCanvas(page, { x: 60, y: 560 });
  await page.waitForTimeout(4_000);
  await expect(page.locator("[data-fondale-inventory-panel]")).toBeHidden();
  expect((await canvas.screenshot()).equals(opening)).toBe(false);
  await shoot(page, "harbour-left-foreground-occlusion");

  // The far end of the quay does the same with Scenery instead of a Background
  // region: the winch and the net heap both stand nearer the Camera than the
  // approach point Michele walks to.
  await walkTowards(page, "passage", "Passaggio verso il chiostro", "right");
  await activateHotspot(page, "Argano senza manovella");
  await expect(response(page)).toContainText("manca la manovella", { timeout: 15_000 });
  await advance(page);
  await page.waitForTimeout(1_500);
  await shoot(page, "harbour-right-scenery-occlusion");

  expect(errors).toEqual([]);
});
