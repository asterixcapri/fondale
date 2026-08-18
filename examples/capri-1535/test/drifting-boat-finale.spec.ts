import { test } from "@playwright/test";

import { expect, openGame, shoot } from "./harness";
import {
  activateHotspot,
  clickCanvas,
  closeOnTheEnding,
  expectDetailView,
  hearTheContradiction,
  inventoryObject,
  line,
  reachDriftingBoat,
  readBrokenSeal,
  readRegistryFragment,
  repairWinchAndSail,
  skipSequence,
  watchSailorDie,
} from "./prologue";

/**
 * The finale, proved where the acceptance path does not go: the Player skips
 * the encounter that hands over the oilskin bundle, and reads the two details
 * in the opposite order.
 *
 * Full playback of the same encounter, the seal-first reading and the Ending's
 * survival of a reload belong to `acceptance.spec.ts`, which is the one place
 * that claims the whole prologue works end to end.
 */

test.setTimeout(420_000);

test("skipping the encounter and reading in the opposite order reaches the same Ending", async ({
  page,
}) => {
  const { errors } = await openGame(page);
  await repairWinchAndSail(page);
  await reachDriftingBoat(page);

  await activateHotspot(page, "Marinaio ferito", { button: "right" });
  await expect(line(page, "woundedSailor")).toContainText("quel viso", { timeout: 25_000 });
  await skipSequence(page);

  // The skipped Sequence committed the same canonical outcome: Michele carries
  // the bundle and the close-up of what it held is presented, with no free-roam
  // gap where full playback has none either.
  await expectDetailView(page, "openedBundle");
  await expect(inventoryObject(page, "oilskinBundle")).toHaveCount(1);
  await shoot(page, "capri-1535-finale-skipped-encounter");

  // Either detail can be read first, and neither reading alone ends anything.
  await readRegistryFragment(page);
  await expectDetailView(page, "openedBundle");
  await readBrokenSeal(page);
  await hearTheContradiction(page);
  await watchSailorDie(page);
  await closeOnTheEnding(page);

  // The same Ending: the closing image, the withdrawn HUD, and a Command that
  // is answered by nothing.
  await expect(page.locator("[data-fondale-overlay]")).toBeHidden();
  await clickCanvas(page, { x: 440, y: 350 });
  await expectDetailView(page, "prologueEnding");
  await shoot(page, "capri-1535-finale-ending");
  expect(errors).toEqual([]);
});
