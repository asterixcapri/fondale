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

async function hotspotIsAvailable(page: Page, label: string): Promise<boolean> {
  const frame = page.locator("[data-fondale-frame]");
  await frame.focus();
  await page.keyboard.down("Tab");
  const hotspots = frame.locator("[data-fondale-revealed-hotspot]");
  for (let index = 0; index < await hotspots.count(); index += 1) {
    if (await hotspots.nth(index).locator("title").textContent() === label) {
      await page.keyboard.up("Tab");
      return true;
    }
  }
  await page.keyboard.up("Tab");
  return false;
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

async function activatePassage(
  page: Page,
  label: string,
  options: { readonly pan: "left" | "right"; readonly attempts?: number } = { pan: "right" },
): Promise<void> {
  const frame = page.locator("[data-fondale-frame]");
  const attempts = options.attempts ?? 8;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    await frame.focus();
    await page.keyboard.down("Tab");
    const passages = frame.locator("[data-fondale-revealed-passage]");
    let point: Point | undefined;
    for (let index = 0; index < await passages.count(); index += 1) {
      const passage = passages.nth(index);
      if (await passage.locator("title").textContent() !== label) continue;
      const candidate = polygonCenter(await passage.getAttribute("points") ?? "");
      if (candidate.x >= 16 && candidate.x <= 1264 && candidate.y >= 16 && candidate.y <= 704) {
        point = candidate;
      }
      break;
    }
    await page.keyboard.up("Tab");
    if (point) {
      await clickCanvas(page, point);
      return;
    }
    await clickCanvas(page, { x: options.pan === "left" ? 80 : 1200, y: 650 });
    await page.waitForTimeout(1_000);
  }
  throw new Error(`Passage '${label}' never entered the Camera viewport`);
}

async function passageIsAvailable(page: Page, label: string): Promise<boolean> {
  const frame = page.locator("[data-fondale-frame]");
  await frame.focus();
  await page.keyboard.down("Tab");
  const passages = frame.locator("[data-fondale-revealed-passage]");
  for (let index = 0; index < await passages.count(); index += 1) {
    if (await passages.nth(index).locator("title").textContent() === label) {
      await page.keyboard.up("Tab");
      return true;
    }
  }
  await page.keyboard.up("Tab");
  return false;
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

async function recoverHandleAtHarbour(page: Page): Promise<void> {
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
  await activateHotspot(page, "Frate Elia");
  const eliaLine = page.locator('[data-fondale-line][data-fondale-speaker="brotherElia"]');
  await expect(eliaLine).toContainText("prestato volontariamente", { timeout: 15_000 });
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

  await activatePassage(page, "Passaggio verso il porto", { pan: "left" });
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

async function winchHubPixels(page: Page): Promise<string> {
  const bounds = await page.locator("[data-fondale-frame] canvas").boundingBox();
  if (!bounds) throw new Error("Fondale canvas is not visible");
  const scaleX = bounds.width / 1280;
  const scaleY = bounds.height / 720;
  const pixels = await page.screenshot({
    clip: {
      x: bounds.x + 1_045 * scaleX,
      y: bounds.y + 370 * scaleY,
      width: 220 * scaleX,
      height: 190 * scaleY,
    },
  });
  let hash = 2_166_136_261;
  for (const value of pixels) {
    hash ^= value;
    hash = Math.imul(hash, 16_777_619);
  }
  return String(hash >>> 0);
}

async function installHandle(page: Page): Promise<void> {
  await selectInventoryObject(page, "winchHandle");
  await activateHotspot(page, "Argano senza manovella");
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

test("Michele delivers the letter, frees the well and keeps the recovered handle across return", async ({
  page,
}) => {
  const { errors } = await openGame(page);
  const frame = page.locator("[data-fondale-frame]");

  await acceptHarbourJob(page);
  await page.locator("[data-fondale-conversation]").getByRole("button", { name: "Leave" }).click();
  await pullNetsAndCollectOil(page);
  await activatePassage(page, "Passaggio verso il chiostro");
  await expect(frame).toHaveAttribute("data-fondale-scene", "cloister", { timeout: 15_000 });

  await selectInventoryObject(page, "oilFlask");
  await activateHotspot(page, "Supporto della carrucola");
  await expect(page.locator('[data-fondale-line][data-fondale-speaker="brotherElia"]'))
    .toContainText("Prima la lettera", { timeout: 15_000 });
  await expect(page.locator('[data-fondale-inventory-object="oilFlask"]')).toHaveCount(1);
  await advance(page);

  await selectInventoryObject(page, "sealedLetter");
  await activateHotspot(page, "Frate Elia");
  const eliaLine = page.locator('[data-fondale-line][data-fondale-speaker="brotherElia"]');
  await expect(eliaLine).toContainText("prestato volontariamente", { timeout: 15_000 });
  await expect(page.locator('[data-fondale-inventory-object="sealedLetter"]')).toHaveCount(0);
  await advance(page);
  await expect(eliaLine).toContainText("olio");
  await advance(page);

  await activateHotspot(page, "Pozzo del chiostro");
  await expect(page.locator("[aria-live=polite]")).toContainText("troppo secca", {
    timeout: 15_000,
  });
  await selectInventoryObject(page, "oilFlask");
  await activateHotspot(page, "Supporto della carrucola");
  await expect(page.locator("[aria-live=polite]")).toContainText("supporto della carrucola", {
    timeout: 15_000,
  });
  await expect(page.locator('[data-fondale-inventory-object="oilFlask"]')).toHaveCount(0);
  await shoot(page, "cloister-well-lubricated");

  await activateHotspot(page, "Pozzo lubrificato");
  await expect(eliaLine).toContainText("secchio è risalito", { timeout: 15_000 });
  await shoot(page, "cloister-well-freed");
  await advance(page);
  await activateHotspot(page, "Manovella liberata");
  await expect(page.locator('[data-fondale-inventory-object="winchHandle"]')).toHaveCount(1);
  await advance(page);

  await activatePassage(page, "Passaggio verso il porto", { pan: "left" });
  await expect(frame).toHaveAttribute("data-fondale-scene", "harbour", { timeout: 15_000 });
  await continueGameSession(page);
  await expect(frame).toHaveAttribute("data-fondale-scene", "harbour");
  await page.locator("[data-fondale-inventory-trigger]").click();
  await expect(page.locator('[data-fondale-inventory-object="winchHandle"]')).toHaveCount(1);
  await page.locator("[data-fondale-inventory-close]").click();

  await activatePassage(page, "Passaggio verso il chiostro");
  await expect(frame).toHaveAttribute("data-fondale-scene", "cloister", { timeout: 15_000 });
  expect(await visibleHotspot(page, "Pozzo liberato")).toBeDefined();
  expect(await visibleHotspot(page, "Manovella liberata")).toBeUndefined();

  await page.getByRole("button", { name: "Rifletti" }).click();
  const reflection = page.locator("[data-fondale-reflection]");
  await reflection.locator("[data-fondale-dialogue-input]").fill("Che cosa so della manovella?");
  await reflection.getByRole("button", { name: "Reflect" }).click();
  const reflected = page.locator('[data-fondale-line][data-fondale-speaker="michele"]');
  await expect(reflected).toContainText("prestato volontariamente");
  await expect(reflected).toContainText("rubato");
  await expect(reflected).not.toContainText("torre della fortificazione");
  expect(errors).toEqual([]);
});

test("Michele installs the handle at contact and every response to Raffaele opens the fortification", async ({
  browser,
}) => {
  test.setTimeout(600_000);
  const branches = [{
    choice: "Mi hai mentito sui frati.",
    reply: "Prestito",
    later: "L'argano tiene",
  }, {
    choice: "Non dirò nulla del prestito.",
    reply: "discrezione",
    later: "L'argano tiene",
  }, {
    choice: "Il prezzo del lavoro è appena salito.",
    reply: "moneta",
    later: "L'argano tiene",
  }] as const;

  for (const [index, branch] of branches.entries()) {
    const context = await browser.newContext();
    const page = await context.newPage();
    const { errors } = await openGame(page);
    await recoverHandleAtHarbour(page);

    const beforeContact = await winchHubPixels(page);
    await installHandle(page);
    if (index === 0) {
      await page.waitForTimeout(50);
      expect(await winchHubPixels(page)).toBe(beforeContact);
      await page.waitForTimeout(550);
      expect(await winchHubPixels(page)).not.toBe(beforeContact);
    }
    await expect(page.locator('[data-fondale-inventory-object="winchHandle"]')).toHaveCount(0);
    await expect(page.locator('[data-fondale-line][data-fondale-speaker="michele"]'))
      .toContainText("argano", { timeout: 15_000 });
    await advance(page);
    await continueGameSession(page);
    expect(await hotspotIsAvailable(page, "Argano riparato")).toBe(true);
    expect(await passageIsAvailable(page, "Gozzo verso la fortificazione")).toBe(false);
    if (index === 0) {
      expect(await winchHubPixels(page)).not.toBe(beforeContact);
      await shoot(page, "harbour-winch-repaired");
    }

    await activateHotspot(page, "Raffaele");
    const conversation = page.locator("[data-fondale-conversation]");
    await expect(conversation.getByRole("button", { name: branch.choice })).toBeVisible({
      timeout: 15_000,
    });
    await conversation.getByRole("button", { name: branch.choice }).click();
    await expect(page.locator('[data-fondale-line][data-fondale-speaker="raffaele"]'))
      .toContainText(branch.reply);
    await advance(page);
    await expect(conversation.getByRole("button", { name: branch.choice })).toHaveCount(0);
    await conversation.getByRole("button", { name: "L'argano è a posto?" }).click();
    await expect(page.locator('[data-fondale-line][data-fondale-speaker="raffaele"]'))
      .toContainText(branch.later);
    await advance(page);
    await conversation.getByRole("button", { name: "Leave" }).click();
    await activatePassage(page, "Gozzo verso la fortificazione", {
      pan: "left",
      attempts: 24,
    });
    await expect(page.locator("[data-fondale-frame]")).toHaveAttribute(
      "data-fondale-scene",
      "coastalFortification",
      { timeout: 15_000 },
    );
    expect(errors).toEqual([]);
    await context.close();
  }
});

test("skipping the installation commits the same repaired world through continuation", async ({
  page,
}) => {
  test.slow();
  const { errors } = await openGame(page);
  await recoverHandleAtHarbour(page);

  await selectInventoryObject(page, "winchHandle");
  await activateHotspot(page, "Argano senza manovella");
  await page.waitForTimeout(100);
  await page.keyboard.press("Escape");
  await expect(page.locator('[data-fondale-inventory-object="winchHandle"]')).toHaveCount(0);
  expect(await hotspotIsAvailable(page, "Argano riparato")).toBe(true);

  await activatePassage(page, "Passaggio verso il chiostro");
  await expect(page.locator("[data-fondale-frame]")).toHaveAttribute(
    "data-fondale-scene",
    "cloister",
    { timeout: 15_000 },
  );
  await activatePassage(page, "Passaggio verso il porto", { pan: "left" });
  await expect(page.locator("[data-fondale-frame]")).toHaveAttribute(
    "data-fondale-scene",
    "harbour",
    { timeout: 15_000 },
  );
  await continueGameSession(page);
  expect(await visibleHotspot(page, "Argano riparato")).toBeDefined();
  expect(await passageIsAvailable(page, "Gozzo verso la fortificazione")).toBe(false);

  await activateHotspot(page, "Raffaele");
  const conversation = page.locator("[data-fondale-conversation]");
  await conversation.getByRole("button", { name: "Non dirò nulla del prestito." }).click();
  await expect(page.locator('[data-fondale-line][data-fondale-speaker="raffaele"]'))
    .toContainText("discrezione");
  await advance(page);
  await conversation.getByRole("button", { name: "Leave" }).click();
  await activatePassage(page, "Gozzo verso la fortificazione", {
    pan: "left",
    attempts: 24,
  });
  await expect(page.locator("[data-fondale-frame]")).toHaveAttribute(
    "data-fondale-scene",
    "coastalFortification",
    { timeout: 15_000 },
  );
  expect(errors).toEqual([]);
});
