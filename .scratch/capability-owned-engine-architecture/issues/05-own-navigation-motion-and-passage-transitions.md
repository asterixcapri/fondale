# 05 — Own navigation, Motion and Passage transitions

**What to build:** Make World own how Characters navigate, approach targets, follow Motion directions and cross Passages, preserving deterministic movement and Scene transitions from authoring through browser presentation.

**Blocked by:** 04 — Own Scene Space and world presence.

**Status:** ready-for-human

- [x] World owns walkable-area pathfinding, nearest reachable points, Approach Point selection and facing derived from movement.
- [x] Interaction can request an approach but cannot calculate or mutate the route itself.
- [x] World owns the per-tick progress and completion of Player navigation and directed Motion.
- [x] Character, Object and Scenery Motion use the shared Direction Step schedule while respecting their distinct path rules.
- [x] Passage availability, destination entrance, Scene transition and Arrival Sequence requests are resolved through World interfaces.
- [x] Motion produces explicit state changes for Game Session to commit rather than mutating shared state through an exposed reference.
- [x] Existing Player walking, target approach, passage navigation and arrival behaviour remain unchanged in browser fixtures and Capri 1535.
- [x] Invalid paths, destinations, entrances, ground points and cross-Scene directions produce World-owned diagnostics.
- [x] Tests cover deterministic paths, blocked or unavailable targets, all facings, Scene transitions, arrival and save/restore while moving.
- [x] Standard build and complete browser verification pass.
