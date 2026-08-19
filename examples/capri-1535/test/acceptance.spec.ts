import { expect, test } from "vitest";

import {
  activate,
  carried,
  choose,
  clear,
  detailView,
  leaveConversation,
  leaveReflection,
  pick,
  reflect,
  revealed,
  advanceTo,
} from "./play";
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
  leaveConversation(session);
  expect(carried(session)).toEqual(["sealedLetter"]);
  pullNetsAndCollectOil(session);

  // 2 — Cloister, early afternoon: the letter buys the truth and the handle.
  travelToCloister(session);
  deliverLetter(session);
  freeWellAndCollectHandle(session);
  expect(carried(session)).toEqual(["winchHandle"]);

  // 3 — Harbour again: the handle goes onto the winch and stays there.
  travelToHarbour(session);
  activate(session, "Argano senza manovella");
  expect(session.hud().commandResponse?.text).toContain("manca la manovella");
  clear(session);
  installHandle(session);
  expect(carried(session)).toEqual([]);
  expect(revealed(session)).toContain("Argano riparato");
  answerRaffaele(session);

  // 4 — Fortification, golden hour: the crossing, the climb and the sighting.
  boardGozzo(session);
  clear(session);
  reachDriftingBoat(session);

  // 5 — Drifting boat, dusk: clues, the sailor and the cliffhanger.
  for (const [label, expected] of [
    ["Sartie recise", "tagliate"],
    ["Traccia di sangue", "sangue"],
    ["Fagotto di tela cerata", "spago cerato"],
  ] as const) {
    activate(session, label);
    expect(session.hud().commandResponse?.text).toContain(expected);
    clear(session);
  }

  // 6 — The handoff opens straight into the close-up: no free-roam gap between
  // the bundle changing hands and what it holds.
  playSailorEncounter(session);
  expect(detailView(session)).toBe("openedBundle");
  expect(carried(session)).toEqual(["oilskinBundle"]);

  // The reading is two details examined on their own, in either order. This path
  // takes the seal first.
  readBrokenSeal(session);

  // What the reading teaches reaches Reflection as any other Fact does, and it
  // opens no puzzle: the other detail is read exactly as it was before.
  expect(await reflect(session, "Che cosa so della nave di mio padre?"))
    .toContain("Santa Marta");
  leaveReflection(session);

  readRegistryFragment(session);
  hearTheContradiction(session);
  watchSailorDie(session);
  closeOnTheEnding(session);

  // The Ending withdraws the HUD and concludes the Game Session.
  expect(session.snapshot().ended).toBe(true);
  expect(session.hud().withdrawn).toBe(true);
  expect(detailView(session)).toBe("prologueEnding");

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
  expect(revealed(session)).not.toContain("Ampolla d'olio");
  pullNetsAndCollectOil(session);
  expect(carried(session)).toEqual(["oilFlask"]);

  acceptHarbourJob(session);
  // Raffaele's hint still identifies the nets; it never becomes a second puzzle.
  choose(session, "Dove trovo l'ampolla?");
  advanceTo(session, "reti", "raffaele");
  leaveConversation(session);

  travelToCloister(session);
  deliverLetter(session);
  freeWellAndCollectHandle(session);
  travelToHarbour(session);

  // Continuation mid-route restores every representative kind of Game State.
  const resumed = continueSession(session);
  expect(scene(resumed)).toBe("harbour");
  // Objects: the recovered handle is still carried, the consumed flask is gone.
  expect(carried(resumed)).toEqual(["winchHandle"]);
  // Scenery: the nets stay moved and the flask they hid is not back.
  expect(revealed(resumed)).toContain("Reti da pesca spostate");
  expect(revealed(resumed)).not.toContain("Ampolla d'olio");
  // Consumed alternatives: the engagement question is not offered a second time.
  activate(resumed, "Raffaele");
  expect(resumed.conversation()?.alternatives.map((one) => one.text))
    .not.toContain("Cerchi qualcuno per un lavoro?");
  leaveConversation(resumed);
  // Knowledge: what Michele learned from Brother Elia survived the reload.
  expect(await reflect(resumed, "Che cosa so della manovella?"))
    .toContain("prestato volontariamente");
  leaveReflection(resumed);

  // Convergence: the same install, the same repaired world, the same unlock.
  activate(resumed, "Argano senza manovella");
  expect(resumed.hud().commandResponse?.text).toContain("manca la manovella");
  clear(resumed);
  installHandle(resumed);
  expect(revealed(resumed)).toContain("Argano riparato");
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
  activate(session, "Reti da pesca");
  expect(session.hud().inventory.triggerVisible).toBe(false);
  session.hudInput({ type: "open-inventory" });
  expect(session.hud().inventory.open).toBe(false);
  clear(session);
  expect(session.hud().inventory.triggerVisible).toBe(true);

  // A Conversation suspends it while it owns the screen.
  activate(session, "Raffaele");
  expect(session.conversation()).not.toBeNull();
  expect(session.hud().inventory.triggerVisible).toBe(false);

  // A Choice inside that Conversation suspends it as well.
  choose(session, "Cerchi qualcuno per un lavoro?");
  advanceTo(session, "monete", "raffaele");
  expect(session.hud().narrative?.kind).toBe("choice");
  expect(session.hud().inventory.triggerVisible).toBe(false);

  // Answering it hands play back, and the Conversation can then be left.
  pick(session, "Quanto vale il lavoro?");
  advanceTo(session, "lettera sigillata", "raffaele");
  leaveConversation(session);
  expect(session.hud().inventory.triggerVisible).toBe(true);

  // Exploration gets the Inventory back, with the collected Object in it.
  activate(session, "Ampolla d'olio");
  clear(session);
  expect(carried(session)).toContain("oilFlask");
  session.hudInput({ type: "open-inventory" });
  expect(session.hud().inventory.open).toBe(true);
});
