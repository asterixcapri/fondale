import { test, type Page } from "@playwright/test";

import { clickWorld, expect, hoverWorld, openGame, shoot } from "./harness";

test.setTimeout(90_000);

type Verb = "pick-up" | "look-at" | "talk-to" | "use";

async function command(page: Page, verb: Verb, x: number, y: number): Promise<void> {
  const labels: Record<Verb, string> = {
    "pick-up": "Raccogli",
    "look-at": "Guarda",
    "talk-to": "Parla con",
    use: "Usa",
  };
  await hoverWorld(page, x, y);
  await expect(page.locator("[data-fondale-primary-action] [data-fondale-action-text]"))
    .toContainText(labels[verb]);
  await clickWorld(page, x, y);
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

async function advance(page: Page): Promise<void> {
  await page.locator("[data-fondale-frame]").focus();
  await page.keyboard.press(".");
}

async function waitForWalk(page: Page, milliseconds = 3_000): Promise<void> {
  await page.waitForTimeout(milliseconds);
}

function polygonBounds(points: string): {
  minimumX: number;
  maximumX: number;
  minimumY: number;
  maximumY: number;
} {
  const coordinates = points.split(" ").map((pair) => {
    const [x, y] = pair.split(",").map(Number);
    return { x: x ?? 0, y: y ?? 0 };
  });
  const xs = coordinates.map(({ x }) => x);
  const ys = coordinates.map(({ y }) => y);
  return {
    minimumX: Math.min(...xs),
    maximumX: Math.max(...xs),
    minimumY: Math.min(...ys),
    maximumY: Math.max(...ys),
  };
}

async function clickVisibleEdgePassage(page: Page, edge: "left" | "right"): Promise<boolean> {
  const frame = page.locator("[data-fondale-frame]");
  await frame.focus();
  await page.keyboard.down("Tab");
  const passages = page.locator("[data-fondale-revealed-passage]");
  await expect(passages).not.toHaveCount(0);
  const candidates: Array<{ x: number; y: number }> = [];
  for (let index = 0; index < await passages.count(); index += 1) {
    const bounds = polygonBounds(await passages.nth(index).getAttribute("points") ?? "");
    if (bounds.maximumX < 0 || bounds.minimumX > 426) continue;
    if (edge === "left" && (bounds.minimumX > 80 || bounds.maximumX < 48)) continue;
    if (edge === "right" && bounds.maximumX < 346) continue;
    candidates.push({
      x: edge === "left"
        ? Math.max(40, Math.min(100, bounds.maximumX - 8))
        : Math.min(418, bounds.maximumX - Math.min(24, bounds.maximumX - bounds.minimumX)),
      y: Math.max(8, Math.min(232, (bounds.minimumY + bounds.maximumY) / 2)),
    });
  }
  const point = candidates.sort((a, b) => edge === "left" ? a.x - b.x : b.x - a.x)[0];
  await page.keyboard.up("Tab");
  if (!point) return false;
  await clickWorld(page, point.x, point.y);
  return true;
}

async function visibleHotspotPoint(page: Page, label: string): Promise<{ x: number; y: number } | undefined> {
  const frame = page.locator("[data-fondale-frame]");
  await frame.focus();
  await page.keyboard.down("Tab");
  const hotspots = page.locator("[data-fondale-revealed-hotspot]");
  let point: { x: number; y: number } | undefined;
  for (let index = 0; index < await hotspots.count(); index += 1) {
    const hotspot = hotspots.nth(index);
    if (await hotspot.locator("title").textContent() !== label) continue;
    const bounds = polygonBounds(await hotspot.getAttribute("points") ?? "");
    if (
      bounds.maximumX >= 0 && bounds.minimumX <= 426 &&
      bounds.maximumY >= 0 && bounds.minimumY <= 240
    ) {
      point = {
        x: Math.max(40, Math.min(418, (bounds.minimumX + bounds.maximumX) / 2)),
        y: Math.max(8, Math.min(232, (bounds.minimumY + bounds.maximumY) / 2)),
      };
    }
    break;
  }
  await page.keyboard.up("Tab");
  return point;
}

async function enterRightEdgePassage(page: Page): Promise<void> {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    if (await clickVisibleEdgePassage(page, "right")) return;
    await clickWorld(page, 400, 228);
    await waitForWalk(page);
  }
  throw new Error("No visible right Passage after panning");
}

async function enterLeftEdgePassage(page: Page): Promise<void> {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    if (await clickVisibleEdgePassage(page, "left")) return;
    await clickWorld(page, 100, 228);
    await waitForWalk(page);
  }
  throw new Error("No visible left Passage after panning");
}

test("the packaged Example opens in the new panoramic town square and reaches the cloister", async ({
  page,
}) => {
  const { errors } = await openGame(page);
  const frame = page.locator("[data-fondale-frame]");
  const canvas = page.locator("[data-fondale-frame] canvas");
  const opening = await canvas.screenshot();

  await expect(frame).toHaveAttribute("data-fondale-scene", "townSquare");
  await command(page, "look-at", 390, 110);
  await expect(page.locator("[aria-live=polite]")).toContainText(
    "campanile divide la piazza dal mare",
  );
  await clickWorld(page, 180, 142);
  await expect(frame).toHaveAttribute("data-fondale-scene", "cloister", {
    timeout: 8_000,
  });
  expect((await canvas.screenshot()).equals(opening)).toBe(false);
  await shoot(page, "capri-1535-cloister");
  expect(errors).toEqual([]);
});

test("Michele completes one ordinary job before the drifting boat begins the adventure", async ({
  page,
}) => {
  const { errors } = await openGame(page);
  const frame = page.locator("[data-fondale-frame]");

  await enterRightEdgePassage(page);
  await expect(frame).toHaveAttribute("data-fondale-scene", "harbour", { timeout: 8_000 });
  await command(page, "talk-to", 216, 180);
  const line = page.locator("[data-fondale-line]");
  await expect(line).toContainText("monete", { timeout: 8_000 });
  await advance(page);
  await expect(page.locator("[data-fondale-choice] button")).toHaveCount(2);
  await page.getByRole("button", { name: "Quanto vale il lavoro?" }).click();
  await expect(line).toContainText("Quanto vale il lavoro?");
  await advance(page);
  await expect(line).toContainText("manovella");
  await advance(page);
  await expect(line).toContainText("ampolla");
  await advance(page);
  await expect(line).toHaveCount(0);

  await command(page, "pick-up", 286, 202);
  await expect(page.locator('[data-fondale-inventory-object="oilFlask"]')).toHaveCount(1);

  await clickWorld(page, 400, 120);
  await expect(frame).toHaveAttribute("data-fondale-scene", "townSquare", { timeout: 8_000 });
  await clickWorld(page, 88, 132);
  await expect(frame).toHaveAttribute("data-fondale-scene", "cloister", { timeout: 8_000 });

  await clickWorld(page, 400, 228);
  await waitForWalk(page);
  await selectInventoryObject(page, "oilFlask");
  await command(page, "use", 390, 188);
  await expect(page.locator("[aria-live=polite]")).toContainText("carrucola");
  await command(page, "pick-up", 365, 198);
  await expect(page.locator('[data-fondale-inventory-object="winchHandle"]')).toHaveCount(1);

  await enterLeftEdgePassage(page);
  await expect(frame).toHaveAttribute("data-fondale-scene", "townSquare", { timeout: 8_000 });
  await enterRightEdgePassage(page);
  await expect(frame).toHaveAttribute("data-fondale-scene", "harbour", { timeout: 8_000 });

  await clickWorld(page, 480, 210);
  await waitForWalk(page, 1_500);
  await selectInventoryObject(page, "winchHandle");
  const winchStart = await frame.locator("canvas").screenshot();
  await command(page, "use", 326, 190);
  await page.waitForTimeout(300);
  expect((await frame.locator("canvas").screenshot()).equals(winchStart)).toBe(false);
  await frame.focus();
  await page.keyboard.press("Escape");
  await expect(page.locator('[data-fondale-inventory-object="winchHandle"]')).toHaveCount(0);
  await expect(line).toHaveCount(0);

  await enterLeftEdgePassage(page);
  await expect(frame).toHaveAttribute("data-fondale-scene", "coastalFortification", {
    timeout: 8_000,
  });
  const arrivalStart = await frame.locator("canvas").screenshot();
  await page.waitForTimeout(400);
  expect((await frame.locator("canvas").screenshot()).equals(arrivalStart)).toBe(false);
  await page.waitForTimeout(3_500);
  await shoot(page, "capri-1535-fortification-lower-path");

  let lookout: { x: number; y: number } | undefined;
  for (let step = 0; step < 14; step += 1) {
    lookout = await visibleHotspotPoint(page, "Mare dalla torre");
    if (lookout) break;
    await clickWorld(page, 330, 24);
    await waitForWalk(page, 1_000);
    if (step === 6) await shoot(page, "capri-1535-fortification-ascent");
  }
  if (!lookout) throw new Error("The tower lookout did not enter the Camera viewport");
  await command(page, "look-at", lookout.x, lookout.y);
  await expect(page.locator("[data-fondale-narration]")).toContainText(
    "una piccola barca alla deriva",
    { timeout: 8_000 },
  );
  await advance(page);
  await expect(line).toContainText("non dovrebbe essere qui");
  await shoot(page, "capri-1535-prologue-ending");
  expect(errors).toEqual([]);
});

test("pixel scaling and the Engine overlay remain usable in a smaller letterboxed window", async ({
  page,
}) => {
  await page.setViewportSize({ width: 900, height: 700 });
  const { errors } = await openGame(page);
  const frame = page.locator("[data-fondale-frame]");
  await expect(frame).toHaveCSS("width", "852px");
  await expect(frame).toHaveCSS("height", "480px");
  await expect(frame.locator("[data-fondale-verb]")).toHaveCount(0);
  await expect(frame.locator("[data-fondale-inventory-trigger]")).toBeVisible();
  await expect(frame.locator("[data-fondale-inventory-panel]")).toBeHidden();
  await frame.locator("[data-fondale-inventory-trigger]").click();
  await expect(frame.locator("[data-fondale-inventory-slot]")).toHaveCount(8);
  await frame.locator("[data-fondale-inventory-close]").click();

  await frame.focus();
  await page.keyboard.down("Tab");
  await expect(frame.locator("[data-fondale-revealed-hotspot]")).toHaveCount(1);
  await expect(frame.locator("[data-fondale-revealed-passage]")).toHaveCount(2);
  await page.keyboard.up("Tab");
  await shoot(page, "capri-1535-letterbox-contextual-overlay");
  expect(errors).toEqual([]);
});

test("the contextual overlay preserves the full Scene and keeps prompts in frame", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 700 });
  await openGame(page);
  const frame = page.locator("[data-fondale-frame]");
  const canvas = frame.locator("canvas");
  const canvasBounds = await canvas.boundingBox();
  await hoverWorld(page, 390, 110);
  const promptBounds = await frame.locator("[data-fondale-command-preview]").boundingBox();
  const triggerBounds = await frame.locator("[data-fondale-inventory-trigger]").boundingBox();
  if (!canvasBounds || !promptBounds || !triggerBounds) throw new Error("Overlay geometry is unavailable");
  const scale = canvasBounds.width / 426;
  const overlayBackground = await frame.locator("[data-fondale-overlay]").evaluate(
    (element) => (element as HTMLElement).style.background,
  );

  expect.soft(overlayBackground).toBe("");
  expect.soft(triggerBounds.width).toBeLessThanOrEqual(24 * scale);
  expect.soft(promptBounds.x).toBeGreaterThanOrEqual(canvasBounds.x);
  expect.soft(promptBounds.y).toBeGreaterThanOrEqual(canvasBounds.y);
  expect.soft(promptBounds.x + promptBounds.width).toBeLessThanOrEqual(canvasBounds.x + canvasBounds.width);
  expect.soft(promptBounds.y + promptBounds.height).toBeLessThanOrEqual(canvasBounds.y + canvasBounds.height);
});

test("packaged text presentations remain legible across Aiano and Boffe", async ({ page }) => {
  for (const [scene, viewport] of [
    ["aiano", { width: 1280, height: 720 }],
    ["boffe", { width: 900, height: 700 }],
  ] as const) {
    await page.setViewportSize(viewport);
    const { errors } = await openGame(page, `/test/fixtures/adventure-text.html?scene=${scene}`);

    await command(page, "look-at", 70, 110);
    await expect(page.locator("[aria-live=polite]")).toContainText("La luce cambia");
    await shoot(page, `capri-1535-${scene}-command-response`);
    await advance(page);

    await command(page, "talk-to", 334, 135);
    await expect(page.locator("[data-fondale-line]")).toContainText("sopra chi la pronuncia");
    await shoot(page, `capri-1535-${scene}-character-line`);
    await advance(page);
    await expect(page.locator("[data-fondale-line]")).toHaveCount(0);

    await command(page, "look-at", 210, 110);
    await expect(page.locator("[data-fondale-narration]")).toContainText("Il vento porta il sale");
    await shoot(page, `capri-1535-${scene}-narration`);
    await advance(page);
    await expect(page.locator("[data-fondale-choice] button")).toHaveCount(2);
    await shoot(page, `capri-1535-${scene}-choice`);
    expect(errors).toEqual([]);
  }
});

test("a Capri Project Version 4 Save remains visible and incompatible", async ({ page }) => {
  await openGame(page);
  const frame = page.locator("[data-fondale-frame]");
  await frame.focus();
  await page.keyboard.press("Control+s");
  const save = frame.locator('[data-fondale-modal="save"]');
  await save.locator("[data-fondale-save-name]").fill("Vecchia Capri");
  await save.locator("[data-fondale-save-confirm]").click();
  await page.evaluate(() => {
    const slots = JSON.parse(localStorage.getItem("fondale.save-slots") ?? "[]") as Array<{
      snapshot: { projectVersion: string };
    }>;
    slots[0]!.snapshot.projectVersion = "4";
    localStorage.setItem("fondale.save-slots", JSON.stringify(slots));
  });
  await frame.focus();
  await page.keyboard.press("Control+l");
  const oldSave = frame.locator('[data-fondale-load-slot="0"]');
  await expect(oldSave).toBeDisabled();
  await expect(oldSave).toContainText("incompatible");
});
