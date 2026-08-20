import { expect, test } from "vitest";
import {
  activateNoun,
  advanceToLine,
  carriedObjects,
  chooseAlternative,
  leaveActivity,
  presentedDetailView,
  pressOn,
  reflect,
  revealedNouns,
} from "fondale/testing";

import {
  acceptHarbourJob,
  answerRaffaele,
  boardGozzo,
  closeOnTheEnding,
  deliverLetter,
  freeWellAndCollectHandle,
  hearTheContradiction,
  installHandle,
  playSailorEncounter,
  pullNetsAndCollectOil,
  reachDriftingBoat,
  readBrokenSeal,
  readRegistryFragment,
  scene,
  travelToCloister,
  travelToHarbour,
  watchSailorDie,
} from "./prologue";
import { continueSession, startExampleWithDialogue } from "./support";

/**
 * The product demonstration.
 *
 * This is the one seam that claims the whole prologue works. It drives the
 * packaged Example the way a Player does — the same inputs, the same committed
 * time — and reads back the Game State each step commits.
 *
 * Focused proofs of individual capabilities live in the sibling specs
 * (`harbour-opening`, `boat-sighting`, `drifting-boat-finale`,
 * `knowledge-dialogue`, `dialogue-resilience`). This file answers one question:
 * can somebody sit down and finish the demo?
 */

test("the whole prologue completes through authored Conversation alternatives alone", async () => {
  const { session, dialogue } = startExampleWithDialogue();

  // 1 — Harbour, morning: the winch is visibly broken and Raffaele pays.
  expect(scene(session)).toBe("harbour");
  acceptHarbourJob(session);
  leaveActivity(session);
  expect(carriedObjects(session)).toEqual(["sealedLetter"]);
  pullNetsAndCollectOil(session);

  // 2 — Cloister, early afternoon: the letter buys the truth and the handle.
  travelToCloister(session);
  deliverLetter(session);
  freeWellAndCollectHandle(session);
  expect(carriedObjects(session)).toEqual(["winchHandle"]);

  // 3 — Harbour again: the handle goes onto the winch and stays there.
  travelToHarbour(session);
  activateNoun(session, "Argano senza manovella");
  expect(session.hud().commandResponse?.text).toContain("manca la manovella");
  pressOn(session);
  installHandle(session);
  expect(carriedObjects(session)).toEqual([]);
  expect(revealedNouns(session)).toContain("Argano riparato");
  answerRaffaele(session);

  // 4 — Fortification, golden hour: the crossing, the climb and the sighting.
  boardGozzo(session);
  pressOn(session);
  reachDriftingBoat(session);

  // 5 — Drifting boat, dusk: clues, the sailor and the cliffhanger.
  for (const [label, expected] of [
    ["Sartie recise", "tagliate"],
    ["Traccia di sangue", "sangue"],
    ["Fagotto di tela cerata", "spago cerato"],
  ] as const) {
    activateNoun(session, label);
    expect(session.hud().commandResponse?.text).toContain(expected);
    pressOn(session);
  }

  // 6 — The handoff opens straight into the close-up: no free-roam gap between
  // the bundle changing hands and what it holds.
  playSailorEncounter(session);
  expect(presentedDetailView(session)).toBe("openedBundle");
  expect(carriedObjects(session)).toEqual(["oilskinBundle"]);

  // The reading is two details examined on their own, in either order. This path
  // takes the seal first.
  readBrokenSeal(session);

  // What the reading teaches reaches Reflection as any other Fact does, and it
  // opens no puzzle: the other detail is read exactly as it was before.
  expect(await reflect(session, "Che cosa so della nave di mio padre?"))
    .toContain("Santa Marta");
  leaveActivity(session);

  readRegistryFragment(session);
  hearTheContradiction(session);
  watchSailorDie(session);
  closeOnTheEnding(session);

  // The Ending withdraws the HUD and concludes the Game Session.
  expect(session.snapshot().ended).toBe(true);
  expect(session.hud().withdrawn).toBe(true);
  expect(presentedDetailView(session)).toBe("prologueEnding");

  // The contradiction is canonical Game State.
  expect(session.snapshot().characterKnowledge.michele)
    .toContain("santa-marta-sailed-after-her-wreck");

  // The demo is finishable without ever typing at a Character: the provider was
  // asked to interpret nothing and to word nothing.
  expect(dialogue.operations.filter((operation) => operation === "interpret")).toEqual([]);
  expect(dialogue.operations.filter((operation) => operation === "verbalize")).toEqual([]);

  // The finished prologue survives leaving the browser: a reopened game finds its
  // Ending rather than a world with nothing left in it.
  const resumed = continueSession(session);
  expect(resumed.snapshot().ended).toBe(true);
  expect(resumed.snapshot().detailView).toBe("prologueEnding");
  expect(resumed.hud().withdrawn).toBe(true);
});

test("finding the oil first converges on the same canonical outcome", async () => {
  const { session } = startExampleWithDialogue();

  // The second valid discovery order: the nets are searched out of curiosity,
  // before anybody explains what the oil is for.
  expect(revealedNouns(session)).not.toContain("Ampolla d'olio");
  pullNetsAndCollectOil(session);
  expect(carriedObjects(session)).toEqual(["oilFlask"]);

  acceptHarbourJob(session);
  // Raffaele's hint still identifies the nets; it never becomes a second puzzle.
  chooseAlternative(session, "Dove trovo l'ampolla?");
  advanceToLine(session, "reti", "raffaele");
  leaveActivity(session);

  travelToCloister(session);
  deliverLetter(session);
  freeWellAndCollectHandle(session);
  travelToHarbour(session);

  // Continuation mid-route restores every representative kind of Game State.
  const resumed = continueSession(session);
  expect(scene(resumed)).toBe("harbour");
  // Objects: the recovered handle is still carried, the consumed flask is gone.
  expect(carriedObjects(resumed)).toEqual(["winchHandle"]);
  // Scenery: the nets stay moved and the flask they hid is not back.
  expect(revealedNouns(resumed)).toContain("Reti da pesca spostate");
  expect(revealedNouns(resumed)).not.toContain("Ampolla d'olio");
  // Consumed alternatives: the engagement question is not offered a second time.
  activateNoun(resumed, "Raffaele");
  expect(resumed.conversation()?.alternatives.map((one) => one.text))
    .not.toContain("Cerchi qualcuno per un lavoro?");
  leaveActivity(resumed);
  // Knowledge: what Michele learned from Brother Elia survived the reload.
  expect(await reflect(resumed, "Che cosa so della manovella?"))
    .toContain("prestato volontariamente");
  leaveActivity(resumed);

  // Convergence: the same install, the same repaired world, the same unlock.
  activateNoun(resumed, "Argano senza manovella");
  expect(resumed.hud().commandResponse?.text).toContain("manca la manovella");
  pressOn(resumed);
  installHandle(resumed);
  expect(revealedNouns(resumed)).toContain("Argano riparato");
  answerRaffaele(resumed, "Mi hai mentito sui frati.");

  // Relationship: calling Raffaele a liar cost Michele his trust and left him
  // angry, and both are committed Game State that survives a reload.
  const restored = continueSession(resumed);
  expect(restored.snapshot().relationships.raffaele?.michele).toEqual({ trust: "low" });
  expect(restored.snapshot().dialogueStates.raffaele).toBe("angry");

  boardGozzo(restored);
  expect(scene(restored)).toBe("coastalFortification");
});

test("the Inventory stays unavailable while a narrative activity holds play", () => {
  const { session } = startExampleWithDialogue();

  // Exploration: the Inventory is available.
  expect(session.hud().inventory.triggerVisible).toBe(true);

  // A Sequence takes play from its first direction, and the Line it presents
  // keeps it: the Inventory does not reach a Player at all.
  activateNoun(session, "Reti da pesca");
  expect(session.hud().inventory.triggerVisible).toBe(false);
  session.hudInput({ type: "open-inventory" });
  expect(session.hud().inventory.open).toBe(false);
  pressOn(session);
  expect(session.hud().inventory.triggerVisible).toBe(true);

  // A Conversation suspends it while it owns the screen.
  activateNoun(session, "Raffaele");
  expect(session.conversation()).not.toBeNull();
  expect(session.hud().inventory.triggerVisible).toBe(false);

  // A Choice inside that Conversation suspends it as well.
  chooseAlternative(session, "Cerchi qualcuno per un lavoro?");
  advanceToLine(session, "monete", "raffaele");
  expect(session.hud().narrative?.kind).toBe("choice");
  expect(session.hud().inventory.triggerVisible).toBe(false);

  // Answering it hands play back, and the Conversation can then be left.
  chooseAlternative(session, "Quanto vale il lavoro?");
  advanceToLine(session, "lettera sigillata", "raffaele");
  leaveActivity(session);
  expect(session.hud().inventory.triggerVisible).toBe(true);

  // Exploration gets the Inventory back, with the collected Object in it.
  activateNoun(session, "Ampolla d'olio");
  pressOn(session);
  expect(carriedObjects(session)).toContain("oilFlask");
  session.hudInput({ type: "open-inventory" });
  expect(session.hud().inventory.open).toBe(true);
});
