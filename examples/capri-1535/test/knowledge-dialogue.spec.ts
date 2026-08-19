import { expect, test } from "vitest";
import {
  activateNoun,
  ask,
  leaveActivity,
  pressOn,
  reflect,
  revealedNouns,
  selectObject,
} from "@asterixcapri/fondale/testing";

import {
  acceptHarbourJob,
  deliverLetter,
  freeWellAndCollectHandle,
  pullNetsAndCollectOil,
  travelToCloister,
} from "./prologue";
import { startExampleWithDialogue } from "./support";

/**
 * What free-form dialogue and Reflection are allowed to say.
 *
 * The prologue is completable without ever typing a question, so everything here
 * is optional exploration. That is exactly why it needs its own proof: a Character
 * who answers something he should not know, or a Reflection that volunteers an
 * undiscovered Fact, would quietly solve the puzzles.
 *
 * The assertions read the Player-visible answer, never the prompt or the generated
 * wording: the deterministic provider decides which Fact is eligible from the same
 * candidate list the real server receives.
 */

test("Knowledge-Driven Dialogue respects open, guarded and secret Disclosure", async () => {
  const { session } = startExampleWithDialogue();

  activateNoun(session, "Raffaele");
  expect(session.conversation()?.status).toBe("ready");

  // Open: Raffaele tells anybody who asks that the winch has lost its handle.
  expect(await ask(session, "Perché l'argano non gira?")).toContain("manca la manovella");

  // Guarded: he does not send a stranger to his own oil before the job is his.
  // His authored withholding behavior is to evade rather than to refuse.
  const guarded = await ask(session, "Dove sta l'ampolla?");
  expect(guarded).toContain("Il mare è largo");
  expect(guarded).not.toContain("accanto alle reti");

  // Secret: asked about the handle he answers with his Cover Story Claim, and the
  // Fact it conceals never reaches the Player.
  const secret = await ask(session, "I frati hanno davvero rubato la manovella?");
  expect(secret).toContain("I frati hanno rubato la manovella");
  expect(secret).not.toContain("prestato volontariamente");
  leaveActivity(session);

  // Accepting the job satisfies the guarded condition — and only that one.
  acceptHarbourJob(session);
  expect(await ask(session, "Dove sta l'ampolla?")).toContain("accanto alle reti");
  // The tower stays secret until the winch is repaired, whatever else changed.
  expect(await ask(session, "Che cosa si vede dalla torre?")).toContain("Il mare è largo");
  leaveActivity(session);

  pullNetsAndCollectOil(session);
  travelToCloister(session);

  // Brother Elia knows the truth but keeps it secret until the letter arrives;
  // his authored withholding behavior is to say so plainly.
  activateNoun(session, "Frate Elia");
  const withheld = await ask(session, "Chi vi ha dato la manovella, i frati la usano davvero?");
  expect(withheld).toContain("preferisco non parlare");
  expect(withheld).not.toContain("prestato volontariamente");
  // What is open he answers at once.
  expect(await ask(session, "Che cosa è successo alla carrucola?")).toContain("bloccata");
  leaveActivity(session);

  // The letter is the authored condition that releases the secret. Free-form
  // asking could not reach it a moment earlier, so it never bypassed the puzzle.
  deliverLetter(session);
  activateNoun(session, "Frate Elia");
  expect(await ask(session, "Perché Raffaele parla di frati e di furti?"))
    .toContain("prestato volontariamente");
  leaveActivity(session);
});

test("Raffaele's Cover Story stays Testimony and never becomes Character Knowledge", async () => {
  const { session, dialogue } = startExampleWithDialogue();
  acceptHarbourJob(session);
  leaveActivity(session);

  // Before the cloister, Michele carries only what he was told.
  const told = await reflect(session, "Che cosa mi ha detto Raffaele?");
  expect(told).toContain("rubato");
  expect(told).not.toContain("prestato volontariamente");
  leaveActivity(session);

  const beforeTruth = dialogue.reflections.at(-1)!;
  expect(beforeTruth.testimonies.map(({ claim }) => claim.id)).toContain("friars-stole-the-handle");
  expect(beforeTruth.facts.map(({ id }) => id)).not.toContain("raffaele-lent-the-handle");

  // Learning the truth adds the Fact; it does not rewrite the Claim into one.
  pullNetsAndCollectOil(session);
  travelToCloister(session);
  deliverLetter(session);

  expect(await reflect(session, "Che cosa so della manovella?"))
    .toContain("prestato volontariamente");
  leaveActivity(session);

  const afterTruth = dialogue.reflections.at(-1)!;
  expect(afterTruth.facts.map(({ id }) => id)).toContain("raffaele-lent-the-handle");
  // The lie is still Testimony, attributed to its speaker, and still a Claim.
  const testimony = afterTruth.testimonies
    .find(({ claim }) => claim.id === "friars-stole-the-handle");
  expect(testimony?.speaker).toBe("raffaele");
  expect(afterTruth.facts.map(({ id }) => id)).not.toContain("friars-stole-the-handle");
});

test("Reflection reports only learned Facts and applies no puzzle effect", async () => {
  const { session, dialogue } = startExampleWithDialogue();

  // At the opening Michele knows only his own situation.
  expect(await reflect(session, "Che cosa so?")).toContain("lavoro onesto");
  expect(dialogue.reflections.at(-1)!.facts.map(({ id }) => id))
    .toEqual(["michele-arrived-in-capri"]);
  leaveActivity(session);

  // The first reminder: what the job is and where the oil is.
  acceptHarbourJob(session);
  leaveActivity(session);
  expect(await reflect(session, "Che cosa devo fare adesso?")).toContain("ampolla");
  const afterJob = dialogue.reflections.at(-1)!.facts.map(({ id }) => id);
  expect(afterJob).toContain("oil-flask-lies-by-the-nets");
  expect(afterJob).toContain("cloister-pulley-is-jammed");
  // Nothing Michele has not met yet ever reaches Reflection.
  expect(afterJob).not.toContain("oil-frees-the-pulley");
  expect(afterJob).not.toContain("the-tower-watches-the-sea");
  expect(afterJob).not.toContain("drifting-boat-sighting");
  leaveActivity(session);

  // Reflecting changes nothing in the world: the nets are still covering the
  // flask, so the reminder had to be acted on rather than merely received.
  expect(revealedNouns(session)).not.toContain("Ampolla d'olio");
  pullNetsAndCollectOil(session);
  travelToCloister(session);
  deliverLetter(session);

  // The second reminder: the mechanism is dry and oil is the remedy.
  expect(await reflect(session, "Perché la carrucola non gira?")).toContain("olio");
  expect(dialogue.reflections.at(-1)!.facts.map(({ id }) => id)).toContain("oil-frees-the-pulley");
  leaveActivity(session);
  // The hint did not free the well; the Player still has to oil and pull.
  activateNoun(session, "Pozzo del chiostro");
  expect(session.hud().commandResponse?.text).toContain("troppo secca");
  pressOn(session);

  freeWellAndCollectHandle(session);

  // The third reminder: the recovered handle belongs on the harbour winch.
  expect(await reflect(session, "Dove va la manovella?")).toContain("argano");
  leaveActivity(session);
  // And it is still carried, not magically installed.
  selectObject(session, "winchHandle");
  expect(session.snapshot().variables.winchRepaired).toBe(false);
});
