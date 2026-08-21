# Vocabulary

The words Fondale uses, and what each one means precisely. Every term here is
used in the same sense everywhere in this documentation and in the public
interfaces.

## The pieces you supply

**Engine** — the reusable Fondale runtime.

**Author** — whoever writes a Game Project. You.

**Game Project** — the complete declaration of one game: immutable settings,
named Game Definitions, local assets, a Command Lexicon, Command fallbacks and
a HUD Theme. See [Project](authoring/project.md).

**Game Definition** — one named thing in a registry: a Scene, Character,
Object, Sequence, Detail View, Narrative Fact or Claim. Its registry key is its
identity.

**Runtime Asset** — an image, sheet, font or audio file the game loads.

**Art Master** — the lossless source an Author keeps; the Engine never sees it.

## Space and sight

**Logical Resolution** — the fixed visible frame and the HUD canvas.

**Scene** — one place the Player Character can occupy. See
[Scene](authoring/scene.md).

**Scene Size** — a Scene's complete extent. Defaults to the Logical Resolution
and may be larger on either axis.

**Scene Space** — the coordinate system of a Scene: origin top-left, one unit
per Background pixel, spanning the complete Scene Size.

**Background** — the Scene's own image, exactly the Scene Size.

**Camera** — the derived view of Scene Space presented inside the Logical
Resolution. It follows the Player Character and is never authored state.

**Perspective Scale** — the depth-dependent multiplier applied to a Character
or Object standing at a given Scene Space `y`. Depth only.

**Ground Point** — where a Character or Object stands in Scene Space.

**Baseline** — the depth line a piece of Scenery sorts on.

**Visual Anchor** — the point inside a Runtime frame that sits on the Ground
Point.

**Walkable Region** — the simple polygon a Character may move within.

**Scenery** — a depth-sorted visual belonging to one Scene. See
[Scenery](authoring/scenery.md).

**Background Region** — a Scenery Appearance that is a polygon cut out of the
Scene's own Background rather than its own image.

**Detail View** — a single image presented in place of the world, with its own
Hotspots and no Scene Space. See [Detail View](authoring/detail-view.md).

## Who and what is in it

**Character** — a persistent inhabitant with a Facing, an Appearance and a
Ground Point. See [Character](authoring/character.md).

**Player Character** — the Character the Camera follows and Commands move.

**Facing** — `left`, `right`, `front` or `back`. Characters only.

**Appearance** — a persistent visual condition owning named Animations.

**Animation** — a transient performance: one sheet (four, for a Character) and
its timing.

**Animation Role** — the Engine's semantic selection: `default`, optional
`speaking`, `walking`.

**Animation Cue** — a named moment in an Animation's timing, used to start
another direction.

**Object** — a portable thing in exactly one place: a Scene, the Inventory, or
consumed. See [Object](authoring/object.md).

**Inventory** — the acquisition-ordered set of carried Objects.

**Inventory Appearance** — an Object's square UI-scale image in the drawer.

## Doing things

**Verb** — one of nine semantic actions, plus implicit `walk-to`.

**Command** — one Verb with one or two Nouns.

**Noun** — what a thing is called and how it answers; owned by a Character,
Object, Scenery, background Hotspot or Passage. See
[Interaction](authoring/interaction.md).

**Command Case** — one ordered specific resolution of a Command.

**Command Fallback** — the local guaranteed answer after every case.

**Command Lexicon** — the words and sentence patterns; the Engine never infers
grammar.

**Hotspot** — an interaction surface pointing at a Noun.

**Approach Point** — where the Player Character walks before a Command
resolves.

**Scene Entrance** — a named arrival Ground Point and Facing.

**Scene Passage** — a directional transition to another Scene's Entrance.

**Scene Opening** — the moment a Scene comes before the Player. A Scene answers
it with its `cases`, and restoring a Save Snapshot is never one. See
[Scene](authoring/scene.md).

## State and flow

**Game State** — every committed fact of one Game Session. See
[Game State](authoring/game-state.md).

**Game Operation** — a validated atomic change to Game State.

**Game Variable** — a declared boolean fact.

**Game Session** — one Player's isolated run.

**Game Activity** — the single dominant piece of progress: a Player Intent, a
direct Line, a Sequence, a Conversation, or Reflection.

**Sequence** — a finite modal flow of steps. See
[Sequence](authoring/sequence.md).

**Direction Step** — one step running concurrent Animation, Motion and Camera
directions.

**Skip Outcome** — the atomic operations applied when a skippable Sequence is
interrupted.

**Ending** — the terminal state of a Game Session, presented on a Detail View.

**Save Snapshot** — an inspectable JSON-safe copy of committed Game State. See
[Save](authoring/save.md).

**Continuation State** — the browser-owned pairing of the latest compatible
Save Snapshot with its Dialogue Provider session identity.

## Knowledge and speech

**Narrative Fact** — a canonical authored truth. See
[Dialogue](authoring/dialogue.md).

**Claim** — an authored proposition that is not canonical truth.

**Character Knowledge** — the facts one Character knows. Monotonic.

**Disclosure** — that Character's policy for one known fact: open, guarded, or
secret.

**Cover Story** — an authored Claim told in place of a concealed fact.

**Testimony** — the committed memory that a Claim was communicated, attributed
to its speaker and never treated as truth.

**Trust** — directional qualitative confidence between two Characters.

**Dialogue State** — an optional qualitative current condition.

**Conversation** — the activity presenting authored alternatives and free-form
input together.

**Dialogue Turn** — one free-form exchange: interpretation, policy,
verbalisation.

**Dialogue Provider** — the adapter that interprets and verbalises. It never
changes Game State.

**Reflection** — the Player Character reasoning over what it knows. Never
canonical.

## When it goes wrong

**Authoring Diagnostic** — one author-facing issue with a stable code, family,
owner, path and message. See [Diagnostics](diagnostics.md).

**Authoring Error** — the aggregate failure thrown by `startGame`.
