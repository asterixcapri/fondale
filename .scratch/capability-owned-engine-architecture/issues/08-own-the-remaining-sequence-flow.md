# 08 — Own the remaining Sequence flow

**What to build:** Complete Sequence ownership beyond Direction Step so Lines, Narrations, Choices, branches, operations and skipping share one validated control flow from authoring through CoreSession and Player presentation.

**Blocked by:** 01 — Own Direction Step end to end; 07 — Own Inventory and Object lifecycle.

**Status:** ready-for-agent

- [ ] Sequence owns SequenceDefinition, all Sequence Step contracts, nested paths, traversal and active Sequence state behind its module interface.
- [ ] Sequence owns Line, Narration, Choice, Branch, Operations Step, Skip Outcome and their completion rules.
- [ ] Choice and Branch conditions use Interaction-owned condition evaluation without duplicating that policy.
- [ ] Operations Step and Skip Outcome request explicit Game Operation application from Game Session and cannot mutate Game State directly.
- [ ] Line and Choice speech obtain Animation facts from Animation without owning visual selection.
- [ ] CoreSession delegates Sequence advancement, choosing, skipping and restoration while retaining the dominant Game Activity decision.
- [ ] Browser presentation receives stable narrative and choice facts instead of resolving Sequence paths and definitions itself.
- [ ] Nested paths, fallback choices, invalid references, recursive starts and missing Skip Outcome produce deterministic results and structured diagnostics.
- [ ] Tests cover every step kind, nesting, conditional paths, operations, skip, restore and completion without browser-specific timing in Sequence.
- [ ] Public docs, recipes, Capri 1535 and standard verification remain coherent.
