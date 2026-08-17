import { test, type Page } from "@playwright/test";

import { continueGameSession, expect, openGame, shoot } from "./harness";
import {
  acceptHarbourJob,
  activateHotspot,
  advance,
  answerRaffaele,
  boardGozzo,
  canvasBounds,
  conversation,
  deliverLetter,
  freeWellAndCollectHandle,
  installHandle,
  inventoryObject,
  isRevealed,
  leaveConversation,
  line,
  logicalResolution,
  pullNetsAndCollectOil,
  recoverHandle,
  reflect,
  response,
  scene,
  selectInventoryObject,
  travelToCloister,
  travelToHarbour,
} from "./prologue";

/**
 * The harbour job and the cloister puzzle it sends the Player to solve.
 *
 * These are the focused proofs behind the acceptance path: narrative authority
 * at the opening, both valid oil discovery orders, the two-step well, and the
 * installation Sequence whose Animation Cue and winch response have to meet.
 */

test.setTimeout(90_000);

/**
 * A cheap fingerprint of the winch hub, used to tell "handle missing" from
 * "handle mounted" without turning the artwork into a golden image.
 */
async function winchHubPixels(page: Page): Promise<string> {
  const bounds = await canvasBounds(page);
  const scaleX = bounds.width / logicalResolution.width;
  const scaleY = bounds.height / logicalResolution.height;
  const pixels = await page.screenshot({
    clip: {
      x: bounds.x + 1_045 * scaleX,
      y: bounds.y + 370 * scaleY,
      width: 220 * scaleX,
      height: 190 * scaleY,
    },
  });
  let hash = 2_166_136_261;
  for (const value of pixels) {
    hash ^= value;
    hash = Math.imul(hash, 16_777_619);
  }
  return String(hash >>> 0);
}

/**
 * Measures how long the winch keeps its old look after the installation starts.
 *
 * The property under test is that the winch does not react before Michele's
 * `mechanism-use` Animation reaches its `contact` Cue. Asserting "unchanged at
 * 50 ms" made the outcome depend on how fast a screenshot came back under load.
 * Sampling instead of scheduling is safe in the direction that matters: a slow
 * machine can only make the observed delay longer, never shorter, so a delay at
 * least as long as the Cue can never be reported spuriously.
 */
async function measureContactDelay(
  page: Page,
  before: string,
  start: () => Promise<void>,
): Promise<number> {
  const startedAt = Date.now();
  await start();
  for (let sample = 0; sample < 40; sample += 1) {
    const at = Date.now() - startedAt;
    if (await winchHubPixels(page) !== before) return at;
  }
  throw new Error("The winch never responded to the installation");
}

test("the authored harbour job gives one sealed letter and records Raffaele's theft Claim as Testimony", async ({
  page,
}) => {
  const { errors } = await openGame(page);
  await acceptHarbourJob(page);

  // The engagement is consumed by asking it: it is canonical Game State.
  await expect(conversation(page).getByRole("button", { name: "Cerchi qualcuno per un lavoro?" }))
    .toHaveCount(0);
  await leaveConversation(page);

  await page.locator("[data-fondale-inventory-trigger]").click();
  await expect(inventoryObject(page, "sealedLetter")).toHaveCount(1);
  await page.locator("[data-fondale-inventory-close]").click();

  await continueGameSession(page);
  await page.locator("[data-fondale-inventory-trigger]").click();
  await expect(inventoryObject(page, "sealedLetter")).toHaveCount(1);
  await page.locator("[data-fondale-inventory-close]").click();

  await activateHotspot(page, "Raffaele");
  await expect(conversation(page).getByRole("button", { name: "Cerchi qualcuno per un lavoro?" }))
    .toHaveCount(0);
  await leaveConversation(page);

  // What Raffaele said is remembered as his Testimony, not as the truth.
  await reflect(page, "Che cosa mi ha detto Raffaele?");
  const reflected = line(page, "michele");
  await expect(reflected).toContainText("rubato");
  await expect(reflected).not.toContainText("prestato volontariamente");
  expect(errors).toEqual([]);
});

for (const order of ["before", "after"] as const) {
  test(`the oil flask remains discoverable ${order} Raffaele's hint`, async ({ page }) => {
    const { errors } = await openGame(page);
    if (order === "after") {
      await acceptHarbourJob(page);
      await conversation(page).getByRole("button", { name: "Dove trovo l'ampolla?" }).click();
      await expect(line(page, "raffaele")).toContainText("reti");
      await advance(page);
      await leaveConversation(page);
    }

    // The flask is genuinely behind the nets: it is not reachable until they
    // move. `isRevealed` is the honest question — `revealedPoint` is also
    // `undefined` for anything the Camera merely does not happen to show.
    expect(await isRevealed(page, "hotspot", "Ampolla d'olio")).toBe(false);
    await pullNetsAndCollectOil(page);

    if (order === "before") {
      await acceptHarbourJob(page);
      await conversation(page).getByRole("button", { name: "Dove trovo l'ampolla?" }).click();
      await expect(line(page, "raffaele")).toContainText("reti");
      await advance(page);
      await leaveConversation(page);
    }

    // Unsupported combinations answer without consuming the essential Object.
    await selectInventoryObject(page, "oilFlask");
    await activateHotspot(page, "Raffaele");
    await expect(response(page)).toContainText("Non credo che lo vorrebbe", { timeout: 15_000 });
    await expect(inventoryObject(page, "oilFlask")).toHaveCount(1);
    await selectInventoryObject(page, "oilFlask");
    await activateHotspot(page, "Reti da pesca spostate");
    await expect(response(page)).toContainText("Non funzionerebbe così", { timeout: 15_000 });
    await expect(inventoryObject(page, "oilFlask")).toHaveCount(1);

    await continueGameSession(page);
    expect(await isRevealed(page, "hotspot", "Reti da pesca spostate")).toBe(true);
    expect(await isRevealed(page, "hotspot", "Ampolla d'olio")).toBe(false);
    await page.locator("[data-fondale-inventory-trigger]").click();
    await expect(inventoryObject(page, "oilFlask")).toHaveCount(1);
    if (order === "after") await shoot(page, "harbour-object-actual-size");
    expect(errors).toEqual([]);
  });
}

test("Michele delivers the letter, frees the well and keeps the recovered handle across return", async ({
  page,
}) => {
  const { errors } = await openGame(page);
  const frame = scene(page);

  await acceptHarbourJob(page);
  await leaveConversation(page);
  await pullNetsAndCollectOil(page);
  await travelToCloister(page);

  // The social gate: Brother Elia refuses the well before the letter arrives,
  // and refusing costs the Player nothing.
  await selectInventoryObject(page, "oilFlask");
  await activateHotspot(page, "Supporto della carrucola");
  await expect(line(page, "brotherElia")).toContainText("Prima la lettera", { timeout: 15_000 });
  await expect(inventoryObject(page, "oilFlask")).toHaveCount(1);
  await advance(page);

  await deliverLetter(page);
  await expect(inventoryObject(page, "sealedLetter")).toHaveCount(0);

  // The two steps are separate: pulling a dry pulley changes nothing.
  await activateHotspot(page, "Pozzo del chiostro");
  await expect(response(page)).toContainText("troppo secca", { timeout: 15_000 });
  await selectInventoryObject(page, "oilFlask");
  await activateHotspot(page, "Supporto della carrucola");
  await expect(response(page)).toContainText("supporto della carrucola", { timeout: 15_000 });
  await expect(inventoryObject(page, "oilFlask")).toHaveCount(0);
  await shoot(page, "cloister-well-lubricated");

  await activateHotspot(page, "Pozzo lubrificato");
  await expect(line(page, "brotherElia")).toContainText("secchio è risalito", { timeout: 15_000 });
  await shoot(page, "cloister-well-freed");
  await advance(page);
  await activateHotspot(page, "Manovella liberata");
  await expect(inventoryObject(page, "winchHandle")).toHaveCount(1);
  await advance(page);

  await travelToHarbour(page);
  await continueGameSession(page);
  await expect(frame).toHaveAttribute("data-fondale-scene", "harbour");
  await page.locator("[data-fondale-inventory-trigger]").click();
  await expect(inventoryObject(page, "winchHandle")).toHaveCount(1);
  await page.locator("[data-fondale-inventory-close]").click();

  // The freed well is still freed when Michele walks back into the cloister.
  await travelToCloister(page);
  expect(await isRevealed(page, "hotspot", "Pozzo liberato")).toBe(true);
  expect(await isRevealed(page, "hotspot", "Manovella liberata")).toBe(false);

  await reflect(page, "Che cosa so della manovella?");
  const reflected = line(page, "michele");
  await expect(reflected).toContainText("prestato volontariamente");
  await expect(reflected).toContainText("rubato");
  await expect(reflected).not.toContainText("torre della fortificazione");
  expect(errors).toEqual([]);
});

test("skipping the well Sequence frees the same mechanism", async ({ page }) => {
  const { errors } = await openGame(page);
  await acceptHarbourJob(page);
  await leaveConversation(page);
  await pullNetsAndCollectOil(page);
  await travelToCloister(page);
  await deliverLetter(page);
  await freeWellAndCollectHandle(page, { skip: true });

  // The skipped Sequence committed the same canonical outcome: the mechanism is
  // freed, the handle is carried, and the well keeps its freed presentation.
  await expect(inventoryObject(page, "winchHandle")).toHaveCount(1);
  expect(await isRevealed(page, "hotspot", "Pozzo liberato")).toBe(true);
  await activateHotspot(page, "Pozzo liberato");
  await expect(response(page)).toContainText("secchio è risalito", { timeout: 15_000 });
  await shoot(page, "cloister-well-freed-skipped");
  expect(errors).toEqual([]);
});

test("Michele installs the handle at contact and every response to Raffaele opens the fortification", async ({
  browser,
}) => {
  test.setTimeout(600_000);
  const branches = [{
    choice: "Mi hai mentito sui frati.",
    reply: "Prestito",
  }, {
    choice: "Non dirò nulla del prestito.",
    reply: "discrezione",
  }, {
    choice: "Il prezzo del lavoro è appena salito.",
    reply: "moneta",
  }] as const;

  for (const [index, branch] of branches.entries()) {
    const context = await browser.newContext();
    const page = await context.newPage();
    const { errors } = await openGame(page);
    await recoverHandle(page);

    const beforeContact = await winchHubPixels(page);
    if (index === 0) {
      // Michele's `mechanism-use` Animation places its `contact` Cue halfway
      // through eight frames at 8 fps, so the winch must hold its broken look
      // for roughly half a second before the handle appears on the hub.
      await selectInventoryObject(page, "winchHandle");
      const delay = await measureContactDelay(
        page,
        beforeContact,
        () => activateHotspot(page, "Argano senza manovella"),
      );
      expect(delay).toBeGreaterThanOrEqual(300);
      expect(delay).toBeLessThanOrEqual(10_000);
      await expect(line(page, "michele")).toContainText("argano", { timeout: 15_000 });
      await advance(page);
    } else {
      await installHandle(page);
    }
    await expect(inventoryObject(page, "winchHandle")).toHaveCount(0);
    await continueGameSession(page);
    expect(await isRevealed(page, "hotspot", "Argano riparato")).toBe(true);
    expect(await isRevealed(page, "passage", "Gozzo verso la fortificazione")).toBe(false);
    if (index === 0) {
      expect(await winchHubPixels(page)).not.toBe(beforeContact);
      await shoot(page, "harbour-winch-repaired");
    }

    await answerRaffaele(page, branch.choice, branch.reply);
    // Whatever Michele said, the same later Line and the same unlock follow.
    await activateHotspot(page, "Raffaele");
    await expect(conversation(page).getByRole("button", { name: branch.choice })).toHaveCount(0);
    await conversation(page).getByRole("button", { name: "L'argano è a posto?" }).click();
    await expect(line(page, "raffaele")).toContainText("L'argano tiene");
    await advance(page);
    await leaveConversation(page);
    await boardGozzo(page);
    expect(errors).toEqual([]);
    await context.close();
  }
});

test("skipping the installation commits the same repaired world through continuation", async ({
  page,
}) => {
  test.slow();
  const { errors } = await openGame(page);
  await recoverHandle(page);

  await installHandle(page, { skip: true });
  expect(await isRevealed(page, "hotspot", "Argano riparato")).toBe(true);

  await travelToCloister(page);
  await travelToHarbour(page);
  await continueGameSession(page);
  expect(await isRevealed(page, "hotspot", "Argano riparato")).toBe(true);
  expect(await isRevealed(page, "passage", "Gozzo verso la fortificazione")).toBe(false);

  await answerRaffaele(page);
  await boardGozzo(page);
  expect(errors).toEqual([]);
});
