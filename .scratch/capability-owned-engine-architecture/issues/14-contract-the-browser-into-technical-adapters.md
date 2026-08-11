# 14 — Contract the browser into technical adapters

**What to build:** Make startGame a composition of technical browser adapters that renders capability facts and forwards physical events without owning a parallel interpretation of the Engine.

**Blocked by:** 11 — Own narrative and system HUD; 12 — Compose Game Project and Authoring Diagnostic; 13 — Reduce CoreSession to the Game Session coordinator.

**Status:** ready-for-agent

- [ ] Browser ownership is limited to PixiJS objects, DOM elements, physical input, request-animation-frame integration, asset loading, audio, preferences and localStorage.
- [ ] startGame creates and coordinates CoreSession, adapters and the fixed-step clock without reading private capability representations.
- [ ] Rendering consumes World, Animation, Camera and HUD presentation facts and does not resolve Sequence definitions or domain conditions.
- [ ] Input adapters translate pointer and keyboard events into declared session or HUD intentions without selecting domain consequences.
- [ ] Save Slot storage delegates compatibility and restore decisions to Save.
- [ ] Asset failures become structured Authoring Diagnostic values without moving PixiJS knowledge into Game Project or Animation.
- [ ] Renderer teardown, CoreSession replacement on load, resize behaviour and fixed-step advancement remain safe and deterministic.
- [ ] Browser adapter tests cover startup, shutdown, resize, invalid assets, input, Save/Load and every presentation capability.
- [ ] Capri 1535 retains the same visible behaviour and public startGame contract.
- [ ] Standard build, documentation and complete browser verification pass.
