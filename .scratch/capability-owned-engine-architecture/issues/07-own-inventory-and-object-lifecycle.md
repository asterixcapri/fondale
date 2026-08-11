# 07 — Own Inventory and Object lifecycle

**What to build:** Give Interaction coherent ownership of collecting, selecting, using, consuming and placing Objects so Inventory behaviour crosses authoring, Game State, HUD and Save through explicit capability results.

**Blocked by:** 06 — Own Command resolution and Player Intent.

**Status:** ready-for-human

- [x] Interaction owns Inventory state transitions and the collect, select, deselect, consume, place-selected and place-object consequences.
- [x] World remains the authority for whether a placed Object location is valid in a Scene.
- [x] Animation remains the authority for whether an Object Appearance exists and can be selected.
- [x] Game Session applies Inventory and Object changes atomically and clears invalid command selections in the same commit.
- [x] HUD receives an immutable Inventory presentation model rather than querying the aggregate Game Project and Game State independently.
- [x] Save round trips preserve Inventory order, Object location, selected first Noun and Appearance without partial restoration.
- [x] Existing Inventory paging, contextual commands and Object artwork remain unchanged in browser fixtures and Capri 1535.
- [x] Invalid Object references, placements, appearances and commands produce attributed structured diagnostics or deterministic runtime failure.
- [x] Tests cover collection, use on a target, cancellation, consumption, placement, pagination, restore and unavailable Objects.
- [x] Standard package, CoreSession and browser verification pass.
