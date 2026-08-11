import { expect, test } from "@playwright/test";

const architectureUrl = new URL("../docs/engine-architecture.html", import.meta.url).href;

for (const viewport of [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
]) {
  test(`the offline Engine architecture is readable at ${viewport.name} size`, async ({ page }) => {
    const remoteRequests: string[] = [];
    page.on("request", (request) => {
      if (/^https?:/.test(request.url())) remoteRequests.push(request.url());
    });
    await page.setViewportSize(viewport);
    await page.goto(architectureUrl);

    await expect(page).toHaveTitle("Fondale 0.4 — Architettura dell’Engine");
    await expect(page.locator("main section")).toHaveCount(7);
    await expect(page.getByRole("heading", { name: "CoreSession: coordinatore deterministico" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Save e restore non controllano la sessione" })).toBeVisible();
    expect(remoteRequests).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });
}
