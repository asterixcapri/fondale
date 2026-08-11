# 13 — Reduce CoreSession to the Game Session coordinator

**What to build:** Preserve CoreSession as the deterministic running game while reducing it to Game Session responsibilities: input queue, logical tick, dominant Game Activity, atomic Game Operation commit and coordination of capability results.

**Blocked by:** 02 — Own Animation semantics; 03 — Own Camera semantics; 05 — Own navigation, Motion and Passage transitions; 07 — Own Inventory and Object lifecycle; 08 — Own the remaining Sequence flow; 09 — Own Save validation and exact restore; 10 — Own contextual and Inventory HUD.

**Status:** ready-for-agent

- [ ] CoreSession retains its name and remains the deterministic seam used by startGame and non-browser integration tests.
- [ ] CoreSession owns queued inputs, explicit logical ticks, lifecycle, dominant Game Activity and the canonical Game State reference.
- [ ] Capability modules receive immutable state views and return explicit decisions, operations or derived facts.
- [ ] Game Operation application remains atomic: failure leaves the prior Game State intact and emits attributed diagnostics.
- [ ] Snapshot, effects and capability query results are defensive and cannot mutate session history.
- [ ] CoreSession delegates Sequence, World, Interaction, Animation, Camera, HUD and Save policy instead of containing duplicate implementations.
- [ ] Existing input ordering and effect ordering remain deterministic across independent sessions and save/restore.
- [ ] No generic SessionCommit, PlayFrame or mutable capability registry replaces the canonical state model.
- [ ] CoreSession tests cover lifecycle, invalid step counts, queued input, commit failure, defensive data and exact replay.
- [ ] Package, browser and Capri 1535 acceptance behaviour remain unchanged and standard verification passes.
