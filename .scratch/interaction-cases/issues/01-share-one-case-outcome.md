# 01 — Extract the shared case outcome and its rules

**What to build:** Nothing changes for an author. The shape every conditional
reaction shares — an optional Interaction Condition, at most one outcome, and
optional Game Operations alongside — becomes one definition the Engine owns in
a single place, together with the three rules that police it: a case declares
at most one outcome, a case declares at least one, and the unconditional case of
a selector comes last. Today the first two are written by hand inside Noun
validation and the third serves only Noun Labels and Verbs, so each container
that adopts the shared shape later inherits all three for free rather than
restating them.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] The outcome shape shared by conditional reactions is defined once and
      reused, rather than restated per container.
- [ ] The arity rule counts a `start-sequence` Game Operation as a Sequence
      outcome, exactly as Noun validation does today.
- [ ] The ordering rule — exactly one unconditional entry, in final position —
      is expressed once and still applies to Noun Labels, Preferred, Secondary
      and Selected Object Verbs with their existing diagnostic.
- [ ] No public type, field name or diagnostic code changes.
- [ ] `npm run build` and `npm run verify` pass, Example and recipes included.
