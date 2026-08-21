import { expect, test } from "vitest";
import {
  activateNoun,
  pressOn,
  revealedNouns,
  walkTo,
} from "fondale/testing";

import { startExampleAt } from "./support";

/**
 * Each Scene driven on its own, out of the prologue's reach.
 *
 * A Scene has to work as a unit: its geometry lets the Player reach every target,
 * its Nouns answer, and its Passage leads back out. Proving that here rather than
 * through the whole prologue keeps a Scene's own failure legible instead of
 * arriving as a broken journey — and proves the Scene works without the state the
 * prologue builds around it.
 *
 * Starting the Player at a Scene's Entrance is not arriving through it. Every
 * session below begins in the Scene it drives, and beginning a game in a Scene
 * is a Scene Opening in which no door was used — so the fortification's landing
 * Sequence, whose case names `fromHarbour`, does not play here, and each Scene
 * is met at rest rather than mid-staging.
 */

test("the cloister answers, and its Passage leads back to the harbour", () => {
  const session = startExampleAt("cloister", "fromHarbour");
  pressOn(session);

  expect(revealedNouns(session)).toEqual([
    "Frate Elia",
    "Pozzo del chiostro",
    "Supporto della carrucola",
    "Passaggio verso il porto",
  ]);

  activateNoun(session, "Pozzo del chiostro");
  expect(session.hud().commandResponse?.text).toContain("corda è in tensione");
  pressOn(session);

  // Brother Elia opens a Conversation rather than answering inline, and he has
  // nothing to offer before the letter reaches him.
  activateNoun(session, "Frate Elia");
  expect(session.conversation()).not.toBeNull();
  expect(session.conversation()?.alternatives.map((one) => one.text))
    .toEqual(["Posso trattenermi un momento?"]);
  session.input({ type: "escape" });
  pressOn(session);

  activateNoun(session, "Passaggio verso il porto");
  pressOn(session);
  expect(session.snapshot().currentScene).toBe("harbour");
});

test("the drifting boat answers every clue and reaches the sailor", () => {
  const session = startExampleAt("driftingBoat", "fromFortification");
  pressOn(session);
  expect(revealedNouns(session)).toHaveLength(7);

  for (const [label, expected] of [
    ["Sartie recise", "tagliate"],
    ["Cassa forzata", "forzato"],
    ["Nome abraso", "abraso"],
    ["Traccia di sangue", "sangue"],
    ["Marinaio ferito", "Respira"],
  ] as const) {
    activateNoun(session, label);
    expect(session.hud().commandResponse?.text).toContain(expected);
    pressOn(session);
  }
});

test("the fortification climbs through every vertical Camera band", () => {
  const session = startExampleAt("coastalFortification", "fromHarbour");
  pressOn(session);

  // 1280 by 1440 points of cliff seen through a 720-point viewport: the Player
  // lands at the foot of it, so the Camera starts clamped at the bottom band.
  expect(session.snapshot().characters.michele!.groundPoint).toEqual({ x: 540, y: 1_320 });
  expect(session.camera().origin.y).toBe(720);

  // The middle band, reached by climbing rather than by scrolling: the Camera
  // follows Scene Space and the Player drives it.
  walkTo(session, { x: 720, y: 910 });
  expect(session.camera().origin.y).toBeGreaterThan(0);
  expect(session.camera().origin.y).toBeLessThan(720);

  // The upper band, where the Camera clamps at the top of the Scene.
  walkTo(session, { x: 850, y: 230 });
  expect(session.camera().origin.y).toBe(0);
  expect(revealedNouns(session)).toHaveLength(3);

  activateNoun(session, "Belvedere della fortificazione");
  pressOn(session);
  expect(session.snapshot().variables.driftingBoatSeen).toBe(true);
});
