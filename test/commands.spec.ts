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

test("one-time hints introduce mouse, reveal, and Inventory controls before reuse", async ({ page }) => {
  await page.goto("/test/fixtures/commands.html");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  const frame = page.locator("[data-fondale-frame]");
  await expect(frame).toBeVisible();
  const hint = frame.locator("[data-fondale-hint]");
  await expect(hint).toContainText("Left click");
  const canvas = frame.locator("canvas");
  const bounds = await canvas.boundingBox();
  if (!bounds) throw new Error("missing canvas bounds");
  const point = (x: number, y: number) => ({
    x: bounds.x + (x / 426) * bounds.width,
    y: bounds.y + (y / 240) * bounds.height,
  });

  const ground = point(360, 160);
  await page.mouse.click(ground.x, ground.y);
  await expect(hint).toContainText("Right click");
  const door = point(230, 110);
  await page.mouse.click(door.x, door.y, { button: "right" });
  await expect(hint).toContainText("Tab");
  await frame.focus();
  await page.keyboard.down("Tab");
  await expect(hint).toContainText("wheel or arrows");
  await page.keyboard.up("Tab");
  await expect.poll(() => page.evaluate(() => {
    const preferences = JSON.parse(localStorage.getItem("fondale.preferences.test.commands") ?? "{}") as { shownHints?: string[] };
    return preferences.shownHints;
  })).toEqual(["left-click", "right-click", "tab", "inventory"]);

  await page.reload();
  await expect(frame.locator("[data-fondale-hint]")).toBeEmpty();
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

test("Give requires two Nouns while Inventory Use supports unary and ordered binary Commands", async ({ page }) => {
  await page.goto("/test/fixtures/commands.html");
  const frame = page.locator("[data-fondale-frame]");
  await expect(frame).toBeVisible();
  const canvas = frame.locator("canvas");
  const bounds = await canvas.boundingBox();
  if (!bounds) throw new Error("missing canvas bounds");
  const clickLogical = (x: number, y: number) => page.mouse.click(
    bounds.x + (x / 426) * bounds.width,
    bounds.y + (y / 240) * bounds.height,
  );
  const collect = async (x: number, y: number, object: string) => {
    await frame.locator('[data-fondale-verb="pick-up"]').click();
    await clickLogical(x, y);
    await expect(frame.locator(`[data-fondale-inventory-object="${object}"]`)).toBeVisible();
  };

  await frame.locator('[data-fondale-verb="give"]').click();
  await clickLogical(230, 110);
  await expect(frame.locator('[data-fondale-verb="give"]')).toHaveAttribute("aria-pressed", "true");
  await expect(frame).not.toHaveAttribute("data-fondale-movement", /.+/);

  await collect(120, 145, "key");
  await frame.locator('[data-fondale-verb="give"]').click();
  await frame.locator('[data-fondale-inventory-object="key"]').click();
  await clickLogical(315, 135);
  await expect(frame.locator("[aria-live=polite]")).toHaveText("L'oste rifiuta la chiave.");

  await collect(20, 110, "item1");
  await frame.locator('[data-fondale-verb="use"]').click();
  await frame.locator('[data-fondale-inventory-object="item1"]').click();
  await expect(frame.locator("[aria-live=polite]")).toHaveText("Uso Oggetto 1 da solo.");
  await expect(frame.locator('[data-fondale-verb="use"]')).toHaveAttribute("aria-pressed", "false");

  await collect(42, 110, "item2");
  await collect(64, 110, "item3");
  await frame.locator('[data-fondale-verb="use"]').click();
  await frame.locator('[data-fondale-inventory-object="item2"]').click();
  await expect(frame.locator('[data-fondale-inventory-object="item2"]')).toHaveAttribute("aria-pressed", "true");
  await frame.locator('[data-fondale-inventory-object="item3"]').click();
  await expect(frame.locator("[aria-live=polite]")).toHaveText("Uso Oggetto 2 con Oggetto 3.");
});

test("Tab reveals active Nouns and a directional Passage supports Fast Walk", async ({ page }) => {
  await page.goto("/test/fixtures/commands.html");
  const frame = page.locator("[data-fondale-frame]");
  await expect(frame).toBeVisible();
  await frame.focus();

  await page.keyboard.down("Tab");
  await expect(frame.locator("[data-fondale-revealed-hotspot]")).toHaveCount(11);
  await expect(frame.locator("[data-fondale-revealed-passage]")).toHaveCount(4);
  const hotspotLabels = frame.locator('[data-fondale-revealed-label="hotspot"]');
  await expect(hotspotLabels).toHaveCount(11);
  await expect(hotspotLabels.filter({ hasText: "Portone" })).toHaveCount(1);
  await expect(hotspotLabels.filter({ hasText: "Chiave" })).toHaveCount(1);
  await expect(hotspotLabels.filter({ hasText: "Oste" })).toHaveCount(1);
  await expect(frame.locator('[data-fondale-revealed-label="passage"]')).toHaveText([
    "Verso l'uscita", "Verso l'uscita", "Verso l'uscita", "Verso l'uscita",
  ]);
  await page.keyboard.up("Tab");
  await expect(frame.locator("[data-fondale-revealed-hotspots]")).toBeHidden();

  const canvas = frame.locator("canvas");
  const bounds = await canvas.boundingBox();
  if (!bounds) throw new Error("missing canvas bounds");
  const passage = {
    x: bounds.x + (405 / 426) * bounds.width,
    y: bounds.y + (135 / 240) * bounds.height,
  };
  for (const [x, expectedCursor] of [[28, "n-resize"], [83, "s-resize"], [138, "pointer"]] as const) {
    await page.mouse.move(
      bounds.x + (x / 426) * bounds.width,
      bounds.y + (82 / 240) * bounds.height,
    );
    await expect(canvas).toHaveCSS("cursor", expectedCursor);
  }
  await page.mouse.move(passage.x, passage.y);
  await expect(frame.locator("[data-fondale-command-preview]")).toHaveText("Verso l'uscita");
  await expect(canvas).toHaveCSS("cursor", "e-resize");

  await frame.locator('[data-fondale-verb="look-at"]').click();
  await page.mouse.click(passage.x, passage.y);
  await expect(frame.locator("[aria-live=polite]")).toHaveText("Non succede nulla.");
  await expect(frame).toHaveAttribute("data-fondale-scene", "opening");

  await page.mouse.click(passage.x, passage.y, { button: "right" });
  await expect(frame).toHaveAttribute("data-fondale-scene", "hall");
  const returnPassage = {
    x: bounds.x + (20 / 426) * bounds.width,
    y: bounds.y + (135 / 240) * bounds.height,
  };
  await page.mouse.move(returnPassage.x, returnPassage.y);
  await expect(canvas).toHaveCSS("cursor", "w-resize");
  await page.mouse.dblclick(returnPassage.x, returnPassage.y);

  await expect(frame).toHaveAttribute("data-fondale-movement", "fast");
  await expect(frame).toHaveAttribute("data-fondale-scene", "opening");
});

test("Inventory pagination exposes more than eight collected Objects", async ({ page }) => {
  await page.goto("/test/fixtures/commands.html");
  const frame = page.locator("[data-fondale-frame]");
  await expect(frame).toBeVisible();
  const canvas = frame.locator("canvas");
  const bounds = await canvas.boundingBox();
  if (!bounds) throw new Error("missing canvas bounds");
  const clickLogical = (x: number, y: number) => page.mouse.click(
    bounds.x + (x / 426) * bounds.width,
    bounds.y + (y / 240) * bounds.height,
  );

  for (let index = 0; index < 8; index += 1) {
    await frame.locator('[data-fondale-verb="pick-up"]').click();
    await clickLogical(20 + index * 22, 110);
    await expect(frame.locator(`[data-fondale-inventory-object="item${index + 1}"]`)).toBeVisible();
  }
  await frame.locator('[data-fondale-verb="pick-up"]').click();
  await clickLogical(120, 145);

  await expect(frame.locator('[data-fondale-inventory-object="key"]')).toBeVisible();
  await expect(frame.locator("[data-fondale-inventory-object]")).toHaveCount(1);
  await expect(frame.locator('[data-fondale-inventory-slot="empty"]')).toHaveCount(7);
  await frame.locator("[data-fondale-inventory-previous]").click();
  await expect(frame.locator("[data-fondale-inventory-object]")).toHaveCount(8);
  await expect(frame.locator('[data-fondale-inventory-object="item1"]')).toBeVisible();

  await frame.locator("[data-fondale-inventory]").hover();
  await page.mouse.wheel(0, 100);
  await expect(frame.locator('[data-fondale-inventory-object="key"]')).toBeVisible();
});

test("Speech follows its Character and Choice uses the HUD with spoken alternatives", async ({ page }) => {
  await page.goto("/test/fixtures/commands.html");
  const frame = page.locator("[data-fondale-frame]");
  await expect(frame).toBeVisible();
  const canvas = frame.locator("canvas");
  const bounds = await canvas.boundingBox();
  if (!bounds) throw new Error("missing canvas bounds");
  const host = {
    x: bounds.x + (315 / 426) * bounds.width,
    y: bounds.y + (135 / 240) * bounds.height,
  };

  await frame.locator('[data-fondale-verb="talk-to"]').click();
  await page.mouse.click(host.x, host.y);
  const line = frame.locator("[data-fondale-line]");
  await expect(line).toHaveText("Benvenuto.");
  await expect(line).toHaveAttribute("data-fondale-speaker", "host");
  await expect(line).toHaveAttribute("data-fondale-presentation", "speech");
  const lineBounds = await line.boundingBox();
  if (!lineBounds) throw new Error("missing line bounds");
  expect(lineBounds.y + lineBounds.height).toBeLessThan(bounds.y + (180 / 240) * bounds.height);

  await page.mouse.click(host.x, host.y);
  await expect(line).toHaveText("Benvenuto.");
  await frame.focus();
  await page.keyboard.press(".");
  const choice = frame.locator("[data-fondale-choice]");
  await expect(choice).toBeVisible();
  await expect(frame.locator('[aria-label="Verbs"]')).toBeHidden();
  await expect(frame.locator("[data-fondale-inventory-previous]")).toBeHidden();
  await expect(frame.locator("[data-fondale-inventory-next]")).toBeHidden();
  await page.keyboard.press("1");
  await expect(line).toHaveText("Grazie!");
  await expect(line).toHaveAttribute("data-fondale-speaker", "player");
  await page.mouse.click(host.x, host.y, { button: "middle" });
  await expect(line).toHaveText("A te.");
  await frame.focus();
  await page.keyboard.press("Escape");
  await expect(line).toHaveCount(0);
  await expect(frame.locator('[aria-label="Verbs"]')).toBeVisible();

  await frame.locator('[data-fondale-verb="talk-to"]').click();
  await page.mouse.click(host.x, host.y);
  await expect(line).toHaveText("Benvenuto.");
  await frame.focus();
  await page.keyboard.press(".");
  await expect(choice).toBeVisible();
  await page.keyboard.press("2");
  await expect(line).toHaveText("Come vuoi.");
  await expect(line).toHaveAttribute("data-fondale-speaker", "host");
});

test("text speed controls automatic Line advancement", async ({ page }) => {
  await page.goto("/test/fixtures/commands.html");
  const frame = page.locator("[data-fondale-frame]");
  await expect(frame).toBeVisible();
  await frame.focus();
  await page.keyboard.press("F5");
  await frame.locator('[data-fondale-modal="options"]').getByLabel("Text speed").selectOption("fast");
  await page.keyboard.press("Escape");

  await frame.locator('[data-fondale-verb="talk-to"]').click();
  const canvas = frame.locator("canvas");
  const bounds = await canvas.boundingBox();
  if (!bounds) throw new Error("missing canvas bounds");
  await page.mouse.click(
    bounds.x + (315 / 426) * bounds.width,
    bounds.y + (135 / 240) * bounds.height,
  );
  await expect(frame.locator("[data-fondale-line]")).toHaveText("Benvenuto.");
  await expect(frame.locator("[data-fondale-choice]")).toBeVisible({ timeout: 2_500 });
});

test("Options, Help, named Save Slots, and Command State restore through shortcuts", async ({ page }) => {
  await page.goto("/test/fixtures/commands.html");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  const frame = page.locator("[data-fondale-frame]");
  await expect(frame).toBeVisible();
  const canvas = frame.locator("canvas");
  const bounds = await canvas.boundingBox();
  if (!bounds) throw new Error("missing canvas bounds");
  const clickLogical = (x: number, y: number) => page.mouse.click(
    bounds.x + (x / 426) * bounds.width,
    bounds.y + (y / 240) * bounds.height,
  );

  await frame.locator('[data-fondale-verb="pick-up"]').click();
  await clickLogical(120, 145);
  const key = frame.locator('[data-fondale-inventory-object="key"]');
  await expect(key).toBeVisible();
  await frame.locator('[data-fondale-verb="use"]').click();
  await key.click();
  await expect(key).toHaveAttribute("aria-pressed", "true");

  await frame.focus();
  await page.keyboard.press("Control+s");
  const modal = frame.locator('[data-fondale-modal="save"]');
  await expect(modal).toBeVisible();
  await modal.locator("[data-fondale-save-name]").fill("Davanti al portone");
  await modal.locator("[data-fondale-save-confirm]").click();

  await frame.focus();
  await page.keyboard.press("Control+s");
  await modal.locator("[data-fondale-save-name]").fill("Davanti al portone");
  await modal.locator("[data-fondale-save-confirm]").click();
  await expect.poll(() => page.evaluate(() => {
    const slots = JSON.parse(localStorage.getItem("fondale.save-slots") ?? "[]") as unknown[];
    return slots.length;
  })).toBe(1);

  await frame.focus();
  await page.keyboard.press("Escape");
  await expect(key).toHaveAttribute("aria-pressed", "false");

  await page.keyboard.press("Control+l");
  await frame.locator('[data-fondale-load-slot="0"]').click();
  await expect(key).toHaveAttribute("aria-pressed", "true");

  await frame.focus();
  await page.keyboard.press("F5");
  const options = frame.locator('[data-fondale-modal="options"]');
  await expect(options).toBeVisible();
  await options.getByLabel("Command preview").selectOption("sentence-line");
  expect(await page.evaluate(() => localStorage.getItem("fondale.preferences.test.commands"))).toContain("sentence-line");
  expect(await page.evaluate(() => localStorage.getItem("fondale.save-slots"))).not.toContain("sentence-line");
  await frame.getByRole("button", { name: "Help" }).click();
  await expect(frame.locator("[data-fondale-help]")).toContainText("QWE/ASD/ZXC");
  await expect(frame.locator("[data-fondale-help]")).toContainText("Ctrl+S Save");

  await page.evaluate(() => {
    const slots = JSON.parse(localStorage.getItem("fondale.save-slots") ?? "[]") as Array<Record<string, unknown>>;
    const incompatible = structuredClone(slots[0]) as Record<string, unknown>;
    incompatible.name = "Vecchio salvataggio";
    const snapshot = incompatible.snapshot as Record<string, unknown>;
    snapshot.projectVersion = "0";
    slots.push(incompatible);
    localStorage.setItem("fondale.save-slots", JSON.stringify(slots));
  });
  await frame.focus();
  await page.keyboard.press("Control+l");
  const incompatible = frame.locator('[data-fondale-load-slot="1"]');
  await expect(incompatible).toBeDisabled();
  await expect(incompatible).toContainText("incompatible");
  await expect(frame.locator('[data-fondale-load-diagnostic="1"]')).toContainText("Project Version");
});
