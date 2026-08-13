# 04 — Consume authored alternatives

**What to build:** An Author decides, for each authored alternative, whether it
disappears once the Player has asked it or stays available to ask again. A
pivotal question that only makes sense once is asked once; a reference question
the Player may want to revisit stays in the list. Which alternatives have been
consumed is part of the playthrough: it survives saving and loading exactly, so
a restored game never re-offers a question the Player already asked, nor
withdraws one they did not.

**Blocked by:** 02 — Present authored alternatives in a Conversation.

**Status:** ready-for-human

- [x] An Author may mark an individual authored alternative as consumed once asked, or as repeatable.
- [x] The default for an alternative that says nothing is decided explicitly, documented, and consistent with how Choice behaves today.
- [x] A consumed alternative is no longer presented, while repeatable ones stay available for as long as they remain eligible.
- [x] Consumption is committed through a Game Operation, atomically with the rest of the selection's effects.
- [x] Consumption state is canonical Game State: it validates and restores exactly in a Save Snapshot, alongside the Conversation continuation.
- [x] A Save Snapshot naming an unknown Character or alternative is rejected by validation rather than silently ignored.
- [x] Consumption interacts correctly with eligibility: an alternative may be hidden by its condition, consumed, or both, without the two mechanisms masking each other.
- [x] Loading resets provider-owned Conversation memory as it does today, while consumption state is restored from the Snapshot.
- [x] Deterministic Game Session and Save tests cover consumption, repeatability, restoration, and rejection of invalid snapshots.
- [x] Standard build and browser verification pass.

## Comments

An alternative declares `once: true` to be consumed by the selection that asks
it. The default is repeatable, chosen to match Choice: a Choice alternative is
offered whenever its condition holds and nothing withdraws it, so an
alternative that says nothing about consumption behaves the same way. The
default is documented in the reference and in the authoring guide.

Consumption is a `ConsumeConversationAlternativeOperation`, an ordinary
Dialogue-owned Game Operation naming the Character and the authored alternative
index. The selection appends it to the alternative's own `operations` and
commits the whole list through the existing `applyOperations`, so a failure
anywhere in the batch rolls consumption back with it. Consuming the same
alternative twice is idempotent. The operation is validated at startup like
every other Dialogue operation, so an authored operation naming an alternative
its Character does not offer is rejected by
`reference.conversation-alternative.index`.

The state lives in `consumedAlternatives`, a Character-indexed record of
authored indexes owned by the dialogue capability alongside Character
Knowledge, so it reaches Game State through the same composition and is
validated by `dialogue.isValidState`. Save rejects a snapshot whose record does
not name exactly the project's Characters, or that names an index the Character
does not offer, a duplicate, or a non-integer. Provider memory still resets on
load in the browser layer, unchanged, while consumption is restored from the
snapshot; a browser test covers the pair.

Consumption is applied at selection, before the alternative's authored Line is
spoken, so an alternative saved mid-Line stays consumed after loading — the
Player did ask it. This is the one place where consumption and the
session-local Line lifecycle differ, and it follows from the ticket's own
requirement that consumption commit atomically with the selection.

An alternative is named by its authored index rather than by an identifier of
its own, as a Hotspot and a Passage already are inside a saved player intent.
The index is only ever compared within one Game Project version — a Save
Snapshot validates against `projectIdentity` and `projectVersion` before
anything reads it — so reordering alternatives is a Project Version change like
any other shape change, not a silent re-pointing. An authored `id` would be the
alternative if alternatives ever needed to be referenced from outside the
Character that declares them; nothing in this spec does.

Eligibility and consumption are independent filters: `alternatives()` evaluates
the authored condition and then drops consumed indexes, so an alternative may be
withdrawn by either or both, and a condition that becomes false and true again
never resurrects a consumed alternative.
