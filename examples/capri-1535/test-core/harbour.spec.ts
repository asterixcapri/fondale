import { expect, test } from "vitest";

import { activate, carried, clear, revealed, walkTo } from "./play";
import { startExample } from "./support";

/**
 * The harbour Scene package, driven on its own.
 *
 * The harbour is the demo's opening Scene and its only panoramic one: 1920 points
 * of quay seen through a 1280-point Camera. This spec inspects the package — the
 * Nouns it exposes, the Appearances it swaps, and both Camera edges — rather than
 * the prologue that runs through it. The authored puzzle chain belongs to
 * `harbour-opening.spec.ts`.
 */

test("the harbour package exposes its panoramic default state", () => {
  const session = startExample();
  expect(session.snapshot().currentScene).toBe("harbour");

  // Every target the opening Scene offers, and only those: the flask is still
  // under the nets, so its Noun is not offered yet, and only the cloister is
  // reachable on foot — the gozzo Passage waits on the repaired winch.
  expect([...revealed(session)].sort()).toEqual([
    "Argano senza manovella",
    "Gozzo di Raffaele",
    "Passaggio verso il chiostro",
    "Raffaele",
    "Reti da pesca",
    "Zona di lavoro",
  ]);
});

test("both Camera edges are reachable and clamp to the quay", () => {
  const session = startExample();

  // Michele opens at the western end, so the Camera starts clamped there.
  expect(session.camera().origin.x).toBe(0);

  // Walking to the far end of the quay scrolls the Camera until it clamps at the
  // Scene's own width less the viewport: 1920 points of quay seen through 1280.
  walkTo(session, { x: 1_880, y: 620 });
  expect(session.camera().origin.x).toBe(640);

  // Asking for more of the same direction moves nothing: the edge holds.
  walkTo(session, { x: 1_880, y: 620 });
  expect(session.camera().origin.x).toBe(640);

  // And back to the opposite edge, which clamps the same way.
  walkTo(session, { x: 40, y: 620 });
  expect(session.camera().origin.x).toBe(0);
});

test("the harbour Nouns answer, and pulling the nets swaps their Appearance", () => {
  const session = startExample();

  // A look-at Noun on Scenery, and the same verb on a background-only Hotspot.
  activate(session, "Gozzo di Raffaele");
  expect(session.hud().commandResponse?.text).toContain("Il gozzo di Raffaele è pronto");
  clear(session);
  activate(session, "Zona di lavoro");
  expect(session.hud().commandResponse?.text).toContain("Ceste, corde e attrezzi");
  clear(session);

  // A Character Noun opens a Conversation instead of answering inline.
  activate(session, "Raffaele");
  expect(session.conversation()).not.toBeNull();
  session.input({ type: "escape" });
  clear(session);
  expect(session.conversation()).toBeNull();

  activate(session, "Argano senza manovella");
  expect(session.hud().commandResponse?.text).toContain("Sul mozzo manca la manovella");
  clear(session);

  // The nets carry two verbs. The secondary one still describes the bulge, and
  // the primary one is the pull that reveals what is under them.
  const nets = session.hud().nouns.find((noun) => noun.label === "Reti da pesca")!;
  expect(nets.primary.text).toContain("Tira");
  expect(nets.secondary?.text).toContain("Guarda");
  activate(session, "Reti da pesca", { action: "secondary" });
  expect(session.hud().commandResponse?.text).toContain("rigonfiamento");
  clear(session);
  expect(session.snapshot().scenery.harbour!.fishingNets).toBe("covering");

  // The primary verb plays the reveal Sequence, which swaps the Appearance for
  // good: the heap answers to a new Label and the Noun it hid is reachable.
  expect(session.snapshot().variables.netsMoved).toBe(false);
  activate(session, "Reti da pesca");
  clear(session);
  expect(session.snapshot().variables.netsMoved).toBe(true);
  expect(session.snapshot().scenery.harbour!.fishingNets).toBe("moved");
  expect(revealed(session)).not.toContain("Reti da pesca");
  expect(revealed(session)).toContain("Reti da pesca spostate");
  expect(revealed(session)).toContain("Ampolla d'olio");

  activate(session, "Ampolla d'olio");
  clear(session);
  expect(carried(session)).toContain("oilFlask");
});
