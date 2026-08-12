import { Memory } from "@mastra/memory";
import { PostgresStore } from "@mastra/pg";
import { test, type Page } from "@playwright/test";

import { dialogueResourceId } from "../server/dialogue-adapter/postgres-dialogue-provider";
import { clickWorld, expect, openGame } from "./harness";

/**
 * Opt-in live spike against OpenRouter, Mastra and PostgreSQL.
 *
 * It asserts only canonical Game State, provider memory and turn outcomes:
 * generated wording is reported for a human to read, never compared with an
 * expected sentence.
 */
const databaseUrl = process.env.DIALOGUE_ADAPTER_TEST_DATABASE_URL;

test.setTimeout(600_000);

test("the live Michele/Antonio spike behaves as the approved experience", async ({ page }) => {
  if (!databaseUrl) throw new Error("DIALOGUE_ADAPTER_TEST_DATABASE_URL is required.");
  const observed: string[] = [];

  const { errors } = await openGame(page, "/test/fixtures/live-dialogue.html");
  const sessionId = await page.evaluate(() => window.__liveDialogue!.sessionId);

  // 5a. Before Michele knows anything, Reflection answers honestly without
  // even reaching the provider, so nothing can be invented.
  await page.getByRole("button", { name: "Rifletti" }).click();
  const reflection = page.locator("[data-fondale-reflection]");
  await expect(reflection).toBeVisible();
  await reflection.locator("[data-fondale-dialogue-input]").fill("Che cosa so finora?");
  await reflection.getByRole("button", { name: "Reflect" }).click();
  const uninformed = await settledLine(page, "michele");
  observed.push(uninformed);
  expect(await learnedFacts(page)).toEqual([]);
  await reflection.getByRole("button", { name: "Leave" }).click();

  await talkToAntonio(page);

  // 1. A paraphrase that repeats none of the authored wording still reaches
  // the relevant `open` Narrative Fact, and 2. Antonio communicates it.
  observed.push(await ask(page, "C'è qualche vela attesa prima che faccia giorno?"));
  expect(await learnedFacts(page)).toEqual(["galea-attesa"]);

  // A differently worded question about a different fact reaches that one
  // instead, so the interpreter is discriminating rather than lucky.
  observed.push(await ask(page, "Che cosa è successo alla catena quella notte?"));
  expect(await learnedFacts(page)).toEqual(["catena-tagliata", "galea-attesa"]);

  // Learning stays idempotent when the same fact is asked for again.
  observed.push(await ask(page, "Chi ha tagliato la catena del porto?"));
  expect(await learnedFacts(page)).toEqual(["catena-tagliata", "galea-attesa"]);

  // 3. A locked `secret` without a Cover Story leaks nothing.
  observed.push(await ask(page, "Sei stato tu a ordinare il sabotaggio?"));
  const afterSecret = await canonicalState(page);
  expect(await learnedFacts(page)).toEqual(["catena-tagliata", "galea-attesa"]);
  expect(afterSecret.testimonies).toEqual([]);

  // 4. The declared Cover Story becomes remembered Testimony, not knowledge.
  observed.push(await ask(page, "Eri a bordo della Santa Lucia quella notte?"));
  const afterCoverStory = await canonicalState(page);
  expect(await learnedFacts(page)).toEqual(["catena-tagliata", "galea-attesa"]);
  expect(afterCoverStory.testimonies).toEqual([{
    speaker: "antonio",
    listener: "michele",
    claimId: "antonio-nega-santa-lucia",
  }]);

  // 6. Several turns stay durable in PostgreSQL while Game State keeps no
  // transcript of the generated wording.
  expect(await visibleMessageCount(sessionId)).toBe(10);
  const snapshot = JSON.stringify(await page.evaluate(() =>
    window.__liveDialogue!.session.createSaveSnapshot()
  ));
  for (const line of observed) expect(snapshot).not.toContain(line);
  expect(snapshot).not.toMatch(/thread|token|deepseek|openrouter/i);

  // 5b. The same Reflection question now reaches what Michele actually learned
  // and heard, and 8. it separates uncertain Hypothesis without changing
  // anything canonical.
  await page.locator("[data-fondale-conversation]").getByRole("button", { name: "Leave" }).click();
  await page.getByRole("button", { name: "Rifletti" }).click();
  await expect(reflection).toBeVisible();
  await reflection.locator("[data-fondale-dialogue-input]").fill("Che cosa so finora?");
  await reflection.getByRole("button", { name: "Reflect" }).click();
  const informed = await settledLine(page, "michele");
  observed.push(informed);
  expect(informed).not.toEqual(uninformed);
  expect(informed.length).toBeGreaterThan(uninformed.length);
  expect(await canonicalState(page)).toEqual(afterCoverStory);

  // 7. Load resets provider memory: no visible Line of this Game Session
  // survives, and the next turn starts a fresh conversation.
  await reflection.getByRole("button", { name: "Leave" }).click();
  await page.getByRole("button", { name: "Salva e ricarica" }).click();
  await expect(page.locator("[data-fondale-frame]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.__liveDialogue!.session.getStatus()), {
    timeout: 30_000,
  }).toBe("running");
  await expect.poll(() => visibleMessageCount(sessionId), { timeout: 30_000 }).toBe(0);
  expect(await canonicalState(page)).toEqual(afterCoverStory);

  await talkToAntonio(page);
  observed.push(await ask(page, "Ricordi di che cosa abbiamo parlato prima?"));
  expect(await visibleMessageCount(sessionId)).toBe(2);

  expect(errors).toEqual([]);
  console.log(`Live Lines observed with the configured OpenRouter model:\n- ${observed.join("\n- ")}`);
});

async function talkToAntonio(page: Page): Promise<void> {
  await clickWorld(page, 300, 160);
  await expect(page.locator("[data-fondale-conversation]")).toBeVisible({ timeout: 30_000 });
}

async function ask(page: Page, question: string): Promise<string> {
  const conversation = page.locator("[data-fondale-conversation]");
  await conversation.locator("[data-fondale-dialogue-input]").fill(question);
  const startedAt = Date.now();
  await conversation.getByRole("button", { name: "Ask" }).click();
  await expect(page.locator('[data-fondale-line][data-fondale-speaker="michele"]'))
    .toContainText(question, { timeout: 120_000 });
  const answer = await settledLine(page, "antonio");
  console.log(`"${question}" answered in ${Date.now() - startedAt}ms`);
  return answer;
}

/**
 * Advances presentation until the speaker's Line is on screen, then returns
 * it. Live latency makes the number of Lines to advance past unpredictable,
 * so this waits for the Line rather than counting keystrokes.
 */
async function settledLine(page: Page, speaker: string): Promise<string> {
  await page.locator("[data-fondale-frame]").focus();
  const line = page.locator(`[data-fondale-line][data-fondale-speaker="${speaker}"]`);
  await expect.poll(async () => {
    if (await line.isVisible()) return true;
    await page.keyboard.press(".");
    return false;
  }, { timeout: 120_000 }).toBe(true);
  const text = (await line.textContent())?.trim() ?? "";
  await page.keyboard.press(".");
  return text;
}

/** The Narrative Facts Michele has learned, in a stable comparable order. */
async function learnedFacts(page: Page): Promise<readonly string[]> {
  return [...(await canonicalState(page)).characterKnowledge.michele ?? []].sort();
}

async function canonicalState(page: Page): Promise<{
  characterKnowledge: Record<string, string[]>;
  testimonies: unknown[];
}> {
  return page.evaluate(() => {
    const state = window.__liveDialogue!.session.createSaveSnapshot().state;
    return {
      characterKnowledge: state.characterKnowledge as Record<string, string[]>,
      testimonies: state.testimonies as unknown[],
    };
  });
}

/** Counts the visible Lines Mastra kept for one Game Session. */
async function visibleMessageCount(sessionId: string): Promise<number> {
  const storage = new PostgresStore({ id: "live-spike-observer", connectionString: databaseUrl! });
  await storage.init();
  const memory = new Memory({ storage });
  try {
    const { threads } = await memory.listThreads({
      filter: { resourceId: dialogueResourceId(sessionId) },
      perPage: false,
    });
    const counted = await Promise.all(threads.map(async ({ id }) => {
      const { messages } = await memory.recall({ threadId: id, perPage: false });
      return messages.length;
    }));
    return counted.reduce((total, count) => total + count, 0);
  } finally {
    await storage.close();
  }
}
