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

**Status:** ready-for-agent

- [ ] A Character's dialogue declares `cases`; the handoff type is gone from the
      authored contract and from the public exports.
- [ ] Whether the Conversation closes or resumes afterwards is still declared
      per case.
- [ ] Conversation alternatives are unchanged in name, shape and behaviour.
- [ ] Existing handoff diagnostics keep their coverage under codes that name the
      case.
- [ ] The Dialogue authoring guide, the Dialogue Provider guide, the contract
      index, the diagnostics reference and the public vocabulary are updated.
- [ ] The Example's Characters are migrated and play green.
- [ ] `npm run build` and `npm run verify` pass.
