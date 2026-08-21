# 05 — A Conversation's engine-chosen reactions become cases

**What to build:** The handoff stops being a concept of its own. What a
Character does when free conversation reaches a condition the author is waiting
for is declared as `cases`, read from the top, first eligible one applies —
identical to a Noun and a Scene, and keeping the declaration of whether the
Conversation closes or resumes afterwards.

The alternatives the Player chooses keep their own name and shape. The
distinction that matters is who chooses: the Engine picks a case, the Player
picks an alternative.

**Blocked by:** 01 — Extract the shared case outcome and its rules.

**Status:** resolved

- [x] A Character's dialogue declares `cases`; the handoff type is gone from the
      authored contract and from the public exports.
- [x] Whether the Conversation closes or resumes afterwards is still declared
      per case.
- [x] Conversation alternatives are unchanged in name, shape and behaviour.
- [x] Existing handoff diagnostics keep their coverage under codes that name the
      case.
- [x] The Dialogue authoring guide, the Dialogue Provider guide, the contract
      index, the diagnostics reference and the public vocabulary are updated.
- [x] The Example's Characters are migrated and play green.
- [x] `npm run build` and `npm run verify` pass.

## Comments

Implemented. `ConversationHandoffDefinition` is gone: a Character's dialogue
declares `cases`, a list of `ConversationCase`, and the Engine applies the first
eligible one — read from the top, exactly as a Noun and a Scene are read. Each
case still names a Sequence and an explicit `close` or `resume`, so nothing a
game could say before became unsayable; `when` is now optional, so a last case
carrying no condition is the Conversation's default, which the shared convention
asks for and which no game could express before.

Conversation alternatives were not touched: they keep their name, shape and
behaviour, and the distinction the spec draws stays visible — the Engine picks a
case, the Player picks an alternative.

The two existing diagnostics keep their coverage under
`definition.dialogue.cases` (the collection must be an array) and
`definition.dialogue.case` (a named Sequence and an explicit close or resume,
with an optional condition). Condition, Sequence and Scene-ownership references
are validated at `characters.<id>.dialogue.cases[n]`. Inside the Engine,
`KnowledgeDrivenDialogue.handoff` is `conversationCase`, and the Session's
`startConversationHandoff` is `startConversationCase`.

Documentation updated: the Dialogue authoring guide (a `Cases` section replacing
`Handoffs`, and its field table), the Dialogue Provider guide, the contract
index, the diagnostics reference, the public vocabulary, one sentence in the
Sequence guide, and the Conversation entry in `CONTEXT.md`. Edits on the shared
pages were confined to the Conversation's own contract, to merge cleanly with
ticket 04. The `skills/` pipeline names none of these fields, as the spec
predicted, so it needed no change.

No Character in `capri-1535` or in the recipes declared a handoff, so the
migration there was empty; the vendored artifact was repacked because the
published surface changed.

Tests: `test/knowledge-driven-dialogue.spec.ts` migrated to the new vocabulary,
plus a new test that a Conversation reads its cases from the top and applies the
final unconditional one when no earlier condition matches.

Verification: `npm run build` and `npm run verify` (369 passed) at the root, and
`npm run typecheck` and `npm run verify` (24 passed) inside `examples/capri-1535`.

Reviewed with `/code-review` against the base commit. Three findings acted on:
the rationale for `ConversationCase` restricting rather than extending
`InteractionCase` is now on the type; `hasResumableSequence` says its predicate
once for cases and alternatives; and the Dialogue guide now states that cases
are evaluated when the Player leaves the Conversation as well as after an
accepted turn — which was already true of handoffs and undocumented — and warns
that an unconditional case that `resume`s leaves the Player no way out. A test
pins the leaving path.

One finding left for the effort's owner rather than decided here. The spec says
the shared ordering validator "is extended to every `cases` list", but
`validateConditionalFallbackOrder` requires *exactly one* unconditional entry in
final position, which neither a Conversation nor a Scene can promise: both lists
are optional and may be wholly conditional, and a Conversation with no eligible
case simply closes. Ticket 03 left the same gap on `SceneOpeningCase`. Applying
the validator unchanged to either would refuse games the Engine accepts today;
closing the gap properly needs a variant that forbids an unconditional entry
before a conditional one without demanding that one exist, which belongs with
the shared validator in ticket 01's file rather than in this container.
