import { type Locator, type Page } from "@playwright/test";

import { expect } from "./harness";

/**
 * The one place the browser suite knows how a Player drives the prologue.
 *
 * Every journey spec used to carry its own copy of the same canvas clicking,
 * hotspot hunting and puzzle chain. Four copies drifted apart, so a fix to one
 * flaky wait never reached the other three. This module owns the interaction
 * vocabulary (`activateHotspot`, `advance`, `selectInventoryObject`) and the
 * canonical route milestones (`acceptHarbourJob`, `recoverHandle`,
 * `repairWinch`, `reachDriftingBoat`), and the specs express only what they are
 * proving.
 *
 * Everything here goes through what a Player can see and touch: the rendered
 * canvas, the revealed-target overlay and the HUD. Nothing reads Game State.
 */

/** The Game Project's Logical Resolution; every canvas point is expressed in it. */
export const logicalResolution = { width: 1280, height: 720 } as const;

export interface Point {
  readonly x: number;
  readonly y: number;
}

export type TargetKind = "hotspot" | "passage";

/** Clicks one Logical Resolution point through the visible canvas. */
export async function clickCanvas(
  page: Page,
  point: Point,
  button: "left" | "right" = "left",
): Promise<void> {
  const bounds = await canvasBounds(page);
  await page.mouse.click(
    bounds.x + (point.x / logicalResolution.width) * bounds.width,
    bounds.y + (point.y / logicalResolution.height) * bounds.height,
    { button },
  );
}

/** Hovers one Logical Resolution point through the visible canvas. */
export async function hoverCanvas(page: Page, point: Point): Promise<void> {
  const bounds = await canvasBounds(page);
  await page.mouse.move(
    bounds.x + (point.x / logicalResolution.width) * bounds.width,
    bounds.y + (point.y / logicalResolution.height) * bounds.height,
  );
}

export async function canvasBounds(page: Page): Promise<{
  x: number;
  y: number;
  width: number;
  height: number;
}> {
  const bounds = await page.locator("[data-fondale-frame] canvas").boundingBox();
  if (!bounds) throw new Error("Fondale canvas is not visible");
  return bounds;
}

function polygonCenter(points: string): Point {
  const coordinates = points.split(" ").map((pair) => pair.split(",").map(Number));
  const xs = coordinates.map(([x]) => x!);
  const ys = coordinates.map(([, y]) => y!);
  return {
    x: (Math.min(...xs) + Math.max(...xs)) / 2,
    y: (Math.min(...ys) + Math.max(...ys)) / 2,
  };
}

/**
 * Holds the hotspot-reveal key while reading the overlay.
 *
 * The reveal is a Player affordance, not a test hook: the same Tab press shows
 * a human where the reachable targets are. Reads are funnelled through here so
 * that no spec can leave the key stuck down after an assertion fails.
 */
async function whileRevealed<Value>(
  page: Page,
  read: (overlay: Locator) => Promise<Value>,
): Promise<Value> {
  const frame = page.locator("[data-fondale-frame]");
  await frame.focus();
  await page.keyboard.down("Tab");
  try {
    return await read(frame);
  } finally {
    await page.keyboard.up("Tab");
  }
}

function revealedSelector(kind: TargetKind): string {
  return kind === "hotspot"
    ? "[data-fondale-revealed-hotspot]"
    : "[data-fondale-revealed-passage]";
}

interface RevealedTarget {
  /** The Noun Label the overlay advertises for it. */
  readonly nounLabel: string;
  /** Its centre, in Logical Resolution points of the current viewport. */
  readonly centre: Point;
}

/** Everything of that kind the reveal overlay currently advertises. */
async function revealedTargets(
  page: Page,
  kind: TargetKind,
): Promise<readonly RevealedTarget[]> {
  return whileRevealed(page, async (frame) => {
    const revealed = frame.locator(revealedSelector(kind));
    const targets: RevealedTarget[] = [];
    for (let index = 0; index < await revealed.count(); index += 1) {
      const element = revealed.nth(index);
      targets.push({
        nounLabel: await element.locator("title").textContent() ?? "",
        centre: polygonCenter(await element.getAttribute("points") ?? ""),
      });
    }
    return targets;
  });
}

/** The centre of a revealed target, or `undefined` while it is off-Camera. */
export async function revealedPoint(
  page: Page,
  kind: TargetKind,
  nounLabel: string,
): Promise<Point | undefined> {
  const found = (await revealedTargets(page, kind))
    .find((target) => target.nounLabel === nounLabel);
  if (!found) return undefined;
  const { centre } = found;
  const inViewport = centre.x >= 16 && centre.x <= logicalResolution.width - 16 &&
    centre.y >= 16 && centre.y <= logicalResolution.height - 16;
  return inViewport ? centre : undefined;
}

/**
 * Whether the target is reachable at all, wherever the Camera happens to be.
 *
 * This is the honest way to ask whether something exists: `revealedPoint` also
 * returns `undefined` for a target that is merely off-Camera, so a spec that
 * reads it to prove absence can pass without proving anything.
 */
export async function isRevealed(
  page: Page,
  kind: TargetKind,
  nounLabel: string,
): Promise<boolean> {
  return (await revealedTargets(page, kind))
    .some((target) => target.nounLabel === nounLabel);
}

/** Every revealed Noun Label of that kind in the current Scene. */
export async function revealedNounLabels(
  page: Page,
  kind: TargetKind,
): Promise<readonly string[]> {
  return (await revealedTargets(page, kind)).map(({ nounLabel }) => nounLabel);
}

interface ActivationOptions {
  /** Which Scene edge to walk towards while the target is off-Camera. */
  readonly pan?: "left" | "right" | "up" | "down";
  readonly attempts?: number;
  /** The secondary button asks for the Noun's secondary verb. */
  readonly button?: "left" | "right";
}

export const panPoints: Readonly<Record<"left" | "right" | "up" | "down", Point>> = {
  left: { x: 80, y: 650 },
  right: { x: 1_200, y: 650 },
  up: { x: 560, y: 120 },
  down: { x: 400, y: 660 },
};

/**
 * Walks towards `pan` until the target is on Camera, then clicks it.
 *
 * The retry is what a Player does: the Camera follows Michele, so a target
 * outside the viewport is reached by walking that way rather than by guessing
 * a Scene Space coordinate.
 */
export async function activate(
  page: Page,
  kind: TargetKind,
  nounLabel: string,
  options: ActivationOptions = {},
): Promise<void> {
  const { pan = "right", attempts = kind === "passage" ? 24 : 8, button = "left" } = options;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const point = await revealedPoint(page, kind, nounLabel);
    if (point) {
      await clickCanvas(page, point, button);
      return;
    }
    await clickCanvas(page, panPoints[pan]);
    await page.waitForTimeout(1_000);
  }
  throw new Error(`${kind} '${nounLabel}' never entered the Camera viewport`);
}

export async function activateHotspot(
  page: Page,
  nounLabel: string,
  options: ActivationOptions = {},
): Promise<void> {
  await activate(page, "hotspot", nounLabel, options);
}

export async function activatePassage(
  page: Page,
  nounLabel: string,
  options: ActivationOptions = {},
): Promise<void> {
  await activate(page, "passage", nounLabel, options);
}

/** Walks in one direction until the named target comes into view. */
export async function walkTowards(
  page: Page,
  kind: TargetKind,
  nounLabel: string,
  pan: "left" | "right" | "up" | "down",
  steps = 40,
): Promise<void> {
  for (let step = 0; step < steps; step += 1) {
    if (await revealedPoint(page, kind, nounLabel)) return;
    await clickCanvas(page, panPoints[pan]);
    await page.waitForTimeout(1_200);
  }
  throw new Error(`${kind} '${nounLabel}' never entered the Camera viewport`);
}

/** Advances the current narrative activity the way the keyboard does. */
export async function advance(page: Page): Promise<void> {
  await page.locator("[data-fondale-frame]").focus();
  await page.keyboard.press(".");
}

/** Skips the running Sequence the way the keyboard does. */
export async function skipSequence(page: Page): Promise<void> {
  await page.locator("[data-fondale-frame]").focus();
  await page.keyboard.press("Escape");
}

export function line(page: Page, speaker?: string): Locator {
  return page.locator(
    speaker ? `[data-fondale-line][data-fondale-speaker="${speaker}"]` : "[data-fondale-line]",
  );
}

export function narration(page: Page): Locator {
  return page.locator("[data-fondale-narration]");
}

export function response(page: Page): Locator {
  return page.locator("[aria-live=polite]");
}

export function conversation(page: Page): Locator {
  return page.locator("[data-fondale-conversation]");
}

export function inventoryObject(page: Page, object: string): Locator {
  return page.locator(`[data-fondale-inventory-object="${object}"]`);
}

/**
 * The Frame the presented Scene is drawn in.
 *
 * It is named for the Scene because that is what a spec is reaching for: the
 * Frame is one element that carries `data-fondale-scene`, owns the canvas and
 * takes the keyboard, and the specs never need to distinguish the three.
 */
export function scene(page: Page): Locator {
  return page.locator("[data-fondale-frame]");
}

/** Waits for the named Scene to be the presented one. */
export async function expectScene(page: Page, sceneId: string): Promise<void> {
  await expect(scene(page)).toHaveAttribute("data-fondale-scene", sceneId, { timeout: 15_000 });
}

/** Opens the Inventory, selects the Object and confirms the panel closed. */
export async function selectInventoryObject(page: Page, object: string): Promise<void> {
  await page.locator("[data-fondale-inventory-trigger]").click();
  const item = inventoryObject(page, object);
  await expect(item).toBeVisible();
  if (await item.getAttribute("aria-pressed") === "true") {
    await page.locator("[data-fondale-inventory-close]").click();
  } else {
    await item.click();
  }
  await expect(page.locator("[data-fondale-inventory-panel]")).toBeHidden();
  await expect(item).toHaveAttribute("aria-pressed", "true");
}

/** Opens the Inventory, reads the carried Objects and closes it again. */
export async function carriedObjects(page: Page): Promise<readonly string[]> {
  await page.locator("[data-fondale-inventory-trigger]").click();
  const items = page.locator("[data-fondale-inventory-object]");
  const carried: string[] = [];
  for (let index = 0; index < await items.count(); index += 1) {
    carried.push(await items.nth(index).getAttribute("data-fondale-inventory-object") ?? "");
  }
  await page.locator("[data-fondale-inventory-close]").click();
  return carried;
}

/** Asks Michele's Reflection one question and leaves the answer on screen. */
export async function reflect(page: Page, question: string): Promise<Locator> {
  await page.getByRole("button", { name: "Rifletti" }).click();
  const reflection = page.locator("[data-fondale-reflection]");
  await expect(reflection).toBeVisible();
  await reflection.locator("[data-fondale-dialogue-input]").fill(question);
  await reflection.getByRole("button", { name: "Reflect" }).click();
  return reflection;
}

/** Closes an open Reflection, whatever it is currently showing. */
export async function leaveReflection(page: Page): Promise<void> {
  const reflection = page.locator("[data-fondale-reflection]");
  await advance(page);
  await reflection.getByRole("button", { name: "Leave" }).click();
  await expect(reflection).toHaveCount(0);
}

/**
 * Asks one free-form question inside the open Conversation and hears the answer.
 *
 * Both Lines are dismissed before returning, so the Conversation is back at its
 * input field and the next question can follow immediately. Answers are matched
 * on the substance the Example authored, never on a whole generated sentence.
 */
export async function ask(
  page: Page,
  question: string,
  answer?: {
    readonly speaker: string;
    readonly contains: string;
    readonly withheld?: string;
  },
): Promise<void> {
  const open = conversation(page);
  await open.locator("[data-fondale-dialogue-input]").fill(question);
  await open.getByRole("button", { name: "Ask" }).click();
  await expect(line(page, "michele")).toContainText(question, { timeout: 15_000 });
  await advance(page);
  if (!answer) return;
  const spoken = line(page, answer.speaker);
  await expect(spoken).toContainText(answer.contains, { timeout: 15_000 });
  if (answer.withheld) await expect(spoken).not.toContainText(answer.withheld);
  await advance(page);
}

/**
 * Retries an activation whose effect only lands once Michele finishes walking.
 *
 * A click that arrives during an in-flight walk is absorbed by the walk, so the
 * expected Line never appears. Rather than padding every call site with a fixed
 * sleep — which is what made these specs load-sensitive — the activation is
 * repeated until the Player-visible effect shows up.
 */
export async function activateUntil(
  page: Page,
  activation: () => Promise<void>,
  effect: () => Promise<void>,
  attempts = 3,
): Promise<void> {
  for (let attempt = 0; ; attempt += 1) {
    await activation();
    try {
      await effect();
      return;
    } catch (failure) {
      if (attempt >= attempts - 1) throw failure;
      // A Conversation may have opened instead of the expected Line; close it
      // so the next attempt starts from the same place. The bounded timeout
      // matters: the suite sets no default action timeout.
      await conversation(page).getByRole("button", { name: "Leave" })
        .click({ timeout: 2_000 }).catch(() => {});
    }
  }
}

// --- Canonical route milestones -------------------------------------------

/** Accepts Raffaele's job through his authored alternatives alone. */
export async function acceptHarbourJob(page: Page): Promise<void> {
  await activateHotspot(page, "Raffaele");
  const open = conversation(page);
  await expect(open.locator("[data-fondale-dialogue-input]")).toBeVisible({ timeout: 15_000 });
  await open.getByRole("button", { name: "Cerchi qualcuno per un lavoro?" }).click();
  await expect(line(page, "raffaele")).toContainText("monete");
  await advance(page);
  await page.getByRole("button", { name: "Quanto vale il lavoro?" }).click();
  await advance(page);
  await expect(line(page, "raffaele")).toContainText("rubato");
  await advance(page);
  await expect(line(page, "raffaele")).toContainText("lettera sigillata");
  await advance(page);
  await expect(open.locator("[data-fondale-dialogue-input]")).toBeVisible();
}

export async function leaveConversation(page: Page): Promise<void> {
  await conversation(page).getByRole("button", { name: "Leave" }).click();
  await expect(conversation(page)).toHaveCount(0);
}

/** Pulls the fishing nets aside and collects the flask they concealed. */
export async function pullNetsAndCollectOil(page: Page): Promise<void> {
  await activateHotspot(page, "Reti da pesca");
  await expect(line(page, "michele")).toContainText("reti", { timeout: 15_000 });
  await advance(page);
  await activateHotspot(page, "Ampolla d'olio");
  await expect(inventoryObject(page, "oilFlask")).toHaveCount(1);
  await advance(page);
}

export async function travelToCloister(page: Page): Promise<void> {
  await activatePassage(page, "Passaggio verso il chiostro");
  await expectScene(page, "cloister");
}

export async function travelToHarbour(page: Page): Promise<void> {
  await activatePassage(page, "Passaggio verso il porto", { pan: "left" });
  await expectScene(page, "harbour");
}

/** Gives Raffaele's letter to Brother Elia and hears the true account. */
export async function deliverLetter(page: Page): Promise<void> {
  await selectInventoryObject(page, "sealedLetter");
  await activateUntil(
    page,
    () => activateHotspot(page, "Frate Elia"),
    () => expect(line(page, "brotherElia"))
      .toContainText("prestato volontariamente", { timeout: 20_000 }),
  );
  await advance(page);
  await advance(page);
}

/** Oils the dry pulley support, pulls the rope and collects the handle. */
export async function freeWellAndCollectHandle(
  page: Page,
  options: { readonly skip?: boolean } = {},
): Promise<void> {
  await selectInventoryObject(page, "oilFlask");
  await activateHotspot(page, "Supporto della carrucola");
  await expect(response(page)).toContainText("supporto della carrucola", { timeout: 15_000 });
  await activateHotspot(page, "Pozzo lubrificato");
  if (options.skip) {
    // Escape has to arrive while the freeing Sequence is running.
    await page.waitForTimeout(300);
    await skipSequence(page);
    await page.waitForTimeout(500);
  } else {
    await expect(line(page, "brotherElia")).toContainText("secchio è risalito", {
      timeout: 15_000,
    });
    await advance(page);
  }
  await activateHotspot(page, "Manovella liberata");
  await expect(inventoryObject(page, "winchHandle")).toHaveCount(1);
  await advance(page);
}

/**
 * Runs the authored chain from the opening harbour to the handle in hand and
 * Michele back at the broken winch, ready to install it.
 */
export async function recoverHandle(page: Page): Promise<void> {
  await acceptHarbourJob(page);
  await leaveConversation(page);
  await pullNetsAndCollectOil(page);
  await travelToCloister(page);
  await deliverLetter(page);
  await freeWellAndCollectHandle(page);
  await travelToHarbour(page);
  await activateHotspot(page, "Argano senza manovella");
  await expect(response(page)).toContainText("manca la manovella", { timeout: 15_000 });
}

/** Installs the handle, playing or skipping the choreographed Sequence. */
export async function installHandle(
  page: Page,
  options: { readonly skip?: boolean } = {},
): Promise<void> {
  await selectInventoryObject(page, "winchHandle");
  await activateHotspot(page, "Argano senza manovella");
  if (options.skip) {
    await page.waitForTimeout(100);
    await skipSequence(page);
    await expect(inventoryObject(page, "winchHandle")).toHaveCount(0);
    return;
  }
  await expect(inventoryObject(page, "winchHandle")).toHaveCount(0);
  await expect(line(page, "michele")).toContainText("argano", { timeout: 15_000 });
  await advance(page);
}

/** Answers Raffaele after the repair, which is what opens the fortification. */
export async function answerRaffaele(
  page: Page,
  choice = "Non dirò nulla del prestito.",
  reply = "discrezione",
): Promise<void> {
  await activateHotspot(page, "Raffaele");
  const open = conversation(page);
  await expect(open.getByRole("button", { name: choice })).toBeVisible({ timeout: 15_000 });
  await open.getByRole("button", { name: choice }).click();
  await expect(line(page, "raffaele")).toContainText(reply);
  await advance(page);
  await leaveConversation(page);
}

export async function boardGozzo(page: Page): Promise<void> {
  await activatePassage(page, "Gozzo verso la fortificazione", { pan: "left", attempts: 24 });
  await expectScene(page, "coastalFortification");
}

/** Repairs the winch and sails to the fortification landing. */
export async function repairWinchAndSail(page: Page): Promise<void> {
  await recoverHandle(page);
  await installHandle(page);
  await answerRaffaele(page);
  await boardGozzo(page);
}

/** Waits out the directed boat-arrival Sequence that plays on landing. */
export async function letBoatArrivalPlay(page: Page): Promise<void> {
  await page.waitForTimeout(5_500);
}

/** Commits the sighting from the lookout. */
export async function observeSighting(page: Page): Promise<void> {
  await walkTowards(page, "hotspot", "Belvedere della fortificazione", "up");
  await activateUntil(
    page,
    () => activateHotspot(page, "Belvedere della fortificazione"),
    () => expect(narration(page))
      .toContainText("una piccola barca alla deriva", { timeout: 20_000 }),
  );
  await advance(page);
  await expect(line(page, "michele")).toContainText("non dovrebbe essere qui");
  await advance(page);
}

/** Climbs back down and boards the drifting boat. */
export async function descendToBoat(page: Page): Promise<void> {
  await walkTowards(page, "passage", "Scaletta verso gli scogli", "down");
  await activatePassage(page, "Scaletta verso gli scogli", { pan: "left" });
  await expectScene(page, "driftingBoat");
}

/** Everything between landing at the fortification and boarding the boat. */
export async function reachDriftingBoat(page: Page): Promise<void> {
  await letBoatArrivalPlay(page);
  await observeSighting(page);
  await descendToBoat(page);
}

/** Plays the sailor encounter through to the bundle in Michele's Inventory. */
export async function playSailorEncounter(page: Page): Promise<void> {
  await activateHotspot(page, "Marinaio ferito", { button: "right" });
  const sailor = line(page, "woundedSailor");
  await expect(sailor).toContainText("quel viso", { timeout: 25_000 });
  await advance(page);
  await expect(line(page, "michele")).toContainText("Mi scambi per un altro");
  await advance(page);
  await expect(sailor).toContainText("Ho navigato con tuo padre");
  await advance(page);
  await expect(line(page, "michele")).toContainText("non è mai tornata");
  await advance(page);
  await expect(sailor).toContainText("Ti appartiene");
  await advance(page);
  // The pick-up gesture and the handoff operations run here.
  await expect(narration(page)).toContainText("resta soltanto il respiro", { timeout: 20_000 });
  await advance(page);
  await expect(line(page, "michele")).toContainText("resta con me");
  await advance(page);
  await expect(narration(page)).toContainText("come se aspettasse");
  await advance(page);
}

/** Opens the oilskin bundle from the Inventory, ending the prologue. */
export async function openBundle(page: Page): Promise<void> {
  await page.locator("[data-fondale-inventory-trigger]").click();
  const bundle = inventoryObject(page, "oilskinBundle");
  await expect(bundle).toBeVisible();
  await bundle.click({ button: "right" });
  await expect(narration(page)).toContainText("apre il fagotto", { timeout: 20_000 });
  await advance(page);
  await expect(line(page, "michele")).toContainText("sigillo spezzato");
  await advance(page);
  await expect(narration(page)).toContainText("quel sigillo lo stava aspettando");
  await advance(page);
  await expect(inventoryObject(page, "oilskinBundle")).toHaveCount(0);
}
