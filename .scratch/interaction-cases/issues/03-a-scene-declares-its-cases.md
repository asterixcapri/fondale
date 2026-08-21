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

**Status:** resolved

- [x] A Scene declares `cases`; the arrival-rule type and field are gone from
      the authored contract and from the public exports.
- [x] A case may answer with a Line, a Command Response or a Sequence, and may
      carry Game Operations alongside, under the shared arity and non-empty
      rules.
- [x] The first eligible case applies; the ambiguity error and its diagnostic
      are gone.
- [x] A case naming a Scene Entrance that does not exist is still refused, under
      a code that names the Scene Opening.
- [x] World owns the selection and exposes it; the Session makes one call rather
      than reproducing it.
- [x] The Scene authoring guide, the contract index, the diagnostics reference,
      the public vocabulary and the recipes describe the list.
- [x] The Example's rule on the coastal fortification is migrated and plays
      green.
- [x] `npm run build` and `npm run verify` pass.

## Comments

**Resolved.** `SceneDefinition.arrivalSequences` and `ArrivalSequenceRule` are
gone; a Scene declares `cases` of `SceneOpeningCase`, which extends the shared
`InteractionCase` from ticket 01 and adds only its selector, the optional
`entrance`. A case answers with a Line, a Command Response or a Sequence, with
Game Operations alongside, under the shared arity and non-empty validators; its
Command Response is checked for emptiness as a Noun's is. The ambiguity check
and `definition.arrival-sequence.ambiguous` are deleted — the first eligible
case wins — and the unknown-Entrance reference is now
`reference.scene-opening.entrance`.

**The seam ticket 04 needs.** World owns the selection:
`world.sceneOpening(state, matches, entrance?)` returns the applicable
`SceneOpeningCase` for the state's current Scene, and `transitionPassage` now
reports that same value as `opening` instead of a bare `arrivalSequence`
string. Omitting the Entrance is what the start of a Playthrough will do, and a
case naming an Entrance then does not apply. The Session answers it in one
place, `applySceneOpening`, which applies the operations, then starts and
advances a Sequence, notifies a Response or begins a Line — so ticket 04 makes
one World call and one Session call and reproduces nothing.

**Deliberately not done here.** The ordering rule
(`validateConditionalFallbackOrder`) is not applied to a Scene's `cases`. That
validator demands exactly one unconditional entry in final position, while a
Scene need not react to its own opening at all — the recipes' storeroom, and the
Example's fortification, both declare a single conditional case. Applying it
unchanged would refuse them. This ticket's acceptance list does not ask for it;
whoever generalises the rule (spec: *the ordering rule generalises*) has to
decide whether "no unconditional case before a conditional one" is a weaker
rule than "exactly one, last" before it can reach containers whose reaction is
optional. Also left alone: an empty `line.text` on a Scene case is not
diagnosed, as it is on a Noun case, because the inline check lives in
`validateNounDefinition` and extracting it would collide with ticket 02.

**Verification.** `npm run build` green; `npm run verify` green (361 tests,
including new coverage for a Line outcome with operations, a Command Response
outcome, first-eligible-case selection, and the unknown-Entrance diagnostic).
The Example was migrated (`cases` on the coastal fortification) and its own
suite runs green (24 tests) against a refreshed `vendor/fondale-0.4.0.tgz` —
that tarball and `examples/capri-1535/package-lock.json` are part of this
commit, since the Example cannot compile against the published 0.4.0 contract
any more.
