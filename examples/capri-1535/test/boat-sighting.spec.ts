import { expect, test } from "vitest";
import {
  activateNoun,
  leaveActivity,
  reflect,
  revealedNouns,
} from "fondale/testing";

import { descendToBoat, observeSighting, repairWinchAndSail, scene } from "./prologue";
import { continueSession, startExample } from "./support";

/**
 * The fortification: a directed Scene Opening and one sighting.
 *
 * The sighting is what turns the repaired winch into the inciting incident. What
 * the opening Sequence draws while it plays is a matter for a human to watch;
 * what it commits is here.
 */

test("the boat arrival lands committed and the sighting unlocks the rocks stairway", async () => {
  const session = startExample();
  repairWinchAndSail(session);

  // The stairway stays shut until the sighting is committed, and the climb is
  // Player-driven throughout.
  expect(session.snapshot().variables.boatLanded).toBe(true);
  expect(revealedNouns(session)).not.toContain("Scaletta verso gli scogli");

  observeSighting(session);
  expect(session.snapshot().variables.driftingBoatSeen).toBe(true);
  expect(revealedNouns(session)).toContain("Scaletta verso gli scogli");

  // Reflection now reports the sighting among Michele's learned Facts.
  const reflected = await reflect(session, "Che cosa ho visto dal belvedere?");
  expect(reflected).toContain("barca alla deriva");
  leaveActivity(session);

  descendToBoat(session);
  expect(scene(session)).toBe("driftingBoat");
  expect(revealedNouns(session)).toHaveLength(7);

  // The return stairway leads back to the fortification landing.
  activateNoun(session, "Scaletta verso gli scogli");
  expect(scene(session)).toBe("coastalFortification");
});

test("skipping the boat arrival commits the same sighting and transition", async () => {
  const session = startExample();
  repairWinchAndSail(session, { skipOpening: true });

  // The skipped outcome lands the boat exactly as full playback does.
  activateNoun(session, "Mare al tramonto");
  expect(session.hud().commandResponse?.text).toContain("barca");

  observeSighting(session);
  const reflected = await reflect(session, "Che cosa ho visto dal belvedere?");
  expect(reflected).toContain("barca alla deriva");
  leaveActivity(session);

  descendToBoat(session);
  const resumed = continueSession(session);
  expect(scene(resumed)).toBe("driftingBoat");
});
