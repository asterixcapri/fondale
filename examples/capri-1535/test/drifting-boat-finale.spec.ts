import { test, type Page } from "@playwright/test";

import { continueGameSession, expect, openGame, shoot } from "./harness";

test.setTimeout(420_000);

interface Point {
  readonly x: number;
  readonly y: number;
}

async function clickCanvas(page: Page, point: Point): Promise<void> {
  const canvas = page.locator("[data-fondale-frame] canvas");
  const bounds = await canvas.boundingBox();
  if (!bounds) throw new Error("Fondale canvas is not visible");
  await page.mouse.click(
    bounds.x + (point.x / 1280) * bounds.width,
    bounds.y + (point.y / 720) * bounds.height,
  );
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

async function revealedPoint(page: Page, kind: "hotspot" | "passage", label: string): Promise<Point | undefined> {
  const frame = page.locator("[data-fondale-frame]");
  await frame.focus();
  await page.keyboard.down("Tab");
  const revealed = frame.locator(
    kind === "hotspot" ? "[data-fondale-revealed-hotspot]" : "[data-fondale-revealed-passage]",
  );
  let point: Point | undefined;
  for (let index = 0; index < await revealed.count(); index += 1) {
    const element = revealed.nth(index);
    if (await element.locator("title").textContent() !== label) continue;
    const candidate = polygonCenter(await element.getAttribute("points") ?? "");
    if (candidate.x >= 16 && candidate.x <= 1264 && candidate.y >= 16 && candidate.y <= 704) {
      point = candidate;
    }
    break;
  }
  await page.keyboard.up("Tab");
  return point;
}

async function activateHotspot(page: Page, label: string): Promise<void> {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const point = await revealedPoint(page, "hotspot", label);
    if (point) {
      await clickCanvas(page, point);
      return;
    }
    await clickCanvas(page, { x: 1200, y: 650 });
    await page.waitForTimeout(1_000);
  }
  throw new Error(`Hotspot '${label}' never entered the Camera viewport`);
}

async function activatePassage(page: Page, label: string, pan: "left" | "right" = "right"): Promise<void> {
  for (let attempt = 0; attempt < 24; attempt += 1) {
    const point = await revealedPoint(page, "passage", label);
    if (point) {
      await clickCanvas(page, point);
      return;
    }
    await clickCanvas(page, { x: pan === "left" ? 80 : 1200, y: 650 });
    await page.waitForTimeout(1_000);
  }
  throw new Error(`Passage '${label}' never entered the Camera viewport`);
}

async function advance(page: Page): Promise<void> {
  await page.locator("[data-fondale-frame]").focus();
  await page.keyboard.press(".");
}

async function selectInventoryObject(page: Page, object: string): Promise<void> {
  await page.locator("[data-fondale-inventory-trigger]").click();
  const item = page.locator(`[data-fondale-inventory-object="${object}"]`);
  await expect(item).toBeVisible();
  if (await item.getAttribute("aria-pressed") === "true") {
    await page.locator("[data-fondale-inventory-close]").click();
  } else {
    await item.click();
  }
  await expect(page.locator("[data-fondale-inventory-panel]")).toBeHidden();
  await expect(item).toHaveAttribute("aria-pressed", "true");
}

async function acceptHarbourJob(page: Page): Promise<void> {
  await activateHotspot(page, "Raffaele");
  const conversation = page.locator("[data-fondale-conversation]");
  await expect(conversation.locator("[data-fondale-dialogue-input]")).toBeVisible({ timeout: 15_000 });
  await conversation.getByRole("button", { name: "Cerchi qualcuno per un lavoro?" }).click();
  await expect(page.locator('[data-fondale-line][data-fondale-speaker="raffaele"]'))
    .toContainText("monete");
  await advance(page);
  await page.getByRole("button", { name: "Quanto vale il lavoro?" }).click();
  await advance(page);
  await expect(page.locator('[data-fondale-line][data-fondale-speaker="raffaele"]'))
    .toContainText("rubato");
  await advance(page);
  await expect(page.locator('[data-fondale-line][data-fondale-speaker="raffaele"]'))
    .toContainText("lettera sigillata");
  await advance(page);
  await expect(conversation.locator("[data-fondale-dialogue-input]")).toBeVisible();
}

async function pullNetsAndCollectOil(page: Page): Promise<void> {
  await activateHotspot(page, "Reti da pesca");
  await expect(page.locator('[data-fondale-line][data-fondale-speaker="michele"]'))
    .toContainText("reti", { timeout: 15_000 });
  await advance(page);
  await activateHotspot(page, "Ampolla d'olio");
  await expect(page.locator('[data-fondale-inventory-object="oilFlask"]')).toHaveCount(1);
  await advance(page);
}

/** Runs the whole repaired-winch chain established by the earlier slices. */
async function reachRepairedHarbour(page: Page): Promise<void> {
  await acceptHarbourJob(page);
  await page.locator("[data-fondale-conversation]").getByRole("button", { name: "Leave" }).click();
  await pullNetsAndCollectOil(page);
  await activatePassage(page, "Passaggio verso il chiostro");
  await expect(page.locator("[data-fondale-frame]")).toHaveAttribute(
    "data-fondale-scene",
    "cloister",
    { timeout: 15_000 },
  );

  await selectInventoryObject(page, "sealedLetter");
  const eliaLine = page.locator('[data-fondale-line][data-fondale-speaker="brotherElia"]');
  for (let attempt = 0; ; attempt += 1) {
    if (attempt >= 3) throw new Error("Brother Elia never acknowledged the letter");
    await activateHotspot(page, "Frate Elia");
    try {
      await expect(eliaLine).toContainText("prestato volontariamente", { timeout: 6_000 });
      break;
    } catch {
      await page.locator("[data-fondale-conversation]").getByRole("button", { name: "Leave" }).click().catch(() => {});
    }
  }
  await advance(page);
  await advance(page);

  await selectInventoryObject(page, "oilFlask");
  await activateHotspot(page, "Supporto della carrucola");
  await expect(page.locator("[aria-live=polite]")).toContainText("supporto della carrucola", {
    timeout: 15_000,
  });
  await activateHotspot(page, "Pozzo lubrificato");
  await expect(eliaLine).toContainText("secchio è risalito", { timeout: 15_000 });
  await advance(page);
  await activateHotspot(page, "Manovella liberata");
  await expect(page.locator('[data-fondale-inventory-object="winchHandle"]')).toHaveCount(1);
  await advance(page);

  await activatePassage(page, "Passaggio verso il porto", "left");
  await expect(page.locator("[data-fondale-frame]")).toHaveAttribute(
    "data-fondale-scene",
    "harbour",
    { timeout: 15_000 },
  );
  await activateHotspot(page, "Argano senza manovella");
  await expect(page.locator("[aria-live=polite]")).toContainText("manca la manovella", {
    timeout: 15_000,
  });
}

async function reachFortification(page: Page): Promise<void> {
  await selectInventoryObject(page, "winchHandle");
  await activateHotspot(page, "Argano senza manovella");
  await expect(page.locator('[data-fondale-inventory-object="winchHandle"]')).toHaveCount(0);
  await expect(page.locator('[data-fondale-line][data-fondale-speaker="michele"]'))
    .toContainText("argano", { timeout: 15_000 });
  await advance(page);

  await activateHotspot(page, "Raffaele");
  const conversation = page.locator("[data-fondale-conversation]");
  await conversation.getByRole("button", { name: "Non dirò nulla del prestito." }).click();
  await expect(page.locator('[data-fondale-line][data-fondale-speaker="raffaele"]'))
    .toContainText("discrezione");
  await advance(page);
  await conversation.getByRole("button", { name: "Leave" }).click();

  await activatePassage(page, "Gozzo verso la fortificazione", "left");
  await expect(page.locator("[data-fondale-frame]")).toHaveAttribute(
    "data-fondale-scene",
    "coastalFortification",
    { timeout: 15_000 },
  );
}

async function climbToLookout(page: Page): Promise<void> {
  for (let step = 0; step < 40; step += 1) {
    if (await revealedPoint(page, "hotspot", "Belvedere della fortificazione")) return;
    await clickCanvas(page, { x: 560, y: 120 });
    await page.waitForTimeout(1_200);
  }
  throw new Error("The lookout never entered the Camera viewport");
}

async function climbDownToLanding(page: Page): Promise<void> {
  for (let step = 0; step < 40; step += 1) {
    if (await revealedPoint(page, "passage", "Scaletta verso gli scogli")) return;
    await clickCanvas(page, { x: 400, y: 660 });
    await page.waitForTimeout(1_200);
  }
  throw new Error("The rocks stairway never entered the Camera viewport");
}

/** Commits the sighting and boards the drifting boat. */
async function reachDriftingBoat(page: Page): Promise<void> {
  await climbToLookout(page);
  await activateHotspot(page, "Belvedere della fortificazione");
  await expect(page.locator("[data-fondale-narration]")).toContainText(
    "una piccola barca alla deriva",
    { timeout: 15_000 },
  );
  await advance(page);
  await expect(page.locator('[data-fondale-line][data-fondale-speaker="michele"]'))
    .toContainText("non dovrebbe essere qui");
  await advance(page);

  await climbDownToLanding(page);
  await activatePassage(page, "Scaletta verso gli scogli", "left");
  await expect(page.locator("[data-fondale-frame]")).toHaveAttribute(
    "data-fondale-scene",
    "driftingBoat",
    { timeout: 15_000 },
  );
}

/** Plays the whole encounter, returning once the sequence has completed. */
async function playEncounter(page: Page): Promise<void> {
  await activateHotspot(page, "Marinaio ferito");
  const sailorLine = page.locator('[data-fondale-line][data-fondale-speaker="woundedSailor"]');
  await expect(sailorLine).toContainText("quel viso", { timeout: 15_000 });
  await advance(page);
  await expect(page.locator('[data-fondale-line][data-fondale-speaker="michele"]'))
    .toContainText("Mi scambi per un altro");
  await advance(page);
  await expect(sailorLine).toContainText("Ho navigato con tuo padre");
  await advance(page);
  await expect(page.locator('[data-fondale-line][data-fondale-speaker="michele"]'))
    .toContainText("non è mai tornata");
  await advance(page);
  await expect(sailorLine).toContainText("Ti appartiene");
  await advance(page);
  // The pick-up gesture and the handoff operations run here.
  await page.waitForTimeout(2_500);
  await expect(page.locator("[data-fondale-narration]")).toContainText("resta soltanto il respiro");
  await advance(page);
  await expect(page.locator('[data-fondale-line][data-fondale-speaker="michele"]'))
    .toContainText("resta con me");
  await advance(page);
  await expect(page.locator("[data-fondale-narration]")).toContainText("come se aspettasse");
  await advance(page);
}

test("the finale plays the sailor encounter, the bundle handoff and the opened-bundle cliffhanger", async ({
  page,
}) => {
  const { errors } = await openGame(page);
  const frame = page.locator("[data-fondale-frame]");
  await reachRepairedHarbour(page);
  await reachFortification(page);
  await reachDriftingBoat(page);

  // Environmental clues stay inspectable and never gate the encounter.
  await activateHotspot(page, "Sartie recise");
  await expect(page.locator("[aria-live=polite]")).toContainText("tagliate", { timeout: 8_000 });
  await activateHotspot(page, "Traccia di sangue");
  await expect(page.locator("[aria-live=polite]")).toContainText("sangue", { timeout: 8_000 });

  // The wrapped bundle is visible but only lookable-at before the handoff.
  await activateHotspot(page, "Fagotto di tela cerata");
  await expect(page.locator("[aria-live=polite]")).toContainText("spago cerato", { timeout: 8_000 });

  await playEncounter(page);

  // The explicit lifecycle transition put the bundle in Michele's Inventory.
  await expect(page.locator('[data-fondale-inventory-object="oilskinBundle"]')).toHaveCount(1);
  // The sailor lost consciousness; his identity stays unresolved.
  await activateHotspot(page, "Marinaio ferito");
  await expect(page.locator("[aria-live=polite]")).toContainText("svenuto", { timeout: 8_000 });
  await shoot(page, "capri-1535-finale-sailor-unconscious");

  // Opening the bundle changes the same Object into its opened Appearance.
  await page.locator("[data-fondale-inventory-trigger]").click();
  const bundle = page.locator('[data-fondale-inventory-object="oilskinBundle"]');
  await expect(bundle).toBeVisible();
  await bundle.click({ button: "right" });
  await expect(page.locator("[data-fondale-narration]")).toContainText("apre il fagotto", {
    timeout: 8_000,
  });
  await advance(page);
  await expect(page.locator('[data-fondale-line][data-fondale-speaker="michele"]'))
    .toContainText("sigillo spezzato");
  await advance(page);
  await expect(page.locator("[data-fondale-narration]")).toContainText("quel sigillo lo stava aspettando");
  await advance(page);

  // The opened bundle left the Inventory and lies revealed on the deck.
  await expect(page.locator('[data-fondale-inventory-object="oilskinBundle"]')).toHaveCount(0);
  await activateHotspot(page, "Fagotto aperto");
  await expect(page.locator("[aria-live=polite]")).toContainText("sigillo spezzato", {
    timeout: 8_000,
  });
  await shoot(page, "capri-1535-finale-opened-bundle");

  // Reflection reports the discovery among Michele's learned facts.
  await page.getByRole("button", { name: "Rifletti" }).click();
  const reflection = page.locator("[data-fondale-reflection]");
  await reflection.locator("[data-fondale-dialogue-input]").fill("Che cosa c'era nel fagotto?");
  await reflection.getByRole("button", { name: "Reflect" }).click();
  await expect(page.locator('[data-fondale-line][data-fondale-speaker="michele"]'))
    .toContainText("sigillo", { timeout: 15_000 });
  await advance(page);
  await reflection.getByRole("button", { name: "Leave" }).click();

  // Continuation retains the opened bundle and the committed knowledge.
  await continueGameSession(page);
  await expect(frame).toHaveAttribute("data-fondale-scene", "driftingBoat");
  await activateHotspot(page, "Fagotto aperto");
  await expect(page.locator("[aria-live=polite]")).toContainText("sigillo spezzato", {
    timeout: 8_000,
  });
  expect(errors).toEqual([]);
});

test("skipping the sailor encounter commits the same handoff and unconsciousness", async ({ page }) => {
  const { errors } = await openGame(page);
  await reachRepairedHarbour(page);
  await reachFortification(page);
  await reachDriftingBoat(page);

  await activateHotspot(page, "Marinaio ferito");
  await expect(page.locator('[data-fondale-line][data-fondale-speaker="woundedSailor"]'))
    .toContainText("quel viso", { timeout: 15_000 });
  await page.keyboard.press("Escape");
  await page.waitForTimeout(800);

  await expect(page.locator('[data-fondale-inventory-object="oilskinBundle"]')).toHaveCount(1);
  await activateHotspot(page, "Marinaio ferito");
  await expect(page.locator("[aria-live=polite]")).toContainText("svenuto", { timeout: 8_000 });

  // The skipped encounter still opens into the same canonical finale.
  await page.locator("[data-fondale-inventory-trigger]").click();
  const bundle = page.locator('[data-fondale-inventory-object="oilskinBundle"]');
  await expect(bundle).toBeVisible();
  await bundle.click({ button: "right" });
  await expect(page.locator("[data-fondale-narration]")).toContainText("apre il fagotto", {
    timeout: 8_000,
  });
  await advance(page);
  await advance(page);
  await advance(page);
  await expect(page.locator('[data-fondale-inventory-object="oilskinBundle"]')).toHaveCount(0);
  await shoot(page, "capri-1535-finale-skipped-encounter");
  expect(errors).toEqual([]);
});
