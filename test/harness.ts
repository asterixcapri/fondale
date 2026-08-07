import { expect, type Page } from "@playwright/test";

export const SHOTS_DIR = "test/shots";

/**
 * Opens the game and waits for a drawn frame.
 *
 * Any console error or page exception is collected and asserted on, because
 * nobody reads the browser console in an autonomous run — an error that only
 * shows up there is an error that never gets found.
 */
export async function openGame(page: Page, url = "/"): Promise<{ errors: string[] }> {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(String(error)));

  await page.goto(url);
  await page.waitForFunction(() => window.__gameReady === true, undefined, { timeout: 20_000 });

  return { errors };
}

/** Saves a screenshot under a stable name the agent can open and look at. */
export async function shoot(page: Page, name: string): Promise<void> {
  await page.screenshot({ path: `${SHOTS_DIR}/${name}.png` });
}

export { expect };
