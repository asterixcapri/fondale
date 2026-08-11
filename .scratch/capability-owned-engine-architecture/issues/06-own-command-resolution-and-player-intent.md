# 06 — Own Command resolution and Player Intent

**What to build:** Make Interaction the single owner of translating Nouns and Commands into a Player Intent, optional World approach and response, while keeping the classic command interface unchanged for Authors and Players.

**Blocked by:** 05 — Own navigation, Motion and Passage transitions.

**Status:** ready-for-agent

- [ ] Interaction owns Noun, Command, Verb, lexicon, condition, response and Player Intent contracts behind its module interface.
- [ ] Interaction owns preferred, secondary, selected-object and fallback command resolution.
- [ ] Interaction evaluates whether an intent can resolve immediately or must request an approach from World.
- [ ] Interaction resumes the same intent after World reports approach completion and rejects targets that became unavailable.
- [ ] Conditions are evaluated against a narrow immutable state view shared consistently by commands, hotspots, passages and sequences.
- [ ] Command responses and state-changing consequences are returned explicitly for Game Session to commit and emit.
- [ ] CoreSession no longer contains command-selection or interaction-resolution policy.
- [ ] Existing pointer buttons, contextual actions, command phrases and responses remain unchanged in browser fixtures and Capri 1535.
- [ ] Invalid lexicons, Nouns, cases, references and responses produce Interaction-owned structured diagnostics.
- [ ] Public API, CoreSession and browser tests cover primary, secondary, fallback, approach, cancellation and failed-operation behaviour.
