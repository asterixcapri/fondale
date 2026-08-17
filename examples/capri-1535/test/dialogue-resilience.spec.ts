import { test, type Page } from "@playwright/test";

import { expect, openGame } from "./harness";
import {
  acceptHarbourJob,
  activateHotspot,
  advance,
  ask,
  conversation,
  leaveConversation,
  leaveReflection,
  line,
  reflect,
  scene,
} from "./prologue";

/**
 * What happens when the Dialogue Server misbehaves.
 *
 * The prologue never depends on generated language, so a provider that fails,
 * a Player who walks away mid-turn and an answer that arrives too late must all
 * leave the demo exactly where it was. The cases below drive the same
 * production HTTP seam a Player's browser uses and read only Player-visible
 * feedback and Player-visible state.
 */

test.setTimeout(180_000);

/** The Conversation's own status line, which is where feedback is shown. */
function dialogueStatus(page: Page) {
  return page.locator("[data-fondale-dialogue] [role=status]");
}

test("a failing Dialogue Provider reports the reason and changes nothing", async ({ page }) => {
  const { errors, dialogueServer } = await openGame(page);

  await acceptHarbourJob(page);
  await leaveConversation(page);

  await activateHotspot(page, "Raffaele");
  const open = conversation(page);
  await expect(open.locator("[data-fondale-dialogue-input]")).toBeVisible({ timeout: 15_000 });

  dialogueServer.failNext("interpret", "Il modello non ha risposto.");
  await open.locator("[data-fondale-dialogue-input]").fill("Dove sta l'ampolla?");
  await open.getByRole("button", { name: "Ask" }).click();

  // The Player is told what went wrong, in the Conversation that failed.
  await expect(dialogueStatus(page)).toContainText("Il modello non ha risposto.", {
    timeout: 15_000,
  });
  // No Line was spoken and no Fact was learned: the turn committed nothing.
  await expect(page.locator("[data-fondale-line]")).toHaveCount(0);
  // The Conversation is usable again straight away, with the same alternatives.
  await expect(open.locator("[data-fondale-dialogue-input]")).toBeEnabled();
  await expect(open.getByRole("button", { name: "Dove trovo l'ampolla?" })).toBeVisible();

  // Retrying the very same question succeeds, so the failure was not sticky.
  await ask(page, "Dove sta l'ampolla?", { speaker: "raffaele", contains: "accanto alle reti" });
  await leaveConversation(page);
  expect(errors).toEqual([]);
});

test("cancelling a Dialogue Turn discards its late completion", async ({ page }) => {
  const { errors, dialogueServer } = await openGame(page);

  await acceptHarbourJob(page);
  await leaveConversation(page);

  // Everything Michele knows and everything he has been told, before the turn.
  await reflect(page, "Che cosa so?");
  await expect(line(page, "michele")).toContainText("Quello che so", { timeout: 15_000 });
  const knowledgeBefore = await line(page, "michele").textContent();
  await leaveReflection(page);

  await activateHotspot(page, "Raffaele");
  const open = conversation(page);
  await expect(open.locator("[data-fondale-dialogue-input]")).toBeVisible({ timeout: 15_000 });

  const held = dialogueServer.holdNext("interpret");
  await open.locator("[data-fondale-dialogue-input]").fill("Dove sta l'ampolla?");
  await open.getByRole("button", { name: "Ask" }).click();
  await expect(dialogueStatus(page)).toContainText("Waiting for a response", { timeout: 15_000 });
  await expect(open.locator("[data-fondale-dialogue-input]")).toBeDisabled();
  const release = await held;

  // The Player gives up on the answer and walks away from the Conversation.
  await scene(page).focus();
  await page.keyboard.press("Escape");
  await expect(open).toHaveCount(0);

  // The abandoned turn now completes on the server. Nothing it carried lands:
  // no Line is spoken and the Fact it would have disclosed is not learned.
  release();
  await page.waitForTimeout(1_000);
  await expect(page.locator("[data-fondale-line]")).toHaveCount(0);

  // Michele's Character Knowledge and Testimony are exactly what they were.
  await reflect(page, "Che cosa so?");
  await expect(line(page, "michele")).toContainText("Quello che so", { timeout: 15_000 });
  expect(await line(page, "michele").textContent()).toBe(knowledgeBefore);
  await leaveReflection(page);

  // The prologue is unharmed: the same question still works.
  await activateHotspot(page, "Raffaele");
  await expect(conversation(page).locator("[data-fondale-dialogue-input]"))
    .toBeVisible({ timeout: 15_000 });
  await ask(page, "Dove sta l'ampolla?", { speaker: "raffaele", contains: "accanto alle reti" });
  await leaveConversation(page);
  expect(errors).toEqual([]);
});

test("a failing Reflection leaves Michele's knowledge untouched", async ({ page }) => {
  const { errors, dialogueServer } = await openGame(page);

  await acceptHarbourJob(page);
  await leaveConversation(page);

  await page.getByRole("button", { name: "Rifletti" }).click();
  const reflection = page.locator("[data-fondale-reflection]");
  await expect(reflection).toBeVisible();
  dialogueServer.failNext("reflect", "La riflessione non è disponibile.");
  await reflection.locator("[data-fondale-dialogue-input]").fill("Che cosa so?");
  await reflection.getByRole("button", { name: "Reflect" }).click();

  await expect(dialogueStatus(page)).toContainText("La riflessione non è disponibile.", {
    timeout: 15_000,
  });
  await expect(page.locator("[data-fondale-line]")).toHaveCount(0);

  // Asking again works, and reports exactly what Michele had already learned.
  await reflection.locator("[data-fondale-dialogue-input]").fill("Che cosa so?");
  await reflection.getByRole("button", { name: "Reflect" }).click();
  await expect(line(page, "michele")).toContainText("ampolla", { timeout: 15_000 });
  await advance(page);
  await reflection.getByRole("button", { name: "Leave" }).click();
  expect(errors).toEqual([]);
});
