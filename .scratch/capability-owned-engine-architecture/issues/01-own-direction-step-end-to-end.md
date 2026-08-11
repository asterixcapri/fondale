# 01 — Own Direction Step end to end

**What to build:** Make Direction Step the first complete capability-owned tracer: an Author uses the canonical contract, Sequence validates and interprets it once, CoreSession applies its Motion consequences, and the browser presents the resulting Animation and Camera facts without a second interpretation.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] `DirectionStep` is the only public type name for the concept; `DirectStep` is removed from source, declarations, documentation, recipes, fixtures and Capri 1535.
- [ ] Sequence owns the Direction Step definition, cloning, local validation and temporal interpretation behind one declared module interface.
- [ ] The shared interpretation determines active directions, local direction time, Cue starts and completion without depending on PixiJS, DOM or browser time.
- [ ] A Direction Step completes when all finite directions finish or when its authored duration elapses, including mixed finite, looping, held and following directions.
- [ ] CoreSession consumes the shared interpretation to apply canonical Motion consequences without changing the shapes or invariants of Game State, CoreEffect and Save Snapshot.
- [ ] Animation and Camera presentation consume the same interpretation; duplicate browser calculations for Direction Step timing and Cue resolution are removed.
- [ ] Invalid references, invalid Cue dependencies, invalid durations and impossible finite boundaries produce structured Authoring Diagnostic values owned by Sequence.
- [ ] Package, CoreSession and browser tests cover concurrent directions, different durations, Cue timing, completion, skip and restore during a Direction Step.
- [ ] Capri 1535 and public authoring material use the new contract with unchanged Player-visible behaviour.
- [ ] Standard build, documentation and browser verification all pass.
