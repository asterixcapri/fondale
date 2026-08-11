# 02 — Own Animation semantics

**What to build:** Give Animation one end-to-end owner for authored appearances, validation, timing, Cue information and the visual facts consumed by the browser, while preserving the animations visible to the Player.

**Blocked by:** 01 — Own Direction Step end to end.

**Status:** ready-for-agent

- [ ] Animation owns Appearance, Animation, frame, strip, role, anchor and Cue contracts behind its declared module interface.
- [ ] Character, Object and Scenery definitions refer to Animation-owned contracts without duplicating their shape or validation.
- [ ] Animation validates frame sources, rates, loops, Cue positions, roles, appearances and anchors and returns structured diagnostics to Game Project.
- [ ] Animation owns finite-duration and Cue-time calculations used by Direction Step.
- [ ] Animation derives the active appearance, animation, frame progression and relevant anchor facts from immutable session input.
- [ ] The browser maps derived Animation facts to PixiJS sprites and textures without selecting animations or recalculating their semantic timing.
- [ ] Existing idle, walking, Line and Direction Step animations remain visually and temporally equivalent in browser fixtures and Capri 1535.
- [ ] Public builder contracts remain available from the single package entry point.
- [ ] Capability tests cover finite and looping animations, strip and image frames, role fallback, Cue timing and invalid authoring.
- [ ] Package, CoreSession and browser verification pass without introducing a public test-only interface.
