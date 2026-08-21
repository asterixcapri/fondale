# 03 — A Scene declares its cases

**What to build:** A Scene declares its reactions the way a Noun does: a list
named `cases`, read from the top, first eligible one applies. An author who
wants a Character to say one sentence when the Player walks in writes a Line in
the case instead of declaring a whole Sequence for it, and may apply Game
Operations alongside any outcome. Two rules that could both apply are no longer
an authoring error — the first wins, as everywhere else in the Engine.

When the Scene opens is unchanged in this ticket: only arriving through a Scene
Passage opens it. The selection itself moves into the World capability and is
exposed as an operation, because it is inline inside the Passage transition
today and the next ticket needs to reach it from a second place. Note that the
"arrival predicate" World exports concerns a Character finishing a walk and is
unrelated to this.

**Blocked by:** 01 — Extract the shared case outcome and its rules.

**Status:** ready-for-agent

- [ ] A Scene declares `cases`; the arrival-rule type and field are gone from
      the authored contract and from the public exports.
- [ ] A case may answer with a Line, a Command Response or a Sequence, and may
      carry Game Operations alongside, under the shared arity and non-empty
      rules.
- [ ] The first eligible case applies; the ambiguity error and its diagnostic
      are gone.
- [ ] A case naming a Scene Entrance that does not exist is still refused, under
      a code that names the Scene Opening.
- [ ] World owns the selection and exposes it; the Session makes one call rather
      than reproducing it.
- [ ] The Scene authoring guide, the contract index, the diagnostics reference,
      the public vocabulary and the recipes describe the list.
- [ ] The Example's rule on the coastal fortification is migrated and plays
      green.
- [ ] `npm run build` and `npm run verify` pass.
