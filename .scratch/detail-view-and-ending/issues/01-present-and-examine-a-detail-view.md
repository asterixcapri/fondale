# 01 — Present and examine a Detail View

**What to build:** The tracer bullet for the whole feature. A Game Project
declares a Detail View — one image and a list of Hotspot areas, each carrying an
ordinary Noun Definition — and a Sequence presents it through a Game Operation.
While it is presented it replaces the world: no Character is drawn, the Player
hovers its areas and reads their advertised phrases, and looking at one answers
at once because there is nothing to approach. A second Game Operation dismisses
it and returns the Player to the world exactly as it was.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] A Game Project declares Detail Views, each with an image and Hotspots whose areas are polygons carrying a Noun Definition.
- [ ] A Detail View accepts no Approach Point, Baseline, Perspective Scale or Walkable Region, and needs none.
- [ ] One Game Operation presents a Detail View and another dismisses the presented one; a Sequence may use both.
- [ ] Presenting a Detail View replaces the world visually and presents no Character.
- [ ] Hovering an area advertises its Noun Label and phrase exactly as a Scene Hotspot does.
- [ ] A Command against an area resolves immediately, with no movement stage.
- [ ] The walking resolution path never asks whether a Detail View is presented; the immediate path is its own route through the interaction capability.
- [ ] Presenting another Detail View replaces the presented one rather than stacking.
- [ ] Dismissing returns the Player to the world with the Player Character in the same Scene, Ground Point and Facing.
- [ ] A Sequence keeps running while a Detail View is presented.
- [ ] The Inventory remains reachable while a Detail View is presented.
- [ ] Authoring Diagnostics reject a malformed Detail View at start and name the offending path.
- [ ] Core Session tests cover presenting, examining, replacing and dismissing.
- [ ] A browser test proves the world is replaced, no Character is drawn, and hovering advertises inside a Detail View.
- [ ] The domain glossary and the Engine documentation agree with the shipped behaviour.
