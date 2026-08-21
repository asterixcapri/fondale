# 04 — A game opens on its initial Scene

**What to build:** A game can open on a staged Scene instead of a static
tableau. A Scene now opens both when the Player arrives through a Scene Passage
and when the game begins in that Scene, and an opening takes control before the
Player has it, so no frame of play is reachable before the staging starts.

Restoring a Save Snapshot never opens a Scene: a returning Player is not shown
the prologue again. That boundary is the most important behaviour in this
ticket.

No new field distinguishes the two: a case naming a Scene Entrance cannot apply
at the start of a game, because no door was used. "Only the first time" stays
the idiom the Engine already teaches — a condition on a Game Variable the
Sequence raises among its own operations and in its Skip Outcome.

**Blocked by:** 03 — A Scene declares its cases.

**Status:** resolved

- [x] A game whose initial Scene declares a case with no Entrance stages it when
      a new game begins.
- [x] The Player is not in control before the staging begins.
- [x] **The same game restored from a Save Snapshot does not stage it.**
- [x] A case naming an Entrance never applies at the start of a game, and still
      applies when the Player arrives through that Entrance.
- [x] A case with no Entrance applies both at the start and on later arrivals.
- [x] The condition is evaluated against the complete initial Session state,
      including dialogue state, with the evaluator the Passage transition
      already receives.
- [x] The Scene, Sequence, Save and Detail View authoring guides no longer say
      that startup is not an arrival, and describe the Scene Opening instead.
- [x] `npm run build` and `npm run verify` pass, Example and recipes included.

## Comments

**Resolved.** A Game Session now asks World for the initial Scene's applicable
case on the branch that builds a fresh state, and answers it through the one
place a Passage transition already answers an opening. One World call
(`world.sceneOpening(state, worldStateConditionMatches)`, with no Scene
Entrance because no door was used) and one Session call (`applySceneOpening`);
nothing about the selection is reproduced. It runs before `advanceCamera()` and
before the session is handed out, so a Sequence holds the Scene at tick 0 and
the Player never has a frame of control before the staging.

The inline evaluator the Passage transition passed to World is now the named
`worldStateConditionMatches`, shared by both callers: a condition is decided
against the whole Session state — variables, Inventory and dialogue state — not
against World state alone.

**Restoration is not an opening.** The branch is guarded by `!restored`, and the
assertion the spec calls the most important is explicit: the same game, saved
after its unconditional opening has played and restored, has a null activity and
a snapshot equal to the uninterrupted one.

**Tests** (all in `test/animated-sequences.spec.ts`, through the Player-facing
seam): a new game staged before control; the restored game not staged; an
`entrance` case that waits for its door and then applies through it; a case with
no `entrance` applying at the start and on every later arrival; the first
eligible case decided by the initial Session state; and a `response`-only
opening with operations at startup.

**Recipes.** The quay is the recipes' initial Scene and its case was
unconditional, so under this change it would have staged the recipes' game —
which ticket 07 owns. The case now names `fromStoreroom`, the Entrance it was
always about ("Every later opening of the quay"), so the recipes play exactly as
before. Ticket 07 replaces this with a deliberate opening.

**The Example.** Untouched. Its only Scene Opening case names an Entrance and
sits on a Scene that is not the initial one, so nothing about it changes; the
Engine's published surface and validation are unchanged, so the vendored tarball
was not refreshed. Verified anyway: with a freshly packed Engine installed the
Example's suite ran green (24 tests), and the pack was reverted afterwards.

**Left alone.** `InteractionCondition` has no dialogue variant, so "including
dialogue state" cannot be exercised by an authored condition; what is testable
is that the evaluator receives the whole Session state, which the variable-
conditioned opening covers. `docs/public/authoring/detail-view.md` was checked
and needed no change: ticket 03 already left its one relevant sentence correct.

**Verification.** `npm run build` green; `npm run verify` green (374 browser
tests); the Example's `npm run typecheck` and `npm run verify` green (24 tests).
