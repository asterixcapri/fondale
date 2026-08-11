# 09 — Own Save validation and exact restore

**What to build:** Make Save the complete owner of producing, validating and restoring Save Snapshots so a supported save resumes exactly and an incompatible save is rejected clearly before session state changes.

**Blocked by:** 02 — Own Animation semantics; 05 — Own navigation, Motion and Passage transitions; 07 — Own Inventory and Object lifecycle; 08 — Own the remaining Sequence flow.

**Status:** ready-for-agent

- [ ] Save owns Save Snapshot, validated snapshot and validation-result contracts behind its module interface.
- [ ] Save receives narrow validation views from Game Project, World, Interaction, Animation and Sequence instead of importing private capability data.
- [ ] Snapshot creation defensively captures every canonical Game State field needed for exact restoration.
- [ ] Validation covers Project Identity, Project Version, Scene, variables, Character and Object state, Inventory, command selection and active Game Activity.
- [ ] A failed validation or restore cannot partially mutate an existing or replacement CoreSession.
- [ ] A valid snapshot restores tick-relevant Sequence and Motion progress so uninterrupted and restored sessions converge.
- [ ] Browser Save Slots use Save-owned compatibility results while localStorage remains a browser concern.
- [ ] Incompatible 0.3 snapshots receive explicit structured diagnostics; no one-off migrator or compatibility shim is introduced.
- [ ] Tests cover round trip, defensive copying, malformed data, wrong identity, wrong version and restoration during each supported activity.
- [ ] Public Save API, browser Save/Load behaviour and standard verification pass.
