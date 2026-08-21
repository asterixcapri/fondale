# 07 — The recipes and the Example open their game

**What to build:** An author reading the documentation can copy an opening
rather than infer it. One recipe opens its game on a staged Scene, and
`capri-1535` opens on its initial Scene — until now nothing in the repository
plays the capability this work added, only tests of it.

Both are played by suites that start from the beginning, so those suites now
begin under a Sequence where the Player used to be free immediately. They are
updated to pass through the opening — settling or skipping it before addressing
the Scene — because that is exactly what an author adopting this has to do, and
these suites are the worked example of it. Moving the opening to a later Scene
to keep the tests unchanged is not acceptable: the capability being shown is the
start of a game.

**Blocked by:** 02, 04, 05, 06.

**Status:** resolved

- [x] One recipe opens its game on a staged Scene, and its README explains the
      opening beside the arrival it already shows.
- [x] `capri-1535` opens on its initial Scene with a staged Sequence.
- [x] The recipes' headless and browser suites pass through the opening rather
      than around it.
- [x] The Example's suite does the same, from its shared session helper.
- [x] The Example's tests that drive a Scene by starting the Player at its
      Entrance state that starting at an Entrance is not arriving through it.
- [x] No page of the documentation still describes the old mechanism.
- [x] `npm run build` and `npm run verify` pass.

## Comments

**Resolved.** Both games in the repository now open on staging rather than on a
static tableau, and both do it with the idiom the guides teach.

**The recipes.** The quay's `cases` list carries the carve-out ticket 04 parked
plus a deliberate opening, written from the specific to the general: the
`fromStoreroom` case first, then a case naming no Entrance — which is what makes
it apply at the start of the game — conditioned on `cameAshore`. The new
`firstMorning` Sequence raises that Variable as its *first* operation and
repeats it in its Skip Outcome, which is the "only the first time" idiom, and
the recipe says on the type why up front rather than last. The README explains
the opening beside the arrival it already showed, and its inventory of the
recipe files now reads three Sequences (as does the Example section of the
Project guide, which still said two).

**The Example.** `harbourDawn` (`src/sequences/harbour-dawn.ts`) stages the
harbour, the initial Scene, under the same shape: one unconditional-outcome case
on the Scene, conditioned on `harbourDawnSeen`, raised first. It is deliberately
*not* named `harbour-opening`, because `test/harbour-opening.spec.ts` already
means the harbour job's puzzle chain.

**The suites pass through the opening, not around it.** The recipes' headless
suite reads it through in one local `startOnTheQuay` helper and skips it in one
place, so both ways are shown; a new test pins that the Sequence holds the quay
at the first tick and that the Player is not in control before it. The browser
suite skips the opening with Escape and then clicks the world, which is what
proves control came back. The Example changed in the one shared helper: an
exported `startExampleUnopened` starts the session, and `startExample` and
`startExampleWithDialogue` press on through the opening. `continueSession` does
not, because restoring is never a Scene Opening.

**Starting at an Entrance is not arriving through it** is now stated where the
Example relies on it: on `startExampleAt` in `test/support.ts` and at the head of
`test/packages.spec.ts`, which names the fortification's `fromHarbour` case as
the one that consequently does not play there.

**One page beyond the diff's own subject.** The Testing guide's worked example
starts a session and addresses a Noun on the next line, which is now wrong advice
for a game whose initial Scene opens; it gained a paragraph saying to pass
through the opening first and that a restored session needs none of it.

**The documentation sweep the effort owed.** Nothing in `docs/`, `CONTEXT.md`,
`README.md`, `skills/` or `packages/` still describes `arrivalSequences`,
`ArrivalSequenceRule`, `CommandFallback`, a Noun `fallbacks` map, a Conversation
handoff, or a branch/choice `fallback`. What the greps do turn up is all
deliberate: `definition.conditional-fallback` is the diagnostic code tickets 01
and 06 kept; the Game Project's `commandFallbacks` stay by the spec's own
decision; ADR 0007 and ADR 0029 are records and speak of their own time; the
`## Handoff` headings under `skills/` and the Example's `sailorHandoff` are
unrelated uses of the word.

**Verification.** `npm run build` green and `npm run verify` green (379 passed)
at the root; `npm run typecheck` and `npm run verify` green (25 passed) inside
`examples/capri-1535`. The vendored `fondale-0.4.0.tgz` and the Example's
`package-lock.json` are refreshed, since the recipes and the guides the tarball
ships both changed and the browser recipe test consumes them.

**Review.** `/code-review` ran and both sub-agents reported. Acted on: the stale
"two Sequences" in `docs/public/authoring/project.md`; the recipe's case order,
which had the general case shadowing the specific one and so taught the inverse
of the rule the Scene guide states; the Sequence file name colliding with the
Example's existing `harbour-opening.spec.ts`; a `openTheHarbour` middle man in
`test/support.ts`, now inlined; a half-finished `arrival` rename in the Example's
tests, completed as `skipOpening`; and a browser assertion that could pass before
the skip propagated, dropped in favour of the click that follows it.

Two findings were judged and not acted on. The Spec reviewer is right that the
Example's and the browser suite's restoration assertions do not *prove* that
restoring bypasses an opening — the guard Variable is already raised by then, so
they would pass against a broken Engine. That property belongs to the Engine's
own suite, where ticket 04 pinned it; the comments here were rewritten to claim
only what they check. The same reviewer notes that no recipe shows an opening
answering with a Line or a Command Response alone (spec stories 15 and 16),
which the Engine's tests cover but nothing an author copies does. The obvious
home is the quay's `backOutside`, a whole Sequence declared for one sentence —
but this ticket's remit is the opening "beside the arrival it already shows", so
that is left for the effort's owner to decide.
