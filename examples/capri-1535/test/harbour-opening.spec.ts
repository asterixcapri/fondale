import { expect, test } from "vitest";
import {
  activateNoun,
  advanceToLine,
  carriedObjects,
  chooseAlternative,
  leaveActivity,
  pressOn,
  reflect,
  revealedNouns,
  selectObject,
} from "@asterixcapri/fondale/testing";

import {
  acceptHarbourJob,
  answerRaffaele,
  boardGozzo,
  deliverLetter,
  freeWellAndCollectHandle,
  installHandle,
  pullNetsAndCollectOil,
  recoverHandle,
  scene,
  travelToCloister,
  travelToHarbour,
} from "./prologue";
import { continueSession, startExample } from "./support";

/**
 * The harbour job and the cloister puzzle it sends the Player to solve.
 *
 * These are the focused proofs behind the acceptance path: narrative authority at
 * the opening, both valid oil discovery orders, the two-step well, and what every
 * answer to Raffaele commits.
 */

test("the authored harbour job gives one sealed letter and records Raffaele's theft Claim as Testimony", async () => {
  const session = startExample();
  acceptHarbourJob(session);

  // The engagement is consumed by asking it: it is canonical Game State.
  expect(session.conversation()?.alternatives.map((one) => one.text))
    .not.toContain("Cerchi qualcuno per un lavoro?");
  leaveActivity(session);
  expect(carriedObjects(session)).toEqual(["sealedLetter"]);

  // What play committed survives reopening the game.
  const resumed = continueSession(session);
  expect(carriedObjects(resumed)).toEqual(["sealedLetter"]);
  activateNoun(resumed, "Raffaele");
  expect(resumed.conversation()?.alternatives.map((one) => one.text))
    .not.toContain("Cerchi qualcuno per un lavoro?");
  leaveActivity(resumed);

  // What Raffaele said is remembered as his Testimony, not as the truth.
  const reflected = await reflect(resumed, "Che cosa mi ha detto Raffaele?");
  expect(reflected).toContain("rubato");
  expect(reflected).not.toContain("prestato volontariamente");
});

for (const order of ["before", "after"] as const) {
  test(`the oil flask remains discoverable ${order} Raffaele's hint`, () => {
    const session = startExample();
    if (order === "after") {
      acceptHarbourJob(session);
      chooseAlternative(session, "Dove trovo l'ampolla?");
      advanceToLine(session, "reti", "raffaele");
      leaveActivity(session);
    }

    // The flask is genuinely behind the nets: it is not reachable until they move.
    expect(revealedNouns(session)).not.toContain("Ampolla d'olio");
    pullNetsAndCollectOil(session);

    if (order === "before") {
      acceptHarbourJob(session);
      chooseAlternative(session, "Dove trovo l'ampolla?");
      advanceToLine(session, "reti", "raffaele");
      leaveActivity(session);
    }

    // Unsupported combinations answer without consuming the essential Object.
    selectObject(session, "oilFlask");
    activateNoun(session, "Raffaele");
    expect(session.hud().commandResponse?.text).toContain("Non credo che lo vorrebbe");
    pressOn(session);
    expect(carriedObjects(session)).toContain("oilFlask");
    selectObject(session, "oilFlask");
    activateNoun(session, "Reti da pesca spostate");
    expect(session.hud().commandResponse?.text).toContain("Non funzionerebbe così");
    pressOn(session);
    expect(carriedObjects(session)).toContain("oilFlask");

    const resumed = continueSession(session);
    expect(revealedNouns(resumed)).toContain("Reti da pesca spostate");
    expect(revealedNouns(resumed)).not.toContain("Ampolla d'olio");
    expect(carriedObjects(resumed)).toContain("oilFlask");
  });
}

test("Michele delivers the letter, frees the well and keeps the recovered handle across return", async () => {
  const session = startExample();
  acceptHarbourJob(session);
  leaveActivity(session);
  pullNetsAndCollectOil(session);
  travelToCloister(session);

  // The social gate: Brother Elia refuses the well before the letter arrives,
  // and refusing costs the Player nothing.
  selectObject(session, "oilFlask");
  activateNoun(session, "Supporto della carrucola");
  advanceToLine(session, "Prima la lettera", "brotherElia");
  expect(carriedObjects(session)).toContain("oilFlask");
  pressOn(session);

  deliverLetter(session);
  expect(carriedObjects(session)).not.toContain("sealedLetter");

  // The two steps are separate: pulling a dry pulley changes nothing.
  activateNoun(session, "Pozzo del chiostro");
  expect(session.hud().commandResponse?.text).toContain("troppo secca");
  pressOn(session);
  expect(session.snapshot().variables.wellFreed).toBe(false);

  selectObject(session, "oilFlask");
  activateNoun(session, "Supporto della carrucola");
  expect(session.snapshot().variables.wellLubricated).toBe(true);
  expect(carriedObjects(session)).not.toContain("oilFlask");
  pressOn(session);

  activateNoun(session, "Pozzo lubrificato");
  advanceToLine(session, "secchio è risalito", "brotherElia");
  pressOn(session);
  activateNoun(session, "Manovella liberata");
  pressOn(session);
  expect(carriedObjects(session)).toContain("winchHandle");

  travelToHarbour(session);
  const resumed = continueSession(session);
  expect(scene(resumed)).toBe("harbour");
  expect(carriedObjects(resumed)).toContain("winchHandle");

  // The freed well is still freed when Michele walks back into the cloister.
  travelToCloister(resumed);
  expect(revealedNouns(resumed)).toContain("Pozzo liberato");
  expect(revealedNouns(resumed)).not.toContain("Manovella liberata");

  const reflected = await reflect(resumed, "Che cosa so della manovella?");
  expect(reflected).toContain("prestato volontariamente");
  expect(reflected).toContain("rubato");
  expect(reflected).not.toContain("torre della fortificazione");
  leaveActivity(resumed);
});

test("skipping the well Sequence frees the same mechanism", () => {
  const session = startExample();
  acceptHarbourJob(session);
  leaveActivity(session);
  pullNetsAndCollectOil(session);
  travelToCloister(session);
  deliverLetter(session);
  freeWellAndCollectHandle(session, { skip: true });

  // The skipped Sequence committed the same canonical outcome: the mechanism is
  // freed, the handle is carried, and the well keeps its freed presentation.
  expect(carriedObjects(session)).toContain("winchHandle");
  expect(session.snapshot().variables.wellFreed).toBe(true);
  expect(revealedNouns(session)).toContain("Pozzo liberato");
  activateNoun(session, "Pozzo liberato");
  expect(session.hud().commandResponse?.text).toContain("secchio è risalito");
});

for (const branch of [
  { choice: "Mi hai mentito sui frati.", reply: "Prestito" },
  { choice: "Non dirò nulla del prestito.", reply: "discrezione" },
  { choice: "Il prezzo del lavoro è appena salito.", reply: "moneta" },
] as const) {
  test(`answering Raffaele with "${branch.choice}" opens the fortification`, () => {
    const session = startExample();
    recoverHandle(session);
    installHandle(session);
    expect(carriedObjects(session)).not.toContain("winchHandle");

    const resumed = continueSession(session);
    expect(revealedNouns(resumed)).toContain("Argano riparato");
    expect(revealedNouns(resumed)).not.toContain("Gozzo verso la fortificazione");

    answerRaffaele(resumed, branch.choice);

    // Whatever Michele said, the same later Line and the same unlock follow.
    activateNoun(resumed, "Raffaele");
    expect(resumed.conversation()?.alternatives.map((one) => one.text)).not.toContain(branch.choice);
    chooseAlternative(resumed, "L'argano è a posto?");
    advanceToLine(resumed, "L'argano tiene", "raffaele");
    leaveActivity(resumed);
    boardGozzo(resumed);
    expect(scene(resumed)).toBe("coastalFortification");
  });
}

test("skipping the installation commits the same repaired world through continuation", () => {
  const session = startExample();
  recoverHandle(session);
  installHandle(session, { skip: true });
  expect(revealedNouns(session)).toContain("Argano riparato");

  travelToCloister(session);
  travelToHarbour(session);
  const resumed = continueSession(session);
  expect(revealedNouns(resumed)).toContain("Argano riparato");
  expect(revealedNouns(resumed)).not.toContain("Gozzo verso la fortificazione");

  answerRaffaele(resumed);
  boardGozzo(resumed);
  expect(scene(resumed)).toBe("coastalFortification");
});
