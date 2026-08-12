# 04 — Model Cover Stories and remembered Testimony

**What to build:** Let an Author give a Character a controlled false account of
a concealed Narrative Fact. When the Character uses that Cover Story, the
Player Character remembers the Claim as Testimony without learning it as truth
or allowing the provider to invent a different factual lie.

**Blocked by:** 03 — Enforce Disclosure, Trust and qualitative behavior.

**Status:** ready-for-agent

- [ ] The Game Project accepts a Claim registry with stable identities and non-empty propositions.
- [ ] A Character may associate a concealed known Narrative Fact with one declared Claim as a Cover Story.
- [ ] Startup diagnostics reject missing references, a Cover Story for a fact the Character does not know and other incoherent associations.
- [ ] When policy selects a Cover Story, verbalisation receives the authorised Claim and not the concealed Narrative Fact.
- [ ] The provider cannot select or invent an undeclared Claim as a factual lie.
- [ ] A successful lie records Testimony identified by speaker, listener and Claim ID in committed Game State.
- [ ] Testimony never adds the Claim to Character Knowledge and never makes it a Narrative Fact.
- [ ] Repeating the same Claim to the same listener is canonically idempotent rather than an ordered transcript entry.
- [ ] Testimony participates in Save Snapshot validation and exact restore without storing the generated wording.
- [ ] Provider failure or cancellation discards staged Testimony together with the rest of the Dialogue Turn.
- [ ] Tests demonstrate a Cover Story, remembered Testimony, contradiction-safe truth and rejection of improvised lies.
- [ ] Standard build and browser verification pass.

## Comments
