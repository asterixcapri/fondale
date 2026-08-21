# 06 — Branch and choice lose their fallback field

**What to build:** Inside a Sequence, branching reads like every other reaction:
a list of cases whose last entry carries no condition and is therefore the
default. The separate fallback field goes, and a choice's guaranteed alternative
becomes its final unconditional alternative — so the convention holds where the
Player chooses too.

**Blocked by:** 01 — Extract the shared case outcome and its rules.

**Status:** resolved

- [x] A branch step declares cases only; its fallback field is gone from the
      authored contract and from the public exports.
- [x] A choice step's guaranteed alternative is its final unconditional
      alternative, and at most six alternatives may still be eligible at once.
- [x] The shared ordering rule refuses an unconditional entry placed before a
      conditional one in both.
- [x] The Sequence and HUD authoring guides, the contract index, the diagnostics
      reference, the public vocabulary and the recipes are updated.
- [x] The Example's Sequences are migrated and play green.
- [x] `npm run build` and `npm run verify` pass.

## Comments

**Resolved.** A branch step declares `cases` only: `BranchStep.fallback` is gone
and each entry is a `BranchCase` — the optional `when` every Interaction Case
carries, plus the further Sequence steps ADR 0029 names as a case outcome. A
choice step declares `alternatives` only: its guaranteed alternative is now the
final unconditional entry of that list, so `ChoiceStep.fallback` is gone too.
`BranchCase` joins the public exports beside `BranchStep` and `ChoiceAlternative`.

**Which ordering validator each got, and why.** A branch takes the strict shared
`validateConditionalFallbackOrder` unchanged: it is read from the top, so a
second unconditional case would be dead, and exactly one, last, is the rule it
wants. A choice could not take it. A Choice's alternatives are normally all
unconditional — the Example's small talk offers five plain questions and a way
out — and the Player is offered every eligible one at once, so several
unconditional entries hide nothing. It takes a sibling in the same file,
`validateConditionalFallbackTail`: the unconditional entries are the last ones
and there is at least one. Both report `definition.conditional-fallback`, and
both are built on one shared `unconditionalIndexes` helper.

**The gap tickets 03 and 05 recorded is still open, and now has no owner.** The
sibling added here demands a default exists, which is exactly what a Scene's and
a Conversation's optional `cases` cannot promise. Closing that needs a third
weakening — *no unconditional entry before a conditional one, none required* —
which this ticket had no container to justify. The effort's owner should decide
whether the optional containers get it; nothing in this ticket blocks it, and
all three variants would sit together in `interaction-case.ts`.

**The six-alternative limit is unchanged but now counts the guaranteed
alternative**, since it is an ordinary member of the list and is always
eligible. A game that authored six conditional alternatives plus a `fallback`
compiled before and is refused now; the authoring guides say so.

**Migration.** The recipes' storeroom choice, and the Example's two branches and
three choices, fold their `fallback` into a final entry. Behaviour changed in
one visible way, which the tests now pin: the guaranteed alternative is offered
*alongside* the other eligible ones rather than only when none is eligible.

**Documentation.** The Sequence and HUD authoring guides, the contract index
(with a `BranchCase` row), the diagnostics reference, the public vocabulary
(`Choice` and `Branch` entries) and the recipes. `CONTEXT.md`'s Choice entry
gains the guaranteed alternative; no new canonical term was invented here.

**Verification.** `npm run build` and `npm run verify` (378 passed) at the root,
`npm run typecheck` and `npm run verify` (24 passed) inside
`examples/capri-1535`. The vendored `fondale-0.4.0.tgz` and the Example's
`package-lock.json` are refreshed, as the published surface changed; the browser
recipe test consumes that tarball and fails against a stale one.

Reviewed with `/code-review` against the base commit. Acted on: a dead value
import in `interaction/index.ts`; the two validators now share one helper and
say plainly how they differ; the branch runtime's silent fall-through when no
case matches carries the reason it is safe; the authoring guides state that
several unconditional alternatives may sit together at the end and that the
guaranteed one counts towards the six; and a **Branch** entry drafted for
`CONTEXT.md` was withdrawn as vocabulary this effort did not commission.
