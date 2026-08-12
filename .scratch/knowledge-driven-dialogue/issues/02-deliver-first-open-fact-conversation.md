# 02 — Deliver the first open-fact Conversation

**What to build:** Let the Player use `Talk To`, enter a free-form question and
receive a Character response derived from one known `open` Narrative Fact. The
complete path uses a deterministic FakeDialogueProvider, reuses Line
presentation and teaches the communicated fact to the Player Character without
giving generated text authority over Game State.

**Blocked by:** 01 — Establish the Character Knowledge lifecycle.

**Status:** ready-for-agent

- [ ] Fondale exposes a provider-agnostic Dialogue Provider interface with separate interpretation, verbalisation and reset responsibilities.
- [ ] A Game Project that configures Knowledge-Driven Dialogue receives its Dialogue Provider as a startup dependency; Fondale does not create a model client.
- [ ] `Talk To` opens a Conversation only for a Character with a `dialogue` profile, while unconfigured Characters preserve their authored Command or Sequence resolution.
- [ ] The Conversation presents a length-bounded free-text input and treats its contents as untrusted Player speech rather than an Engine or provider instruction.
- [ ] The FakeDialogueProvider can map multiple deterministic Player formulations to a declared Narrative Fact ID and verbalise an authorised semantic payload.
- [ ] Fondale rejects unknown IDs from interpretation and passes only a relevant, known, `open` Narrative Fact to verbalisation.
- [ ] A successful Dialogue Turn presents the accepted Player input as a Player Character Line and the response as an interlocutor Line through the existing presentation rules.
- [ ] The communicated Narrative Fact enters the Player Character's Character Knowledge through an Engine-decided Game Operation in the same successful turn.
- [ ] Fondale never parses the generated Line to infer Narrative Facts, Game Operations or progression.
- [ ] The browser fixture demonstrates the complete happy path with no network, database or model dependency.
- [ ] Public, Game Session and browser tests cover the tracer without changing existing authored dialogue behavior.
- [ ] Standard build and browser verification pass.

## Comments
