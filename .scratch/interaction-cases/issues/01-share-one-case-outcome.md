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

**Status:** resolved

- [x] The outcome shape shared by conditional reactions is defined once and
      reused, rather than restated per container.
- [x] The arity rule counts a `start-sequence` Game Operation as a Sequence
      outcome, exactly as Noun validation does today.
- [x] The ordering rule — exactly one unconditional entry, in final position —
      is expressed once and still applies to Noun Labels, Preferred, Secondary
      and Selected Object Verbs with their existing diagnostic.
- [x] No public type, field name or diagnostic code changes.
- [x] `npm run build` and `npm run verify` pass, Example and recipes included.

## Comments

Implemented as a pure refactor. `src/capabilities/interaction/interaction-case.ts`
now owns `InteractionCase` — the optional `when`, at most one of `line`,
`response` and `sequence`, and optional `operations` — together with
`validateInteractionCaseOutcome` (the arity rule, still counting a
`start-sequence` Game Operation as a Sequence outcome, and the non-empty rule)
and `validateConditionalFallbackOrder` (exactly one unconditional entry, in
final position). All three leave the Interaction capability through its
`index.ts`, so the containers that adopt the shape in later tickets inherit the
rules rather than restating them.

`CommandCase` now extends `InteractionCase` and declares only its selector, and
Noun validation calls the two shared validators. Noun Labels, Preferred,
Secondary and Selected Object Verbs keep the ordering rule with the same
`definition.conditional-fallback` diagnostic. Codes, messages, paths and the
order in which diagnostics are emitted are unchanged, and nothing was added to
`src/index.ts`, `src/testing.ts` or `docs/public`: `InteractionCase` is
`@internal` until a container publishes it.

Two supporting changes. `tools/verify-docs.mjs` now reads a public interface's
inherited fields through its `extends` clause, because extracting a shared base
would otherwise have silently retired the documentation gate on every field it
absorbed (`line` was the one field no other public contract still carried); the
new file is listed among the contract sources so its diagnostic codes stay in
the forward scan. `src/capabilities/interaction/interaction-case.spec.ts` covers
the two rules directly, in the idiom of the capability's existing spec.

Verification: `npm run build` passes (type-check, both packages, architecture,
release preparation, documentation gate) and `npm run verify` passes with 356
tests. The Example under `examples/` consumes the vendored `fondale-0.4.0`
package and is unaffected, since the published surface is identical.

Follow-up for a later ticket: the shared outcome rule still emits
`definition.command-case.textual-outcome` and a message naming a Command Case.
That is deliberate here — this ticket forbids changing codes — but the wording
will need to name the Interaction Case once Scenes and Conversations call the
same validator.
