import { test } from "@playwright/test";

import { expect, openGame, shoot } from "./harness";
import {
  activateHotspot,
  advance,
  inventoryObject,
  line,
  narration,
  reachDriftingBoat,
  repairWinchAndSail,
  response,
  skipSequence,
} from "./prologue";

/**
 * The finale, proved where the acceptance path does not go: what happens when
 * the Player skips the encounter that hands over the oilskin bundle.
 *
 * Full playback of the same encounter, the opened bundle and the cliffhanger
 * belong to `acceptance.spec.ts`, which is the one place that claims the whole
 * prologue works end to end.
 */

test.setTimeout(420_000);

test("skipping the sailor encounter commits the same handoff and unconsciousness", async ({
  page,
}) => {
  const { errors } = await openGame(page);
  await repairWinchAndSail(page);
  await reachDriftingBoat(page);

  await activateHotspot(page, "Marinaio ferito", { button: "right" });
  await expect(line(page, "woundedSailor")).toContainText("quel viso", { timeout: 25_000 });
  await skipSequence(page);
  await page.waitForTimeout(800);

  // The skipped Sequence committed the same canonical outcome: Michele carries
  // the bundle and the sailor is unconscious, his identity still unresolved.
  await expect(inventoryObject(page, "oilskinBundle")).toHaveCount(1);
  await activateHotspot(page, "Marinaio ferito");
  await expect(response(page)).toContainText("svenuto", { timeout: 20_000 });

  // And the skipped encounter still opens into the same finale.
  await page.locator("[data-fondale-inventory-trigger]").click();
  const bundle = inventoryObject(page, "oilskinBundle");
  await expect(bundle).toBeVisible();
  await bundle.click({ button: "right" });
  await expect(narration(page)).toContainText("apre il fagotto", { timeout: 20_000 });
  await advance(page);
  await expect(line(page, "michele")).toContainText("sigillo spezzato");
  await advance(page);
  await advance(page);
  await expect(inventoryObject(page, "oilskinBundle")).toHaveCount(0);
  await activateHotspot(page, "Fagotto aperto");
  await expect(response(page)).toContainText("sigillo spezzato", { timeout: 20_000 });
  await shoot(page, "capri-1535-finale-skipped-encounter");
  expect(errors).toEqual([]);
});
