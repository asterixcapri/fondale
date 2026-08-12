# 02 — Compile an isolated Game Project snapshot

**What to build:** Give Game Project one browser-independent internal
compilation path that coordinates the capability validators, reports all
reliable Authoring Diagnostic, applies supported defaults and produces an
isolated immutable project snapshot. The current public authoring path may call
this compiler until the atomic cutover, but Game Session, Save and browser
consumers must receive only narrow views derived from the compiled result.

**Blocked by:** 01 — Make Game Definitions independently validatable.

**Status:** ready-for-human

- [x] Compilation returns an explicit invalid result containing Authoring Diagnostic or a valid compiled result; it does not use an exception as its internal ordinary validation result.
- [x] Game Project coordinates capability validators without duplicating their rules or attributing their diagnostic to the browser adapter.
- [x] Local diagnostic paths are rooted in the complete registries and definitions of the Game Project.
- [x] Independent definition and reference failures are aggregated in deterministic order.
- [x] Checks whose prerequisites are missing or invalid avoid producing unreliable derivative diagnostic.
- [x] The compilation preserves every local and cross-definition invariant guaranteed by the current builders and Game Project composition.
- [x] A failed compilation exposes no partial compiled project.
- [x] A successful compilation resolves every supported project default before internal consumers receive the result.
- [x] A successful compilation creates a deep defensive copy and deeply freezes that copy.
- [x] Registry values, nested arrays, geometry, Appearance, Animation, Sequence branches, Noun Definition and HUD Theme values do not retain mutable aliases into Author-owned input.
- [x] Supported URL references retain URL semantics and values in the compiled copy.
- [x] Compilation neither modifies nor freezes the Author-owned input graph.
- [x] Mutating Author-owned input after compilation cannot alter the compiled result.
- [x] Compiling the same input twice creates independent snapshots, and the later compilation observes only changes made before that compilation.
- [x] Game Session, Save, browser startup, asset and presentation consumers continue to receive only the narrow immutable views they require.
- [x] Existing public behavior remains usable until the cutover ticket; this ticket adds no second public authoring interface.
- [x] Compilation, isolation, defaults, aggregation and narrow-view behavior have deterministic tests independent of DOM, WebGL and Runtime Asset loading.
- [x] Standard build and browser verification pass.

## Comments

- Added the browser-independent `compileGameProject` result seam and kept `defineGame` as the existing public exception boundary.
- Compilation now aggregates immutable ordered diagnostics, suppresses size-dependent World diagnostics when their size prerequisite is invalid, resolves defaults, and creates a deeply frozen defensive clone with preserved URL values.
- Added deterministic tests for invalid and valid results, complete alias isolation, supported defaults, narrow consumer views, and independent recompilation snapshots.
- Verified with `npm run build` and the complete 199-test `npm run verify` suite.
