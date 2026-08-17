import type { DialogueHttpRequest } from "@asterixcapri/fondale";
import { expect, type Page } from "@playwright/test";

import { type DialogueServerStub, installDialogueServerStub } from "./dialogue-server-stub";

export const SHOTS_DIR = "test/shots";

interface SceneSpaceSize {
  readonly width: number;
  readonly height: number;
}

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
): Promise<{
  errors: string[];
  dialogueRequests: readonly DialogueHttpRequest[];
  dialogueServer: DialogueServerStub;
}> {
  const errors: string[] = [];
  const dialogueServer = options.stubDialogueServer === false
    ? unstubbedDialogueServer()
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

  return { errors, dialogueRequests: dialogueServer.requests, dialogueServer };
}

/** The empty stand-in used when a spec deliberately leaves the seam unstubbed. */
function unstubbedDialogueServer(): DialogueServerStub {
  return {
    requests: [],
    failNext() {
      throw new Error("The Dialogue Server seam is not stubbed in this test");
    },
    holdNext() {
      throw new Error("The Dialogue Server seam is not stubbed in this test");
    },
  };
}

/** Clicks one point through a canvas whose Scene Space matches the given Size. */
export async function clickSceneSpace(
  page: Page,
  x: number,
  y: number,
  size: SceneSpaceSize,
): Promise<void> {
  const canvas = page.locator("[data-fondale-frame] canvas");
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Fondale canvas is not visible");
  await page.mouse.click(
    box.x + (x / size.width) * box.width,
    box.y + (y / size.height) * box.height,
  );
}

/** Hovers one point through a canvas whose Scene Space matches the given Size. */
export async function hoverSceneSpace(
  page: Page,
  x: number,
  y: number,
  size: SceneSpaceSize,
): Promise<void> {
  const canvas = page.locator("[data-fondale-frame] canvas");
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Fondale canvas is not visible");
  await page.mouse.move(
    box.x + (x / size.width) * box.width,
    box.y + (y / size.height) * box.height,
  );
}

/** Clicks one logical Scene Space point through the visible canvas. */
export async function clickWorld(page: Page, x: number, y: number): Promise<void> {
  await clickSceneSpace(page, x, y, { width: 426, height: 240 });
}

/** Hovers one logical Scene Space point through the visible canvas. */
export async function hoverWorld(page: Page, x: number, y: number): Promise<void> {
  await hoverSceneSpace(page, x, y, { width: 426, height: 240 });
}

/**
 * Reloads the browser and continues the automatically persisted Game Session.
 *
 * Waiting for a Continuation State to merely exist is not enough: one exists
 * from the first frame of the Game Session, so a reload could land on a
 * snapshot taken before whatever the spec had just done. The Scene on screen is
 * the cheapest thing both sides agree on, so this waits until the persisted
 * snapshot has caught up with it.
 */
export async function continueGameSession(page: Page): Promise<void> {
  const frame = page.locator("[data-fondale-frame]");
  const presented = await frame.getAttribute("data-fondale-scene");
  await expect.poll(() => page.evaluate(() => {
    const key = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index))
      .find((candidate) => candidate?.startsWith("fondale.continuation."));
    if (!key) return null;
    const { snapshot } = JSON.parse(localStorage.getItem(key)!) as {
      snapshot: { state: { currentScene: string } };
    };
    return snapshot.state.currentScene;
  }), { timeout: 20_000 }).toBe(presented);
  await page.reload();
  await page.locator("[data-fondale-continuation]")
    .getByRole("button", { name: "Continue" }).click();
  await expect(frame).toBeVisible();
}

/**
 * The Game State the browser has persisted for this Game Session.
 *
 * Almost everything a spec needs is visible on screen, and reading it there is
 * always preferable. This is for the exceptions: canonical state the Example
 * gives no Player-visible consequence, which a continuation still has to carry.
 */
export async function continuationState(page: Page): Promise<{
  relationships: Record<string, Record<string, { trust: string }>>;
  dialogueStates: Record<string, string | null>;
}> {
  return page.evaluate(() => {
    const key = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index))
      .find((candidate) => candidate?.startsWith("fondale.continuation."));
    if (!key) throw new Error("The browser persisted no Continuation State");
    const { snapshot } = JSON.parse(localStorage.getItem(key)!) as {
      snapshot: {
        state: {
          relationships: Record<string, Record<string, { trust: string }>>;
          dialogueStates: Record<string, string | null>;
        };
      };
    };
    return { relationships: snapshot.state.relationships, dialogueStates: snapshot.state.dialogueStates };
  });
}

/** Saves a screenshot under a stable name the agent can open and look at. */
export async function shoot(page: Page, name: string): Promise<void> {
  await page.screenshot({ path: `${SHOTS_DIR}/${name}.png` });
}

export { expect };
