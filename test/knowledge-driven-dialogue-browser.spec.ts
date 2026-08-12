import { expect, test } from "@playwright/test";

test("the browser fixture completes an open-fact Conversation without external dependencies", async ({
  page,
}) => {
  await page.goto("/test/fixtures/knowledge-driven-dialogue.html");
  await page.locator("[data-fondale-frame]").waitFor();

  const canvas = page.locator("[data-fondale-frame] canvas");
  const bounds = await canvas.boundingBox();
  if (!bounds) throw new Error("Fondale canvas is not visible.");
  await page.mouse.click(
    bounds.x + (315 / 426) * bounds.width,
    bounds.y + (150 / 240) * bounds.height,
  );

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

  const learned = await page.evaluate(() =>
    window.__dialogueSession?.createSaveSnapshot().state.characterKnowledge.player
  );
  expect(learned).toEqual(["harbour-chain-cut"]);
});
