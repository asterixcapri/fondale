# 01 — Share alternative eligibility across capabilities

**What to build:** Nothing changes for the Author or the Player. This
prefactor makes the rules that decide which authored alternatives may be
presented — eligibility against committed Game State, hiding rather than
disabling the ineligible ones, and the limit of six eligible at once —
available to more than one Engine Capability, so the Conversation can apply
exactly the same rules a Choice already applies instead of growing a second,
drifting copy of them.

Make the change easy first: no Conversation work belongs in this ticket.

**Blocked by:** None — can start immediately.

**Status:** ready-for-human

- [x] Alternative eligibility evaluation and the at-most-six rule are reachable from outside the sequence capability without duplicating them.
- [x] The sequence capability keeps its current behaviour for Choice: same eligibility, same hiding of ineligible alternatives, same authoring diagnostics with the same codes and paths.
- [x] The extracted rules evaluate committed Game State only, and never generated wording.
- [x] No public API surface changes, and no Game State or Save Snapshot shape changes.
- [x] The architecture verification continues to pass, and the extracted location respects the capability boundaries it documents.
- [x] Existing sequence and Choice tests pass unchanged, without being rewritten to match a new internal shape.
- [x] Standard build and browser verification pass.

## Comments

Implemented. The eligibility rules now live in
`src/capabilities/interaction/alternative-eligibility.ts` and are exported from
the Interaction capability interface: `eligibleAlternativeIndexes`,
`exceedsEligibleAlternativeLimit`, `maximumEligibleAlternatives` and the
`ConditionalAlternative` shape, named after the glossary's own wording for
Choice — the rule is a limit on eligibility, and presentation belongs to the
HUD. Interaction owns them because it already owns
`InteractionCondition` and `conditionMatchesState`, the committed-state
evaluation these rules are written against, and because both Sequence and
Dialogue already import that interface.

`sequence` keeps the Choice behaviour it had: it calls the shared rules instead
of its own copies of `maximumEligibleAlternatives` and
`eligibleAlternativeIndexes`, and still emits `definition.choice.limit` at the
same path with the same message. No root export changed, so the public API and
the documentation gate are untouched.

Note on running the verification locally: `npm run verify` reuses whatever is
already serving port 5173. An unrelated `examples/capri-1535` dev server on that
port makes every browser fixture time out. Run with `FONDALE_TEST_PORT=5199` (or
stop that server) to get a true result — 238 passed on a free port.
