# 01 — Establish the Character Knowledge lifecycle

**What to build:** Let an Author declare Narrative Facts and a Character's
initial dialogue profile as ordinary Game Project data, then carry Character
Knowledge through Game State, atomic learning and exact Save restore. This
establishes the canonical knowledge path before any generated Conversation is
introduced.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] The Game Project accepts a Narrative Fact registry whose keys are stable identities and whose propositions are non-empty.
- [ ] A Character may declare one optional `dialogue` profile beside its existing World definition without making World own dialogue policy.
- [ ] Character Knowledge references Narrative Facts by ID and invalid or duplicate references produce capability-owned Authoring Diagnostic values at startup.
- [ ] Initial Character Knowledge is copied into independent Game State without mutating or retaining mutable references to the Author's Game Definition.
- [ ] A Game Operation can add one known Narrative Fact to one Character atomically and idempotently.
- [ ] Invalid Character or Narrative Fact references reject the complete operation batch without partially changing Game State.
- [ ] Character Knowledge is included in Save Snapshot validation and restores exactly, while the immutable Game Project remains unchanged.
- [ ] Character definitions without a `dialogue` profile retain their current authored behavior and save shape apart from the compatible top-level schema extension.
- [ ] Public authoring types and operations are exported from the package root using the canonical language in `CONTEXT.md`.
- [ ] Capability-local, Game Session and Save tests cover authoring validation, learning, rollback and round trip.
- [ ] Standard build and browser verification pass.

## Comments
