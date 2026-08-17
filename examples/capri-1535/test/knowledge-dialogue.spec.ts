import type { DialogueHttpRequest, ReflectionRequest } from "@asterixcapri/fondale";
import { test } from "@playwright/test";

import { expect, openGame } from "./harness";
import {
  acceptHarbourJob,
  activateHotspot,
  ask,
  conversation,
  deliverLetter,
  freeWellAndCollectHandle,
  isRevealed,
  leaveConversation,
  leaveReflection,
  line,
  pullNetsAndCollectOil,
  reflect,
  response,
  selectInventoryObject,
  travelToCloister,
} from "./prologue";

/**
 * What free-form dialogue and Reflection are allowed to say.
 *
 * The prologue is completable without ever typing a question, so everything
 * here is optional exploration. That is exactly why it needs its own proof:
 * a Character who answers something he should not know, or a Reflection that
 * volunteers an undiscovered Fact, would quietly solve the puzzles.
 *
 * The assertions read the Player-visible answer, never the prompt or the
 * generated wording: the deterministic stub decides which Fact is eligible
 * from the same candidate list the real server receives.
 */

test.setTimeout(180_000);

/**
 * Disclosure is decided after interpretation, so the candidate list a provider
 * sees is deliberately everything the speaker knows. What a Player may learn is
 * therefore only observable in the answer, which is what these cases read.
 */
test("Knowledge-Driven Dialogue respects open, guarded and secret Disclosure", async ({ page }) => {
  const { errors } = await openGame(page);

  await activateHotspot(page, "Raffaele");
  await expect(conversation(page).locator("[data-fondale-dialogue-input]"))
    .toBeVisible({ timeout: 15_000 });

  // Open: Raffaele tells anybody who asks that the winch has lost its handle.
  await ask(page, "Perché l'argano non gira?", {
    speaker: "raffaele",
    contains: "manca la manovella",
  });

  // Guarded: he does not send a stranger to his own oil before the job is his.
  // His authored withholding behavior is to evade rather than to refuse.
  await ask(page, "Dove sta l'ampolla?", {
    speaker: "raffaele",
    contains: "Il mare è largo",
    withheld: "accanto alle reti",
  });

  // Secret: asked about the handle he answers with his Cover Story Claim, and
  // the Fact it conceals never reaches the Player.
  await ask(page, "I frati hanno davvero rubato la manovella?", {
    speaker: "raffaele",
    contains: "I frati hanno rubato la manovella",
    withheld: "prestato volontariamente",
  });
  await leaveConversation(page);

  // Accepting the job satisfies the guarded condition — and only that one.
  await acceptHarbourJob(page);
  await ask(page, "Dove sta l'ampolla?", {
    speaker: "raffaele",
    contains: "accanto alle reti",
  });
  // The tower stays secret until the winch is repaired, whatever else changed.
  await ask(page, "Che cosa si vede dalla torre?", {
    speaker: "raffaele",
    contains: "Il mare è largo",
  });
  await leaveConversation(page);

  await pullNetsAndCollectOil(page);
  await travelToCloister(page);

  // Brother Elia knows the truth but keeps it secret until the letter arrives;
  // his authored withholding behavior is to say so plainly.
  await activateHotspot(page, "Frate Elia");
  await expect(conversation(page).locator("[data-fondale-dialogue-input]"))
    .toBeVisible({ timeout: 15_000 });
  await ask(page, "Chi vi ha dato la manovella, i frati la usano davvero?", {
    speaker: "brotherElia",
    contains: "preferisco non parlare",
    withheld: "prestato volontariamente",
  });
  // What is open he answers at once.
  await ask(page, "Che cosa è successo alla carrucola?", {
    speaker: "brotherElia",
    contains: "bloccata",
  });
  await leaveConversation(page);

  // The letter is the authored condition that releases the secret. Free-form
  // asking could not reach it a moment earlier, so it never bypassed the puzzle.
  await deliverLetter(page);
  await activateHotspot(page, "Frate Elia");
  await expect(conversation(page).locator("[data-fondale-dialogue-input]"))
    .toBeVisible({ timeout: 15_000 });
  await ask(page, "Perché Raffaele parla di frati e di furti?", {
    speaker: "brotherElia",
    contains: "prestato volontariamente",
  });
  await leaveConversation(page);
  expect(errors).toEqual([]);
});

test("Raffaele's Cover Story stays Testimony and never becomes Character Knowledge", async ({
  page,
}) => {
  const { errors, dialogueRequests } = await openGame(page);
  await acceptHarbourJob(page);
  await leaveConversation(page);

  // Before the cloister, Michele carries only what he was told.
  await reflect(page, "Che cosa mi ha detto Raffaele?");
  await expect(line(page, "michele")).toContainText("rubato", { timeout: 15_000 });
  await expect(line(page, "michele")).not.toContainText("prestato volontariamente");
  await leaveReflection(page);

  const beforeTruth = lastReflectionRequest(dialogueRequests);
  expect(beforeTruth.testimonies.map(({ claim }) => claim.id)).toContain("friars-stole-the-handle");
  expect(beforeTruth.facts.map(({ id }) => id)).not.toContain("raffaele-lent-the-handle");

  // Learning the truth adds the Fact; it does not rewrite the Claim into one.
  await pullNetsAndCollectOil(page);
  await travelToCloister(page);
  await deliverLetter(page);

  await reflect(page, "Che cosa so della manovella?");
  await expect(line(page, "michele")).toContainText("prestato volontariamente", {
    timeout: 15_000,
  });
  await leaveReflection(page);

  const afterTruth = lastReflectionRequest(dialogueRequests);
  expect(afterTruth.facts.map(({ id }) => id)).toContain("raffaele-lent-the-handle");
  // The lie is still Testimony, attributed to its speaker, and still a Claim.
  const testimony = afterTruth.testimonies
    .find(({ claim }) => claim.id === "friars-stole-the-handle");
  expect(testimony?.speaker).toBe("raffaele");
  expect(afterTruth.facts.map(({ id }) => id)).not.toContain("friars-stole-the-handle");
  expect(errors).toEqual([]);
});

test("Reflection reports only learned Facts and applies no puzzle effect", async ({ page }) => {
  const { errors, dialogueRequests } = await openGame(page);

  // At the opening Michele knows only his own situation.
  await reflect(page, "Che cosa so?");
  await expect(line(page, "michele")).toContainText("lavoro onesto", { timeout: 15_000 });
  const opening = lastReflectionRequest(dialogueRequests);
  expect(opening.facts.map(({ id }) => id)).toEqual(["michele-arrived-in-capri"]);
  await leaveReflection(page);

  // The first reminder: what the job is and where the oil is.
  await acceptHarbourJob(page);
  await leaveConversation(page);
  await reflect(page, "Che cosa devo fare adesso?");
  await expect(line(page, "michele")).toContainText("ampolla", { timeout: 15_000 });
  const afterJob = lastReflectionRequest(dialogueRequests).facts.map(({ id }) => id);
  expect(afterJob).toContain("oil-flask-lies-by-the-nets");
  expect(afterJob).toContain("cloister-pulley-is-jammed");
  // Nothing Michele has not met yet ever reaches Reflection.
  expect(afterJob).not.toContain("oil-frees-the-pulley");
  expect(afterJob).not.toContain("the-tower-watches-the-sea");
  expect(afterJob).not.toContain("drifting-boat-sighting");
  await leaveReflection(page);

  // Reflecting changes nothing in the world: the nets are still covering the
  // flask, so the reminder had to be acted on rather than merely received.
  expect(await isRevealed(page, "hotspot", "Ampolla d'olio")).toBe(false);
  await pullNetsAndCollectOil(page);
  await travelToCloister(page);
  await deliverLetter(page);

  // The second reminder: the mechanism is dry and oil is the remedy.
  await reflect(page, "Perché la carrucola non gira?");
  await expect(line(page, "michele")).toContainText("olio", { timeout: 15_000 });
  expect(lastReflectionRequest(dialogueRequests).facts.map(({ id }) => id))
    .toContain("oil-frees-the-pulley");
  await leaveReflection(page);
  // The hint did not free the well; the Player still has to oil and pull.
  await activateHotspot(page, "Pozzo del chiostro");
  await expect(response(page)).toContainText("troppo secca", { timeout: 15_000 });

  await freeWellAndCollectHandle(page);

  // The third reminder: the recovered handle belongs on the harbour winch.
  await reflect(page, "Dove va la manovella?");
  await expect(line(page, "michele")).toContainText("argano", { timeout: 15_000 });
  await leaveReflection(page);
  // And it is still in the Inventory, not magically installed.
  await selectInventoryObject(page, "winchHandle");
  expect(errors).toEqual([]);
});

/**
 * The material Fondale actually offered Reflection for its last turn.
 *
 * Reading it is the only way to prove a negative — that an undiscovered Fact was
 * never even a candidate — because a deterministic stub that declines to mention
 * something proves nothing about what it was allowed to mention.
 */
function lastReflectionRequest(
  requests: readonly DialogueHttpRequest[],
): ReflectionRequest {
  const last = [...requests].reverse().find(({ operation }) => operation === "reflect");
  if (last?.operation !== "reflect") throw new Error("The game asked for no reflection");
  return last.request;
}
