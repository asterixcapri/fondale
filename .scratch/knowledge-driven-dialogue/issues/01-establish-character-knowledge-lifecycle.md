# 01 — Establish the Character Knowledge lifecycle

**What to build:** Let an Author declare Narrative Facts and a Character's
initial dialogue profile as ordinary Game Project data, then carry Character
Knowledge through Game State, atomic learning and exact Save restore. This
establishes the canonical knowledge path before any generated Conversation is
introduced.

**Blocked by:** None — can start immediately.

**Status:** ready-for-human

- [x] The Game Project accepts a Narrative Fact registry whose keys are stable identities and whose propositions are non-empty.
- [x] A Character may declare one optional `dialogue` profile beside its existing World definition without making World own dialogue policy.
- [x] Character Knowledge references Narrative Facts by ID and invalid or duplicate references produce capability-owned Authoring Diagnostic values at startup.
- [x] Initial Character Knowledge is copied into independent Game State without mutating or retaining mutable references to the Author's Game Definition.
- [x] A Game Operation can add one known Narrative Fact to one Character atomically and idempotently.
- [x] Invalid Character or Narrative Fact references reject the complete operation batch without partially changing Game State.
- [x] Character Knowledge is included in Save Snapshot validation and restores exactly, while the immutable Game Project remains unchanged.
- [x] Character definitions without a `dialogue` profile retain their current authored behavior and save shape apart from the compatible top-level schema extension.
- [x] Public authoring types and operations are exported from the package root using the canonical language in `CONTEXT.md`.
- [x] Capability-local, Game Session and Save tests cover authoring validation, learning, rollback and round trip.
- [x] Standard build and browser verification pass.

## Comments

- Implemented with TDD across the Knowledge-Driven Dialogue, Game Session and
  Save seams. Final verification: `npm run build` and 186 Playwright tests.
- Two-axis code review completed with no remaining Standards or Spec findings.
