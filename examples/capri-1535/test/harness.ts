import { expect, type Page } from "@playwright/test";

import { installDialogueServerStub } from "./dialogue-server-stub";

export const SHOTS_DIR = "test/shots";

/**
 * Opens the game and waits for a drawn frame.
 *
 * Any console error or page exception is collected and asserted on, because
 * nobody reads the browser console in an autonomous run — an error that only
 * shows up there is an error that never gets found.
 */
export async function openGame(
  page: Page,
  url = "/",
  options: { readonly stubDialogueServer?: boolean } = {},
): Promise<{ errors: string[]; dialogueRequests: Awaited<ReturnType<typeof installDialogueServerStub>> }> {
  const errors: string[] = [];
  const dialogueRequests = options.stubDialogueServer === false
    ? []
    : await installDialogueServerStub(page);
  page.on("console", (message) => {
    if (message.type() === "error") {
      const location = message.location().url;
      errors.push(location ? `${message.text()} (${location})` : message.text());
    }
  });
  page.on("pageerror", (error) => errors.push(String(error)));

  await page.goto(url);
  await page.locator("[data-fondale-frame]").waitFor({ timeout: 20_000 });

  return { errors, dialogueRequests };
}

/** Clicks one logical Scene Space point through the visible canvas. */
export async function clickWorld(page: Page, x: number, y: number): Promise<void> {
  const canvas = page.locator("[data-fondale-frame] canvas");
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Fondale canvas is not visible");
  await page.mouse.click(box.x + (x / 426) * box.width, box.y + (y / 240) * box.height);
}

/** Hovers one logical Scene Space point through the visible canvas. */
export async function hoverWorld(page: Page, x: number, y: number): Promise<void> {
  const canvas = page.locator("[data-fondale-frame] canvas");
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Fondale canvas is not visible");
  await page.mouse.move(box.x + (x / 426) * box.width, box.y + (y / 240) * box.height);
}

/** Reloads the browser and continues the automatically persisted Game Session. */
export async function continueGameSession(page: Page): Promise<void> {
  await expect.poll(() => page.evaluate(() => Array.from(
    { length: localStorage.length },
    (_, index) => localStorage.key(index),
  ).some((key) => key?.startsWith("fondale.continuation.")))).toBe(true);
  await page.reload();
  await page.locator("[data-fondale-continuation]")
    .getByRole("button", { name: "Continue" }).click();
  await expect(page.locator("[data-fondale-frame]")).toBeVisible();
}

/** Saves a screenshot under a stable name the agent can open and look at. */
export async function shoot(page: Page, name: string): Promise<void> {
  await page.screenshot({ path: `${SHOTS_DIR}/${name}.png` });
}

export { expect };
