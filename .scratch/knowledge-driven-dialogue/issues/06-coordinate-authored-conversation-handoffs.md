# 06 — Coordinate authored Conversation handoffs

**What to build:** Allow authored progress to move deliberately between a
free-form Conversation and a finite Sequence. The Author controls whether the
Conversation closes or resumes afterward; generated speech never initiates
story choreography or replaces exact authored Lines and Choices.

**Blocked by:** 05 — Make Dialogue Turns atomic and cancellable.

**Status:** ready-for-human

- [x] An authored condition can hand control from an active Conversation to a named eligible Sequence.
- [x] The handoff is based only on committed Game State and authored configuration, never on generated wording.
- [x] Any pending Dialogue Turn is cancelled before the Sequence becomes the dominant Game Activity.
- [x] The Author explicitly selects whether the Conversation closes or resumes after the Sequence completes.
- [x] A resumed Conversation retains only provider memory that has not been reset by Save or Load and never persists that memory in Game State.
- [x] Sequence continues to own authored Line, Choice, timing, skip and choreography semantics without a second generated interpretation path.
- [x] Game Operations produced by the final accepted turn are committed before the authored handoff condition is evaluated.
- [x] Leaving or closing a Conversation returns cleanly to ordinary Player control when no Sequence takes over.
- [x] Existing authored conversations and Character fallbacks remain behaviorally unchanged.
- [x] Deterministic Game Session and browser tests cover close, resume, cancellation and authored fallback paths.
- [x] Standard build and browser verification pass.

## Comments

- Implemented with TDD across Dialogue authoring, Game Session, Save and
  browser seams. Authored `close` and `resume` handoffs evaluate committed Game
  State, while Sequence retains exact presentation and skip semantics.
- Final verification: `npm run build` and 229 Playwright tests.
- Two-axis code review completed; all Standards and Spec findings were
  corrected and rechecked with no remaining findings.
