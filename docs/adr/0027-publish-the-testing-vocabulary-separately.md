---
status: accepted
---

# Publish the testing vocabulary as its own entry point

Publishing the headless Core Session (ADR 0026) told a Game Project how to run
without a renderer, but not how to drive one. Driving means speaking the seam's
own vocabulary: input kinds, target indices, simulated steps. Writing the
Example's suite against it cost a day of learning which input drives what — a
Conversation alternative and a Sequence choice take different inputs, a Noun is
addressed by an index the Player never sees, and an activation walked to commits
its outcome long after the walk ends. Every author would pay that again, and a
motor that ships no repeatable way to test a game has delivered half the work.

`fondale/testing` publishes that vocabulary in the terms a Player
would use: activate the Noun labelled this, answer the alternative that reads
like that, let play settle. Opening the game without a renderer belongs there
too, so `startCoreSession` and the Core Session's own types move out of the
runtime entry point: what a shipped game imports to run is `startGame` and its
`GameSession`, and nothing else.

`CoreSession.atRest` stays a method, alone among this vocabulary, because a
queued input the session has yet to handle appears nowhere in Game State: no
caller can answer it. Hiding it from the interface was tried and undone — it
bought consistency with a private registry keyed on session identity, which is
machinery in exchange for taste. The interface is published from here anyway, so
a game that only runs never sees it.

## Considered options

Exporting it from the package root was tried first, and rejected once the
Engine's own suite proved it would never use it: those specs address Hotspots by
index, choose the exact input under test rather than a generic one, and step
fixed counts because their fixtures' timing is what they assert. A vocabulary
that hides the seam is wrong for testing the seam. So the root entry would have
shipped every game code that only its tests want.

## Consequences

The package now declares two entry points, and `tools/verify-architecture.mjs`
enforces exactly those two rather than exactly one; `src/testing.ts` joins
`src/index.ts` as a root contract with no capability owner. Both entry points are
read by the documentation gate, so a name published from either must be
documented.

Game story stays out. What a Scene contains, which Fact a letter releases, which
route reaches the boat: an authored path belongs to the game that authored it,
and no future addition here may know one.
