# 01 — Replace Animation authoring with coordinate sheets

**What to build:** Replace every Engine and first-party Animation frame source
with the approved coordinate-based sheet contract in one atomic alpha migration.
An Author can define a static or animated Character, Object, or Scenery element
through one Runtime Asset image and ordered frame rectangles, while timing is
authored separately and the browser presents those frames end to end.

**Blocked by:** None — can start immediately.

**Status:** ready-for-human

- [x] `AnimationFrame`, `AnimationSheet`, `AnimationTiming`, and `CharacterAnimationSheets` are public authoring types with the approved responsibilities.
- [x] Object and Scenery Animations require `sheet` plus `timing`; Character Animations require directional `sheets` plus `timing`.
- [x] `uniformGrid` is publicly available with frame size, columns, count, optional origin, and optional row/column gaps, returning row-major frames without import-time authoring failures.
- [x] Frame count, duration, looping, forced walking playback, and Animation Cue scheduling derive from sheet frames and nested timing without changing their established behavior.
- [x] Browser asset loading extracts textures from the authored rectangles rather than inferring horizontal slices.
- [x] A representative coordinate sheet starts and visibly animates through the normal Engine entry point.
- [x] Every first-party Character, Object, Scenery, fixture, and compilable recipe uses the new contract.
- [x] `AnimationStrip`, separate-image Animation lists, bare-image Animation sources, former Character frame containers, and flat timing properties are removed without compatibility aliases.
- [x] Existing Facing selection, Animation Roles, Motion, Sequence direction, Save behavior, and renderer-facing frame lookup remain behaviorally unchanged.
- [x] The package build and existing browser verification remain green after the atomic migration.

## Answer

Replaced the former strip, separate-image, and flat-timing Animation authoring
forms with coordinate-based Runtime Asset sheets throughout the Engine, public
API, first-party project, fixtures, and compilable recipes. Browser loading now
creates frame textures from authored rectangles, while playback, Facing, Motion,
Sequence timing and Cues continue to derive from the same logical frame order.

Verified with the package build, capability tests, and the complete browser
suite, including the coordinate-driven Character Facing fixture.
