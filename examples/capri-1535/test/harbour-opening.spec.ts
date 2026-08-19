import { expect, test } from "vitest";

import {
  activate,
  carried,
  choose,
  clear,
  leaveConversation,
  leaveReflection,
  narrative,
  reflect,
  revealed,
  select,
  advanceTo,
} from "./play";
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
  leaveConversation(session);
  expect(carried(session)).toEqual(["sealedLetter"]);

  // What play committed survives reopening the game.
  const resumed = continueSession(session);
  expect(carried(resumed)).toEqual(["sealedLetter"]);
  activate(resumed, "Raffaele");
  expect(resumed.conversation()?.alternatives.map((one) => one.text))
    .not.toContain("Cerchi qualcuno per un lavoro?");
  leaveConversation(resumed);

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
      choose(session, "Dove trovo l'ampolla?");
      advanceTo(session, "reti", "raffaele");
      leaveConversation(session);
    }

    // The flask is genuinely behind the nets: it is not reachable until they move.
    expect(revealed(session)).not.toContain("Ampolla d'olio");
    pullNetsAndCollectOil(session);

    if (order === "before") {
      acceptHarbourJob(session);
      choose(session, "Dove trovo l'ampolla?");
      advanceTo(session, "reti", "raffaele");
      leaveConversation(session);
    }

    // Unsupported combinations answer without consuming the essential Object.
    select(session, "oilFlask");
    activate(session, "Raffaele");
    expect(session.hud().commandResponse?.text).toContain("Non credo che lo vorrebbe");
    clear(session);
    expect(carried(session)).toContain("oilFlask");
    select(session, "oilFlask");
    activate(session, "Reti da pesca spostate");
    expect(session.hud().commandResponse?.text).toContain("Non funzionerebbe così");
    clear(session);
    expect(carried(session)).toContain("oilFlask");

    const resumed = continueSession(session);
    expect(revealed(resumed)).toContain("Reti da pesca spostate");
    expect(revealed(resumed)).not.toContain("Ampolla d'olio");
    expect(carried(resumed)).toContain("oilFlask");
  });
}

test("Michele delivers the letter, frees the well and keeps the recovered handle across return", async () => {
  const session = startExample();
  acceptHarbourJob(session);
  leaveConversation(session);
  pullNetsAndCollectOil(session);
  travelToCloister(session);

  // The social gate: Brother Elia refuses the well before the letter arrives,
  // and refusing costs the Player nothing.
  select(session, "oilFlask");
  activate(session, "Supporto della carrucola");
  advanceTo(session, "Prima la lettera", "brotherElia");
  expect(carried(session)).toContain("oilFlask");
  clear(session);

  deliverLetter(session);
  expect(carried(session)).not.toContain("sealedLetter");

  // The two steps are separate: pulling a dry pulley changes nothing.
  activate(session, "Pozzo del chiostro");
  expect(session.hud().commandResponse?.text).toContain("troppo secca");
  clear(session);
  expect(session.snapshot().variables.wellFreed).toBe(false);

  select(session, "oilFlask");
  activate(session, "Supporto della carrucola");
  expect(session.snapshot().variables.wellLubricated).toBe(true);
  expect(carried(session)).not.toContain("oilFlask");
  clear(session);

  activate(session, "Pozzo lubrificato");
  advanceTo(session, "secchio è risalito", "brotherElia");
  clear(session);
  activate(session, "Manovella liberata");
  clear(session);
  expect(carried(session)).toContain("winchHandle");

  travelToHarbour(session);
  const resumed = continueSession(session);
  expect(scene(resumed)).toBe("harbour");
  expect(carried(resumed)).toContain("winchHandle");

  // The freed well is still freed when Michele walks back into the cloister.
  travelToCloister(resumed);
  expect(revealed(resumed)).toContain("Pozzo liberato");
  expect(revealed(resumed)).not.toContain("Manovella liberata");

  const reflected = await reflect(resumed, "Che cosa so della manovella?");
  expect(reflected).toContain("prestato volontariamente");
  expect(reflected).toContain("rubato");
  expect(reflected).not.toContain("torre della fortificazione");
  leaveReflection(resumed);
});

test("skipping the well Sequence frees the same mechanism", () => {
  const session = startExample();
  acceptHarbourJob(session);
  leaveConversation(session);
  pullNetsAndCollectOil(session);
  travelToCloister(session);
  deliverLetter(session);
  freeWellAndCollectHandle(session, { skip: true });

  // The skipped Sequence committed the same canonical outcome: the mechanism is
  // freed, the handle is carried, and the well keeps its freed presentation.
  expect(carried(session)).toContain("winchHandle");
  expect(session.snapshot().variables.wellFreed).toBe(true);
  expect(revealed(session)).toContain("Pozzo liberato");
  activate(session, "Pozzo liberato");
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
    expect(carried(session)).not.toContain("winchHandle");

    const resumed = continueSession(session);
    expect(revealed(resumed)).toContain("Argano riparato");
    expect(revealed(resumed)).not.toContain("Gozzo verso la fortificazione");

    answerRaffaele(resumed, branch.choice);

    // Whatever Michele said, the same later Line and the same unlock follow.
    activate(resumed, "Raffaele");
    expect(resumed.conversation()?.alternatives.map((one) => one.text)).not.toContain(branch.choice);
    choose(resumed, "L'argano è a posto?");
    advanceTo(resumed, "L'argano tiene", "raffaele");
    leaveConversation(resumed);
    boardGozzo(resumed);
    expect(scene(resumed)).toBe("coastalFortification");
  });
}

test("skipping the installation commits the same repaired world through continuation", () => {
  const session = startExample();
  recoverHandle(session);
  installHandle(session, { skip: true });
  expect(revealed(session)).toContain("Argano riparato");

  travelToCloister(session);
  travelToHarbour(session);
  const resumed = continueSession(session);
  expect(revealed(resumed)).toContain("Argano riparato");
  expect(revealed(resumed)).not.toContain("Gozzo verso la fortificazione");

  answerRaffaele(resumed);
  boardGozzo(resumed);
  expect(scene(resumed)).toBe("coastalFortification");
});
