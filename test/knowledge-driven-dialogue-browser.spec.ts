import { expect, test, type Page } from "@playwright/test";

async function openAntonioConversation(page: Page): Promise<void> {
  await page.goto("/test/fixtures/knowledge-driven-dialogue.html");
  const canvas = page.locator("[data-fondale-frame] canvas");
  const bounds = await canvas.boundingBox();
  if (!bounds) throw new Error("Fondale canvas is not visible.");
  await page.mouse.click(
    bounds.x + (315 / 426) * bounds.width,
    bounds.y + (150 / 240) * bounds.height,
  );
}

test("the browser fixture completes an open-fact Conversation without external dependencies", async ({
  page,
}) => {
  await openAntonioConversation(page);

  const input = page.locator("[data-fondale-dialogue-input]");
  await expect(input).toBeVisible();
  await expect(input).toHaveAttribute("maxlength", "500");
  await input.fill("Who cut the chain?");
  await page.locator("[data-fondale-conversation]").getByRole("button", { name: "Ask" }).click();

  await expect(page.locator('[data-fondale-line][data-fondale-speaker="player"]'))
    .toContainText("Who cut the chain?");
  await page.locator("[data-fondale-frame]").focus();
  await page.keyboard.press(".");
  await expect(page.locator('[data-fondale-line][data-fondale-speaker="antonio"]'))
    .toContainText("I saw the harbour chain being cut.");

  await page.keyboard.press(".");
  await input.fill("What are you hiding?");
  await page.locator("[data-fondale-conversation]").getByRole("button", { name: "Ask" }).click();
  await expect(page.locator('[data-fondale-line][data-fondale-speaker="player"]'))
    .toContainText("What are you hiding?");
  await page.keyboard.press(".");
  await expect(page.locator('[data-fondale-line][data-fondale-speaker="antonio"]'))
    .toContainText("I would rather not say.");

  await page.keyboard.press(".");
  await input.fill("I do not know what to ask.");
  await page.locator("[data-fondale-conversation]").getByRole("button", { name: "Ask" }).click();
  await expect(page.locator('[data-fondale-line][data-fondale-speaker="player"]'))
    .toContainText("I do not know what to ask.");
  await page.keyboard.press(".");
  await expect(page.locator('[data-fondale-line][data-fondale-speaker="antonio"]'))
    .toContainText("What exactly do you want to know?");

  const learned = await page.evaluate(() =>
    window.__dialogueSession?.createSaveSnapshot().state.characterKnowledge.player
  );
  expect(learned).toEqual(["harbour-chain-cut"]);
});

test("the Player can leave a pending Conversation and its late response stays invisible", async ({
  page,
}) => {
  await openAntonioConversation(page);

  const conversation = page.locator("[data-fondale-conversation]");
  const input = conversation.locator("[data-fondale-dialogue-input]");
  await input.fill("Wait for this answer.");
  await conversation.getByRole("button", { name: "Ask" }).click();
  await expect(input).toBeDisabled();
  await expect(conversation.getByRole("button", { name: "Ask" })).toBeDisabled();
  await expect(conversation).toContainText("Waiting for a response…");

  await conversation.getByRole("button", { name: "Leave" }).click();
  await expect(conversation).toBeHidden();
  const released = await page.evaluate(() => {
    const [turnId] = window.__dialogueProvider?.pendingTurnIds() ?? [];
    return turnId ? window.__dialogueProvider?.release(turnId) : false;
  });
  expect(released).toBe(true);
  await page.waitForTimeout(0);

  await expect(page.locator("[data-fondale-line]")).toHaveCount(0);
  expect(await page.evaluate(() =>
    window.__dialogueSession?.createSaveSnapshot().state.characterKnowledge.player
  )).toEqual([]);
});

test("Load resets provider memory before restoring an active Conversation", async ({ page }) => {
  await openAntonioConversation(page);
  const conversation = page.locator("[data-fondale-conversation]");
  const input = conversation.locator("[data-fondale-dialogue-input]");
  await expect(input).toBeVisible();
  await page.evaluate(() => {
    const snapshot = window.__dialogueSession!.createSaveSnapshot();
    localStorage.setItem("fondale.save-slots", JSON.stringify([{
      name: "Active Conversation",
      savedAt: "2026-08-12T12:00:00.000Z",
      snapshot,
    }]));
  });

  await input.fill("Wait for this answer.");
  await conversation.getByRole("button", { name: "Ask" }).click();
  await expect(input).toBeDisabled();
  const [pendingTurnId] = await page.evaluate(() =>
    window.__dialogueProvider?.pendingTurnIds() ?? []
  );
  const lifecycle = await page.evaluate(async (turnId) => {
    if (!turnId || !window.__dialogueProvider?.release(turnId)) {
      return { released: false, staged: false };
    }
    for (let microtask = 0; microtask < 10; microtask += 1) await Promise.resolve();
    const staged = document.querySelector<HTMLInputElement>(
      "[data-fondale-dialogue-input]",
    )?.value === "";
    const frame = document.querySelector<HTMLElement>("[data-fondale-frame]");
    frame?.dispatchEvent(new KeyboardEvent("keydown", {
      key: "l",
      ctrlKey: true,
      bubbles: true,
    }));
    document.querySelector<HTMLButtonElement>('[data-fondale-load-slot="0"]')?.click();
    return { released: true, staged };
  }, pendingTurnId);
  expect(lifecycle).toEqual({ released: true, staged: true });

  await expect(input).toBeVisible();
  await expect(input).toBeEnabled();
  await expect(conversation).toContainText("Ask antonio");
  expect(await page.evaluate(() => window.__dialogueProvider?.resetCount())).toBe(1);
  expect(await page.evaluate((turnId) =>
    turnId ? window.__dialogueProvider?.release(turnId) : false, pendingTurnId
  )).toBe(false);
  expect(await page.evaluate(() =>
    window.__dialogueSession?.createSaveSnapshot().state.characterKnowledge.player
  )).toEqual([]);
});
