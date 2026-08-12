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

**Status:** ready-for-agent

- [ ] Alternative eligibility evaluation and the at-most-six rule are reachable from outside the sequence capability without duplicating them.
- [ ] The sequence capability keeps its current behaviour for Choice: same eligibility, same hiding of ineligible alternatives, same authoring diagnostics with the same codes and paths.
- [ ] The extracted rules evaluate committed Game State only, and never generated wording.
- [ ] No public API surface changes, and no Game State or Save Snapshot shape changes.
- [ ] The architecture verification continues to pass, and the extracted location respects the capability boundaries it documents.
- [ ] Existing sequence and Choice tests pass unchanged, without being rewritten to match a new internal shape.
- [ ] Standard build and browser verification pass.
