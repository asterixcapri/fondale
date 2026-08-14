# 02 — Prove multi-row Animation Sheet playback

**What to build:** Demonstrate through the public browser entry point that one
coordinate-based sheet model correctly presents static and multi-row Animations
for Character, Object, and Scenery subjects. The proof makes frame ordering,
timing, Facing, scaling, and spatial registration visible without relying on an
external generator or private renderer state.

**Blocked by:** 01 — Replace Animation authoring with coordinate sheets.

**Status:** ready-for-agent

- [ ] A deterministic local fixture contains visually distinguishable multi-row sheets for a Character, an Object, and Scenery.
- [ ] Browser verification observes row-major playback from left to right and then top to bottom.
- [ ] A grid with an incomplete final row plays exactly its authored frame count without placeholders.
- [ ] A one-frame sheet remains visibly static while using the same contract as every other Animation.
- [ ] Authored frames per second and loop behavior produce the expected visible progression.
- [ ] Left, right, front, and back Character sheets select the corresponding authored presentation without mirroring or fallback.
- [ ] Changing Facing preserves Animation phase because all directional sheets share one timing and frame count.
- [ ] Character, Object, and Scenery remain registered to their Visual Anchors while frames, Animations, and Facing change.
- [ ] Perspective Scale continues to affect the selected frame without changing sheet-coordinate semantics.
- [ ] The proof uses local Runtime Assets and passes browser verification without AutoSprite, network access, or expiring URLs.
