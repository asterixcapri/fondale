# 01 — Make Game Definitions independently validatable

**What to build:** Make every Engine Capability able to validate its own
authored Game Definition through a pure internal interface, so the complete
project can later be checked without calling public builders. This is a
behavior-preserving prefactor: the current public authoring path remains in
place for this ticket, delegates to the capability validators, and owns no
validation rule that the future startup compilation would miss.

**Blocked by:** None — can start immediately.

**Status:** ready-for-human

- [x] World validates the complete local contracts of Character, Object and Scene definitions, including geometry, placement facts and Appearance selection, without requiring a composed Game Project.
- [x] Interaction validates the complete local contracts of Noun Definition and Command Lexicon values without requiring a composed Game Project.
- [x] Sequence validates the complete local contract of a Sequence, including finiteness, Choice limits, Skip Outcome and Direction Step rules, without requiring a composed Game Project.
- [x] HUD validates the complete local HUD Theme contract without requiring a composed Game Project.
- [x] Animation-owned Appearance, Animation, role, frame, cue and Visual Anchor invariants remain owned and reported by Animation even when another capability coordinates their validation.
- [x] Every validator accepts enough path context to produce a diagnostic that can later be rooted in the complete Game Project.
- [x] Validators return Authoring Diagnostic collections as their ordinary invalid result instead of throwing.
- [x] Existing diagnostic codes, families, owners and messages remain stable unless an existing test demonstrates an ownership correction required by ADR-0011.
- [x] The current public builders delegate to the internal validators and no validation rule remains implemented only in a builder.
- [x] Duplicate validation paths are removed so each local invariant has one implementation owner.
- [x] Capability-local tests cover every invariant previously tested only through a builder; precise cases such as a Cue dependency on a non-Animation direction are exercised directly at the owning capability interface.
- [x] Existing package, CoreSession and browser behavior remains unchanged.
- [x] Standard build and browser verification pass.

## Comments

- Implemented capability-owned pure validators with caller-provided diagnostic paths; public builders and Game Project composition delegate to them.
- Verified with `npm run build` and the complete 194-test `npm run verify` suite.
