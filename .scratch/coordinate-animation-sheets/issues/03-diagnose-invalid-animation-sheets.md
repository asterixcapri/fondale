# 03 — Diagnose invalid Animation Sheets

**What to build:** Give Authors complete, actionable startup feedback when an
Animation Sheet, its timing, or a directional sheet set violates the approved
contract. Structural problems and decoded-image bounds fail through the normal
Engine startup seam and identify the owning subject, Appearance, Animation,
Facing when applicable, and frame.

**Blocked by:** 01 — Replace Animation authoring with coordinate sheets.

**Status:** ready-for-agent

- [ ] Startup rejects an Animation Sheet with no frames.
- [ ] Startup rejects non-integer or negative frame coordinates and non-positive or non-integer frame dimensions.
- [ ] Startup rejects frame rectangles that extend beyond the decoded Runtime Asset image.
- [ ] Startup accepts duplicate and overlapping rectangles when every rectangle is otherwise valid.
- [ ] Startup rejects cell dimensions that differ anywhere within one Character, Object, or Scenery Appearance.
- [ ] Startup rejects a Character Animation missing any left, right, front, or back sheet.
- [ ] Startup rejects directional Character sheets with unequal frame counts.
- [ ] Startup rejects non-positive or non-finite frames per second and invalid loop values inside Animation Timing.
- [ ] Startup rejects unnamed, negative, non-finite, or out-of-duration Animation Cues inside Animation Timing.
- [ ] Diagnostics use stable capability ownership and precise paths down to the affected sheet, Facing, and frame index.
- [ ] JavaScript or otherwise untrusted authoring receives the same semantic protection that TypeScript provides at compile time.
- [ ] Capability-level support tests cover deterministic grid geometry, origins, gaps, incomplete rows, frame count, duration, looping, and Cue ticks without asserting private renderer implementation.
