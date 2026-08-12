# 07 — Add Player Character Reflection

**What to build:** Let the Player ask the Player Character to reflect on what
has actually been learned and heard. Reflection may summarise Character
Knowledge and Testimony, identify uncertainty and suggest Hypothesis, but it
must not expose hidden truth or create canonical deductions.

**Blocked by:** 04 — Model Cover Stories and remembered Testimony; 05 — Make Dialogue Turns atomic and cancellable.

**Status:** ready-for-human

- [x] The Example exposes a clear `Rifletti` entry into Reflection without treating it as a Conversation with a second Character.
- [x] Reflection receives only the Player Character's committed Character Knowledge, remembered Testimony and other explicitly authorised current context.
- [x] Hidden World truth, undiscovered Character Knowledge and future puzzle solutions are absent from the provider payload.
- [x] Reflection does not apply Disclosure, Cover Story or new Testimony.
- [x] A Reflection response may state a Hypothesis only as uncertain and never adds it to Character Knowledge or Game State.
- [x] Suggestions about what to investigate remain non-canonical possibilities rather than automatic deductions or quest progression.
- [x] Reflection uses provider memory distinct from every Character Conversation.
- [x] Load resets Reflection memory together with Conversation memory, without changing the loaded canonical knowledge.
- [x] Empty or insufficient knowledge produces an honest limited response instead of an invented answer.
- [x] FakeDialogueProvider and browser tests demonstrate summaries, Testimony attribution, uncertainty, thread separation and reset.
- [x] Standard build and browser verification pass.

## Comments

- Implemented test-first across the Dialogue Provider, Game Session, Save and
  browser/Example seams. The provider payload is limited to the Player
  Character's committed knowledge, attributed Testimony and outgoing
  Relationships; generated hypotheses and investigation suggestions remain
  non-canonical.
- Reflection and Character Conversation use distinct provider threads. Load
  resets all provider memory while preserving the restored canonical state.
- Final verification passed: root build and all 235 Playwright tests; packaged
  Capri 1535 Example build and all 7 Playwright tests.
- Final two-axis review passed with 0 Standards findings and 0 Spec findings.
