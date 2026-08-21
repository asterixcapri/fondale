# Interaction Cases and Scene Openings

Status: ready-for-agent

Records ADR 0029, `docs/adr/0029-model-every-conditional-reaction-as-an-interaction-case.md`.

## Problem Statement

An author who has learned to write the reactions of one thing in a Fondale game
cannot carry that knowledge anywhere else. A Noun declares `cases`, a
Conversation declares `handoffs`, a Scene declares `arrivalSequences`, and a
Sequence branch declares `cases` beside a separate `fallback`. They all express
the same idea — *when this holds, do that* — and they agree on nothing: not the
name of the list, not what happens when two entries could apply, not how a
default is written, not which outcomes are allowed.

The differences are not merely cosmetic. On a Noun the first eligible case wins,
so an author writes reactions from the specific to the general and ends with an
unconditional one. On a Scene two rules that could both apply are rejected as an
authoring error instead. A default is a per-Verb map on a Noun, a separate field
inside a branch and a choice, and an unconditional final entry among Noun Labels
and Verbs. An outcome may be a Line, a Command Response, Game Operations or a
Sequence on a Noun, but only a Sequence on a Scene — so making a Character say
one sentence when the Player walks in requires declaring a whole Sequence.

Beneath the disorder there is a missing capability: **a game cannot open on
anything but a static tableau.** A Sequence may start from a Command Case, a
Game Operation, a Conversation alternative, or an arrival after a Scene Passage,
and arrival rules are deliberately barred from the start of a game. At the first
frame the Player is standing in the room in control, and the opening of the game
cannot be staged.

## Solution

One concept, **Interaction Case**, governs every conditional reaction in the
Engine, and one moment, **Scene Opening**, includes the start of a game.

An author learns a single rule and applies it in four places: a list named
`cases`, read from the top, where the first eligible case applies; each case
carrying an optional Interaction Condition and at most one outcome; the last
case for a given selector carrying no condition and therefore acting as the
default. Only the selector changes, because only the moment changes — a Verb on
a Noun, a Scene Entrance on a Scene, nothing inside a Sequence or a
Conversation. Where the Player rather than the Engine chooses, the list stays
`alternatives` and keeps its own shape.

A Scene opens when the Player arrives through a Scene Passage **or when the game
begins in that Scene**, so an opening can be staged. Restoring a Save Snapshot
never opens a Scene: a returning Player is not shown the prologue again.

## User Stories

1. As a game author, I want every conditional reaction in the Engine to be
   written as a list named `cases`, so that what I learn on one Noun applies to
   Scenes, Conversations and Sequences without relearning.
2. As a game author, I want the first eligible case to apply everywhere, so that
   I can write reactions from the specific to the general in every container.
3. As a game author, I want the last case of a selector to be the default simply
   by carrying no condition, so that I never have to remember a separate
   `fallback` field or map.
4. As a game author, I want a diagnostic when I put an unconditional case before
   a conditional one, so that I discover a dead case at authoring time rather
   than by playing.
5. As a game author, I want a case to declare at most one of a Line, a Command
   Response, a Sequence or further Sequence steps, so that a case can never
   speak twice at once.
6. As a game author, I want Game Operations to accompany any outcome, so that I
   can change state and answer the Player in the same case.
7. As a game author, I want a diagnostic when a case declares no outcome at all,
   so that an empty case cannot silently do nothing.
8. As a game author, I want a Scene to declare the cases with which it reacts to
   its own opening, so that staging lives where the moment lives.
9. As a game author, I want a Scene to open when the game begins there, so that
   my game can open on a staged Scene rather than a static tableau.
10. As a game author, I want a Scene to open when the Player arrives through a
    Scene Passage, exactly as arrival rules did, so that nothing I have already
    written stops working differently.
11. As a Player, I want a restored Save Snapshot to resume where I left off, so
    that I never sit through the opening of a game I have already begun.
12. As a game author, I want a case naming a Scene Entrance never to apply at the
    start of a game, so that the rules I wrote for arriving through a door stay
    rules about that door.
13. As a game author, I want an opening case with no Entrance to apply both at
    the start of the game and on every later arrival, so that one rule covers
    both without being written twice.
14. As a game author, I want to make the opening of a Scene happen only once by
    conditioning it on a Game Variable the Sequence itself raises, so that I use
    the idiom the Engine already taught me instead of a new flag.
15. As a game author, I want an opening case to be able to answer with a Line,
    so that a Character can say one sentence when the Player walks in without my
    declaring a whole Sequence.
16. As a game author, I want an opening case to be able to answer with a Command
    Response or to apply Game Operations alone, so that small reactions cost
    little to write.
17. As a game author, I want the Sequence started by an opening to take control
    before the Player does, so that no frame of play is reachable before the
    staging begins.
18. As a game author, I want a Noun's default for a Verb to be its final
    unconditional case, so that the reactions of a Noun read as one list.
19. As a game author, I want the Engine to still refuse a game where some Verb on
    some Noun has no answer at all, so that no Command can go unanswered.
20. As a game author, I want the Game Project's Command Fallbacks to keep
    covering Verbs a Noun does not answer itself, so that I do not have to
    repeat a global answer on every Noun.
21. As a game author, I want a Conversation's engine-selected reactions to be
    called `cases` like everywhere else, so that the handoff stops being a
    concept of its own.
22. As a game author, I want a Conversation case to keep declaring whether the
    Conversation closes or resumes afterwards, so that no expressiveness is lost
    in the unification.
23. As a game author, I want the alternatives the Player chooses to keep their
    own shape and name, so that the distinction between what I offer and what
    the Engine decides stays visible.
24. As a game author, I want a Sequence branch to be a list of cases whose last
    entry is the default, so that branching reads like every other reaction.
25. As a game author, I want a Sequence choice's guaranteed alternative to be its
    final unconditional alternative, so that the same convention holds where the
    Player chooses too.
26. As a game author, I want the documentation to describe one mechanism rather
    than four, so that I can read one page and write anywhere.
27. As a game author, I want at least one recipe to open a game on a staged
    Scene, so that I can copy the new capability rather than infer it.
28. As a game author reading the diagnostics reference, I want the codes to name
    the concepts the glossary uses, so that an error message leads me to the
    right page.
29. As a game author upgrading an existing game, I want the release to state
    plainly what to rename and what to fold, so that the migration is mechanical.
30. As a game author, I want no page of the documentation to still describe the
    old mechanism after the change lands, so that I never follow an example that
    the Engine no longer accepts.
31. As a maintainer, I want the ordering rule and the outcome-arity rule to be
    checked by one shared validator, so that a future container inherits both
    for free.

## Implementation Decisions

**One outcome shape, shared.** A case carries an optional `when`, at most one of
`line`, `response`, `sequence` and `steps`, and optional `operations`. The
arity rule — at most one outcome, counting a `start-sequence` Game Operation as
a Sequence outcome — and the non-empty rule are lifted out of the Noun
validation they live in today and applied in every container, with the codes
they already use.

**One list name.** Wherever the Engine selects, the list is `cases`: on a Noun
Definition, on a Scene Definition, on a Character's dialogue, and inside a
branch step. Wherever the Player selects, it stays `alternatives`: Conversation
alternatives and Choice alternatives.

**One selection rule.** First eligible case applies. The Scene's filter-and-
reject behaviour is removed along with its ambiguity diagnostic; the reference
diagnostic for an unknown Scene Entrance is kept and renamed to name the Scene
Opening.

**One default convention.** The default is the final case carrying no condition.
`CommandFallback` and the Noun's `fallbacks` map are removed; the branch and
choice `fallback` fields are removed. The Game Project's response-only
`commandFallbacks` stay as they are — a different level, not a duplicate.

**The ordering rule generalises.** The existing validator that requires exactly
one unconditional variant in final position, today applied to Noun Labels and
Verbs, is extended to every `cases` list. On a Noun it applies per Verb, since
the default there is per Verb.

**The coverage guarantee is restated, not weakened.** "Every Verb has a local or
global Command Fallback" becomes "every Verb has an unconditional case on the
Noun or a Command Fallback on the Game Project", keeping its diagnostic.

**Scene Opening is owned by World.** The selection of an applicable case on a
Scene lives in the World capability and is used by both paths: the Passage
transition it already serves, and the start of a Game Session. It is exposed as
a World operation returning the same shape the Passage transition returns, so
that the Session makes one call and does not reproduce the selection. This is
new: no reusable predicate exists today — the selection is inline inside the
Passage transition, and the "arrival predicate" exported from World concerns a
Character finishing a walk and is unrelated.

**Startup is a Scene Opening, restoration is not.** A Game Session evaluates the
initial Scene's cases only on the branch that builds a fresh initial state, not
on the branch that restores a Save Snapshot. The condition is evaluated against
the complete initial Session state, including dialogue state, with the same
evaluator the Passage transition receives — not against World state alone.

**Control before the first frame.** When an opening starts a Sequence at
startup, the Session begins it and advances it as it does after a Passage, so
that no frame of Player control precedes the staging.

**No new field distinguishes startup.** `entrance` is a filter meaning *only if
the Player came through this door*; at startup no door was used, so a case
naming an Entrance does not apply. "Only the first time" remains the existing
idiom: a condition on a Game Variable the Sequence raises among its operations
and in its Skip Outcome.

**Public surface.** The Engine's public exports and the testing entry point
carry the new type names; `ArrivalSequenceRule` and `CommandFallback` are gone.

**Documentation moves with the contract, not after it.** Every page that
describes a changed contract is updated in the slice that changes it, never in a
tidying pass afterwards. The authoring guides affected are Scene, Sequence,
Interaction, Dialogue, HUD, Save and Detail View; alongside them the contract
index, the diagnostics reference, the public vocabulary, the Dialogue Provider
guide, and the recipes with their README. The recipes carry a second obligation
beyond renaming: one of them must open its game on a staged Scene, because a
recipe is what an author copies and the new capability is otherwise invisible.

The authoring skills under `skills/` read the contract from the installed
package rather than restating it, and none of them names the affected fields, so
they need no change — worth confirming rather than assuming when the renames
land.

**The Example exercises the new capability.** `capri-1535` renames its rule on
the coastal fortification, which names an Entrance and is therefore unaffected
by the behavioural change, and gains an opening on its initial Scene — otherwise
nothing in the repository exercises what this spec adds. The renaming reaches
further than that one rule: several of its Characters, Objects and Scenes carry
Noun fallbacks, and several of its Sequences carry branch or choice fallbacks,
all of which fold into final unconditional cases.

**Starting at an Entrance is not arriving through it.** The Example drives an
individual Scene by starting the real Game Project with the Player already at
that Scene's Entrance, rather than by defining a stand-in project. Under this
spec such a start is a Scene Opening in which no door was used, so a case naming
an Entrance does not apply — which is what happens today as well, since startup
was never an arrival. The behaviour is unchanged but becomes a stated property
of the contract rather than an accident of the implementation, and the tests
that rely on it should say so.

## Testing Decisions

**What makes a good test here.** A test addresses the game the way a Player
meets it: the Labels on screen, the answers it gives, whether a Sequence has
taken control. It never reaches for the shape of a definition or the internals
of a capability. Authoring errors are addressed as an author meets them: a
project that refuses to start, and a diagnostic code.

**One seam, and it already exists.** Everything is driven through
`fondale/testing` — `startCoreSession(project, { restored })` — which is the
same function for a new game and a restored one, and which raises an
`AuthoringError` carrying diagnostics for a project that does not validate. No
new seam is introduced.

**Prior art.** `test/recipes.spec.ts` plays the recipes as one game through the
Player-facing helpers. `test/animated-sequences.spec.ts` covers Sequence control
and Save-and-restore equivalence, and shows the diagnostics idiom. Both are the
models to follow.

**The tests that matter most.**

- A game whose initial Scene declares an opening with no Entrance stages it at
  the start of a new game, and the Player is not in control before it begins.
- **The same game, restored from a Save Snapshot taken later, does not stage it**
  — the single most important assertion in this spec.
- A case naming a Scene Entrance never applies at the start of a game.
- The same case applies when the Player arrives through that Entrance, exactly
  as the arrival rule it replaces did.
- Two cases that could both apply select the first, in every container.
- An unconditional case before a conditional one is refused with the ordering
  diagnostic, in every container.
- A Verb left with no unconditional case and no Game Project Command Fallback is
  refused with the coverage diagnostic.
- A case declaring two outcomes is refused; a case declaring none is refused.
- An opening answering with a Line speaks it without a Sequence being declared.

**Whole-suite obligations.** The Example and the recipes are part of
verification, so `capri-1535` and the recipes must play green — including the
Example's own suite, which addresses the boat sighting and the prologue, and the
architecture documentation test that guards the published contract.

**The Example's own suite meets the opening too.** Its sessions are started
from one shared helper, so unlike the recipes the change lands in a single place
— but every spec that plays from the beginning now begins under a Sequence, and
the specs addressing the harbour and the prologue are the ones to check first.

**Staging the recipes' opening changes their tests, and should.** The recipes
are played as one game by a headless suite that starts several sessions and by a
browser suite that clicks through the installed package, and the Scene they open
in is the one that gains the opening. Every one of those sessions will therefore
meet a Sequence in control at the first frame, where today the Player is free
immediately. Those tests are updated to pass through the opening — settling or
skipping it before addressing the quay — because that is exactly what an author
adopting this capability has to do, and the recipes' tests are the worked
example of it. Moving the opening to a later Scene to keep the tests unchanged
is not acceptable: the capability being demonstrated is the start of a game.

## Out of Scope

The Player's starting position stays on the Character's initial Ground Point and
Facing; it does not become a Scene Entrance. ADR 0029 records why.

Detail Views do not gain cases: a Detail View is a still image, not a dramatic
moment, and its Hotspot conditions are predicates of existence, not reactions.

The predicates of existence generally — Hotspot and Passage availability,
Disclosure levels, the visibility of an alternative — are a different family and
are untouched. So is the family that selects a *value* from ordered variants:
Noun Labels, Preferred, Secondary and Selected Object Verbs.

`InteractionCondition` gains no new variants and no composition. ADR 0029
records why.

Resuming a Sequence interrupted by a Save is unchanged: the Engine does not
restore a Sequence in progress, and an opening interrupted that way is not
marked consumed. The recipe shows raising the Game Variable as the first
operation rather than the last, which is what an author controls.

No deprecation period or alias is provided. The Engine is at 0.4.0 and the break
is taken at once.

## Further Notes

The Example already calls the start of its game an *opening*: one of its specs
is named for the harbour opening. The glossary is formalising the author's own
word rather than importing a new one.

The name **Interaction Case** was already used by the glossary's definition of
Interaction Condition without having an entry of its own; this work gives it
one. `CONTEXT.md` now carries it, along with **Scene Opening**, and **Scene
Entrance** is deliberately untouched: an Entrance remains a threshold, and the
word *arrival* is removed from events, not from doors.

`arrivalSequences` is used in zero files in `fondale-demo1`, and in exactly one
in `capri-1535` — where it names an Entrance and so is unaffected by the change
in behaviour. The behavioural break is therefore real but unexercised by
existing games; the risk is in the renaming, which is mechanical.
