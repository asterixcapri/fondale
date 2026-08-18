# 01 — Present Detail Views

**What to build:** Give the Engine the Detail View defined in `CONTEXT.md` and
ADR-0024: a single presented image with its own Hotspots, shown in place of the
world so the Player may examine one subject closely. A Game Project declares one
with an image and a list of areas, each carrying an ordinary Noun Definition. A
Sequence opens it and closes it through Game Operations, and while it is
presented the Player examines it with the same Verbs, Command Cases and
Inventory Objects used everywhere else.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] A Game Project declares Detail Views with an image and Hotspots whose areas are polygons carrying a Noun Definition, and no Approach Point, Baseline, Perspective Scale or Walkable Region.
- [ ] Game Operations open and close a Detail View, and a Sequence may use them.
- [ ] The presented Detail View is committed Game State: it survives a Save Snapshot and is restored exactly.
- [ ] While a Detail View is presented, it replaces the world visually and no Character is presented.
- [ ] Commands against its Hotspots execute immediately, because there is no Character to approach — no existing Scene invariant is relaxed to achieve this.
- [ ] Its Command Cases keep their full existing power: responses and Lines, Game Operations, starting a Sequence, conditions, and using a selected Inventory Object on an area.
- [ ] Hotspot conditions and Noun Labels behave exactly as they do in a Scene, including hover advertisement.
- [ ] Closing a Detail View returns the Player to the world unchanged, with the Player Character where it was.
- [ ] Authoring Diagnostics validate a Detail View at start like every other definition, and name the offending path.
- [ ] The Engine documentation and the domain glossary agree with the shipped behaviour.
- [ ] A browser test opens a Detail View, exercises its Hotspots, saves, restores, and closes it.
