import { expect, test } from "@playwright/test";
import {
  activateNoun,
  advanceToLine,
  carriedObjects,
  chooseAlternative,
  deselectObject,
  presentedDetailView,
  presentedLine,
  pressOn,
  revealedNouns,
  skipSequence,
  stepUntil,
  selectObject,
  startCoreSession,
  type CoreSession,
} from "fondale/testing";

import { project } from "../docs/public/recipes/game";
import { player } from "../docs/public/recipes/characters";
import { lantern } from "../docs/public/recipes/lantern";

/**
 * The recipes are one playable game, so they are verified by playing it.
 *
 * Every assertion below addresses the game the way a Player meets it — by the
 * Labels on screen and the answers it gives — which is the same vocabulary the
 * Testing guide teaches.
 */

/**
 * Starts the recipe game and reads through the opening it stages.
 *
 * The quay is the initial Scene and declares a Scene Opening case that names no
 * Entrance, so every new session begins under a Sequence rather than in the
 * Player's hands. Passing through it here is what an author adopting a Scene
 * Opening has to do to their own suite, so the recipes' suite does it too.
 */
function startOnTheQuay(): CoreSession {
  const session = startCoreSession(project);
  pressOn(session);
  return session;
}

test("the recipes are ordinary author-owned data, not Engine objects", () => {
  expect(Object.isFrozen(project)).toBe(false);
  expect(Object.isFrozen(player)).toBe(false);
  expect(Object.isFrozen(lantern)).toBe(false);
  expect(project.playerCharacter).toBe("player");
});

test("the game opens on a staged quay before the Player has control", () => {
  const session = startCoreSession(project);

  // No frame of play precedes the staging: the Sequence holds the Scene at the
  // first tick, and only reading it through hands the quay to the Player.
  expect(session.snapshot().activity).not.toBeNull();
  pressOn(session);
  expect(session.snapshot().activity).toBeNull();

  // The opening raises its own Variable, so walking back onto the quay later
  // does not replay it: that is the whole of the "only once" idiom.
  expect(session.snapshot().variables.cameAshore).toBe(true);
});

test("the quay offers only what the Player can reach at the start", () => {
  const session = startOnTheQuay();

  // The storeroom door is withdrawn: its Passage waits on a lit lantern.
  expect([...revealedNouns(session)].sort()).toEqual(["Brazier", "Keeper", "Lantern", "Notice"]);
});

test("the lantern is collected, lit, and opens the storeroom", () => {
  // Escape is the other way through the opening. It cuts the Sequence short and
  // hands the quay over with the same world committed, because the Skip Outcome
  // repeats what the Sequence's own operations raise.
  const session = startCoreSession(project);
  skipSequence(session);
  pressOn(session);
  expect(session.snapshot().variables.cameAshore).toBe(true);

  activateNoun(session, "Lantern");
  pressOn(session);
  expect(carriedObjects(session)).toEqual(["lantern"]);

  selectObject(session, "lantern");
  activateNoun(session, "Brazier");
  pressOn(session);

  expect(session.snapshot().variables.lanternLit).toBe(true);
  expect([...revealedNouns(session)]).toContain("Storeroom door");
});

test("the first opening plays its Sequence and the ledger ends the game", () => {
  const session = startOnTheQuay();

  activateNoun(session, "Lantern");
  pressOn(session);
  selectObject(session, "lantern");
  activateNoun(session, "Brazier");
  pressOn(session);

  deselectObject(session, "lantern");
  activateNoun(session, "Storeroom door");
  stepUntil(session, "the Player crosses into the storeroom",
    () => session.snapshot().currentScene === "storeroom");

  // The opening Sequence narrates and speaks, and pressOn stops at its Choice
  // rather than pressing advance at something that is waiting for an answer.
  pressOn(session);
  chooseAlternative(session, "Say nothing");
  pressOn(session);
  expect(session.snapshot().variables.sawTheStoreroom).toBe(true);

  activateNoun(session, "Ledger");
  advanceToLine(session, "Every crossing since the spring");
  expect(session.snapshot().variables.readTheLedger).toBe(true);

  activateNoun(session, "Ledger");
  pressOn(session);
  expect(presentedDetailView(session)).toBe("notice");
});

test("the Keeper answers differently once the lantern is carried", () => {
  const session = startOnTheQuay();

  activateNoun(session, "Keeper");
  stepUntil(session, "the Keeper speaks", () => presentedLine(session) !== null);
  expect(presentedLine(session)?.text).toContain("under the crate");
});
