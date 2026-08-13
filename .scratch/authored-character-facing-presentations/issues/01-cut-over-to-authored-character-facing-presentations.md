# 01 — Cut over to authored Character Facing presentations

**What to build:** Replace the Engine's mirrored lateral Character presentation
with one authored presentation for each Facing, completing the breaking change
across the public interface and every first-party Game Project while keeping the
repository green.

**Blocked by:** None — can start immediately.

**Status:** ready-for-human

- [x] Every Character Animation requires synchronized `left`, `right`, `front`, and `back` strips through the public TypeScript interface.
- [x] Character Appearance and Animation authoring is distinct from the non-directional contracts available to Objects and Scenery.
- [x] The renderer selects the presentation matching the current Facing and never mirrors Character artwork or falls back to another Facing.
- [x] Perspective Scale is applied with a positive horizontal scale for every Facing.
- [x] Startup validation reports incomplete Character Facing presentations, unequal directional frame counts, incompatible Runtime cell dimensions, and invalid Visual Anchors.
- [x] Timing, looping, duration, and Animation Cues remain shared across the four synchronized presentations.
- [x] Changing Facing selects the corresponding presentation immediately without synthesizing a turning Animation.
- [x] The legacy `side` field and its mirroring behavior are removed without a compatibility path.
- [x] All first-party Game Projects, browser fixtures, tests, and public recipes use the four-Facing contract.
- [x] Objects and Scenery with non-directional Animations continue to build and run unchanged in behavior.
- [x] The package build, type checking, architecture checks, and existing browser verification pass after the cutover.

## Answer

Fondale now exposes Character-specific Appearance and Animation contracts with
four synchronized authored Facing strips. Startup validation, asset slicing,
Runtime cell checks, renderer selection, first-party projects, fixtures,
recipes, public documentation, and the vendored Example package all use the
new contract; Character mirroring and the legacy `side` field are removed.
