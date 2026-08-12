# 07 — Add Player Character Reflection

**What to build:** Let the Player ask the Player Character to reflect on what
has actually been learned and heard. Reflection may summarise Character
Knowledge and Testimony, identify uncertainty and suggest Hypothesis, but it
must not expose hidden truth or create canonical deductions.

**Blocked by:** 04 — Model Cover Stories and remembered Testimony; 05 — Make Dialogue Turns atomic and cancellable.

**Status:** ready-for-agent

- [ ] The Example exposes a clear `Rifletti` entry into Reflection without treating it as a Conversation with a second Character.
- [ ] Reflection receives only the Player Character's committed Character Knowledge, remembered Testimony and other explicitly authorised current context.
- [ ] Hidden World truth, undiscovered Character Knowledge and future puzzle solutions are absent from the provider payload.
- [ ] Reflection does not apply Disclosure, Cover Story or new Testimony.
- [ ] A Reflection response may state a Hypothesis only as uncertain and never adds it to Character Knowledge or Game State.
- [ ] Suggestions about what to investigate remain non-canonical possibilities rather than automatic deductions or quest progression.
- [ ] Reflection uses provider memory distinct from every Character Conversation.
- [ ] Load resets Reflection memory together with Conversation memory, without changing the loaded canonical knowledge.
- [ ] Empty or insufficient knowledge produces an honest limited response instead of an invented answer.
- [ ] FakeDialogueProvider and browser tests demonstrate summaries, Testimony attribution, uncertainty, thread separation and reset.
- [ ] Standard build and browser verification pass.

## Comments
