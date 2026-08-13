# 05 — Set a Game Variable when a Narrative Fact is learned

**What to build:** An Author declares that a Character learning a given
Narrative Fact also sets a named Game Variable. This is the bridge between
free-form dialogue and the rest of the game: an Interaction Condition reads
Game Variables and Inventory, never Character Knowledge, so today a Player who
discovers something by typing accumulates knowledge the world cannot react to.
With this, asking the right question in your own words can open a Passage,
enable a Hotspot or make a Sequence eligible — through the same mechanisms an
Author already uses.

The Engine sets the variable; generated wording never does. It is committed in
the same atomic step as the `learn-narrative-fact` Game Operation, after
Disclosure has authorised the Fact and before any verbalisation is spoken. See
the spec's implementation decisions and ADR-0013.

**Blocked by:** None — can start immediately.

**Status:** ready-for-human

- [x] An Author may declare, per Narrative Fact, a Game Variable that is set when a Character learns it.
- [x] The variable is committed atomically with the learning: either both land or neither does.
- [x] The variable is set only after Disclosure authorised the Fact for communication, so an undisclosed secret can never open anything.
- [x] A turn answered with a Cover Story records Testimony and leaves the variable untouched.
- [x] A turn that fails, is cancelled, or is abandoned by leaving the Conversation commits neither the learning nor the variable.
- [x] The resulting variable is an ordinary Game Variable: Interaction Conditions, Hotspots, Passages, Sequences and alternative eligibility react to it with no special casing.
- [x] Learning the same Fact again is idempotent and does not produce a second conflicting change.
- [x] A Fact learned through an authored path — a Game Operation on an alternative or in a Sequence — sets the variable too, so the two routes stay consistent.
- [x] Authoring diagnostics reject a declaration naming an unknown Game Variable or an unknown Narrative Fact at startup.
- [x] Save Snapshots validate and restore the resulting state exactly, with no new snapshot shape beyond existing variables and Character Knowledge.
- [x] Deterministic Game Session tests cover the disclosed, withheld, cover-story, failed and cancelled cases, and a condition elsewhere in the Game Project reacting afterwards.
- [x] `CONTEXT.md`, `docs/public/reference.md` and `docs/public/game-authoring.md` describe the declaration and its guarantees.
- [x] Standard build and browser verification pass.

## Comments

The declaration lives on the Narrative Fact itself: `NarrativeFactDefinition`
gains an optional `setsVariable` naming a declared Game Variable. Keeping it in
the registry that already defines the Fact avoids a second registry that could
drift from it, and makes the rule visible where an Author reads the Fact.

One consequence of that shape is worth recording: a declaration cannot name an
unknown Narrative Fact, because the registry key *is* the Fact. The checklist's
"unknown Narrative Fact" case is therefore satisfied by construction rather
than by a diagnostic of its own; naming an unknown Fact from anywhere else
still fails with the existing `reference.character-knowledge.fact`. The unknown
Game Variable case is a real diagnostic: `reference.narrative-fact.variable`,
with `definition.narrative-fact.sets-variable` for an empty declaration.

The Engine performs the setting in `applyDialogueOperation`, a single seam in
the Game Session that both routes reach: the free-form commit
(`commitDialogueCompletion`) and the authored commit (`applyOperation` for any
Dialogue-owned operation, whether it comes from an alternative, a Sequence, a
Hotspot or a Command). Both stage their changes in one draft Game State and
publish it in a single assignment, so the learning and the variable can only
land together — a failure anywhere in the batch rolls back both.

Disclosure ordering needs no new code: `respond` only produces a
`learn-narrative-fact` operation for the `answer` strategy, after Disclosure
authorised the Fact and before the Line is spoken. A Cover Story yields a
`record-testimony` operation instead, withholding yields no operation, and a
failed or cancelled turn never reaches a commit. Tests cover all four.

The variable is set to `true` on every applied learning rather than only on the
first, which keeps the invariant "a Character who knows the Fact has its
variable set" true after any commit, including a re-learning that follows an
authored reset. Learning is otherwise idempotent, so nothing else changes.

Initial Character Knowledge does not set these variables: an Author declares
the initial value of a Game Variable in the `variables` registry, and knowledge
copied at startup was never learned during play.
