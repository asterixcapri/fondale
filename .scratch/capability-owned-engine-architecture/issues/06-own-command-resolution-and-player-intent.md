# 06 — Own Command resolution and Player Intent

**What to build:** Make Interaction the single owner of translating Nouns and Commands into a Player Intent, optional World approach and response, while keeping the classic command interface unchanged for Authors and Players.

**Blocked by:** 05 — Own navigation, Motion and Passage transitions.

**Status:** ready-for-human

- [x] Interaction owns Noun, Command, Verb, lexicon, condition, response and Player Intent contracts behind its module interface.
- [x] Interaction owns preferred, secondary, selected-object and fallback command resolution.
- [x] Interaction evaluates whether an intent can resolve immediately or must request an approach from World.
- [x] Interaction resumes the same intent after World reports approach completion and rejects targets that became unavailable.
- [x] Conditions are evaluated against a narrow immutable state view shared consistently by commands, hotspots, passages and sequences.
- [x] Command responses and state-changing consequences are returned explicitly for Game Session to commit and emit.
- [x] CoreSession no longer contains command-selection or interaction-resolution policy.
- [x] Existing pointer buttons, contextual actions, command phrases and responses remain unchanged in browser fixtures and Capri 1535.
- [x] Invalid lexicons, Nouns, cases, references and responses produce Interaction-owned structured diagnostics.
- [x] Public API, CoreSession and browser tests cover primary, secondary, fallback, approach, cancellation and failed-operation behaviour.
