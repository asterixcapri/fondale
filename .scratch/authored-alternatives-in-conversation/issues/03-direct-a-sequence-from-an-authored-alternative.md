# 03 — Direct a Sequence from an authored alternative

**What to build:** An authored alternative may answer with a full scene rather
than a single Line. Selecting it hands direction of play to a named Sequence,
which keeps its existing ownership of exact Lines, Narrations, Choices, timing,
skip behaviour, Animations, Motions and the Camera. While that Sequence is the
dominant Game Activity the free-form input field is not presented, because the
Player is watching a performance rather than conducting a conversation. When
the Sequence completes, the Conversation resumes and both channels are
available again.

This is what lets an authored question carry the weight it carries today — the
Raffaele engagement is four Lines, a Choice and a Game Variable, not one reply.

**Blocked by:** 02 — Present authored alternatives in a Conversation.

**Status:** ready-for-human

- [x] An authored alternative may name a Sequence instead of, or in addition to, its own authored language.
- [x] Selecting such an alternative makes the Sequence the dominant Game Activity, with its existing presentation and skip semantics untouched.
- [x] The free-form input field is not presented while the Sequence holds direction of play, and returns when the Conversation resumes.
- [x] The Author decides whether the Conversation resumes or closes after the Sequence completes, consistent with authored Conversation handoffs.
- [x] A resumed Conversation presents the alternatives that are eligible against the Game State the Sequence left behind, not the state from before it ran.
- [x] Any pending Dialogue Turn is cancelled before the Sequence becomes dominant, and its late provider result is ignored.
- [x] A Sequence reached this way remains within its Scene and cannot direct a Scene transition, consistent with Sequence semantics.
- [x] Authoring diagnostics reject an alternative naming an unknown Sequence at startup.
- [x] Existing authored Conversation handoffs, which evaluate a condition rather than respond to a selection, continue to work unchanged and alongside this path.
- [x] Deterministic Game Session tests cover selection into a Sequence, resume, close, cancellation of a pending turn, and eligibility re-evaluation after the Sequence.
- [x] A browser test confirms the input field disappears during the Sequence and returns afterwards.
- [x] Standard build and browser verification pass.

## Comments

An alternative declares `sequence` together with an explicit `after: "close" |
"resume"`; each is invalid without the other, and `response` becomes optional so
an alternative may answer with authored language, with a Sequence, or with both.
An alternative carrying both speaks its authored answer first and directs the
Sequence when that Line ends.

The Sequence takeover reuses the authored-handoff path: both now call one
`startDirectedSequence`, which cancels any pending Dialogue Turn, records the
`conversationContinuation` when the outcome is `resume`, and starts the Sequence
in the current Scene. Save validation accepts a continuation left by an
alternative as well as by a handoff (`hasResumableSequence`).

The pending-turn policy chosen in ticket 02 is unchanged: a selection made while
a Dialogue Turn is pending is refused rather than allowed to race it, so no
provider turn can be outstanding at takeover. The cancellation at takeover is
therefore an invariant rather than a new decision point; the deterministic test
covers a turn cancelled by a Save whose late provider result arrives while the
Sequence is dominant and is ignored.

A Sequence an alternative queued behind its own authored Line takes precedence
over an eligible handoff, and leaving the Conversation during that Line discards
the queued direction so the handoff decides what follows, as it does for every
other way of leaving. The queued direction is session-local, like the Line it
waits behind: a Save taken during that Line discards both, and the alternative
stays selectable after loading. Both are covered by deterministic tests, as is a
Character carrying a handoff and a Sequence-directing alternative at once.
