# Detail Views and the Ending

**Status:** ready-for-agent

## Problem Statement

Fondale can only present the world through a Scene, and a Scene always carries
Scene Space, a Walkable Region, Perspective Scale, a Camera and a presented
Player Character. Two ordinary things an adventure game needs therefore cannot
be authored at all.

The first is examining one subject closely: a map, a document, a mechanism with
several active points, an object turned over in the hands. An Author who wants
this today must fake it as full-frame Scenery hidden behind a transparent
Appearance, inside the Scene the Player happens to be standing in — a trick that
survives being wanted once and collapses when it is wanted a dozen times, and
that leaves the Player free to walk away behind the picture.

The second is ending. A Game Session runs until whoever hosts the Engine stops
it, so a Game Project has no way to say that the story is over. A prologue that
reaches its last beat simply hands control back and lets the Player wander a
world with nothing left in it.

## Solution

Two additions, decided in ADR-0024 and ADR-0025.

A **Detail View** is a single presented image with its own Hotspots, shown in
place of the world so the Player may examine one subject closely. It has no
Scene Space, no Walkable Region and no presented Character; because there is no
Character to approach, its Commands execute immediately. It represents something
the world already contains rather than being a place within it. A Game
Operation presents one and another dismisses it, so a Sequence, a Command Case
or an Object interaction can open a close-up at the right moment.

An **Ending** is the terminal state of a Game Session: a Detail View stays
presented, no further Command is accepted, and the HUD withdraws. The Ending
carries no picture of its own — what remains on screen is an ordinary Detail
View, so a closing card, a dedication and a final illustration with a detail
worth clicking are all the same shape.

Neither addition relaxes an existing invariant. Scene, Walkable Region, Approach
Point, Perspective Scale and Camera keep exactly the rules they have today.

## User Stories

1. As an Author, I want to declare a Detail View from an image and a list of
   Hotspot areas, so that I can present a close-up without inventing a Scene
   nobody can walk in.
2. As an Author, I want a Detail View's Hotspots to carry ordinary Noun
   Definitions, so that I reuse the Verbs, Noun Labels and Command Cases I
   already know instead of learning a second interaction model.
3. As an Author, I want to omit Approach Points, Baselines, Perspective Scale
   and Walkable Regions from a Detail View, so that I am not asked for geometry
   that has no meaning there.
4. As an Author, I want a Game Operation that presents a Detail View, so that a
   Sequence can open a close-up at a chosen beat.
5. As an Author, I want a Game Operation that dismisses the presented Detail
   View, so that I can return the Player to the world when the world must be
   watched again.
6. As an Author, I want a Command Case to present a Detail View directly, so
   that looking at a map or a document does not require writing a Sequence
   around every examinable subject.
7. As an Author, I want a Detail View Hotspot to answer with a Line or a
   Command Response, so that examining a detail can simply say something.
8. As an Author, I want a Detail View Hotspot to run Game Operations, so that
   examining a detail can teach a Narrative Fact or set a Game Variable.
9. As an Author, I want a Detail View Hotspot to start a Sequence, so that
   examining a detail can trigger a directed beat or open a Conversation.
10. As an Author, I want a Detail View Hotspot to accept a selected Inventory
    Object, so that the Player can put a key in a lock or a tessera in a
    mechanism seen close.
11. As an Author, I want Detail View Hotspots to be conditional on Game State,
    so that a port appears on the map only once the Player has learnt of it.
12. As an Author, I want Authoring Diagnostics for a malformed Detail View at
    start, naming the offending path, so that I find my mistake before a Player
    does.
13. As an Author, I want a Game Operation that ends the Game Session on a named
    Detail View, so that my game can declare that the story is over.
14. As an Author, I want the Ending to reuse a Detail View rather than take an
    image of its own, so that a closing card with a clickable dedication needs
    no new concept.
15. As an Author, I want more than one Ending to be authorable, so that
    different outcomes can close on different final images.
16. As a Player, I want a close-up to fill the frame in place of the world, so
    that I understand I am now examining one thing.
17. As a Player, I want the Player Character not to be drawn over the close-up,
    so that the presentation is not contradicted by a figure standing on it.
18. As a Player, I want my Commands inside a close-up to resolve at once, so
    that I am not waiting for a walk that has no meaning.
19. As a Player, I want hovering a detail to advertise its phrase exactly as in
    the world, so that the close-up feels like the same game.
20. As a Player, I want my Inventory to stay available while a close-up is
    presented, so that I can use what I carry on what I am looking at.
21. As a Player, I want to examine details in any order, so that a close-up is
    exploration rather than a fixed slideshow.
22. As a Player, I want to save while a close-up is presented and find it again
    on restore, so that closing the browser does not lose my place.
23. As a Player, I want to leave a close-up and find the world exactly as I left
    it, with my Character where it stood, so that examining something costs me
    nothing.
24. As a Player, I want a directed Sequence to keep running while a close-up is
    presented, so that a story beat is not blocked by what I am looking at.
25. As a Player, I want the game to close on a final image, so that I know the
    story has ended rather than wondering what is left to do.
26. As a Player, I want the HUD to withdraw at the Ending, so that nothing
    invites a Command that will not be answered.
27. As a Player, I want my Commands to be refused after the Ending, so that a
    finished game cannot be poked back into motion.
28. As a Player, I want to reopen the browser on a finished game and find its
    Ending, so that I am not dropped back into an exhausted world.
29. As a Player, I want starting a new game to leave the Ending behind, so that
    a finished playthrough does not contaminate the next one.
30. As a Player of the Capri 1535 demo, I want the wounded sailor's bundle to
    open as a close-up of the broken seal and the registry fragment, so that the
    discovery that ends the prologue is something I look at rather than a line
    of text.

## Implementation Decisions

**Detail View is its own entity, not a kind of Scene.** ADR-0024 records the
rejected alternatives: widening Scene by making the Approach Point and the
Walkable Region optional, which relaxed three validated invariants for two
screens; and staging the close-up as full-frame Scenery behind a transparent
Appearance, which does not survive repetition and leaves the world walkable
underneath.

**The Engine grows one new capability module**, consistent with ADR-0011.
Detail View definitions, their validation and their presented state belong
together rather than being scattered through the world and interaction
capabilities.

**Hotspot is no longer Scene-local.** `CONTEXT.md` now defines it as the local
surface belonging to whatever presents it — a Scene or a Detail View. The
Hotspot shape used by a Detail View carries an area and a Noun Definition and
deliberately has no Approach Point.

**Interaction gains a second resolution path, not a branch.** Commands against
Detail View Hotspots resolve without a movement stage. This is authored as its
own path through the interaction capability rather than as a conditional
inserted into the walking path; if the walking path starts asking whether a
Detail View is presented, the design is wrong and should be revisited.

**The presented Detail View is committed Game State**, carried by the Save
Snapshot and the Continuation State. The Player Character keeps its Scene and
its Ground Point throughout: presenting a Detail View changes only what the
Player sees, never where anyone stands.

**At most one Detail View is presented at a time.** Presenting another replaces
it. Nesting is rejected: it would add a stack to save and restore for a case no
game has needed.

**Sequences run unimpeded while a Detail View is presented**, directing a world
the Player cannot currently see, and dismiss it when the world must be watched
again.

**The Ending is a state of the Game Session, not an entity.** It has no registry
and no identity of its own: it is the fact that the session has concluded plus
the identity of the Detail View that remains presented.

**The Ending refuses Commands and withdraws the HUD.** The Engine does not
freeze a Scene as a substitute for a closing Detail View, because that would
give the Ending two meanings.

**Camera needs no change.** It is transient and follows the presented Player
Character; while a Detail View is presented there is nothing to follow and
nothing to save.

**Detail Views ship without travel and without Appearances.** A Hotspot that
carries the Player to another Scene would reintroduce the presented-Scene
divergence ADR-0024 rejects; a Detail View that swaps images is wanted by a
growing map, which no current game has.

## Testing Decisions

A good test here asserts what an Author or a Player would observe: committed
Game State after a Command, and what the frame shows. It never reaches into a
capability's internals, and it never asserts the shape of intermediate values
that exist only to make the implementation work.

**Two existing seams, no new ones.**

*Behaviour, at the Core Session seam.* `createTestSession` in `test/support.ts`
compiles a Game Project and drives it as a session, which is the highest seam
below the browser and the one `core.spec.ts`, `gameplay.spec.ts`,
`commands.spec.ts` and `recipes.spec.ts` already use. It covers presenting and
dismissing a Detail View, Commands resolving without movement, Hotspot
conditions, Lines, Game Operations and Sequences started from a detail, using a
selected Object on a detail, Authoring Diagnostics for malformed definitions,
Save Snapshot round-trips, the Ending refusing Commands, and starting a new game
after an Ending.

*Presentation, at the browser seam.* A fixture page driven with `clickLogical`
and rendered-pixel assertions, as the existing `*-browser.spec.ts` files do. It
covers only what must be seen: the Detail View replacing the world, no Character
drawn over it, hover advertisement inside it, the Inventory remaining reachable,
the HUD withdrawing at the Ending, and a browser reload restoring both a
presented Detail View and an Ending — the latter following the prior art in
`continuation-browser.spec.ts`.

The Capri 1535 Example proves the feature in use rather than in isolation, and
its own acceptance paths remain the final gate.

## Out of Scope

- Travel from a Detail View Hotspot to another Scene, which the map case will
  eventually want.
- Detail Views that swap images through Appearances.
- Nested or stacked Detail Views.
- Any relaxation of Scene, Walkable Region, Approach Point, Perspective Scale or
  Camera rules.
- Credits, menus, chapter cards and anything else that presumes a shell around
  the game rather than a Game Project that ends.
- The prologue finale itself, which consumes this feature and is tracked
  separately in the Capri 1535 effort.

## Further Notes

The design was reached by repeatedly applying one test proposed by the Author:
if a solution needs a lot of conditionals, it is the wrong solution. It rejected
three successive designs, including two of the Engine author's own. It remains
the sharpest available check on this feature: the moment an existing rule needs
"except when a Detail View is presented", the concept has been drawn in the
wrong place.

The close-up artwork for the Capri 1535 finale already exists outside the
repository, at `output/imagegen/seal-closeup-v2.png`, and should be fitted
rather than regenerated.
