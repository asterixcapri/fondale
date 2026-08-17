# 08 — Repair the winch and confront Raffaele

**What to build:** Pay off the harbour job after the oil and cloister slices are
complete. Michele installs the recovered handle through a physically connected
Sequence, leaves it visibly mounted on the restored winch and chooses how to
respond to Raffaele's lie without risking the route forward.

**Blocked by:** 06 — Play the harbour job and oil reveal; 07 — Deliver the letter and free the well.

**Status:** resolved

- [x] The winch has missing-handle and installed-handle Art Masters and Runtime Appearances that recompose at one scale and position.
- [x] Using the selected handle on the winch starts the installation Sequence from a valid approach and Facing.
- [x] Michele has the required mechanism-use Animation with a named visible contact Cue.
- [x] The winch response begins from that Cue and never visually precedes Michele's action.
- [x] Ordinary playback and Sequence skipping commit identical canonical outcomes.
- [x] Installation removes the handle from Inventory and places the same Object at the winch with an installed Appearance.
- [x] The repaired winch remains visibly repaired through Scene transitions and browser continuation.
- [x] Raffaele offers authored responses to accusation, silence and a request for better payment.
- [x] Each response may change Trust, Dialogue State or later Lines through explicit Game Operations.
- [x] Every response converges on fortification access and none creates an unwinnable state.
- [x] Browser acceptance proves installation timing, every social branch and their convergence.

## Comments

- 2026-08-17 — Added the Cue-driven, skippable installation Sequence. Its shared
  outcome consumes the Inventory handle, leaves the same Object visibly mounted
  on the repaired winch and persists through Scene transitions and Continuation.
- 2026-08-17 — Added accusation, silence and payment responses for Raffaele.
  Explicit Trust and Dialogue State operations distinguish the branches, while
  each response safely unlocks the fortification route.
- 2026-08-17 — Standards and specification review completed with no remaining
  actionable findings. Browser acceptance uses fresh Game Sessions for each
  branch and proves unchanged pixels before the contact Cue and changed pixels
  afterward.
- 2026-08-17 — Example verification: `npm run build` passes (typecheck and Vite,
  792 modules); focused ordinary timing/three-branch acceptance passes `1/1` in
  4.7m, and focused skip/Continuation acceptance passes `1/1` in 1.7m. The full
  command `CAPRI_TEST_PORT=5273 CAPRI_ORDINARY_PORT=5274 npm run verify --
  --workers=4` finishes `13/20` in 9.8m; the seven failures are pre-existing
  legacy expectations in `acceptance.spec.ts`, `harbour.spec.ts` and
  `michele.spec.ts`, outside ticket 08. No root Engine verification was run.
