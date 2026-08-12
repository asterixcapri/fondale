# 05 — Make Dialogue Turns atomic and cancellable

**What to build:** Make every pending Dialogue Turn safe under latency,
failure, cancellation and Game Session lifecycle changes. The Player can leave,
save, load or stop without receiving a stale response or committing half of a
turn, and provider-owned conversation memory remains outside Game State.

**Blocked by:** 02 — Deliver the first open-fact Conversation.

**Status:** ready-for-human

- [x] A Conversation accepts at most one pending Dialogue Turn and blocks duplicate submission until that turn settles or is cancelled.
- [x] Interpretation and verbalisation receive cancellation and a non-canonical turn identity suitable for rejecting late results.
- [x] Provider rejection, invalid structured output, timeout or an empty invalid Line leaves Game State unchanged and allows a later retry.
- [x] Leaving the Conversation cancels the pending turn and ignores every later provider result from it.
- [x] Save, Load and `stop()` invalidate a pending turn before it can commit or present a late response.
- [x] A successful Dialogue Turn commits its accepted Line outcome and all Engine-decided Game Operations as one observable transition.
- [x] Load resets every provider conversation for the Game Session before Fondale accepts another Dialogue Turn.
- [x] A Conversation restored from a Save Snapshot begins with empty provider memory rather than reconnecting to an earlier transcript.
- [x] Save Snapshots contain no transcript, summary, thread ID, provider ID, model ID, token usage or technical interpretation output.
- [x] The FakeDialogueProvider can deterministically exercise pending, cancellation, failure, reset and late-response cases.
- [x] Game Session, Save and browser tests cover all lifecycle transitions without flaky timing assumptions.
- [x] Standard build and browser verification pass.

## Comments

- Implemented with TDD across the Dialogue Provider, Game Session, Save and
  browser lifecycle seams. Pending and staged turns are invalidated by Leave,
  Save, Load and `stop()`; Load awaits provider reset before restoring play.
- Final verification: `npm run build` and 216 Playwright tests.
- Two-axis code review completed; all Standards and Spec findings were
  corrected and rechecked with no remaining findings.
