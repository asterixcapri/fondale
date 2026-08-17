import { test, type Page } from "@playwright/test";

import { continueGameSession, expect, openGame, shoot } from "./harness";

test.setTimeout(90_000);

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

async function visibleHotspot(page: Page, label: string): Promise<Point | undefined> {
  const frame = page.locator("[data-fondale-frame]");
  await frame.focus();
  await page.keyboard.down("Tab");
  const hotspots = frame.locator("[data-fondale-revealed-hotspot]");
  let point: Point | undefined;
  for (let index = 0; index < await hotspots.count(); index += 1) {
    const hotspot = hotspots.nth(index);
    if (await hotspot.locator("title").textContent() !== label) continue;
    const candidate = polygonCenter(await hotspot.getAttribute("points") ?? "");
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
    const point = await visibleHotspot(page, label);
    if (point) {
      await clickCanvas(page, point);
      return;
    }
    await clickCanvas(page, { x: 1200, y: 650 });
    await page.waitForTimeout(1_000);
  }
  throw new Error(`Hotspot '${label}' never entered the Camera viewport`);
}

async function advance(page: Page): Promise<void> {
  await page.locator("[data-fondale-frame]").focus();
  await page.keyboard.press(".");
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
  await shoot(page, "harbour-oil-reveal");
  await advance(page);
  await activateHotspot(page, "Ampolla d'olio");
  await expect(page.locator('[data-fondale-inventory-object="oilFlask"]')).toHaveCount(1);
  await advance(page);
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

test("the authored harbour job gives one sealed letter and records Raffaele's theft Claim as Testimony", async ({
  page,
}) => {
  const { errors } = await openGame(page);
  await acceptHarbourJob(page);

  const conversation = page.locator("[data-fondale-conversation]");
  await expect(conversation.getByRole("button", { name: "Cerchi qualcuno per un lavoro?" }))
    .toHaveCount(0);
  await conversation.getByRole("button", { name: "Leave" }).click();

  await page.locator("[data-fondale-inventory-trigger]").click();
  await expect(page.locator('[data-fondale-inventory-object="sealedLetter"]')).toHaveCount(1);
  await page.locator("[data-fondale-inventory-close]").click();

  await continueGameSession(page);
  await page.locator("[data-fondale-inventory-trigger]").click();
  await expect(page.locator('[data-fondale-inventory-object="sealedLetter"]')).toHaveCount(1);
  await page.locator("[data-fondale-inventory-close]").click();

  await activateHotspot(page, "Raffaele");
  await expect(page.locator("[data-fondale-conversation]")
    .getByRole("button", { name: "Cerchi qualcuno per un lavoro?" })).toHaveCount(0);
  await page.locator("[data-fondale-conversation]").getByRole("button", { name: "Leave" }).click();

  await page.getByRole("button", { name: "Rifletti" }).click();
  const reflection = page.locator("[data-fondale-reflection]");
  await reflection.locator("[data-fondale-dialogue-input]").fill("Che cosa mi ha detto Raffaele?");
  await reflection.getByRole("button", { name: "Reflect" }).click();
  const reflected = page.locator('[data-fondale-line][data-fondale-speaker="michele"]');
  await expect(reflected).toContainText("rubato");
  await expect(reflected).not.toContainText("prestato volontariamente");
  expect(errors).toEqual([]);
});

for (const order of ["before", "after"] as const) {
  test(`the oil flask remains discoverable ${order} Raffaele's hint`, async ({ page }) => {
    const { errors } = await openGame(page);
    if (order === "after") {
      await acceptHarbourJob(page);
      await page.locator("[data-fondale-conversation]")
        .getByRole("button", { name: "Dove trovo l'ampolla?" }).click();
      await expect(page.locator('[data-fondale-line][data-fondale-speaker="raffaele"]'))
        .toContainText("reti");
      await advance(page);
      await page.locator("[data-fondale-conversation]").getByRole("button", { name: "Leave" }).click();
    }

    expect(await visibleHotspot(page, "Ampolla d'olio")).toBeUndefined();
    await pullNetsAndCollectOil(page);

    if (order === "before") {
      await acceptHarbourJob(page);
      const conversation = page.locator("[data-fondale-conversation]");
      await conversation.getByRole("button", { name: "Dove trovo l'ampolla?" }).click();
      await expect(page.locator('[data-fondale-line][data-fondale-speaker="raffaele"]'))
        .toContainText("reti");
      await advance(page);
      await conversation.getByRole("button", { name: "Leave" }).click();
    }

    await selectInventoryObject(page, "oilFlask");
    await activateHotspot(page, "Raffaele");
    await expect(page.locator("[aria-live=polite]")).toContainText("Non credo che lo vorrebbe", {
      timeout: 15_000,
    });
    await expect(page.locator('[data-fondale-inventory-object="oilFlask"]')).toHaveCount(1);
    await selectInventoryObject(page, "oilFlask");
    await activateHotspot(page, "Reti da pesca spostate");
    await expect(page.locator("[aria-live=polite]")).toContainText("Non funzionerebbe così", {
      timeout: 15_000,
    });
    await expect(page.locator('[data-fondale-inventory-object="oilFlask"]')).toHaveCount(1);

    await continueGameSession(page);
    expect(await visibleHotspot(page, "Reti da pesca spostate")).toBeDefined();
    expect(await visibleHotspot(page, "Ampolla d'olio")).toBeUndefined();
    await page.locator("[data-fondale-inventory-trigger]").click();
    await expect(page.locator('[data-fondale-inventory-object="oilFlask"]')).toHaveCount(1);
    if (order === "after") await shoot(page, "harbour-object-actual-size");
    expect(errors).toEqual([]);
  });
}
