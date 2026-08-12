# 04 — Consume authored alternatives

**What to build:** An Author decides, for each authored alternative, whether it
disappears once the Player has asked it or stays available to ask again. A
pivotal question that only makes sense once is asked once; a reference question
the Player may want to revisit stays in the list. Which alternatives have been
consumed is part of the playthrough: it survives saving and loading exactly, so
a restored game never re-offers a question the Player already asked, nor
withdraws one they did not.

**Blocked by:** 02 — Present authored alternatives in a Conversation.

**Status:** ready-for-agent

- [ ] An Author may mark an individual authored alternative as consumed once asked, or as repeatable.
- [ ] The default for an alternative that says nothing is decided explicitly, documented, and consistent with how Choice behaves today.
- [ ] A consumed alternative is no longer presented, while repeatable ones stay available for as long as they remain eligible.
- [ ] Consumption is committed through a Game Operation, atomically with the rest of the selection's effects.
- [ ] Consumption state is canonical Game State: it validates and restores exactly in a Save Snapshot, alongside the Conversation continuation.
- [ ] A Save Snapshot naming an unknown Character or alternative is rejected by validation rather than silently ignored.
- [ ] Consumption interacts correctly with eligibility: an alternative may be hidden by its condition, consumed, or both, without the two mechanisms masking each other.
- [ ] Loading resets provider-owned Conversation memory as it does today, while consumption state is restored from the Snapshot.
- [ ] Deterministic Game Session and Save tests cover consumption, repeatability, restoration, and rejection of invalid snapshots.
- [ ] Standard build and browser verification pass.
