# 03 — Own Camera semantics

**What to build:** Give Camera one semantic model for Player following and Sequence direction so that every presentation receives the same focus and movement facts while the browser remains responsible only for viewport application.

**Blocked by:** 01 — Own Direction Step end to end.

**Status:** ready-for-human

- [x] Camera owns its authoring contracts, validation and derived runtime facts behind a declared module interface.
- [x] Player-following Camera behaviour remains derived from the current Scene, logical resolution and Player position.
- [x] Directed cut, move, hold and follow modes use Direction Step timing and Cue starts from the shared Sequence interpretation.
- [x] Camera defines deterministic precedence between Player following and an active Sequence direction.
- [x] Camera calculations are independent of PixiJS, DOM dimensions and request-animation-frame timing.
- [x] The browser applies Camera output to the viewport without interpreting CameraDirection or resolving directed subjects independently.
- [x] Scene clamping, scenes smaller than the viewport and horizontal and vertical scrolling retain their current behaviour.
- [x] Invalid points, durations, subjects and Scene relationships produce capability-owned Authoring Diagnostic values.
- [x] Capability, CoreSession integration and browser tests cover following, every directed mode, restore and Scene transitions.
- [x] Camera ADRs, public reference material, Capri 1535 and standard verification remain coherent.
