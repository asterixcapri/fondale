# 04 — Model Cover Stories and remembered Testimony

**What to build:** Let an Author give a Character a controlled false account of
a concealed Narrative Fact. When the Character uses that Cover Story, the
Player Character remembers the Claim as Testimony without learning it as truth
or allowing the provider to invent a different factual lie.

**Blocked by:** 03 — Enforce Disclosure, Trust and qualitative behavior.

**Status:** ready-for-human

- [x] The Game Project accepts a Claim registry with stable identities and non-empty propositions.
- [x] A Character may associate a concealed known Narrative Fact with one declared Claim as a Cover Story.
- [x] Startup diagnostics reject missing references, a Cover Story for a fact the Character does not know and other incoherent associations.
- [x] When policy selects a Cover Story, verbalisation receives the authorised Claim and not the concealed Narrative Fact.
- [x] The provider cannot select or invent an undeclared Claim as a factual lie.
- [x] A successful lie records Testimony identified by speaker, listener and Claim ID in committed Game State.
- [x] Testimony never adds the Claim to Character Knowledge and never makes it a Narrative Fact.
- [x] Repeating the same Claim to the same listener is canonically idempotent rather than an ordered transcript entry.
- [x] Testimony participates in Save Snapshot validation and exact restore without storing the generated wording.
- [x] Provider failure or cancellation discards staged Testimony together with the rest of the Dialogue Turn.
- [x] Tests demonstrate a Cover Story, remembered Testimony, contradiction-safe truth and rejection of improvised lies.
- [x] Standard build and browser verification pass.

## Comments

- Implemented with TDD across Dialogue authoring and policy, Game Session,
  Save and public API seams. Testimony is a canonically ordered set of
  speaker/listener/Claim associations and generated wording remains outside
  Game State.
- Final verification: `npm run build` and 207 Playwright tests.
- Two-axis code review completed; all Standards and Spec findings were
  corrected and rechecked with no remaining findings.
