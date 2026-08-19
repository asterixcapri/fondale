import { expect, test } from "vitest";
import {
  activateNoun,
  carriedObjects,
  presentedDetailView,
  skipSequence,
} from "@asterixcapri/fondale/testing";

import {
  hearTheContradiction,
  closeOnTheEnding,
  readBrokenSeal,
  readRegistryFragment,
  reachDriftingBoat,
  repairWinchAndSail,
  watchSailorDie,
} from "./prologue";
import { startExample } from "./support";

/**
 * The finale, proved where the acceptance path does not go: the Player skips the
 * encounter that hands over the oilskin bundle, and reads the two details in the
 * opposite order.
 *
 * Full playback of the same encounter and the seal-first reading belong to
 * `acceptance.spec.ts`, which is the one place that claims the whole prologue
 * works end to end.
 */
test("skipping the encounter and reading in the opposite order reaches the same Ending", () => {
  const session = startExample();
  repairWinchAndSail(session);
  reachDriftingBoat(session);

  activateNoun(session, "Marinaio ferito", "secondary");
  skipSequence(session);
  session.steps(200);

  // The skipped Sequence committed the same canonical outcome: Michele carries
  // the bundle and the close-up of what it held is presented.
  expect(presentedDetailView(session)).toBe("openedBundle");
  expect(carriedObjects(session)).toContain("oilskinBundle");

  // Either detail can be read first, and neither reading alone ends anything.
  readRegistryFragment(session);
  expect(presentedDetailView(session)).toBe("openedBundle");
  expect(session.snapshot().variables.registryRead).toBe(true);
  expect(session.snapshot().ended).toBeUndefined();

  readBrokenSeal(session);
  hearTheContradiction(session);
  watchSailorDie(session);
  closeOnTheEnding(session);

  // The same Ending: the Game Session has concluded on its Detail View and the
  // HUD has withdrawn entirely.
  expect(session.snapshot().ended).toBe(true);
  expect(presentedDetailView(session)).toBe("prologueEnding");
  expect(session.hud().withdrawn).toBe(true);
});
