import { test, type Page } from "@playwright/test";

import { clickWorld, expect, openGame, shoot } from "./harness";

test.setTimeout(90_000);

type Verb = "pick-up" | "look-at" | "talk-to" | "use";

async function command(page: Page, verb: Verb, x: number, y: number): Promise<void> {
  await page.locator(`[data-fondale-verb="${verb}"]`).click();
  await clickWorld(page, x, y);
}

async function advance(page: Page): Promise<void> {
  await page.locator("[data-fondale-frame]").focus();
  await page.keyboard.press(".");
}

async function reachHarbour(page: Page, previousScene?: Uint8Array): Promise<void> {
  await command(page, "pick-up", 118, 165);
  const key = page.locator('[data-fondale-inventory-object="key"]');
  await expect(key).toBeVisible({ timeout: 8_000 });
  await expect(page.locator("[aria-live=polite]")).toHaveText("Prendo la chiave d'ottone.");

  await page.locator('[data-fondale-verb="use"]').click();
  await key.click();
  await clickWorld(page, 210, 150);
  await expect(page.locator("[aria-live=polite]")).toHaveText(
    "La chiave d'ottone apre il cancello.",
    { timeout: 8_000 },
  );

  await clickWorld(page, 210, 140);
  await expect(page.locator("[data-fondale-frame]")).toHaveAttribute(
    "data-fondale-scene",
    "townSquare",
    { timeout: 8_000 },
  );
  const townSquare = await page.locator("[data-fondale-frame] canvas").screenshot();
  if (previousScene) expect(townSquare.equals(previousScene)).toBe(false);
  await shoot(page, "capri-1535-town-square");

  await clickWorld(page, 365, 120);
  await expect(page.locator("[data-fondale-frame]")).toHaveAttribute(
    "data-fondale-scene",
    "harbour",
    { timeout: 8_000 },
  );
}

async function meetRaffaele(
  page: Page,
  choice: "Quanto mi dai per sistemarlo?" | "Dipende: il mare paga meglio di te?",
  restoreAtChoice = false,
): Promise<void> {
  await command(page, "talk-to", 322, 150);
  const line = page.locator("[data-fondale-line]");
  await expect(line).toContainText("guardare il mare", { timeout: 8_000 });
  await advance(page);
  const choices = page.locator("[data-fondale-choice]");
  await expect(choices.getByRole("button")).toHaveCount(2);

  if (restoreAtChoice) {
    await page.locator("#restore").click();
    await expect(choices).toBeVisible({ timeout: 8_000 });
  }

  await page.getByRole("button", { name: choice, exact: true }).click();
  await expect(line).toHaveText(choice);
  await advance(page);
  // The sequence deliberately repeats Michele's answer before Raffaele replies.
  await expect(line).toHaveText(choice);
  await advance(page);
  await expect(line).toContainText("argano");
  await advance(page);
  await expect(line).toContainText("olio e la manovella");
  await advance(page);
  await expect(line).toHaveCount(0);
}

async function repairWinch(page: Page): Promise<void> {
  await command(page, "pick-up", 375, 160);
  const handle = page.locator('[data-fondale-inventory-object="winchHandle"]');
  await expect(handle).toBeVisible({ timeout: 8_000 });

  await command(page, "pick-up", 409, 160);
  const oil = page.locator('[data-fondale-inventory-object="oilFlask"]');
  await expect(oil).toBeVisible({ timeout: 8_000 });

  await page.locator('[data-fondale-verb="use"]').click();
  await oil.click();
  await clickWorld(page, 250, 160);
  await expect(page.locator("[aria-live=polite]")).toHaveText(
    "L'olio libera lentamente gli ingranaggi.",
    { timeout: 8_000 },
  );
  await expect(oil).toHaveCount(0);

  await page.locator('[data-fondale-verb="use"]').click();
  await handle.click();
  await clickWorld(page, 250, 160);
  await expect(page.locator("[aria-live=polite]")).toHaveText(
    "La manovella entra al suo posto. Il gozzo può partire.",
    { timeout: 8_000 },
  );
  await expect(handle).toHaveCount(0);
}

async function sailToMonteSolaroAndReadConclusion(page: Page, expected: string): Promise<void> {
  await clickWorld(page, 115, 145);
  await expect(page.locator("[data-fondale-frame]")).toHaveAttribute("data-fondale-scene", "grotto", {
    timeout: 8_000,
  });
  await shoot(page, "capri-1535-grotto");
  await clickWorld(page, 230, 95);
  await expect(page.locator("[data-fondale-frame]")).toHaveAttribute(
    "data-fondale-scene",
    "monteSolaro",
    { timeout: 8_000 },
  );
  await command(page, "look-at", 215, 120);
  const line = page.locator("[data-fondale-line]");
  await expect(line).toContainText("Da Monte Solaro", { timeout: 8_000 });
  await advance(page);
  await expect(line).toContainText(expected);
  await advance(page);
  await expect(line).toHaveCount(0);
}

test("the packaged Example completes the harbour puzzle through the command interface", async ({
  page,
}) => {
  const { errors } = await openGame(page);
  const canvas = page.locator("[data-fondale-frame] canvas");
  const opening = await canvas.screenshot();

  await reachHarbour(page, opening);
  const harbour = await canvas.screenshot();
  await shoot(page, "capri-1535-harbour-new");

  await meetRaffaele(page, "Quanto mi dai per sistemarlo?", true);
  await repairWinch(page);
  await shoot(page, "capri-1535-harbour-repaired");

  await page.locator("#restore").click();
  await expect(page.locator('[data-fondale-inventory-object="oilFlask"]')).toHaveCount(0);
  await expect(page.locator('[data-fondale-inventory-object="winchHandle"]')).toHaveCount(0);

  await sailToMonteSolaroAndReadConclusion(page, "Raffaele dovrà ammettere");
  await page.locator("#restore").click();
  await command(page, "look-at", 215, 120);
  await expect(page.locator("[aria-live=polite]")).toHaveText(
    "Il mare continua a fingere di essere innocente.",
    { timeout: 8_000 },
  );
  const monteSolaro = await canvas.screenshot();
  expect(monteSolaro.equals(harbour)).toBe(false);
  await shoot(page, "capri-1535-monte-solaro");

  await clickWorld(page, 70, 100);
  await expect(page.locator("[data-fondale-frame]")).toHaveAttribute("data-fondale-scene", "grotto", {
    timeout: 8_000,
  });
  await clickWorld(page, 40, 160);
  await expect(page.locator("[data-fondale-frame]")).toHaveAttribute("data-fondale-scene", "harbour", {
    timeout: 8_000,
  });
  expect(errors).toEqual([]);
});

test("the ironic answer reaches its distinct Monte Solaro conclusion", async ({ page }) => {
  const { errors } = await openGame(page);
  await reachHarbour(page);
  await meetRaffaele(page, "Dipende: il mare paga meglio di te?");
  await repairWinch(page);
  await sailToMonteSolaroAndReadConclusion(page, "Raffaele detrarrà");
  expect(errors).toEqual([]);
});

test("the tavern is optional, bidirectional, and gives the host a short dialogue", async ({ page }) => {
  const { errors } = await openGame(page);
  await reachHarbour(page);
  await clickWorld(page, 315, 110);
  await expect(page.locator("[data-fondale-frame]")).toHaveAttribute("data-fondale-scene", "tavern", {
    timeout: 8_000,
  });

  await command(page, "look-at", 82, 110);
  await expect(page.locator("[aria-live=polite]")).toContainText("porta a sinistra");
  await command(page, "talk-to", 285, 135);
  const line = page.locator("[data-fondale-line]");
  await expect(line).toContainText("Benvenuto", { timeout: 8_000 });
  await advance(page);
  await expect(page.locator("[data-fondale-choice] button")).toHaveCount(2);
  await page.keyboard.press("1");
  await expect(line).toContainText("Cosa si dice");
  await advance(page);
  await expect(line).toContainText("Raffaele lo cura meno");
  await advance(page);
  await expect(line).toHaveCount(0);

  await clickWorld(page, 210, 110);
  await expect(page.locator("[data-fondale-frame]")).toHaveAttribute("data-fondale-scene", "harbour", {
    timeout: 8_000,
  });
  await clickWorld(page, 370, 120);
  await expect(page.locator("[data-fondale-frame]")).toHaveAttribute("data-fondale-scene", "townSquare", {
    timeout: 8_000,
  });
  await clickWorld(page, 25, 120);
  await expect(page.locator("[data-fondale-frame]")).toHaveAttribute("data-fondale-scene", "alley", {
    timeout: 8_000,
  });
  await clickWorld(page, 210, 140);
  await expect(page.locator("[data-fondale-frame]")).toHaveAttribute("data-fondale-scene", "townSquare", {
    timeout: 8_000,
  });
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
  await expect(frame.locator('[aria-label="Verbs"] [data-fondale-verb]')).toHaveCount(9);
  await expect(frame.locator("[data-fondale-inventory-slot]")).toHaveCount(8);

  await frame.focus();
  await page.keyboard.down("Tab");
  await expect(frame.locator("[data-fondale-revealed-hotspot]")).toHaveCount(3);
  await page.keyboard.up("Tab");
  await shoot(page, "capri-1535-letterbox-command-hud");
  expect(errors).toEqual([]);
});

test("a Capri Project Version 3 Save remains visible and incompatible", async ({ page }) => {
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
    slots[0]!.snapshot.projectVersion = "3";
    localStorage.setItem("fondale.save-slots", JSON.stringify(slots));
  });
  await frame.focus();
  await page.keyboard.press("Control+l");
  const oldSave = frame.locator('[data-fondale-load-slot="0"]');
  await expect(oldSave).toBeDisabled();
  await expect(oldSave).toContainText("incompatible");
});
