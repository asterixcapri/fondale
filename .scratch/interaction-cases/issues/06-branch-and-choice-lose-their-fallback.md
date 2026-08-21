# 06 — Branch and choice lose their fallback field

**What to build:** Inside a Sequence, branching reads like every other reaction:
a list of cases whose last entry carries no condition and is therefore the
default. The separate fallback field goes, and a choice's guaranteed alternative
becomes its final unconditional alternative — so the convention holds where the
Player chooses too.

**Blocked by:** 01 — Extract the shared case outcome and its rules.

**Status:** ready-for-agent

- [ ] A branch step declares cases only; its fallback field is gone from the
      authored contract and from the public exports.
- [ ] A choice step's guaranteed alternative is its final unconditional
      alternative, and at most six alternatives may still be eligible at once.
- [ ] The shared ordering rule refuses an unconditional entry placed before a
      conditional one in both.
- [ ] The Sequence and HUD authoring guides, the contract index, the diagnostics
      reference, the public vocabulary and the recipes are updated.
- [ ] The Example's Sequences are migrated and play green.
- [ ] `npm run build` and `npm run verify` pass.
