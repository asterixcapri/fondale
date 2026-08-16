# 01 — Lock the project scale and reference Michele

**What to build:** Establish the final `1280×720` visual system and make Michele
the trustworthy reference Character against which every later Scene, Scenery
element and Object will be sized. The running Example must already let a Player
walk, turn, idle and speak with production-ready directional artwork before any
new Scene composition depends on it.

**Blocked by:** None — can start immediately.

**Status:** resolved

- [ ] The Game Project uses a `1280×720` Logical Resolution and one Scene Space unit per Runtime Asset pixel.
- [ ] A scale sheet records Michele's native cell, Ground Point, Visual Anchor and displayed height at every planned near, middle and far Perspective Scale.
- [ ] The current approved V3 Runtime sprites are reused as-is; Michele's sprites are not regenerated or creatively derived again.
- [ ] Michele has distinct authored `left`, `right`, `front` and `back` Runtime presentations for idle, speaking and walking.
- [ ] Every Appearance has a looping Default Animation, an intentional Speaking Role and a Walking Role.
- [ ] All four Walking presentations contain mechanically valid registered phases, clean loops and stable Ground Points.
- [ ] Michele's movement speed and animation cadence produce plausible foot planting during uninterrupted Engine travel.
- [ ] No reachable Perspective Scale enlarges Michele's Runtime artwork.
- [ ] Actual-size Engine inspection shows no chroma fringe, scale pop, anchor jump or direction-dependent identity drift.
- [ ] The V3 portrayal remains recognisable in costume, silhouette, palette and equipment across all presentations.
- [ ] Every non-Michele Character remains outside the directional-artwork scope and uses exactly one static Runtime image.
- [ ] The Example builds and a browser check demonstrates Michele walking and turning in all four Facings.

## Comments

- 2026-08-16 — The user reviewed a side-by-side animated prototype and selected
  the left-hand version currently shown by the Game Project: the existing
  `256×256`, 16-frame V3 sheets previously wired as the Godmode preview. Their
  existing pixel content is the approved production portrayal and must not be
  regenerated. Production integration may give the approved assets final
  production names, but must preserve their visual content and playback.
- 2026-08-16 — Integrated as commit `6cd6d61` on `main`. The root build passed,
  the full browser suite passed `311/311`, and the selected twelve idle,
  walking and speaking sheets remain byte-identical to the approved sources.
  Existing pick-up and mechanism-use sheets remain dormant for later Sequence
  integration; no Michele sprite was generated or creatively derived.
