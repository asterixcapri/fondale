# 02 — Prove multi-row Animation Sheet playback

**What to build:** Demonstrate through the public browser entry point that one
coordinate-based sheet model correctly presents static and multi-row Animations
for Character, Object, and Scenery subjects. The proof makes frame ordering,
timing, Facing, scaling, and spatial registration visible without relying on an
external generator or private renderer state.

**Blocked by:** 01 — Replace Animation authoring with coordinate sheets.

**Status:** ready-for-human

- [x] A deterministic local fixture contains visually distinguishable multi-row sheets for a Character, an Object, and Scenery.
- [x] Browser verification observes row-major playback from left to right and then top to bottom.
- [x] A grid with an incomplete final row plays exactly its authored frame count without placeholders.
- [x] A one-frame sheet remains visibly static while using the same contract as every other Animation.
- [x] Authored frames per second and loop behavior produce the expected visible progression.
- [x] Left, right, front, and back Character sheets select the corresponding authored presentation without mirroring or fallback.
- [x] Changing Facing preserves Animation phase because all directional sheets share one timing and frame count.
- [x] Character, Object, and Scenery remain registered to their Visual Anchors while frames, Animations, and Facing change.
- [x] Perspective Scale continues to affect the selected frame without changing sheet-coordinate semantics.
- [x] The proof uses local Runtime Assets and passes browser verification without AutoSprite, network access, or expiring URLs.

## Answer

Added a deterministic `startGame` browser fixture with local coordinate sheets
for Character, Object, and Scenery subjects. Its five-cell `3 × 2` sheets make
row-major order and the incomplete final row visible, while a one-frame sheet
proves the shared static contract. Browser tests cover looping and finite
timing, every authored Character Facing, phase preservation, Visual Anchor
registration, and Perspective Scale without inspecting renderer internals.

Verified with `npm run build` and the complete `npm run verify` suite (284
tests).
