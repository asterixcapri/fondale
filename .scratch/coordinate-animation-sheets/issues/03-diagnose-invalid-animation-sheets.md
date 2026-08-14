# 03 — Diagnose invalid Animation Sheets

**What to build:** Give Authors complete, actionable startup feedback when an
Animation Sheet, its timing, or a directional sheet set violates the approved
contract. Structural problems and decoded-image bounds fail through the normal
Engine startup seam and identify the owning subject, Appearance, Animation,
Facing when applicable, and frame.

**Blocked by:** 01 — Replace Animation authoring with coordinate sheets.

**Status:** ready-for-human

- [x] Startup rejects an Animation Sheet with no frames.
- [x] Startup rejects non-integer or negative frame coordinates and non-positive or non-integer frame dimensions.
- [x] Startup rejects frame rectangles that extend beyond the decoded Runtime Asset image.
- [x] Startup accepts duplicate and overlapping rectangles when every rectangle is otherwise valid.
- [x] Startup rejects cell dimensions that differ anywhere within one Character, Object, or Scenery Appearance.
- [x] Startup rejects a Character Animation missing any left, right, front, or back sheet.
- [x] Startup rejects directional Character sheets with unequal frame counts.
- [x] Startup rejects non-positive or non-finite frames per second and invalid loop values inside Animation Timing.
- [x] Startup rejects unnamed, negative, non-finite, or out-of-duration Animation Cues inside Animation Timing.
- [x] Diagnostics use stable capability ownership and precise paths down to the affected sheet, Facing, and frame index.
- [x] JavaScript or otherwise untrusted authoring receives the same semantic protection that TypeScript provides at compile time.
- [x] Capability-level support tests cover deterministic grid geometry, origins, gaps, incomplete rows, frame count, duration, looping, and Cue ticks without asserting private renderer implementation.

## Answer

Animation now validates every authored frame rectangle structurally, reports
invalid coordinates and dimensions at the exact frame field, and enforces one
Runtime cell size across every sheet in an Appearance. Duplicate and
overlapping rectangles remain valid. Existing directional-sheet, timing, and
Cue diagnostics are covered together with untrusted authoring values.

Browser startup coverage proves that empty sheets fail before mounting and that
rectangles outside a decoded Runtime Asset report the owning Character,
Appearance, Animation, Facing, and frame index. Verified with `npm run build`
and the complete `npm run verify` suite (294 tests).
