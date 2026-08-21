---
status: accepted
---

# Model every conditional reaction as an Interaction Case

Several places let an author say *when this holds, do that*, each in its own
syntax, and the start of a game had no such expression at all. Every conditional
reaction in the Engine is therefore one concept, for uniformity and to let a
game open on a staged Scene rather than a static tableau.

An **Interaction Case** is an authored conditional alternative through which
something in the world reacts to a moment. Eligible cases are read in their
declared order and the first one applies. A case produces at most one of a Line,
a Command Response, a Sequence or further Sequence steps, with optional Game
Operations alongside. The final case for a given selector carries no condition
and is therefore the default; no unconditional case may precede a conditional
one. Nouns, Scenes, Conversations and Sequence branches all declare their
reactions this way, in a list named `cases`, and only the selector varies,
because only the moment varies: a Verb and an optional second Noun on a Noun, a
Scene Entrance on a Scene, nothing inside a Sequence or a Conversation. Where
the Player rather than the Engine chooses, the list is `alternatives` and keeps
its own shape.

A **Scene Opening** is the moment a Scene comes before the Player: arriving
through a Scene Passage, or the game beginning in that Scene. Restoring a Save
Snapshot is never a Scene Opening — it resumes a Playthrough rather than
presenting a Scene anew. Nothing distinguishes startup from arrival in a case,
because `entrance` is a filter meaning *only if the Player came through this
door*, and at startup the Player came through none.

## Considered options

**An `openingSequence` on the Game Project**, beside `initialScene`, was
rejected by the author: two mechanisms for one idea in two places. The opening
belongs on the Scene, where the moment is.

**An explicit `fallback` field** would make a misplaced default inexpressible,
but the default is not singular everywhere: a Noun needs one per Verb, so its
field would be a map while every other container's is a value. Three shapes of
default to retire one convention.

**Absorbing the selector into the condition**, so every case reads
`{ when, outcome }`, is the only way to make the syntax literally identical. It
would give `InteractionCondition` variants that mean something in some places
and nothing in others, and it would cost the guarantee that no Command goes
unanswered, which depends on the Verb being structural.

**Starting the Player from a Scene Entrance** would make startup literally an
arrival. Entrances are thresholds between Scenes, and a game may begin in the
middle of a room where no door has reason to exist.

## Consequences

This breaks the public contract in four capabilities at once, which is
acceptable at 0.4.0 and would not be later. The Example gains an opening on its
initial Scene, and so does one recipe, since the new capability is otherwise
exercised nowhere.

Both guarantees survive. *No Command goes unanswered* becomes *every Verb has an
unconditional case on the Noun or a Command Fallback on the Game Project*. *No
default hides the cases below it* becomes one ordering rule, checked in every
container by the validator that already checks it for Noun Labels and Verbs.
