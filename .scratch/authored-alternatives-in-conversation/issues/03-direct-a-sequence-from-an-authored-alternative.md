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

**Status:** ready-for-agent

- [ ] An authored alternative may name a Sequence instead of, or in addition to, its own authored language.
- [ ] Selecting such an alternative makes the Sequence the dominant Game Activity, with its existing presentation and skip semantics untouched.
- [ ] The free-form input field is not presented while the Sequence holds direction of play, and returns when the Conversation resumes.
- [ ] The Author decides whether the Conversation resumes or closes after the Sequence completes, consistent with authored Conversation handoffs.
- [ ] A resumed Conversation presents the alternatives that are eligible against the Game State the Sequence left behind, not the state from before it ran.
- [ ] Any pending Dialogue Turn is cancelled before the Sequence becomes dominant, and its late provider result is ignored.
- [ ] A Sequence reached this way remains within its Scene and cannot direct a Scene transition, consistent with Sequence semantics.
- [ ] Authoring diagnostics reject an alternative naming an unknown Sequence at startup.
- [ ] Existing authored Conversation handoffs, which evaluate a condition rather than respond to a selection, continue to work unchanged and alongside this path.
- [ ] Deterministic Game Session tests cover selection into a Sequence, resume, close, cancellation of a pending turn, and eligibility re-evaluation after the Sequence.
- [ ] A browser test confirms the input field disappears during the Sequence and returns afterwards.
- [ ] Standard build and browser verification pass.
