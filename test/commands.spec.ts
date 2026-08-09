import { expect, test } from "@playwright/test";

test("the public browser completes Look At → Noun → Command Response", async ({ page }) => {
  await page.goto("/test/fixtures/commands.html");
  const frame = page.locator("[data-fondale-frame]");
  await expect(frame).toBeVisible();

  await frame.locator('[data-fondale-verb="look-at"]').click();
  const canvas = frame.locator("canvas");
  const bounds = await canvas.boundingBox();
  if (!bounds) throw new Error("missing canvas bounds");
  await page.mouse.click(
    bounds.x + (230 / 426) * bounds.width,
    bounds.y + (110 / 240) * bounds.height,
  );

  await expect(frame.locator("[aria-live=polite]")).toHaveText("Un vecchio portone.");
  await expect(frame.locator('[data-fondale-verb="look-at"]')).toHaveAttribute("aria-pressed", "false");
});

test("the command HUD keeps its grid, keyboard mapping, preview, cancel, and Preferred Verb", async ({ page }) => {
  await page.goto("/test/fixtures/commands.html");
  const frame = page.locator("[data-fondale-frame]");
  await expect(frame).toBeVisible();
  const verbs = frame.locator("[data-fondale-verb]");
  await expect(verbs).toHaveText([
    "Apri", "Raccogli", "Spingi",
    "Chiudi", "Guarda", "Tira",
    "Dai", "Parla con", "Usa",
  ]);

  await frame.focus();
  await page.keyboard.press("z");
  await expect(frame.locator('[data-fondale-verb="give"]')).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Escape");
  await expect(frame.locator('[data-fondale-verb="give"]')).toHaveAttribute("aria-pressed", "false");
  await page.keyboard.press("z");

  const canvas = frame.locator("canvas");
  const bounds = await canvas.boundingBox();
  if (!bounds) throw new Error("missing canvas bounds");
  const door = {
    x: bounds.x + (230 / 426) * bounds.width,
    y: bounds.y + (110 / 240) * bounds.height,
  };
  await page.mouse.move(door.x, door.y);
  await expect(frame.locator("[data-fondale-command-preview]")).toContainText("Dai Portone");
  await page.mouse.click(door.x, door.y, { button: "right" });

  await expect(frame.locator("[aria-live=polite]")).toHaveText("Un vecchio portone.");
  await expect(frame.locator('[data-fondale-verb="give"]')).toHaveAttribute("aria-pressed", "true");
});

test("an Inventory Object becomes the first Noun of a binary Use Command", async ({ page }) => {
  await page.goto("/test/fixtures/commands.html");
  const frame = page.locator("[data-fondale-frame]");
  await expect(frame).toBeVisible();
  const canvas = frame.locator("canvas");
  const bounds = await canvas.boundingBox();
  if (!bounds) throw new Error("missing canvas bounds");
  const logicalClick = (x: number, y: number) => page.mouse.click(
    bounds.x + (x / 426) * bounds.width,
    bounds.y + (y / 240) * bounds.height,
  );
  await expect(frame.locator('[data-fondale-inventory-slot="empty"]')).toHaveCount(8);

  await frame.locator('[data-fondale-verb="pick-up"]').click();
  await logicalClick(120, 145);
  const key = frame.locator('[data-fondale-inventory-object="key"]');
  await expect(key).toBeVisible();
  await expect(frame.locator('[data-fondale-inventory-slot="empty"]')).toHaveCount(7);
  await expect(frame.locator("[aria-live=polite]")).toHaveText("Raccolgo la chiave.");

  await frame.locator('[data-fondale-verb="use"]').click();
  await key.click();
  await expect(key).toHaveAttribute("aria-pressed", "true");
  await expect(frame.locator("[data-fondale-command-preview]")).toContainText("Usa Chiave");
  await page.mouse.move(
    bounds.x + (230 / 426) * bounds.width,
    bounds.y + (110 / 240) * bounds.height,
  );
  await expect(frame.locator("[data-fondale-command-preview]")).toHaveText("Usa Chiave con Portone");
  await logicalClick(230, 110);

  await expect(frame.locator("[aria-live=polite]")).toHaveText("La chiave gira nella serratura.");
  await expect(key).toHaveAttribute("aria-pressed", "false");
});

test("Tab reveals active Nouns and a directional Passage supports Fast Walk", async ({ page }) => {
  await page.goto("/test/fixtures/commands.html");
  const frame = page.locator("[data-fondale-frame]");
  await expect(frame).toBeVisible();
  await frame.focus();

  await page.keyboard.down("Tab");
  await expect(frame.locator("[data-fondale-revealed-hotspot]")).toHaveCount(2);
  await expect(frame.locator("[data-fondale-revealed-passage]")).toHaveCount(1);
  await page.keyboard.up("Tab");
  await expect(frame.locator("[data-fondale-revealed-hotspots]")).toBeHidden();

  const canvas = frame.locator("canvas");
  const bounds = await canvas.boundingBox();
  if (!bounds) throw new Error("missing canvas bounds");
  const passage = {
    x: bounds.x + (405 / 426) * bounds.width,
    y: bounds.y + (135 / 240) * bounds.height,
  };
  await page.mouse.move(passage.x, passage.y);
  await expect(frame.locator("[data-fondale-command-preview]")).toHaveText("Verso l'uscita");
  await expect(canvas).toHaveCSS("cursor", "e-resize");
  await page.mouse.dblclick(passage.x, passage.y);

  await expect(frame).toHaveAttribute("data-fondale-movement", "fast");
  await expect(frame).toHaveAttribute("data-fondale-scene", "hall");
});
