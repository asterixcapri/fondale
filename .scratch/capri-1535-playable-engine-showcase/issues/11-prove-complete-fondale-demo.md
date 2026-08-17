# 11 — Prove the complete Fondale demo

**What to build:** Turn the assembled prologue into one trustworthy product
demonstration. A Player can complete it through authored dialogue, explore it
through Knowledge-Driven Dialogue and Reflection, continue it after leaving,
use mouse or keyboard and understand the shipped behavior from coherent
documentation.

**Blocked by:** 10 — Play the drifting-boat finale.

**Status:** resolved

- [x] One browser acceptance path completes the entire prologue through only authored Conversation alternatives.
- [x] A second path proves early oil discovery and convergence on the same canonical outcome.
- [x] Reflection reports only learned Narrative Facts and offers progressive reminders without applying puzzle effects.
- [x] Knowledge-Driven Dialogue respects open, guarded and secret Disclosure throughout the prologue.
- [x] Raffaele's Cover Story remains Testimony and is never promoted to canonical Character Knowledge.
- [x] Provider failure, cancellation and late completion leave Game State unchanged and provide actionable feedback.
- [x] Standard verification uses deterministic support at the production HTTP seam and needs no live database, model or network.
- [x] Opt-in live verification exercises the separately run Dialogue Server without comparing generated wording verbatim.
- [x] Browser continuation restores representative Object, Scenery, knowledge, relationship and alternative state.
- [x] Mouse and keyboard operate Passages, Hotspots, Inventory, Conversations, Choices, Reflection and Sequences.
- [x] Inventory remains unavailable during narrative activities according to the HUD contract.
- [x] Every skippable Sequence preserves its canonical outcome when skipped.
- [x] Actual-size inspection covers all Scenes, Perspective Scale bands, Appearances, occlusion and Camera edges.
- [x] Michele's walking and directed Animations pass motion review in every required Facing and representative depth.
- [x] The README describes the same four-Scene route, Dialogue Server requirement and verification flows.
- [x] The package build and full standard browser suite pass from the assembled tree.

## Comments

- 2026-08-17, during ticket 09: agreed with the user that the legacy
  `test/acceptance.spec.ts` (town-square route, Aiano/Boffe text fixtures) is
  obsolete and already red; it must not be run or patched ticket by ticket.
  This ticket replaces it with the single four-Scene acceptance path and the
  focused cases listed above. Until then, per-ticket verification runs the
  current specs only (michele, harbour, cloister, harbour-opening,
  fortification, drifting-boat, boat-sighting, dialogue-server-unreachable).
- Some current assertions are timing-sensitive under full-suite load (winch
  contact pixel hash in harbour-opening, clue clicks without walk waits in
  drifting-boat, asset-request polling in michele). Stabilise them while
  rewriting the acceptance harness here.
- 2026-08-17, ticket 09 follow-up: the obsolete set also includes the early
  isolated package specs `test/michele.spec.ts` and `test/harbour.spec.ts`
  (stale sprite names and pre-06 interaction expectations). Ticket 09 applied
  stopgap fixes to both (runtime-workwear asset list; nets pull expectation)
  so they are green if run, but their proper rebuild belongs here together
  with the acceptance rewrite.
- 2026-08-17, during this ticket: the rebuilt motion review found Michele
  standing in open water along the harbour's far edge. The Scene's
  `walkableRegion` ran straight from (90, 470) to (900, 400) while the
  Background's waterline sits at y 527 at x 100, 515 at x 300, 479 at x 500,
  440 at x 700 and 408 at x 900 — up to 75 points of sea inside the walkable
  area. The region now follows the sampled waterline. This is ticket 02
  content, corrected here because a motion review that leaves the Player
  Character walking on water has not passed.
- 2026-08-17, during this ticket: the load sensitivity noted above was
  Playwright's default worker count, not the assertions. The standard suite ran
  eleven Chrome instances against the same CPU and failed ten cases that every
  one of them passed alone; the Example's `playwright.config.ts` now pins
  `workers: 1`. Every case in this suite drives a real-time simulation and
  reads it back by screenshotting a canvas, so it cannot share a machine with
  copies of itself. The full serial run takes about 32 minutes.
- 2026-08-17, review follow-up: Trust and Dialogue State have no Player-visible
  consequence in this prologue — no Disclosure here is gated on Trust — so the
  continuation case reads them from the persisted Continuation State through
  `continuationState` in the harness. That is the one place the suite reads
  Game State rather than the screen, and it is deliberate: the alternative was
  authoring a trust-gated Disclosure, which is content this ticket does not own.
- 2026-08-17, review follow-up: the Engine renders through WebGL, so the suite
  can compare rendered frames but can never read a pixel or measure a sprite.
  Perspective Scale bands, occlusion and depth sorting are therefore reviewed
  in named screenshots under `test/shots/`, not asserted. Facings are asserted:
  Michele returns to one point from four sides and whole idle cycles are
  compared, so two Facings drawn from the same sheet would share a frame.
