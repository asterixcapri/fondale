# 05 — Make Dialogue Turns atomic and cancellable

**What to build:** Make every pending Dialogue Turn safe under latency,
failure, cancellation and Game Session lifecycle changes. The Player can leave,
save, load or stop without receiving a stale response or committing half of a
turn, and provider-owned conversation memory remains outside Game State.

**Blocked by:** 02 — Deliver the first open-fact Conversation.

**Status:** ready-for-agent

- [ ] A Conversation accepts at most one pending Dialogue Turn and blocks duplicate submission until that turn settles or is cancelled.
- [ ] Interpretation and verbalisation receive cancellation and a non-canonical turn identity suitable for rejecting late results.
- [ ] Provider rejection, invalid structured output, timeout or an empty invalid Line leaves Game State unchanged and allows a later retry.
- [ ] Leaving the Conversation cancels the pending turn and ignores every later provider result from it.
- [ ] Save, Load and `stop()` invalidate a pending turn before it can commit or present a late response.
- [ ] A successful Dialogue Turn commits its accepted Line outcome and all Engine-decided Game Operations as one observable transition.
- [ ] Load resets every provider conversation for the Game Session before Fondale accepts another Dialogue Turn.
- [ ] A Conversation restored from a Save Snapshot begins with empty provider memory rather than reconnecting to an earlier transcript.
- [ ] Save Snapshots contain no transcript, summary, thread ID, provider ID, model ID, token usage or technical interpretation output.
- [ ] The FakeDialogueProvider can deterministically exercise pending, cancellation, failure, reset and late-response cases.
- [ ] Game Session, Save and browser tests cover all lifecycle transitions without flaky timing assumptions.
- [ ] Standard build and browser verification pass.

## Comments
