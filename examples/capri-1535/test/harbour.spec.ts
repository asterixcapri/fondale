import { test, type Page } from "@playwright/test";

import { expect, openGame, shoot } from "./harness";

test.setTimeout(90_000);

async function clickCanvas(page: Page, x: number, y: number): Promise<void> {
  const bounds = await page.locator("[data-fondale-frame] canvas").boundingBox();
  if (!bounds) throw new Error("Fondale canvas is not visible");
  await page.mouse.click(
    bounds.x + (x / 1280) * bounds.width,
    bounds.y + (y / 720) * bounds.height,
  );
}

async function expectResponse(page: Page, text: string): Promise<void> {
  await expect(page.locator("[aria-live=polite]")).toContainText(text, { timeout: 15_000 });
  await page.locator("[data-fondale-frame]").focus();
  await page.keyboard.press(".");
}

async function clickHotspot(page: Page, label: string, vertical: "middle" | "top" = "middle"): Promise<void> {
  const frame = page.locator("[data-fondale-frame]");
  await frame.focus();
  await page.keyboard.down("Tab");
  const hotspots = frame.locator("[data-fondale-revealed-hotspot]");
  for (let index = 0; index < await hotspots.count(); index += 1) {
    const hotspot = hotspots.nth(index);
    if (await hotspot.locator("title").textContent() !== label) continue;
    const coordinates = (await hotspot.getAttribute("points") ?? "")
      .split(" ")
      .map((pair) => pair.split(",").map(Number));
    const xs = coordinates.map(([x]) => x!);
    const ys = coordinates.map(([, y]) => y!);
    await page.keyboard.up("Tab");
    await clickCanvas(
      page,
      Math.max(8, Math.min(1272, (Math.min(...xs) + Math.max(...xs)) / 2)),
      Math.max(8, Math.min(712, vertical === "top"
        ? Math.min(...ys) + 24
        : (Math.min(...ys) + Math.max(...ys)) / 2)),
    );
    return;
  }
  await page.keyboard.up("Tab");
  throw new Error(`Missing harbour Hotspot: ${label}`);
}

test("the isolated harbour package exposes and exercises its panoramic default state", async ({
  page,
}) => {
  const raffaeleRuntimeImages = new Set<string>();
  page.on("requestfinished", (request) => {
    const path = new URL(request.url()).pathname;
    if (path.includes("/characters/raffaele/") && path.endsWith(".png")) {
      raffaeleRuntimeImages.add(path.split("/").at(-1)!);
    }
  });
  const { errors } = await openGame(page);
  const frame = page.locator("[data-fondale-frame]");
  const canvas = frame.locator("canvas");

  await expect(frame).toHaveAttribute("data-fondale-scene", "harbour");
  expect(await canvas.evaluate((element) => ({
    width: (element as HTMLCanvasElement).width,
    height: (element as HTMLCanvasElement).height,
  }))).toEqual({ width: 1280, height: 720 });

  await frame.focus();
  await page.keyboard.down("Tab");
  const labels = await frame.locator("[data-fondale-revealed-hotspot] title").allTextContents();
  expect(labels.sort()).toEqual([
    "Argano senza manovella",
    "Gozzo di Raffaele",
    "Raffaele",
    "Reti da pesca",
    "Zona di lavoro",
  ]);
  await page.keyboard.up("Tab");

  const opening = await canvas.screenshot();
  await clickHotspot(page, "Gozzo di Raffaele");
  await expectResponse(page, "Il gozzo di Raffaele è pronto");

  await clickHotspot(page, "Zona di lavoro");
  await expectResponse(page, "Ceste, corde e attrezzi");

  await clickHotspot(page, "Raffaele");
  await expect(page.locator("[data-fondale-conversation]")).toBeVisible({ timeout: 15_000 });
  await page.locator("[data-fondale-conversation]").getByRole("button", { name: "Leave" }).click();

  // Since the harbour opening, pulling is the nets' primary verb: the click
  // plays the reveal Sequence instead of a look-at response.
  await clickHotspot(page, "Reti da pesca");
  await expect(page.locator('[data-fondale-line][data-fondale-speaker="michele"]'))
    .toContainText("reti", { timeout: 15_000 });
  await page.locator("[data-fondale-frame]").focus();
  await page.keyboard.press(".");
  await page.waitForTimeout(3_000);

  await clickHotspot(page, "Argano senza manovella", "top");
  await expectResponse(page, "Sul mozzo manca la manovella");

  expect((await canvas.screenshot()).equals(opening)).toBe(false);
  await shoot(page, "harbour-right-camera-edge");

  expect([...raffaeleRuntimeImages]).toEqual(["idle.png"]);
  expect(errors).toEqual([]);
});
