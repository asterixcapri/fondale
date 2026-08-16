import { expect, test, type Page } from "@playwright/test";

async function openCharacterConversation(page: Page, characterX: number): Promise<void> {
  await page.goto("/test/fixtures/knowledge-driven-dialogue.html");
  const canvas = page.locator("[data-fondale-frame] canvas");
  const bounds = await canvas.boundingBox();
  if (!bounds) throw new Error("Fondale canvas is not visible.");
  await page.mouse.click(
    bounds.x + (characterX / 426) * bounds.width,
    bounds.y + (150 / 240) * bounds.height,
  );
}

test("the browser fixture completes an open-fact Conversation without external dependencies", async ({
  page,
}) => {
  await openCharacterConversation(page, 315);

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

test("authored alternatives and the free-form field stay usable together by keyboard alone", async ({
  page,
}) => {
  await openCharacterConversation(page, 315);
  const conversation = page.locator("[data-fondale-conversation]");
  const input = conversation.locator("[data-fondale-dialogue-input]");
  const alternatives = conversation.locator("[data-fondale-conversation-alternative]");

  await expect(input).toBeVisible();
  await expect(alternatives).toHaveCount(2);
  await expect(alternatives.first()).toBeVisible();
  await expect(alternatives.first()).toContainText("Who cut the harbour chain?");
  await expect(alternatives.first()).toHaveCSS("filter", "brightness(1)");
  await expect(alternatives.nth(1)).toHaveCSS("filter", "brightness(1)");

  await alternatives.first().hover();
  await expect(alternatives.first()).toHaveCSS("filter", "brightness(1.45)");
  await alternatives.nth(1).hover();
  await expect(alternatives.first()).toHaveCSS("filter", "brightness(1)");
  await expect(alternatives.nth(1)).toHaveCSS("filter", "brightness(1.45)");

  const inputBounds = await input.boundingBox();
  const askBounds = await conversation.getByRole("button", { name: "Ask" }).boundingBox();
  if (!inputBounds || !askBounds) throw new Error("Conversation controls are unavailable");
  expect(askBounds.x - inputBounds.x - inputBounds.width).toBeGreaterThanOrEqual(10);

  await expect(input).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Shift+Tab");
  await expect(alternatives.first()).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator('[data-fondale-line][data-fondale-speaker="player"]'))
    .toContainText("Who cut the harbour chain?");
  await page.locator("[data-fondale-frame]").focus();
  await page.keyboard.press(".");
  await expect(page.locator('[data-fondale-line][data-fondale-speaker="antonio"]'))
    .toContainText("I never saw who cut it.");
  await page.keyboard.press(".");

  await expect(input).toBeVisible();
  await expect(alternatives).toHaveCount(2);
  await expect(input).toBeFocused();
  await page.keyboard.type("Who cut the chain?");
  await page.keyboard.press("Enter");
  await expect(page.locator('[data-fondale-line][data-fondale-speaker="player"]'))
    .toContainText("Who cut the chain?");

  expect(await page.evaluate(() => window.__dialogueProvider?.threadKeys()))
    .toEqual(["conversation:antonio"]);
});

test("restoring a Save Snapshot keeps provider memory outside canonical Game State", async ({
  page,
}) => {
  await openCharacterConversation(page, 315);
  const conversation = page.locator("[data-fondale-conversation]");
  const input = conversation.locator("[data-fondale-dialogue-input]");
  const alternatives = conversation.locator("[data-fondale-conversation-alternative]");

  await expect(alternatives).toHaveCount(2);
  await alternatives.nth(1).click();
  await expect(page.locator('[data-fondale-line][data-fondale-speaker="player"]'))
    .toContainText("Where were you that night?");
  await page.locator("[data-fondale-frame]").focus();
  await page.keyboard.press(".");
  await expect(page.locator('[data-fondale-line][data-fondale-speaker="antonio"]'))
    .toContainText("At home, with the shutters closed.");
  await page.keyboard.press(".");

  await expect(alternatives).toHaveCount(1);
  await expect(alternatives.first()).toContainText("Who cut the harbour chain?");
  await input.fill("Who cut the chain?");
  await conversation.getByRole("button", { name: "Ask" }).click();
  await expect(page.locator('[data-fondale-line][data-fondale-speaker="antonio"]'))
    .toContainText("I saw the harbour chain being cut.");
  await page.keyboard.press(".");
  const consumed = await page.evaluate(() =>
    window.__dialogueSession!.createSaveSnapshot().state.consumedAlternatives.antonio
  );
  expect(consumed).toEqual([1]);

  await page.evaluate(async () => {
    const snapshot = window.__dialogueSession!.createSaveSnapshot();
    await window.__restoreDialogueSession!(snapshot);
  });

  const restoredConversation = page.locator("[data-fondale-conversation]");
  await expect(restoredConversation.locator("[data-fondale-conversation-alternative]")).toHaveCount(1);
  await expect(restoredConversation.locator("[data-fondale-conversation-alternative]").first())
    .toContainText("Who cut the harbour chain?");
  expect(await page.evaluate(() => window.__dialogueProvider?.resetCount())).toBe(0);
  expect(await page.evaluate(() => window.__dialogueProvider?.threadKeys()))
    .toEqual(["conversation:antonio"]);
  expect(await page.evaluate(() =>
    window.__dialogueSession?.createSaveSnapshot().state.consumedAlternatives.antonio
  )).toEqual([1]);
});

test("an authored alternative directing a Sequence hides the input field until it completes", async ({
  page,
}) => {
  await openCharacterConversation(page, 80);
  const conversation = page.locator("[data-fondale-conversation]");
  const input = conversation.locator("[data-fondale-dialogue-input]");
  const alternatives = conversation.locator("[data-fondale-conversation-alternative]");

  await expect(input).toBeVisible();
  await expect(alternatives).toHaveCount(1);
  await alternatives.first().click();

  await expect(page.locator('[data-fondale-line][data-fondale-speaker="lucia"]'))
    .toContainText("Watch: the chain fell just here.");
  await expect(input).toBeHidden();
  await expect(alternatives).toHaveCount(0);

  await page.locator("[data-fondale-frame]").focus();
  await page.keyboard.press(".");
  await expect(page.locator('[data-fondale-line][data-fondale-speaker="lucia"]'))
    .toContainText("That is all I saw.");
  await expect(input).toBeHidden();

  await page.keyboard.press(".");
  await expect(input).toBeVisible();
  await expect(alternatives).toHaveCount(1);
});

test("Rifletti keeps Reflection separate from Conversation memory", async ({ page }) => {
  await openCharacterConversation(page, 315);
  const conversation = page.locator("[data-fondale-conversation]");
  const input = conversation.locator("[data-fondale-dialogue-input]");

  for (const question of ["Who cut the chain?", "Were you aboard the Santa Lucia?"]) {
    await input.fill(question);
    await conversation.getByRole("button", { name: "Ask" }).click();
    await page.locator("[data-fondale-frame]").focus();
    await page.keyboard.press(".");
    await page.keyboard.press(".");
  }
  await conversation.getByRole("button", { name: "Leave" }).click();
  await page.getByRole("button", { name: "Rifletti" }).click();

  const reflection = page.locator("[data-fondale-reflection]");
  await expect(reflection).toBeVisible();
  await expect(page.locator("[data-fondale-conversation]")).toHaveCount(0);
  await expect(reflection).toContainText("Reflection");
  await reflection.locator("[data-fondale-dialogue-input]").fill("What have I learned?");
  await reflection.getByRole("button", { name: "Reflect" }).click();
  await expect(page.locator('[data-fondale-line][data-fondale-speaker="player"]'))
    .toContainText("Antonio denied being aboard the Santa Lucia");
  await expect(page.locator('[data-fondale-line][data-fondale-speaker="player"]'))
    .toContainText("Uncertain hypothesis: Antonio may know more than he admitted.");
  expect(await page.evaluate(() => window.__dialogueProvider?.threadKeys())).toEqual([
    "conversation:antonio",
    "reflection:player",
  ]);
  expect(await page.evaluate(() => window.__dialogueProvider?.resetCount())).toBe(0);
});

test("an authored Sequence takes over the browser and then resumes its Conversation", async ({
  page,
}) => {
  await openCharacterConversation(page, 80);
  const conversation = page.locator("[data-fondale-conversation]");
  const input = conversation.locator("[data-fondale-dialogue-input]");
  await expect(conversation).toContainText("Ask lucia");
  await input.fill("Begin the exact account.");
  await conversation.getByRole("button", { name: "Ask" }).click();

  await expect(page.locator('[data-fondale-line][data-fondale-speaker="player"]'))
    .toContainText("Begin the exact account.");
  await page.locator("[data-fondale-frame]").focus();
  await page.keyboard.press(".");
  await expect(page.locator('[data-fondale-line][data-fondale-speaker="lucia"]'))
    .toContainText("I saw the harbour chain being cut.");
  await page.keyboard.press(".");

  await expect(conversation).toBeHidden();
  await expect(page.locator('[data-fondale-line][data-fondale-speaker="lucia"]'))
    .toContainText("Meet me beneath the harbour clock at midnight.");
  await page.keyboard.press(".");
  await expect(conversation).toBeVisible();
  await expect(conversation).toContainText("Ask lucia");
});

test("an authored Sequence can close its browser Conversation", async ({ page }) => {
  await openCharacterConversation(page, 390);
  const conversation = page.locator("[data-fondale-conversation]");
  const input = conversation.locator("[data-fondale-dialogue-input]");
  await input.fill("Close after the exact account.");
  await conversation.getByRole("button", { name: "Ask" }).click();
  await page.locator("[data-fondale-frame]").focus();

  await expect(page.locator('[data-fondale-line][data-fondale-speaker="player"]'))
    .toContainText("Close after the exact account.");
  await page.keyboard.press(".");
  await expect(page.locator('[data-fondale-line][data-fondale-speaker="marco"]'))
    .toContainText("I saw the harbour chain being cut.");
  await page.keyboard.press(".");
  await expect(page.locator('[data-fondale-line][data-fondale-speaker="marco"]'))
    .toContainText("This closes our exploratory conversation.");
  await page.keyboard.press(".");

  await expect(conversation).toBeHidden();
  await expect.poll(() => page.evaluate(() =>
    window.__dialogueSession?.createSaveSnapshot().state.activity
  )).toBeNull();
});

test("a pending browser turn is cancelled before its authored Sequence takes over", async ({
  page,
}) => {
  await openCharacterConversation(page, 80);
  const conversation = page.locator("[data-fondale-conversation]");
  const input = conversation.locator("[data-fondale-dialogue-input]");
  await input.fill("Wait before the exact account.");
  await conversation.getByRole("button", { name: "Ask" }).click();
  await expect(input).toBeDisabled();

  await conversation.getByRole("button", { name: "Leave" }).click();
  await expect(conversation).toBeHidden();
  await expect(page.locator('[data-fondale-line][data-fondale-speaker="lucia"]'))
    .toContainText("Meet me beneath the harbour clock at midnight.");
  const released = await page.evaluate(() => {
    const [turnId] = window.__dialogueProvider?.pendingTurnIds() ?? [];
    return turnId ? window.__dialogueProvider?.release(turnId) : false;
  });
  expect(released).toBe(true);
  await page.waitForTimeout(0);
  expect(await page.evaluate(() =>
    window.__dialogueSession?.createSaveSnapshot().state.characterKnowledge.player
  )).toEqual([]);
});

test("a browser Talk To keeps the authored fallback for a Character without a Dialogue Profile", async ({
  page,
}) => {
  await openCharacterConversation(page, 25);

  await expect(page.locator("[data-fondale-conversation]")).toBeHidden();
  await expect(page.locator('[data-fondale-line][data-fondale-speaker="bystander"]'))
    .toContainText("Authored words from Bystander.");
});

test("the Player can leave a pending Conversation and its late response stays invisible", async ({
  page,
}) => {
  await openCharacterConversation(page, 315);

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
