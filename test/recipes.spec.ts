import { expect, test } from "@playwright/test";
import {
  activateNoun,
  advanceToLine,
  carriedObjects,
  chooseAlternative,
  presentedDetailView,
  presentedLine,
  pressOn,
  revealedNouns,
  stepUntil,
  selectObject,
  startCoreSession,
  type CoreSession,
} from "@asterixcapri/fondale/testing";

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
 * Puts a selected Object back, which the vocabulary does not yet name.
 *
 * A Player deselects by clicking the drawer entry again; `selectObject`
 * deliberately refuses to toggle, so a test that needs the other half of that
 * toggle reaches for the Core Session input directly.
 */
function deselectObject(session: CoreSession, object: string): void {
  session.hudInput({ type: "activate-inventory", object, action: "primary" });
  session.steps(1);
}

test("the recipes are ordinary author-owned data, not Engine objects", () => {
  expect(Object.isFrozen(project)).toBe(false);
  expect(Object.isFrozen(player)).toBe(false);
  expect(Object.isFrozen(lantern)).toBe(false);
  expect(project.playerCharacter).toBe("player");
});

test("the quay offers only what the Player can reach at the start", () => {
  const session = startCoreSession(project);

  // The storeroom door is withdrawn: its Passage waits on a lit lantern.
  expect([...revealedNouns(session)].sort()).toEqual(["Brazier", "Keeper", "Lantern", "Notice"]);
});

test("the lantern is collected, lit, and opens the storeroom", () => {
  const session = startCoreSession(project);

  activateNoun(session, "Lantern");
  pressOn(session);
  expect(carriedObjects(session)).toEqual(["lantern"]);

  selectObject(session, "lantern");
  activateNoun(session, "Brazier");
  pressOn(session);

  expect(session.snapshot().variables.lanternLit).toBe(true);
  expect([...revealedNouns(session)]).toContain("Storeroom door");
});

test("the first arrival plays its Sequence and the ledger ends the game", () => {
  const session = startCoreSession(project);

  activateNoun(session, "Lantern");
  pressOn(session);
  selectObject(session, "lantern");
  activateNoun(session, "Brazier");
  pressOn(session);

  deselectObject(session, "lantern");
  activateNoun(session, "Storeroom door");
  stepUntil(session, "the Player crosses into the storeroom",
    () => session.snapshot().currentScene === "storeroom");

  // The arrival Sequence narrates, speaks, and then waits on its Choice.
  advanceToLine(session, "kept this place in order");
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
  const session = startCoreSession(project);

  activateNoun(session, "Keeper");
  stepUntil(session, "the Keeper speaks", () => presentedLine(session) !== null);
  expect(presentedLine(session)?.text).toContain("under the crate");
});
