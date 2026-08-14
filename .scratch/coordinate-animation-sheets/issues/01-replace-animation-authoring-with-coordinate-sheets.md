# 01 — Replace Animation authoring with coordinate sheets

**What to build:** Replace every Engine and first-party Animation frame source
with the approved coordinate-based sheet contract in one atomic alpha migration.
An Author can define a static or animated Character, Object, or Scenery element
through one Runtime Asset image and ordered frame rectangles, while timing is
authored separately and the browser presents those frames end to end.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] `AnimationFrame`, `AnimationSheet`, `AnimationTiming`, and `CharacterAnimationSheets` are public authoring types with the approved responsibilities.
- [ ] Object and Scenery Animations require `sheet` plus `timing`; Character Animations require directional `sheets` plus `timing`.
- [ ] `uniformGrid` is publicly available with frame size, columns, count, optional origin, and optional row/column gaps, returning row-major frames without import-time authoring failures.
- [ ] Frame count, duration, looping, forced walking playback, and Animation Cue scheduling derive from sheet frames and nested timing without changing their established behavior.
- [ ] Browser asset loading extracts textures from the authored rectangles rather than inferring horizontal slices.
- [ ] A representative coordinate sheet starts and visibly animates through the normal Engine entry point.
- [ ] Every first-party Character, Object, Scenery, fixture, and compilable recipe uses the new contract.
- [ ] `AnimationStrip`, separate-image Animation lists, bare-image Animation sources, former Character frame containers, and flat timing properties are removed without compatibility aliases.
- [ ] Existing Facing selection, Animation Roles, Motion, Sequence direction, Save behavior, and renderer-facing frame lookup remain behaviorally unchanged.
- [ ] The package build and existing browser verification remain green after the atomic migration.
