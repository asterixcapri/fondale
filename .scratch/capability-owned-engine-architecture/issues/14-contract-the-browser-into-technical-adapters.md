# 14 — Contract the browser into technical adapters

**What to build:** Make startGame a composition of technical browser adapters that renders capability facts and forwards physical events without owning a parallel interpretation of the Engine.

**Blocked by:** 11 — Own narrative and system HUD; 12 — Compose Game Project and Authoring Diagnostic; 13 — Reduce CoreSession to the Game Session coordinator.

**Status:** ready-for-human

- [x] Browser ownership is limited to PixiJS objects, DOM elements, physical input, request-animation-frame integration, asset loading, audio, preferences and localStorage.
- [x] startGame creates and coordinates CoreSession, adapters and the fixed-step clock without reading private capability representations.
- [x] Rendering consumes World, Animation, Camera and HUD presentation facts and does not resolve Sequence definitions or domain conditions.
- [x] Input adapters translate pointer and keyboard events into declared session or HUD intentions without selecting domain consequences.
- [x] Save Slot storage delegates compatibility and restore decisions to Save.
- [x] Asset failures become structured Authoring Diagnostic values without moving PixiJS knowledge into Game Project or Animation.
- [x] Renderer teardown, CoreSession replacement on load, resize behaviour and fixed-step advancement remain safe and deterministic.
- [x] Browser adapter tests cover startup, shutdown, resize, invalid assets, input, Save/Load and every presentation capability.
- [x] Capri 1535 retains the same visible behaviour and public startGame contract.
- [x] Standard build, documentation and complete browser verification pass.
