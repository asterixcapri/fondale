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

async function continuationState(page: Page): Promise<Record<string, unknown>> {
  await expect.poll(() => page.evaluate(() => Array.from(
    { length: localStorage.length },
    (_, index) => localStorage.key(index),
  ).some((key) => key?.startsWith("fondale.continuation.")))).toBe(true);
  return page.evaluate(() => {
    const key = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index))
      .find((candidate) => candidate?.startsWith("fondale.continuation."));
    if (!key) throw new Error("Continuation State is absent");
    return JSON.parse(localStorage.getItem(key)!).snapshot.state as Record<string, unknown>;
  });
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

  const state = await continuationState(page) as {
    variables: { jobAccepted: boolean };
    inventory: { objects: string[] };
    characterKnowledge: Record<string, string[]>;
    testimonies: Array<{ speaker: string; listener: string; claimId: string }>;
  };
  expect(state.variables.jobAccepted).toBe(true);
  expect(state.inventory.objects.filter((object) => object === "sealedLetter")).toHaveLength(1);
  expect(state.characterKnowledge.michele).not.toContain("raffaele-lent-the-handle");
  expect(state.testimonies).toContainEqual({
    speaker: "raffaele",
    listener: "michele",
    claimId: "friars-stole-the-handle",
  });

  await continueGameSession(page);
  await page.locator("[data-fondale-inventory-trigger]").click();
  await expect(page.locator('[data-fondale-inventory-object="sealedLetter"]')).toHaveCount(1);
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
      await activateHotspot(page, "Raffaele");
      const conversation = page.locator("[data-fondale-conversation]");
      await expect(conversation)
        .toContainText("Cerchi qualcuno per un lavoro?");
      await conversation.getByRole("button", { name: "Leave" }).click();
    }

    const state = await continuationState(page) as {
      scenery: { harbour: { fishingNets: string } };
      objects: { oilFlask: { location: { kind: string } } };
    };
    expect(state.scenery.harbour.fishingNets).toBe("moved");
    expect(state.objects.oilFlask.location.kind).toBe("inventory");

    await continueGameSession(page);
    await page.locator("[data-fondale-inventory-trigger]").click();
    await expect(page.locator('[data-fondale-inventory-object="oilFlask"]')).toHaveCount(1);
    expect(errors).toEqual([]);
  });
}
