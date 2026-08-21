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

**Status:** ready-for-agent

- [ ] A game whose initial Scene declares a case with no Entrance stages it when
      a new game begins.
- [ ] The Player is not in control before the staging begins.
- [ ] **The same game restored from a Save Snapshot does not stage it.**
- [ ] A case naming an Entrance never applies at the start of a game, and still
      applies when the Player arrives through that Entrance.
- [ ] A case with no Entrance applies both at the start and on later arrivals.
- [ ] The condition is evaluated against the complete initial Session state,
      including dialogue state, with the evaluator the Passage transition
      already receives.
- [ ] The Scene, Sequence, Save and Detail View authoring guides no longer say
      that startup is not an arrival, and describe the Scene Opening instead.
- [ ] `npm run build` and `npm run verify` pass, Example and recipes included.
