# 03 — Enforce Disclosure, Trust and qualitative behavior

**What to build:** Make the Engine decide whether and how a Character responds
by evaluating Character-specific Disclosure, directional Trust and qualitative
dialogue configuration before verbalisation. The Player should observe stable
answering, withholding and clarification without probabilistic leaks or numeric
personality simulation.

**Blocked by:** 02 — Deliver the first open-fact Conversation.

**Status:** ready-for-agent

- [ ] Character Knowledge supports `open`, `guarded` and `secret` Disclosure with capability-owned authoring validation.
- [ ] Every `guarded` fact has an Author-chosen condition based initially on minimum Trust or a boolean Game Variable.
- [ ] Every `secret` fact has an explicit boolean Game Variable unlock, and Trust alone can never unlock it.
- [ ] Relationship is directional, initial Trust uses only `low`, `medium` or `high`, and authored Game Operations change it atomically.
- [ ] Relationship and optional qualitative Dialogue State are validated, saved and restored exactly.
- [ ] Personality, Dialogue Behavior, Dialogue State and Voice accept only the qualitative MVP vocabulary and reject unsupported numeric trait values.
- [ ] The Behaviour Engine selects an authorised Response Strategy deterministically from committed state and authored configuration.
- [ ] Ambiguous interpretation produces `clarify` without communicating a Narrative Fact or applying canonical effects.
- [ ] A blocked fact is absent from the verbalisation payload; personality, behavior and voice cannot reintroduce or unlock it.
- [ ] The Dialogue Provider cannot infer or change Trust, Dialogue State, Relationship or Game State.
- [ ] Tests cover the full Disclosure matrix, directional Trust, qualitative portrayal, clarification and exact Save round trips.
- [ ] Standard build and browser verification pass.

## Comments
