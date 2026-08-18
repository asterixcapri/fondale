import { test } from "@playwright/test";

import { continuationState, continueGameSession, expect, openGame, shoot } from "./harness";
import {
  acceptHarbourJob,
  activateHotspot,
  advance,
  answerRaffaele,
  boardGozzo,
  carriedObjects,
  clickCanvas,
  closeOnTheEnding,
  conversation,
  deliverLetter,
  expectDetailView,
  freeWellAndCollectHandle,
  hearTheContradiction,
  hoverCanvas,
  installHandle,
  inventoryObject,
  isRevealed,
  leaveConversation,
  leaveReflection,
  line,
  playSailorEncounter,
  pullNetsAndCollectOil,
  reachDriftingBoat,
  readBrokenSeal,
  readRegistryFragment,
  reflect,
  response,
  revealedPoint,
  scene,
  travelToCloister,
  travelToHarbour,
  watchSailorDie,
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

  // 6 — The handoff opens straight into the close-up: no free-roam gap between
  // the bundle changing hands and what it holds.
  await playSailorEncounter(page);
  await expectDetailView(page, "openedBundle");
  expect(await carriedObjects(page)).toEqual(["oilskinBundle"]);
  await shoot(page, "acceptance-7-opened-bundle-close-up");

  // The reading is two details examined on their own, in either order. This
  // path takes the seal first.
  await readBrokenSeal(page);

  // What the reading teaches reaches Reflection as any other Fact does, and it
  // opens no puzzle: the other detail is read exactly as it was before.
  const reading = await reflect(page, "Che cosa so della nave di mio padre?");
  await expect(line(page, "michele")).toContainText("Santa Marta", { timeout: 15_000 });
  await advance(page);
  await reading.getByRole("button", { name: "Leave" }).click();

  await readRegistryFragment(page);
  await hearTheContradiction(page);
  // The sailor dies in the world, in front of the Player, not behind a picture.
  await shoot(page, "acceptance-8-drifting-boat-death");
  await watchSailorDie(page);
  await shoot(page, "acceptance-9-michele-answers");
  await closeOnTheEnding(page);
  await shoot(page, "acceptance-10-prologue-ending");

  // The Ending withdraws the HUD and answers no further Command: the closing
  // image keeps its frame whatever the Player clicks.
  await expect(page.locator("[data-fondale-overlay]")).toBeHidden();
  await clickCanvas(page, { x: 440, y: 350 });
  await expectDetailView(page, "prologueEnding");

  // The contradiction is canonical Game State. The Ending leaves no Player
  // surface to read it back through, so the persisted Game State is where it
  // has to be proved.
  const finished = await continuationState(page);
  expect(finished.characterKnowledge["michele"]).toContain("santa-marta-sailed-after-her-wreck");

  // The demo is finishable without ever typing at a Character: the deterministic
  // support saw no interpretation request, so nothing above depended on a model
  // reading free-form Italian. `reset` and `ready` are session lifecycle.
  expect(dialogueRequests.filter(({ operation }) => operation === "interpret")).toEqual([]);
  expect(dialogueRequests.filter(({ operation }) => operation === "verbalize")).toEqual([]);

  // The finished prologue survives leaving the browser: a reopened game finds
  // its Ending rather than a world with nothing left in it.
  await continueGameSession(page);
  await expectDetailView(page, "prologueEnding");
  await expect(page.locator("[data-fondale-overlay]")).toBeHidden();
  expect(errors).toEqual([]);
});

test("finding the oil first converges on the same canonical outcome", async ({ page }) => {
  const { errors } = await openGame(page);
  const frame = scene(page);

  // The second valid discovery order: the nets are searched out of curiosity,
  // before anybody explains what the oil is for.
  expect(await isRevealed(page, "hotspot", "Ampolla d'olio")).toBe(false);
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

  // Relationship: calling Raffaele a liar cost Michele his trust and left him
  // angry, and both survive leaving the browser. Neither has a Player-visible
  // consequence in this prologue — no Disclosure here is gated on Trust — so
  // the persisted Continuation State is the only place they can be read.
  await continueGameSession(page);
  const restored = await continuationState(page);
  expect(restored.relationships["raffaele"]?.["michele"]).toEqual({ trust: "low" });
  expect(restored.dialogueStates["raffaele"]).toBe("angry");

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

  // Inventory: `i` opens it, focus and Enter select the Object the same way a
  // click does, and Escape closes the panel.
  await frame.focus();
  await page.keyboard.press("i");
  const panel = page.locator("[data-fondale-inventory-panel]");
  await expect(panel).toBeVisible();
  const letter = inventoryObject(page, "sealedLetter");
  await expect(letter).toHaveAttribute("aria-pressed", "false");
  await letter.focus();
  await page.keyboard.press("Enter");
  await expect(panel).toBeHidden();
  await expect(letter).toHaveAttribute("aria-pressed", "true");
  // Selecting is a Command in progress, so pressing it again puts it back.
  await page.keyboard.press("i");
  await expect(panel).toBeVisible();
  await letter.focus();
  await page.keyboard.press("Enter");
  await expect(letter).toHaveAttribute("aria-pressed", "false");
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();

  // Reflection: reached from the keyboard, answered with what Michele actually
  // knows at the opening, and left again.
  const reflectionControl = page.getByRole("button", { name: "Rifletti" });
  await reflectionControl.focus();
  await page.keyboard.press("Enter");
  const reflection = page.locator("[data-fondale-reflection]");
  await expect(reflection).toBeVisible();
  await reflection.locator("[data-fondale-dialogue-input]").fill("Che cosa so?");
  await reflection.getByRole("button", { name: "Reflect" }).click();
  await expect(line(page, "michele")).toContainText("lavoro onesto", { timeout: 15_000 });
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
