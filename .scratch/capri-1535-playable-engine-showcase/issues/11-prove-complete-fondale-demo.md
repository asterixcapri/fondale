# 11 — Prove the complete Fondale demo

**What to build:** Turn the assembled prologue into one trustworthy product
demonstration. A Player can complete it through authored dialogue, explore it
through Knowledge-Driven Dialogue and Reflection, continue it after leaving,
use mouse or keyboard and understand the shipped behavior from coherent
documentation.

**Blocked by:** 10 — Play the drifting-boat finale.

**Status:** ready-for-agent

- [ ] One browser acceptance path completes the entire prologue through only authored Conversation alternatives.
- [ ] A second path proves early oil discovery and convergence on the same canonical outcome.
- [ ] Reflection reports only learned Narrative Facts and offers progressive reminders without applying puzzle effects.
- [ ] Knowledge-Driven Dialogue respects open, guarded and secret Disclosure throughout the prologue.
- [ ] Raffaele's Cover Story remains Testimony and is never promoted to canonical Character Knowledge.
- [ ] Provider failure, cancellation and late completion leave Game State unchanged and provide actionable feedback.
- [ ] Standard verification uses deterministic support at the production HTTP seam and needs no live database, model or network.
- [ ] Opt-in live verification exercises the separately run Dialogue Server without comparing generated wording verbatim.
- [ ] Browser continuation restores representative Object, Scenery, knowledge, relationship and alternative state.
- [ ] Mouse and keyboard operate Passages, Hotspots, Inventory, Conversations, Choices, Reflection and Sequences.
- [ ] Inventory remains unavailable during narrative activities according to the HUD contract.
- [ ] Every skippable Sequence preserves its canonical outcome when skipped.
- [ ] Actual-size inspection covers all Scenes, Perspective Scale bands, Appearances, occlusion and Camera edges.
- [ ] Michele's walking and directed Animations pass motion review in every required Facing and representative depth.
- [ ] The README describes the same four-Scene route, Dialogue Server requirement and verification flows.
- [ ] The package build and full standard browser suite pass from the assembled tree.

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
