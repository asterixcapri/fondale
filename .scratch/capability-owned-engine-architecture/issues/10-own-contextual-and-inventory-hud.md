# 10 — Own contextual and Inventory HUD

**What to build:** Make HUD own the logical presentation of contextual actions, command preview and Inventory so the browser renders a prepared view instead of combining World, Interaction and Game State rules itself.

**Blocked by:** 06 — Own Command resolution and Player Intent; 07 — Own Inventory and Object lifecycle.

**Status:** ready-for-agent

- [ ] HUD owns HUD Theme and the presentation models for contextual action, command preview, Inventory entries, pagination and revealed Nouns.
- [ ] HUD derives its models from narrow World and Interaction views and immutable Game State.
- [ ] Preferred and secondary actions, selected first Noun and command phrase formatting are calculated once outside the DOM adapter.
- [ ] Inventory open state, paging and focus intentions have one owner and deterministic transitions.
- [ ] The browser maps HUD presentation models to accessible DOM controls and forwards user actions without reapplying domain policy.
- [ ] CoreSession no longer exposes HUD-shaped queries when the same information belongs to a capability interface.
- [ ] Existing cursor labels, command previews, Inventory drawer, paging and hotspot reveal remain visually and behaviourally equivalent.
- [ ] HUD Theme validation remains available through the package entry point and produces attributed diagnostics.
- [ ] Capability and browser tests cover keyboard, pointer, focus, pagination, selected Objects and responsive presentation.
- [ ] Capri 1535 and standard build and browser verification pass.
