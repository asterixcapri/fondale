import { test } from "@playwright/test";

import { continueGameSession, expect, openGame, shoot } from "./harness";
import {
  acceptHarbourJob,
  activateHotspot,
  advance,
  answerRaffaele,
  boardGozzo,
  carriedObjects,
  clickCanvas,
  conversation,
  deliverLetter,
  freeWellAndCollectHandle,
  hoverCanvas,
  installHandle,
  inventoryObject,
  isRevealed,
  leaveConversation,
  leaveReflection,
  line,
  narration,
  playSailorEncounter,
  pullNetsAndCollectOil,
  reachDriftingBoat,
  reflect,
  response,
  revealedPoint,
  scene,
  travelToCloister,
  travelToHarbour,
} from "./prologue";

/**
 * The product demonstration.
 *
 * This is the one seam that claims the whole prologue works. It drives the
 * packaged Example exactly as a Player does — canvas clicks, HUD controls and
 * the keyboard — and reads back only what a Player can see: the presented
 * Scene, Lines, Narrations, Inventory contents and revealed targets.
 *
 * Focused proofs of individual capabilities live in the sibling specs
 * (`harbour-opening`, `boat-sighting`, `drifting-boat-finale`,
 * `knowledge-dialogue`, `dialogue-resilience`). This file answers one question:
 * can somebody sit down and finish the demo?
 */

test.setTimeout(420_000);

test("the whole prologue completes through authored Conversation alternatives alone", async ({
  page,
}) => {
  const { errors, dialogueRequests } = await openGame(page);
  const frame = scene(page);

  // 1 — Harbour, morning: the winch is visibly broken and Raffaele pays.
  await expect(frame).toHaveAttribute("data-fondale-scene", "harbour");
  await shoot(page, "acceptance-1-harbour-morning");
  await acceptHarbourJob(page);
  await leaveConversation(page);
  expect(await carriedObjects(page)).toEqual(["sealedLetter"]);
  await pullNetsAndCollectOil(page);
  await shoot(page, "acceptance-2-harbour-nets-moved");

  // 2 — Cloister, early afternoon: the letter buys the truth and the handle.
  await travelToCloister(page);
  await shoot(page, "acceptance-3-cloister-afternoon");
  await deliverLetter(page);
  await freeWellAndCollectHandle(page);
  expect(await carriedObjects(page)).toEqual(["winchHandle"]);

  // 3 — Harbour again: the handle goes onto the winch and stays there.
  await travelToHarbour(page);
  await activateHotspot(page, "Argano senza manovella");
  await expect(response(page)).toContainText("manca la manovella", { timeout: 15_000 });
  await installHandle(page);
  expect(await carriedObjects(page)).toEqual([]);
  expect(await isRevealed(page, "hotspot", "Argano riparato")).toBe(true);
  await shoot(page, "acceptance-4-harbour-winch-repaired");
  await answerRaffaele(page);

  // 4 — Fortification, golden hour: the climb and the sighting.
  await boardGozzo(page);
  await shoot(page, "acceptance-5-fortification-golden-hour");
  await reachDriftingBoat(page);

  // 5 — Drifting boat, dusk: clues, the sailor and the cliffhanger.
  await shoot(page, "acceptance-6-drifting-boat-dusk");
  await activateHotspot(page, "Sartie recise");
  await expect(response(page)).toContainText("tagliate", { timeout: 20_000 });
  await activateHotspot(page, "Traccia di sangue");
  await expect(response(page)).toContainText("sangue", { timeout: 20_000 });
  await activateHotspot(page, "Fagotto di tela cerata");
  await expect(response(page)).toContainText("spago cerato", { timeout: 20_000 });

  await playSailorEncounter(page);
  expect(await carriedObjects(page)).toEqual(["oilskinBundle"]);
  await activateHotspot(page, "Marinaio ferito");
  await expect(response(page)).toContainText("svenuto", { timeout: 20_000 });

  // The HUD contract holds for Narration too: the opening Narration owns play,
  // so the Inventory trigger is suspended until the Player dismisses it.
  await page.locator("[data-fondale-inventory-trigger]").click();
  await inventoryObject(page, "oilskinBundle").click({ button: "right" });
  await expect(narration(page)).toContainText("apre il fagotto", { timeout: 20_000 });
  await expect(page.locator("[data-fondale-inventory-trigger]")).toBeHidden();
  await advance(page);
  await expect(line(page, "michele")).toContainText("sigillo spezzato");
  await advance(page);
  await expect(narration(page)).toContainText("quel sigillo lo stava aspettando");
  await advance(page);
  await expect(inventoryObject(page, "oilskinBundle")).toHaveCount(0);
  await activateHotspot(page, "Fagotto aperto");
  await expect(response(page)).toContainText("sigillo spezzato", { timeout: 20_000 });
  await shoot(page, "acceptance-7-prologue-cliffhanger");

  // The demo is finishable without ever typing at a Character: the deterministic
  // support saw no interpretation request, so nothing above depended on a model
  // reading free-form Italian. `reset` and `ready` are session lifecycle.
  expect(dialogueRequests.filter(({ operation }) => operation === "interpret")).toEqual([]);
  expect(dialogueRequests.filter(({ operation }) => operation === "verbalize")).toEqual([]);

  // The finished prologue survives leaving the browser.
  await continueGameSession(page);
  await expect(frame).toHaveAttribute("data-fondale-scene", "driftingBoat");
  await activateHotspot(page, "Fagotto aperto");
  await expect(response(page)).toContainText("sigillo spezzato", { timeout: 20_000 });
  expect(errors).toEqual([]);
});

test("finding the oil first converges on the same canonical outcome", async ({ page }) => {
  const { errors } = await openGame(page);
  const frame = scene(page);

  // The second valid discovery order: the nets are searched out of curiosity,
  // before anybody explains what the oil is for.
  expect(await revealedPoint(page, "hotspot", "Ampolla d'olio")).toBeUndefined();
  await pullNetsAndCollectOil(page);
  expect(await carriedObjects(page)).toEqual(["oilFlask"]);

  await acceptHarbourJob(page);
  // Raffaele's hint still identifies the nets; it never becomes a second puzzle.
  await conversation(page).getByRole("button", { name: "Dove trovo l'ampolla?" }).click();
  await expect(line(page, "raffaele")).toContainText("reti");
  await advance(page);
  await leaveConversation(page);

  await travelToCloister(page);
  await deliverLetter(page);
  await freeWellAndCollectHandle(page);
  await travelToHarbour(page);

  // Continuation mid-route restores every representative kind of Game State.
  await continueGameSession(page);
  await expect(frame).toHaveAttribute("data-fondale-scene", "harbour");
  // Objects: the recovered handle is still carried, the consumed flask is gone.
  expect(await carriedObjects(page)).toEqual(["winchHandle"]);
  // Scenery: the nets stay moved and the flask they hid is not back.
  expect(await isRevealed(page, "hotspot", "Reti da pesca spostate")).toBe(true);
  expect(await isRevealed(page, "hotspot", "Ampolla d'olio")).toBe(false);
  // Consumed alternatives: the engagement question is not offered a second time.
  await activateHotspot(page, "Raffaele");
  await expect(conversation(page).locator("[data-fondale-dialogue-input]"))
    .toBeVisible({ timeout: 15_000 });
  await expect(conversation(page).getByRole("button", { name: "Cerchi qualcuno per un lavoro?" }))
    .toHaveCount(0);
  await leaveConversation(page);
  // Knowledge: what Michele learned from Brother Elia survived the reload.
  const reflection = await reflect(page, "Che cosa so della manovella?");
  await expect(line(page, "michele")).toContainText("prestato volontariamente", {
    timeout: 15_000,
  });
  await advance(page);
  await reflection.getByRole("button", { name: "Leave" }).click();

  // Convergence: the same install, the same repaired world, the same unlock.
  await activateHotspot(page, "Argano senza manovella");
  await expect(response(page)).toContainText("manca la manovella", { timeout: 15_000 });
  await installHandle(page);
  expect(await isRevealed(page, "hotspot", "Argano riparato")).toBe(true);
  await answerRaffaele(page, "Mi hai mentito sui frati.", "Prestito");
  await boardGozzo(page);
  await expect(frame).toHaveAttribute("data-fondale-scene", "coastalFortification");
  expect(errors).toEqual([]);
});

test("mouse and keyboard both reach every Player affordance", async ({ page }) => {
  const { errors } = await openGame(page);
  const frame = scene(page);

  // Hotspots and Passages are revealed from the keyboard and walked to with the
  // mouse: the reveal overlay is presentation, so it never takes pointer input.
  await frame.focus();
  await page.keyboard.down("Tab");
  await expect(frame.locator("[data-fondale-revealed-hotspot]")).not.toHaveCount(0);
  await expect(frame.locator("[data-fondale-revealed-hotspots]"))
    .toHaveCSS("pointer-events", "none");
  await page.keyboard.up("Tab");
  await expect(frame.locator("[data-fondale-revealed-hotspot]")).toHaveCount(0);

  // The mouse names the command before committing to it.
  const raffaele = await revealedPoint(page, "hotspot", "Raffaele");
  if (!raffaele) throw new Error("Raffaele is not on Camera at the opening");
  await hoverCanvas(page, raffaele);
  await expect(page.locator("[data-fondale-primary-action] [data-fondale-action-text]"))
    .toContainText("Parla con");

  // Conversations: the alternative is chosen with the keyboard alone.
  await clickCanvas(page, raffaele);
  const open = conversation(page);
  const engagement = open.getByRole("button", { name: "Cerchi qualcuno per un lavoro?" });
  await expect(engagement).toBeVisible({ timeout: 15_000 });
  await engagement.focus();
  await page.keyboard.press("Enter");
  await expect(line(page, "raffaele")).toContainText("monete", { timeout: 15_000 });

  // Lines advance with `.`, and a Choice answers to its number key.
  await advance(page);
  await expect(page.locator("[data-fondale-choice] button")).toHaveCount(2);
  await frame.focus();
  await page.keyboard.press("1");
  await expect(line(page, "raffaele")).toContainText("rubato", { timeout: 15_000 });
  await advance(page);
  await advance(page);
  await leaveConversation(page);

  // Inventory: `i` opens it, arrow-free focus selects, Escape closes it.
  await frame.focus();
  await page.keyboard.press("i");
  const panel = page.locator("[data-fondale-inventory-panel]");
  await expect(panel).toBeVisible();
  await inventoryObject(page, "sealedLetter").focus();
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();

  // Reflection: reached from the keyboard, answered, and left again.
  const reflectionControl = page.getByRole("button", { name: "Rifletti" });
  await reflectionControl.focus();
  await page.keyboard.press("Enter");
  const reflection = page.locator("[data-fondale-reflection]");
  await expect(reflection).toBeVisible();
  await reflection.locator("[data-fondale-dialogue-input]").fill("Che cosa so?");
  await reflection.getByRole("button", { name: "Reflect" }).click();
  await expect(line(page, "michele")).toContainText("Michele", { timeout: 15_000 });
  await leaveReflection(page);

  // Sequences: the reveal is driven to its end from the keyboard alone, and
  // commits its outcome. Skipping a skippable Sequence is the same Escape the
  // installation, well, arrival and encounter cases press.
  await activateHotspot(page, "Reti da pesca");
  await expect(line(page, "michele")).toContainText("reti", { timeout: 15_000 });
  await advance(page);
  await expect(page.locator("[data-fondale-line]")).toHaveCount(0);
  expect(await isRevealed(page, "hotspot", "Reti da pesca spostate")).toBe(true);
  await activateHotspot(page, "Ampolla d'olio");
  await expect(inventoryObject(page, "oilFlask")).toHaveCount(1);
  expect(errors).toEqual([]);
});

test("the Inventory stays unavailable while a narrative activity holds play", async ({ page }) => {
  const { errors } = await openGame(page);
  const frame = scene(page);
  const trigger = page.locator("[data-fondale-inventory-trigger]");

  // Exploration: the Inventory and the hotspot reveal are both available.
  await expect(trigger).toBeVisible();

  // A Sequence takes play from its first direction, and the Line it presents
  // keeps it: neither the trigger nor its keyboard shortcut reaches a Player.
  await activateHotspot(page, "Reti da pesca");
  await expect(trigger).toBeHidden();
  await expect(line(page, "michele")).toContainText("reti", { timeout: 15_000 });
  await expect(trigger).toBeHidden();
  await frame.focus();
  await page.keyboard.press("i");
  await expect(page.locator("[data-fondale-inventory-panel]")).toBeHidden();
  await advance(page);
  await expect(trigger).toBeVisible();

  // A Conversation suspends it while it owns the screen.
  await activateHotspot(page, "Raffaele");
  await expect(conversation(page)).toBeVisible({ timeout: 15_000 });
  await expect(trigger).toBeHidden();

  // A Choice inside that Conversation suspends it as well.
  await conversation(page).getByRole("button", { name: "Cerchi qualcuno per un lavoro?" }).click();
  await expect(line(page, "raffaele")).toContainText("monete", { timeout: 15_000 });
  await advance(page);
  await expect(page.locator("[data-fondale-choice] button")).toHaveCount(2);
  await expect(trigger).toBeHidden();
  await frame.focus();
  await page.keyboard.press("1");
  await advance(page);
  await advance(page);
  await leaveConversation(page);
  await expect(trigger).toBeVisible();

  // Exploration gets the Inventory back, with the collected Object in it. The
  // click starts a walk first, so the collection lands a few seconds later.
  await activateHotspot(page, "Ampolla d'olio");
  await expect(inventoryObject(page, "oilFlask")).toHaveCount(1, { timeout: 20_000 });
  await advance(page);
  await expect(trigger).toBeVisible();
  await frame.focus();
  await page.keyboard.press("i");
  await expect(page.locator("[data-fondale-inventory-panel]")).toBeVisible();
  expect(errors).toEqual([]);
});

test("an incompatible Continuation State offers only New Game", async ({ page }) => {
  await openGame(page);
  await expect.poll(() => page.evaluate(() => {
    const key = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index))
      .find((candidate) => candidate?.startsWith("fondale.continuation."));
    if (!key) return false;
    const continuation = JSON.parse(localStorage.getItem(key)!) as {
      snapshot: { projectVersion: string };
    };
    continuation.snapshot.projectVersion = "4";
    localStorage.setItem(key, JSON.stringify(continuation));
    return true;
  })).toBe(true);
  await page.reload();
  const startup = page.locator("[data-fondale-continuation]");
  await expect(startup.getByRole("button", { name: "Continue" })).toHaveCount(0);
  await expect(startup.getByRole("button", { name: "New Game" })).toBeVisible();
});

// Each window scale gets its own Game Session: reopening the game in the same
// browser would meet the continuation prompt of the run before it.
for (const [name, viewport] of [
  ["actual-size", { width: 1_280, height: 720 }],
  ["letterboxed", { width: 900, height: 700 }],
] as const) {
  test(`packaged text presentations remain legible ${name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const { errors } = await openGame(page);

    // The Engine overlay never paints over the Scene and keeps prompts in frame.
    const bounds = await page.locator("[data-fondale-frame] canvas").boundingBox();
    const raffaele = await revealedPoint(page, "hotspot", "Raffaele");
    if (!bounds || !raffaele) throw new Error("Harbour geometry is unavailable");
    await hoverCanvas(page, raffaele);
    const prompt = await page.locator("[data-fondale-command-preview]").boundingBox();
    if (!prompt) throw new Error("The command preview is unavailable");
    expect(await page.locator("[data-fondale-overlay]").evaluate(
      (element) => (element as HTMLElement).style.background,
    )).toBe("");
    expect(prompt.x).toBeGreaterThanOrEqual(bounds.x);
    expect(prompt.y).toBeGreaterThanOrEqual(bounds.y);
    expect(prompt.x + prompt.width).toBeLessThanOrEqual(bounds.x + bounds.width);
    expect(prompt.y + prompt.height).toBeLessThanOrEqual(bounds.y + bounds.height);
    await shoot(page, `acceptance-command-preview-${name}`);

    // A Character-bound Line and a Choice both stay inside the frame.
    await activateHotspot(page, "Raffaele");
    await conversation(page).getByRole("button", { name: "Cerchi qualcuno per un lavoro?" })
      .click();
    await expect(line(page, "raffaele")).toContainText("monete", { timeout: 15_000 });
    await shoot(page, `acceptance-line-${name}`);
    await advance(page);
    await expect(page.locator("[data-fondale-choice] button")).toHaveCount(2);
    await shoot(page, `acceptance-choice-${name}`);
    await page.locator("[data-fondale-frame]").focus();
    await page.keyboard.press("1");
    await advance(page);
    await advance(page);
    await leaveConversation(page);

    // The Inventory panel is the last presentation that has to survive scaling.
    await page.locator("[data-fondale-inventory-trigger]").click();
    await expect(page.locator("[data-fondale-inventory-panel]")).toBeVisible();
    await expect(inventoryObject(page, "sealedLetter")).toBeVisible();
    await shoot(page, `acceptance-inventory-${name}`);
    await page.locator("[data-fondale-inventory-close]").click();
    expect(errors).toEqual([]);
  });
}
