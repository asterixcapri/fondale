import { expect, test, type Locator, type Page } from "@playwright/test";

import { logicalPoint as canvasLogicalPoint } from "./browser-support";

async function logicalPoint(frame: Locator, x: number, y: number): Promise<{ x: number; y: number }> {
  return canvasLogicalPoint(frame.locator("canvas"), x, y);
}

async function clickLogical(page: Page, frame: Locator, x: number, y: number): Promise<void> {
  const point = await canvasLogicalPoint(frame.locator("canvas"), x, y);
  await page.mouse.click(point.x, point.y);
}

test("the contextual overlay presents one main action and an optional secondary action", async ({ page }) => {
  await page.goto("/test/fixtures/commands.html");
  const frame = page.locator("[data-fondale-frame]");
  await expect(frame).toBeVisible();
  await expect(frame.locator("[data-fondale-verb]")).toHaveCount(0);

  const door = await logicalPoint(frame, 230, 110);
  await page.mouse.move(door.x, door.y);
  await expect(frame.locator("[data-fondale-primary-action] [data-fondale-action-text]"))
    .toHaveText("Portone / Guarda");
  await expect(frame.locator("[data-fondale-secondary-action] [data-fondale-action-text]"))
    .toHaveText("Portone / Parla con");
  await page.mouse.click(door.x, door.y);
  await expect(frame.locator("[aria-live=polite]")).toHaveText("Un vecchio portone.");

  await page.mouse.click(door.x, door.y, { button: "right" });
  await expect(frame.locator("[data-fondale-line]")).toContainText("domanda molto lunga");
  await frame.focus();
  await page.keyboard.press(".");
  await expect(frame.locator("[data-fondale-line]")).toHaveCount(0);

  const passage = await logicalPoint(frame, 405, 135);
  await page.mouse.move(passage.x, passage.y);
  await expect(frame.locator("[data-fondale-primary-action] [data-fondale-action-text]"))
    .toHaveText("Verso l'uscita");
  await expect(frame.locator("[data-fondale-secondary-action]")).toBeHidden();
});

test("an activated Contextual Action dismisses its preview until another Noun is explored", async ({ page }) => {
  await page.goto("/test/fixtures/commands.html");
  const frame = page.locator("[data-fondale-frame]");
  const preview = frame.locator("[data-fondale-command-preview]");
  const response = frame.locator("[aria-live=polite]");
  const door = await logicalPoint(frame, 230, 110);
  const host = await logicalPoint(frame, 315, 135);

  await page.mouse.move(door.x, door.y);
  await expect(preview).toBeVisible();
  await page.mouse.click(door.x, door.y);
  expect(await preview.isVisible()).toBe(false);
  await expect(response).toHaveText("Un vecchio portone.");

  await page.mouse.move(host.x, host.y);
  await expect(preview.locator("[data-fondale-action-text]").first()).toHaveText("Oste / Parla con");
  await expect(preview).toBeVisible();
  await expect(response).toBeVisible();
});

test("a Command Response follows text speed, leads the HUD type scale, and can be skipped", async ({ page }) => {
  await page.goto("/test/fixtures/commands.html");
  const frame = page.locator("[data-fondale-frame]");
  await frame.focus();
  await page.keyboard.press("F5");
  await frame.locator('[data-fondale-modal="options"]').getByLabel("Text speed").selectOption("fast");
  await page.keyboard.press("Escape");

  const door = await logicalPoint(frame, 230, 110);
  const host = await logicalPoint(frame, 315, 135);
  await page.mouse.move(door.x, door.y);
  await page.mouse.click(door.x, door.y);
  const response = frame.locator("[aria-live=polite]");
  await expect(response).toHaveText("Un vecchio portone.");
  const canvasBounds = await frame.locator("canvas").boundingBox();
  const responseBounds = await response.boundingBox();
  if (!canvasBounds || !responseBounds) throw new Error("missing response bounds");
  expect(canvasBounds.y + canvasBounds.height - responseBounds.y - responseBounds.height)
    .toBeLessThanOrEqual(15);
  await page.mouse.move(host.x, host.y);
  const action = frame.locator("[data-fondale-primary-action]");
  await expect(action).toBeVisible();
  expect(Number.parseFloat(await action.evaluate((element) => getComputedStyle(element).fontSize)))
    .toBeLessThan(Number.parseFloat(await response.evaluate((element) => getComputedStyle(element).fontSize)));
  await expect(response).toBeHidden({ timeout: 2_500 });

  await page.mouse.move(door.x, door.y);
  await page.mouse.click(door.x, door.y);
  await expect(response).toHaveText("Un vecchio portone.");
  await frame.focus();
  await page.keyboard.press(".");
  await expect(response).toBeHidden();

  await page.mouse.move(host.x, host.y);
  await page.mouse.move(door.x, door.y);
  await page.mouse.click(door.x, door.y);
  await expect(response).toHaveText("Un vecchio portone.");
  await page.mouse.click(door.x, door.y, { button: "middle" });
  await expect(response).toBeHidden();
});

test("an identical Command Response restarts its HUD-owned timeout", async ({ page }) => {
  await page.goto("/test/fixtures/commands.html");
  const frame = page.locator("[data-fondale-frame]");
  await frame.focus();
  await page.keyboard.press("F5");
  await frame.getByLabel("Text speed").selectOption("fast");
  await page.keyboard.press("Escape");

  const door = await logicalPoint(frame, 230, 110);
  const response = frame.locator("[aria-live=polite]");
  await page.mouse.click(door.x, door.y);
  await expect(response).toHaveText("Un vecchio portone.");
  await page.waitForTimeout(400);
  await page.mouse.click(door.x, door.y);
  await page.waitForTimeout(400);
  await expect(response).toBeVisible();
  await expect(response).toBeHidden({ timeout: 1_000 });
});

test("a selected Inventory Object becomes contextual Use or Give", async ({ page }) => {
  await page.goto("/test/fixtures/commands.html");
  const frame = page.locator("[data-fondale-frame]");
  await clickLogical(page, frame, 120, 145);
  await expect(frame.locator("[aria-live=polite]")).toHaveText("Raccolgo la chiave.");

  await frame.locator("[data-fondale-inventory-trigger]").click();
  const key = frame.locator('[data-fondale-inventory-object="key"]');
  await expect(key).toBeVisible();
  await key.click();
  await expect(frame.locator("[data-fondale-inventory-panel]")).toBeHidden();
  await expect(key).toHaveAttribute("aria-pressed", "true");

  const door = await logicalPoint(frame, 230, 110);
  await page.mouse.move(door.x, door.y);
  await expect(frame.locator("[data-fondale-primary-action] [data-fondale-action-text]"))
    .toHaveText("Usa Chiave con Portone");
  await expect(frame.locator("[data-fondale-secondary-action] [data-fondale-action-text]"))
    .toHaveText("Portone / Guarda");
  await page.mouse.click(door.x, door.y, { button: "right" });
  await expect(frame.locator("[aria-live=polite]")).toHaveText("Un vecchio portone.");
  await expect(key).toHaveAttribute("aria-pressed", "true");
  await page.mouse.click(door.x, door.y);
  await expect(frame.locator("[aria-live=polite]")).toHaveText("La chiave gira nella serratura.");

  const host = await logicalPoint(frame, 315, 135);
  await page.mouse.move(host.x, host.y);
  await expect(frame.locator("[data-fondale-primary-action] [data-fondale-action-text]"))
    .toHaveText("Dai Chiave a Oste");
  await page.mouse.click(host.x, host.y);
  await expect(frame.locator("[aria-live=polite]")).toHaveText("L'oste rifiuta la chiave.");

  await frame.focus();
  await page.keyboard.press("Escape");
  await expect(key).toHaveAttribute("aria-pressed", "false");
});

test("Inventory Objects expose Return-style contextual selection and secondary actions", async ({ page }) => {
  await page.goto("/test/fixtures/commands.html");
  const frame = page.locator("[data-fondale-frame]");
  await clickLogical(page, frame, 120, 145);
  await frame.locator("[data-fondale-inventory-trigger]").click();
  const key = frame.locator('[data-fondale-inventory-object="key"]');
  const preview = frame.locator("[data-fondale-command-preview]");

  for (const control of [
    frame.locator("[data-fondale-inventory-close]"),
    frame.locator("[data-fondale-inventory-previous]"),
    frame.locator("[data-fondale-inventory-next]"),
  ]) {
    await expect(control).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(control).toHaveCSS("border-top-color", "rgba(0, 0, 0, 0)");
  }
  await expect(key.locator("[data-fondale-inventory-label]")).toHaveCount(0);
  const keyBounds = await key.boundingBox();
  if (!keyBounds) throw new Error("missing Inventory Object bounds");
  expect(Math.abs(keyBounds.width - keyBounds.height)).toBeLessThanOrEqual(2);
  await key.hover();
  await page.evaluate(() => new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  }));
  await expect(preview).toBeVisible();
  await expect(preview.locator("[data-fondale-primary-action] [data-fondale-action-text]"))
    .toHaveText("Prendi Chiave");
  await expect(preview.locator("[data-fondale-secondary-action] [data-fondale-action-text]"))
    .toHaveText("Chiave / Guarda");
  await key.click({ button: "right" });
  const response = frame.locator("[aria-live=polite]");
  await expect(response).toHaveText("Una piccola chiave da inventario.");
  await expect(frame.locator("[data-fondale-inventory-panel]")).toBeVisible();
  await expect(preview).toBeHidden();
  const canvasBounds = await frame.locator("canvas").boundingBox();
  const responseBounds = await response.boundingBox();
  const panelBounds = await frame.locator("[data-fondale-inventory-panel]").boundingBox();
  if (!canvasBounds || !responseBounds || !panelBounds) throw new Error("missing overlay bounds");
  expect(canvasBounds.y + canvasBounds.height - responseBounds.y - responseBounds.height)
    .toBeLessThanOrEqual(15);
  expect(responseBounds.x + responseBounds.width).toBeLessThanOrEqual(panelBounds.x);

  await page.mouse.move(0, 0);
  await key.hover();
  await key.click();
  await expect(frame.locator("[data-fondale-inventory-panel]")).toBeHidden();
  await expect(key).toHaveAttribute("aria-pressed", "true");

  await frame.locator("[data-fondale-inventory-trigger]").click();
  await key.focus();
  await expect(preview.locator("[data-fondale-primary-action] [data-fondale-action-text]"))
    .toHaveText("Riponi Chiave");
  await key.click();
  await expect(key).toHaveAttribute("aria-pressed", "false");
});

test("Tab reveals active Nouns and a directional Passage remains full-frame", async ({ page }) => {
  await page.goto("/test/fixtures/commands.html");
  const frame = page.locator("[data-fondale-frame]");
  await frame.focus();
  await page.keyboard.down("Tab");
  await expect(frame.locator("[data-fondale-revealed-hotspot]")).toHaveCount(11);
  await expect(frame.locator("[data-fondale-revealed-passage]")).toHaveCount(4);
  await page.keyboard.up("Tab");
  await expect(frame.locator("[data-fondale-revealed-hotspots]")).toBeHidden();

  const canvas = frame.locator("canvas");
  const passage = await logicalPoint(frame, 405, 135);
  await page.mouse.move(passage.x, passage.y);
  await expect(canvas).toHaveCSS("cursor", "e-resize");
  await page.mouse.click(passage.x, passage.y, { button: "right" });
  await expect(frame).toHaveAttribute("data-fondale-scene", "opening");
  await expect(frame.locator("[data-fondale-command-preview]")).toBeVisible();
  await page.mouse.click(passage.x, passage.y);
  await expect(frame).toHaveAttribute("data-fondale-scene", "hall");

  const ground = await logicalPoint(frame, 200, 150);
  await page.mouse.dblclick(ground.x, ground.y);
  await expect(frame).toHaveAttribute("data-fondale-movement", "fast");
});

test("Inventory drawer paginates more than eight collected Objects", async ({ page }) => {
  await page.goto("/test/fixtures/commands.html");
  const frame = page.locator("[data-fondale-frame]");
  for (let index = 0; index < 8; index += 1) {
    await clickLogical(page, frame, 20 + index * 22, 110);
    await expect(frame.locator(`[data-fondale-inventory-object="item${index + 1}"]`)).toHaveCount(1);
  }
  await clickLogical(page, frame, 120, 145);
  await expect(frame.locator('[data-fondale-inventory-object="key"]')).toHaveCount(1);
  await frame.locator("[data-fondale-inventory-trigger]").click();

  await expect(frame.locator('[data-fondale-inventory-object="key"]')).toBeVisible();
  await expect(frame.locator("[data-fondale-inventory-object]")).toHaveCount(1);
  await frame.locator("[data-fondale-inventory-previous]").click();
  await expect(frame.locator("[data-fondale-inventory-object]")).toHaveCount(8);
  await expect(frame.locator('[data-fondale-inventory-object="item1"]')).toBeVisible();
  await frame.locator("[data-fondale-inventory]").hover();
  await page.mouse.wheel(0, 100);
  await expect(frame.locator('[data-fondale-inventory-object="key"]')).toBeVisible();
});

test("Inventory keyboard and pointer transitions apply HUD focus intentions", async ({ page }) => {
  await page.goto("/test/fixtures/commands.html");
  const frame = page.locator("[data-fondale-frame]");
  const panel = frame.locator("[data-fondale-inventory-panel]");

  await frame.focus();
  await page.keyboard.press("i");
  await expect(panel).toBeVisible();
  await expect(panel).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await expect(frame).toBeFocused();

  await frame.locator("[data-fondale-inventory-trigger]").click();
  await expect(panel).toBeFocused();
  await frame.locator("[data-fondale-inventory-scrim]").click({ position: { x: 300, y: 200 } });
  await expect(frame).toBeFocused();
});

test("contextual HUD presentation remains inside a smaller letterboxed viewport", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 700 });
  await page.goto("/test/fixtures/commands.html");
  const frame = page.locator("[data-fondale-frame]");
  const canvas = frame.locator("canvas");
  await expect(frame).toHaveCSS("width", "852px");
  await expect(frame).toHaveCSS("height", "480px");

  await frame.locator("[data-fondale-inventory-trigger]").click();
  await expect(frame.locator("[data-fondale-inventory-slot]"))
    .toHaveCount(8);
  const panelBounds = await frame.locator("[data-fondale-inventory-panel]").boundingBox();
  await frame.locator("[data-fondale-inventory-close]").click();

  const door = await logicalPoint(frame, 230, 110);
  await page.mouse.move(door.x, door.y);
  const canvasBounds = await canvas.boundingBox();
  const previewBounds = await frame.locator("[data-fondale-command-preview]").boundingBox();
  if (!canvasBounds || !panelBounds || !previewBounds) throw new Error("missing HUD bounds");
  for (const bounds of [panelBounds, previewBounds]) {
    expect.soft(bounds.x).toBeGreaterThanOrEqual(canvasBounds.x);
    expect.soft(bounds.y).toBeGreaterThanOrEqual(canvasBounds.y);
    expect.soft(bounds.x + bounds.width).toBeLessThanOrEqual(canvasBounds.x + canvasBounds.width);
    expect.soft(bounds.y + bounds.height).toBeLessThanOrEqual(canvasBounds.y + canvasBounds.height);
  }
});

test("the HUD responds independently to the visible size of a high-resolution Game", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/test/fixtures/commands.html?high-resolution");
  const frame = page.locator("[data-fondale-frame]");
  const canvas = frame.locator("canvas");
  const trigger = frame.locator("[data-fondale-inventory-trigger]");
  await trigger.click();
  const panel = frame.locator("[data-fondale-inventory-panel]");
  const widePanel = await panel.boundingBox();
  const wideTrigger = await trigger.boundingBox();
  const wideFont = Number.parseFloat(await panel.evaluate((element) => getComputedStyle(element).fontSize));
  if (!widePanel || !wideTrigger) throw new Error("missing wide HUD bounds");

  expect(widePanel.width / 1280).toBeCloseTo(0.3, 2);
  expect(widePanel.width).toBeLessThanOrEqual(480);
  expect(Math.abs(wideTrigger.width - wideTrigger.height)).toBeLessThanOrEqual(1);

  await page.setViewportSize({ width: 900, height: 700 });
  await expect(frame).toHaveCSS("width", "900px");
  const compactPanel = await panel.boundingBox();
  const compactTrigger = await trigger.boundingBox();
  const compactFont = Number.parseFloat(await panel.evaluate((element) => getComputedStyle(element).fontSize));
  const canvasBounds = await canvas.boundingBox();
  const overlayBounds = await frame.locator("[data-fondale-overlay]").boundingBox();
  if (!compactPanel || !compactTrigger || !canvasBounds || !overlayBounds) {
    throw new Error("missing compact HUD bounds");
  }

  expect(compactPanel.width).toBeLessThan(widePanel.width);
  expect(compactPanel.width).toBeGreaterThanOrEqual(260);
  expect(compactTrigger.width).toBeLessThan(wideTrigger.width);
  expect(compactTrigger.width).toBeGreaterThanOrEqual(36);
  expect(Math.abs(compactTrigger.width - compactTrigger.height)).toBeLessThanOrEqual(1);
  expect(compactFont).toBeLessThan(wideFont);
  expect(compactFont).toBeGreaterThanOrEqual(12);
  expect(overlayBounds).toEqual(canvasBounds);
});

test("Speech is readable over the Scene and Choice temporarily owns input", async ({ page }) => {
  await page.goto("/test/fixtures/commands.html");
  const frame = page.locator("[data-fondale-frame]");
  const canvasBounds = await frame.locator("canvas").boundingBox();
  if (!canvasBounds) throw new Error("missing canvas bounds");
  const host = await logicalPoint(frame, 315, 135);
  await page.mouse.click(host.x, host.y);
  const line = frame.locator("[data-fondale-line]");
  await expect(line).toHaveText("Benvenuto.");
  await expect(line).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(line).toHaveCSS("border-top-width", "0px");
  await expect(line).not.toHaveCSS("text-shadow", "none");
  expect(await line.evaluate((element) => getComputedStyle(element).textShadow)).toContain("2px 0px");
  const lineBounds = await line.boundingBox();
  if (!lineBounds) throw new Error("missing line bounds");
  expect(lineBounds.y).toBeGreaterThanOrEqual(canvasBounds.y);
  expect(lineBounds.y + lineBounds.height).toBeLessThanOrEqual(canvasBounds.y + canvasBounds.height);
  expect(lineBounds.y + lineBounds.height).toBeLessThan(canvasBounds.y + canvasBounds.height - 30);
  const scale = canvasBounds.height / 240;
  const lineBottom = (lineBounds.y + lineBounds.height - canvasBounds.y) / scale;
  expect(lineBottom).toBeGreaterThanOrEqual(120);
  expect(lineBottom).toBeLessThanOrEqual(128.5);

  await frame.focus();
  await page.keyboard.press(".");
  const narration = frame.locator("[data-fondale-narration]");
  await expect(narration).toHaveText("La sera scende lentamente sul porto.");
  await expect(narration).toHaveCSS("color", "rgb(244, 223, 180)");
  const narrationBounds = await narration.boundingBox();
  if (!narrationBounds) throw new Error("missing Narration bounds");
  expect(canvasBounds.y + canvasBounds.height - narrationBounds.y - narrationBounds.height)
    .toBeLessThanOrEqual(15);
  expect(Number.parseFloat(await narration.evaluate((element) => getComputedStyle(element).maxWidth)))
    .toBeGreaterThan(150);
  await frame.locator("[data-fondale-inventory-trigger]").click();
  const inventoryBounds = await frame.locator("[data-fondale-inventory-panel]").boundingBox();
  const shiftedNarrationBounds = await narration.boundingBox();
  if (!inventoryBounds || !shiftedNarrationBounds) throw new Error("missing lower text bounds");
  expect(shiftedNarrationBounds.x + shiftedNarrationBounds.width).toBeLessThanOrEqual(inventoryBounds.x);
  await frame.locator("[data-fondale-inventory-close]").click();

  await page.keyboard.press(".");
  const choice = frame.locator("[data-fondale-choice]");
  await expect(choice).toBeVisible();
  await expect(frame.locator("[data-fondale-inventory-trigger]")).toBeHidden();
  await page.keyboard.press("1");
  await expect(line).toHaveText("Grazie!");
  await page.mouse.click(host.x, host.y, { button: "middle" });
  await expect(line).toHaveText("A te.");
});

test("wrapped Speech remains inside the full Scene", async ({ page }) => {
  await page.goto("/test/fixtures/commands.html");
  const frame = page.locator("[data-fondale-frame]");
  const canvasBounds = await frame.locator("canvas").boundingBox();
  if (!canvasBounds) throw new Error("missing canvas bounds");
  const door = await logicalPoint(frame, 230, 110);
  await page.mouse.click(door.x, door.y, { button: "right" });
  const speech = frame.locator("[data-fondale-line]");
  await expect(speech).toContainText("domanda molto lunga");
  const speechBounds = await speech.boundingBox();
  if (!speechBounds) throw new Error("missing speech bounds");
  expect(speechBounds.y + speechBounds.height).toBeLessThanOrEqual(canvasBounds.y + canvasBounds.height);
});

test("Dialogue Choices use the Player Character speech styling", async ({ page }) => {
  await page.goto("/test/fixtures/commands.html");
  const frame = page.locator("[data-fondale-frame]");
  const host = await logicalPoint(frame, 315, 135);
  await page.mouse.click(host.x, host.y);
  await expect(frame.locator("[data-fondale-line]")).toHaveText("Benvenuto.");
  await frame.focus();
  await page.keyboard.press(".");
  await expect(frame.locator("[data-fondale-narration]")).toBeVisible();
  await page.keyboard.press(".");
  const choice = frame.locator("[data-fondale-choice]");
  await expect(choice).toBeVisible();
  const alternatives = choice.getByRole("button");
  await expect(alternatives).toHaveCount(2);
  await expect(alternatives.nth(0)).toHaveText("1. Grazie!");
  await expect(alternatives.nth(1)).toHaveText("2. Non ora.");
  await expect(choice).toHaveCSS("border-top-width", "0px");
  expect(await choice.evaluate((element) => getComputedStyle(element).backgroundImage))
    .toContain("linear-gradient");
  await expect(alternatives.nth(0)).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(alternatives.nth(0)).toHaveCSS("border-top-width", "0px");
  await expect(alternatives.nth(0)).toHaveCSS("outline-style", "none");
  await expect(alternatives.nth(0)).toHaveCSS("text-align", "left");
  await expect(alternatives.nth(0)).toHaveCSS("filter", "brightness(1)");
  await expect(alternatives.nth(1)).toHaveCSS("filter", "brightness(1)");
  await alternatives.nth(1).hover();
  await expect(alternatives.nth(1)).toHaveCSS("filter", "brightness(1.45)");
  await expect(alternatives.nth(0)).toHaveCSS("filter", "brightness(1)");
  const playerChoiceStyle = await alternatives.first().evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      color: style.color,
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
      textShadow: style.textShadow,
    };
  });
  await page.keyboard.press("1");
  const line = frame.locator("[data-fondale-line]");
  await expect(line).toHaveText("Grazie!");
  const playerSpeechStyle = await line.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      color: style.color,
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
      textShadow: style.textShadow,
    };
  });
  expect(playerChoiceStyle).toEqual(playerSpeechStyle);
});

test("text speed controls automatic Line advancement", async ({ page }) => {
  await page.goto("/test/fixtures/commands.html");
  const frame = page.locator("[data-fondale-frame]");
  await frame.focus();
  await page.keyboard.press("F5");
  await frame.locator('[data-fondale-modal="options"]').getByLabel("Text speed").selectOption("fast");
  await page.keyboard.press("Escape");
  const host = await logicalPoint(frame, 315, 135);
  await page.mouse.click(host.x, host.y);
  await expect(frame.locator("[data-fondale-line]")).toHaveText("Benvenuto.");
  await expect(frame.locator("[data-fondale-choice]")).toBeVisible({ timeout: 2_500 });
});

test("the browser adapter plays Line audio at the HUD-owned preference volume", async ({ page }) => {
  await page.addInitScript(() => {
    HTMLMediaElement.prototype.play = function (this: HTMLMediaElement) {
      (window as unknown as {
        __fondalePlayedAudio?: { readonly source: string; readonly volume: number };
      }).__fondalePlayedAudio = { source: this.currentSrc || this.src, volume: this.volume };
      return Promise.resolve();
    };
  });
  await page.goto("/test/fixtures/commands.html");
  const frame = page.locator("[data-fondale-frame]");
  await frame.focus();
  await page.keyboard.press("F5");
  await frame.getByLabel("Speech volume").fill("0.35");
  await page.keyboard.press("Escape");

  const host = await logicalPoint(frame, 315, 135);
  await page.mouse.click(host.x, host.y);
  await expect(frame.locator("[data-fondale-line]")).toHaveText("Benvenuto.");
  await expect.poll(() => page.evaluate(() =>
    (window as unknown as {
      __fondalePlayedAudio?: { readonly source: string; readonly volume: number };
    }).__fondalePlayedAudio,
  )).toMatchObject({ volume: 0.35 });
});

test("Options and Help keep Player Preferences separate from continuation", async ({ page }) => {
  await page.goto("/test/fixtures/commands.html");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  const frame = page.locator("[data-fondale-frame]");
  await clickLogical(page, frame, 120, 145);
  await frame.locator("[data-fondale-inventory-trigger]").click();
  const key = frame.locator('[data-fondale-inventory-object="key"]');
  await key.click();
  await expect(key).toHaveAttribute("aria-pressed", "true");

  await frame.focus();
  await page.keyboard.press("F5");
  const options = frame.locator('[data-fondale-modal="options"]');
  await expect(options.getByLabel("Speech volume")).toBeVisible();
  await options.getByLabel("Speech volume").fill("0.5");
  expect(await page.evaluate(() => localStorage.getItem("fondale.preferences.test.commands")))
    .toContain('"audioVolume":0.5');
  expect(await page.evaluate(() => Array.from({ length: localStorage.length }, (_, index) =>
    localStorage.key(index)
  ).find((candidate) => candidate?.startsWith("fondale.continuation.")))).toBeTruthy();
  await frame.getByRole("button", { name: "Help" }).click();
  await expect(frame.locator("[data-fondale-help]")).toContainText("Bag or I opens Inventory");
  await expect(frame.locator("[data-fondale-help]")).not.toContainText("Save");
});
