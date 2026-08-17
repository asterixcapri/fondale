import { test } from "@playwright/test";

import { continueGameSession, expect, openGame, shoot } from "./harness";
import {
  activateHotspot,
  activatePassage,
  descendToBoat,
  isRevealed,
  leaveReflection,
  line,
  observeSighting,
  reflect,
  repairWinchAndSail,
  response,
  scene,
  skipSequence,
  walkTowards,
} from "./prologue";

/**
 * The fortification: a vertical Camera, a directed arrival and one sighting.
 *
 * The arrival is the Example's demonstration of Camera direction, and the
 * sighting is what turns the repaired winch into the inciting incident. Both
 * are proved through what the Player sees: a changing frame, a Narration, a
 * newly reachable Passage.
 */

test.setTimeout(300_000);

test("the boat arrival is directed on landing and the sighting unlocks the rocks stairway", async ({
  page,
}) => {
  const { errors } = await openGame(page);
  const frame = scene(page);
  await repairWinchAndSail(page);

  // The arrival Sequence cuts to the open sea while the boat drifts in.
  await page.waitForTimeout(400);
  const duringSequence = await frame.locator("canvas").screenshot();
  await page.waitForTimeout(4_500);
  const afterSequence = await frame.locator("canvas").screenshot();
  expect(afterSequence.equals(duringSequence)).toBe(false);
  expect(await isRevealed(page, "passage", "Scaletta verso gli scogli")).toBe(false);
  await shoot(page, "capri-1535-boat-arrival-directed");

  // The climb stays Player-driven while the Camera follows Scene Space.
  await walkTowards(page, "hotspot", "Belvedere della fortificazione", "up");
  await shoot(page, "capri-1535-lookout-before-sighting");
  expect(await isRevealed(page, "passage", "Scaletta verso gli scogli")).toBe(false);

  await observeSighting(page);

  // Reflection now reports the sighting among Michele's learned facts.
  await reflect(page, "Che cosa ho visto dal belvedere?");
  await expect(line(page, "michele")).toContainText("barca alla deriva", { timeout: 15_000 });
  await leaveReflection(page);

  await descendToBoat(page);
  await shoot(page, "capri-1535-boat-sighting-finale-entrance");
  await expect(frame.locator("[data-fondale-revealed-hotspot]")).toHaveCount(0);
  await frame.focus();
  await page.keyboard.down("Tab");
  await expect(frame.locator("[data-fondale-revealed-hotspot]")).toHaveCount(6);
  await page.keyboard.up("Tab");

  // The return stairway leads back to the fortification landing.
  await activatePassage(page, "Scaletta verso gli scogli", { pan: "left" });
  await expect(frame).toHaveAttribute("data-fondale-scene", "coastalFortification", {
    timeout: 15_000,
  });
  expect(errors).toEqual([]);
});

test("skipping the boat arrival commits the same sighting and transition", async ({ page }) => {
  const { errors } = await openGame(page);
  const frame = scene(page);
  await repairWinchAndSail(page);

  await page.waitForTimeout(200);
  await skipSequence(page);
  await page.waitForTimeout(500);

  // The skipped outcome lands the boat exactly as full playback does.
  await walkTowards(page, "hotspot", "Belvedere della fortificazione", "up");
  await activateHotspot(page, "Mare al tramonto");
  await expect(response(page)).toContainText("barca", { timeout: 15_000 });

  await observeSighting(page);
  await reflect(page, "Che cosa ho visto dal belvedere?");
  await expect(line(page, "michele")).toContainText("barca alla deriva", { timeout: 15_000 });
  await leaveReflection(page);
  await descendToBoat(page);
  await continueGameSession(page);
  await expect(frame).toHaveAttribute("data-fondale-scene", "driftingBoat");
  expect(errors).toEqual([]);
});
