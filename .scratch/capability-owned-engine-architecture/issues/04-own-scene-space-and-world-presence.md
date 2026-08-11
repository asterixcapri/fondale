# 04 — Own Scene Space and world presence

**What to build:** Make World the complete owner of Scene Space and entity presence so an authored Scene is validated, represented in Game State, queried for targets and presented consistently without leaking the aggregate Game Project representation.

**Blocked by:** 01 — Own Direction Step end to end.

**Status:** ready-for-agent

- [ ] World owns Scene, Character, Object, Scenery, Hotspot, Scene Size, Scene Space and world-position contracts behind its module interface.
- [ ] World owns geometry and spatial validation for polygons, bounds, ground points, anchors and entity membership.
- [ ] World creates the initial spatial state of Characters, Objects and Scenery from a narrow Game Project view.
- [ ] Hit testing and availability queries use World-owned services and immutable Game State rather than CoreSession private knowledge.
- [ ] Directed-subject availability is answered by World for the current Scene and reused by Sequence.
- [ ] The browser receives stable world presentation facts and retains only PixiJS construction, texture use and pointer-coordinate adaptation.
- [ ] Layering, perspective scaling, background regions and visual entity placement remain equivalent in fixtures and Capri 1535.
- [ ] Invalid Scene membership and geometry produce structured diagnostics owned by World and aggregated by Game Project.
- [ ] World tests cover overlapping hotspots, concave polygons, entity presence, conditional availability and defensive results.
- [ ] Package, CoreSession and browser verification pass through the existing public entry point.
