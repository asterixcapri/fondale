# 02 — Deliver the first open-fact Conversation

**What to build:** Let the Player use `Talk To`, enter a free-form question and
receive a Character response derived from one known `open` Narrative Fact. The
complete path uses a deterministic FakeDialogueProvider, reuses Line
presentation and teaches the communicated fact to the Player Character without
giving generated text authority over Game State.

**Blocked by:** 01 — Establish the Character Knowledge lifecycle.

**Status:** ready-for-human

- [x] Fondale exposes a provider-agnostic Dialogue Provider interface with separate interpretation, verbalisation and reset responsibilities.
- [x] A Game Project that configures Knowledge-Driven Dialogue receives its Dialogue Provider as a startup dependency; Fondale does not create a model client.
- [x] `Talk To` opens a Conversation only for a Character with a `dialogue` profile, while unconfigured Characters preserve their authored Command or Sequence resolution.
- [x] The Conversation presents a length-bounded free-text input and treats its contents as untrusted Player speech rather than an Engine or provider instruction.
- [x] The FakeDialogueProvider can map multiple deterministic Player formulations to a declared Narrative Fact ID and verbalise an authorised semantic payload.
- [x] Fondale rejects unknown IDs from interpretation and passes only a relevant, known, `open` Narrative Fact to verbalisation.
- [x] A successful Dialogue Turn presents the accepted Player input as a Player Character Line and the response as an interlocutor Line through the existing presentation rules.
- [x] The communicated Narrative Fact enters the Player Character's Character Knowledge through an Engine-decided Game Operation in the same successful turn.
- [x] Fondale never parses the generated Line to infer Narrative Facts, Game Operations or progression.
- [x] The browser fixture demonstrates the complete happy path with no network, database or model dependency.
- [x] Public, Game Session and browser tests cover the tracer without changing existing authored dialogue behavior.
- [x] Standard build and browser verification pass.

## Comments

- Implemented with TDD across the Dialogue Provider, Game Session and browser
  seams. The deterministic Fake maps multiple formulations to one authorised
  Narrative Fact, and the canonical learning commit occurs only on a logical
  Game Session tick.
- Final verification: `npm run build` and 192 Playwright tests.
- Two-axis code review completed with no Standards violations and no Spec
  findings after review corrections.
