import { test, type Page } from "@playwright/test";

import { continueGameSession, expect, openGame, shoot } from "./harness";

test.setTimeout(300_000);

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

async function isRevealed(page: Page, kind: "hotspot" | "passage", label: string): Promise<boolean> {
  const frame = page.locator("[data-fondale-frame]");
  await frame.focus();
  await page.keyboard.down("Tab");
  const revealed = frame.locator(
    kind === "hotspot" ? "[data-fondale-revealed-hotspot]" : "[data-fondale-revealed-passage]",
  );
  let found = false;
  for (let index = 0; index < await revealed.count(); index += 1) {
    if (await revealed.nth(index).locator("title").textContent() === label) {
      found = true;
      break;
    }
  }
  await page.keyboard.up("Tab");
  return found;
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
  // A click absorbed by an in-flight walk would open nothing; retry the give.
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

/** Installs the handle, keeps silent about the loan and boards the gozzo. */
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

/**
 * Climbs the vertical route until the lookout hotspot enters the viewport.
 * Clicks are screen-relative because the Camera follows Michele vertically.
 */
async function climbToLookout(page: Page): Promise<void> {
  for (let step = 0; step < 40; step += 1) {
    if (await revealedPoint(page, "hotspot", "Belvedere della fortificazione")) return;
    await clickCanvas(page, { x: 560, y: 120 });
    await page.waitForTimeout(1_200);
  }
  throw new Error("The lookout never entered the Camera viewport");
}

async function observeSightingAndBoard(page: Page): Promise<void> {
  // The directed observation commits the sighting as a Narrative Fact.
  await activateHotspot(page, "Belvedere della fortificazione");
  await expect(page.locator("[data-fondale-narration]")).toContainText(
    "una piccola barca alla deriva",
    { timeout: 15_000 },
  );
  await advance(page);
  await expect(page.locator('[data-fondale-line][data-fondale-speaker="michele"]'))
    .toContainText("non dovrebbe essere qui");
  await advance(page);

  // Reflection now reports the sighting among Michele's learned facts.
  await page.getByRole("button", { name: "Rifletti" }).click();
  const reflection = page.locator("[data-fondale-reflection]");
  await reflection.locator("[data-fondale-dialogue-input]").fill("Che cosa ho visto dal belvedere?");
  await reflection.getByRole("button", { name: "Reflect" }).click();
  await expect(page.locator('[data-fondale-line][data-fondale-speaker="michele"]'))
    .toContainText("barca alla deriva", { timeout: 15_000 });
  await advance(page);
  await reflection.getByRole("button", { name: "Leave" }).click();

  // The final transition opens only now.
  await climbDownToLanding(page);
  await activatePassage(page, "Scaletta verso gli scogli", "left");
  await expect(page.locator("[data-fondale-frame]")).toHaveAttribute(
    "data-fondale-scene",
    "driftingBoat",
    { timeout: 15_000 },
  );
  await shoot(page, "capri-1535-boat-sighting-finale-entrance");
}

async function climbDownToLanding(page: Page): Promise<void> {
  for (let step = 0; step < 40; step += 1) {
    if (await revealedPoint(page, "passage", "Scaletta verso gli scogli")) return;
    await clickCanvas(page, { x: 400, y: 660 });
    await page.waitForTimeout(1_200);
  }
  throw new Error("The rocks stairway never entered the Camera viewport");
}

test("the boat arrival is directed on landing and the sighting unlocks the rocks stairway", async ({
  page,
}) => {
  const { errors } = await openGame(page);
  const frame = page.locator("[data-fondale-frame]");
  await reachRepairedHarbour(page);
  await reachFortification(page);

  // The arrival Sequence cuts to the open sea while the boat drifts in.
  await page.waitForTimeout(400);
  const duringSequence = await frame.locator("canvas").screenshot();
  await page.waitForTimeout(4_500);
  const afterSequence = await frame.locator("canvas").screenshot();
  expect(afterSequence.equals(duringSequence)).toBe(false);
  expect(await isRevealed(page, "passage", "Scaletta verso gli scogli")).toBe(false);
  await shoot(page, "capri-1535-boat-arrival-directed");

  // The climb stays Player-driven while the Camera follows Scene Space.
  await climbToLookout(page);
  await shoot(page, "capri-1535-lookout-before-sighting");
  expect(await isRevealed(page, "passage", "Scaletta verso gli scogli")).toBe(false);

  await observeSightingAndBoard(page);
  const frame2 = page.locator("[data-fondale-frame]");
  await expect(frame2.locator("[data-fondale-revealed-hotspot]")).toHaveCount(0);
  await frame2.focus();
  await page.keyboard.down("Tab");
  await expect(frame2.locator("[data-fondale-revealed-hotspot]")).toHaveCount(5);
  await page.keyboard.up("Tab");

  // The return stairway leads back to the fortification landing.
  await activatePassage(page, "Scaletta verso gli scogli", "left");
  await expect(frame2).toHaveAttribute("data-fondale-scene", "coastalFortification", {
    timeout: 15_000,
  });
  expect(errors).toEqual([]);
});

test("skipping the boat arrival commits the same sighting and transition", async ({ page }) => {
  const { errors } = await openGame(page);
  const frame = page.locator("[data-fondale-frame]");
  await reachRepairedHarbour(page);
  await reachFortification(page);

  await page.waitForTimeout(200);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);

  // The skipped outcome lands the boat exactly as full playback does.
  await climbToLookout(page);
  await activateHotspot(page, "Mare al tramonto");
  await expect(page.locator("[aria-live=polite]")).toContainText("barca", { timeout: 15_000 });

  await observeSightingAndBoard(page);
  await continueGameSession(page);
  await expect(frame).toHaveAttribute("data-fondale-scene", "driftingBoat");
  expect(errors).toEqual([]);
});
