# Fondale

Shared glossary for the adventure game engine. It names the concepts through
which a game project defines its world and the player interacts with it.

## Product language

**Engine**:
The reusable system that interprets a Game Project and makes its adventure
playable without requiring changes to the engine's internals.
_Avoid_: Game, generic framework

**Engine Capability**:
Reusable behavior that Fondale guarantees to Game Projects through its public
interface.
_Avoid_: Capri feature, renderer detail

**Game Setting**:
A choice or value through which a Game Project adapts an Engine Capability to
its artistic direction and behavior.
_Avoid_: Engine constant, internal interface

**Player Preference**:
A locally retained presentation or control choice owned by the Player rather
than a Game Session. It may affect help, appearance, audio, or input but never
the logical outcome of play and is not part of a Save Snapshot.
_Avoid_: Game Setting, Game Variable, progress flag

**Logical Resolution**:
The fixed width and height of the visible logical viewport and Engine-owned
overlay before the whole frame is fitted to its display target through uniform
scaling and, when required, letterboxing. A Scene may extend beyond it.
_Avoid_: Window size, renderer resolution, per-Scene resolution

**Scene Size**:
The positive-integer width and height of one Scene's complete Scene Space. It
defaults to the Logical Resolution but may extend beyond the visible frame.
_Avoid_: Logical Resolution, Background size, world size

**Camera**:
The transient view of Scene Space presented inside the Logical Resolution. It
is derived from the visible Player Character and never belongs to Game State.
_Avoid_: Saved viewport, Camera state, cinematic pan

**Author**:
The web developer who builds a Game Project through Fondale's public interface
without depending on the engine's internals.
_Avoid_: Player, end user

**Player**:
The person who controls a Game Session and expresses intentions through the
game's supported input.
_Avoid_: Author, Game Project

**Game Project**:
The self-contained collection of content, settings, and behaviors that defines
a particular adventure built with Fondale.
_Avoid_: Engine, demo

**Project Identity**:
The stable, author-declared identity that distinguishes a Game Project when
creating or restoring a Save Snapshot.
_Avoid_: Display title, package name

**Project Version**:
The author-declared compatibility version shared by Game Project definitions
and the Save Snapshots they can restore.
_Avoid_: Package version, release version

**Game Definition**:
The declarative description of an adventure element, kept separate from
exceptional behavior written specifically for a Game Project.
_Avoid_: Engine class, generic configuration

**Art Master**:
The original, lossless visual source preserved outside runtime code so that a
Game Project can derive fitted and optimized visual files without modifying its
source artwork.
_Avoid_: Runtime import, generated variant, preview

**Runtime Asset**:
A processed visual or audio file loaded by a Game Project from beside its
owning definition under `src/`, derived from an Art Master when one exists.
_Avoid_: Art Master, source artwork, reproducible intermediate

**Game Behavior**:
A rule specific to an adventure that complements its Game Definitions without
changing the engine's internals. It is deterministic for the context supplied
by the Engine and cannot depend on external mutable state.
_Avoid_: Engine patch, plugin

**Example**:
A Game Project distributed with Fondale to demonstrate and verify supported
Engine Capabilities; Capri 1535 is the first Example.
_Avoid_: Engine code, throwaway demo

**Support Baseline**:
The explicitly verified browser, input, and basic usability commitments that a
Fondale release guarantees to Players and Game Projects.
_Avoid_: Accessibility compliance, universal browser support, best-effort compatibility

**Authoring Diagnostic**:
A structured explanation of one invalid Game Definition, Game Project, Save
Snapshot, asset, or startup condition that helps an Author locate and correct
the problem.
_Avoid_: Player error, log message, debugging tool

## Playthrough language

**Game Session**:
An isolated execution of a Game Project, from starting a new game or restoring
one until it is stopped.
_Avoid_: Game Project, renderer, global game

**Game State**:
The canonical facts that describe the current progress of a Game Session and
determine how its world may evolve.
_Avoid_: Game Project, renderer state, transient activity

**Save Snapshot**:
A JSON-safe representation of one committed Game State, identified by its Game
Project and compatibility versions and suitable for exact restoration.
_Avoid_: Save slot, storage record, event log

**Save Slot**:
A Player-named browser record that owns one Save Snapshot together with the
name, date, and Scene metadata needed to find, manage, and restore it.
_Avoid_: Save Snapshot, checkpoint, autosave

**Command State**:
The selected Verb and optional first Noun of a Command being constructed. It is
committed Game State, unlike the transient Noun beneath the pointer.
_Avoid_: Hover state, cursor state, Player Intent

**Game Variable**:
A named boolean fact declared by a Game Project for adventure-specific progress
not already represented by an Engine Capability.
_Avoid_: Global variable, arbitrary state object, duplicate engine state

**Game Operation**:
A validated request that moves a Game Session atomically from one valid Game
State to the next.
_Avoid_: Direct mutation, renderer event, callback side effect

**Game Activity**:
Runtime behavior that progresses over logical time, such as a Player Intent or
a Sequence, or temporarily presents a Command Response; at most one Game
Activity controls play at a time.
_Avoid_: Animation frame, ambient rendering, unmanaged task

**Sequence**:
A named, finite progression of Lines, Narrations, Choices, conditions, and Game
Operations that temporarily controls play as the dominant Game Activity. It is
strictly sequential and its exact logical progress belongs to the Game State.
_Avoid_: Cutscene, Dialogue as a separate activity model, nested sequence, scripted async function

**Line**:
A single authored phrase spoken by a Character. Its presentation may advance
by timing or Player input.
_Avoid_: Narration, Command Response, subtitle, dialogue node, renderer text

**Narration**:
A single authored phrase delivered by the narrator rather than a Character. It
describes or frames the story instead of explaining the outcome of a Command.
_Avoid_: Line without a Character, Command Response, system message

**Choice**:
A point in a Sequence where the Player selects one of the authored alternatives
eligible in the current Game State from the HUD. By default, the selected phrase
is pronounced by the Player Character before the Sequence continues along its
branch, but an alternative may explicitly remain unspoken; ineligible
alternatives are not presented. At most six alternatives may be eligible at
once.
_Avoid_: Menu, disabled answer, arbitrary input prompt

## Interaction language

**Scene**:
The explorable unit of the world that the Engine presents as one space. It may
represent an interior or an outdoor location; it is not a controlled sequence
of actions.
_Avoid_: Room, sequence

**Scene Space**:
The logical coordinate space shared by a Scene's background, placed elements,
and authored geometry.
_Avoid_: Screen coordinates, CSS pixels, window space

**Walkable Region**:
A polygon in Scene Space within which a Character's Ground Point may stand and
move.
_Avoid_: Room mask, screen-space hit area

**Approach Point**:
An authored Ground Point and facing in a Scene at which a Character can perform
an Interaction with a target.
_Avoid_: Click position, sprite position, implicit nearest point

**Scene Entrance**:
A named arrival Ground Point and facing through which a Character enters a
Scene after a transition.
_Avoid_: Spawn point, Exit

**Scene Passage**:
A named navigable connection that participates in a Walk To Command and leads
from an approach in one Scene to a named Scene Entrance in another Scene.
_Avoid_: Exit, teleporter, implicit two-way link

**Passage Direction**:
The author-declared visual direction of a Scene Passage—left, right, up, down,
or enter—used by a HUD Theme to present its directional cursor.
_Avoid_: Destination inference, movement vector, hard-coded cursor asset

**Background**:
The visual base that spans the whole Scene Space. A local element that needs
its own position, depth, or behavior is Scenery instead.
_Avoid_: Scenery, visual layer

**Appearance**:
The semantic visual presentation of a Character, Object, or Scenery. Its named
selection belongs to the Game State, while the file that depicts it has no game
identity.
_Avoid_: Asset, sprite, texture

**Ground Point**:
The point where a Character or Object meets the walkable surface and from
which its position, depth, and perspective are interpreted.
_Avoid_: Sprite origin, center point

**Visual Anchor**:
The point within a visual asset that aligns it to a Ground Point or Baseline
and remains consistent across its animation frames.
_Avoid_: Pivot, sprite origin

**Baseline**:
The Scene Space depth at which Scenery meets the ground and joins the world's
visual ordering.
_Avoid_: z-index, rendering layer

**Perspective Scale**:
The Scene-defined relationship between a Ground Point's depth and the visual
size of a Character or Object placed there.
_Avoid_: Camera zoom, sprite scale

**Character**:
A persistent entity capable of acting in the world, controlled by either the
Player or the game. Its identity and lifecycle do not belong to a Scene.
_Avoid_: Actor, sprite

**Scenery**:
The non-collectible visual elements local to a Scene and defined separately
from its background when they need their own position, depth, or behavior.
_Avoid_: Object, Hotspot, details embedded in the background

**Hotspot**:
The Scene-local surface that makes Scenery, a Character, an Object present in
the Scene, or a background region interactive. It has no identity apart from
what it makes interactive; while inactive it neither receives nor advertises
Player Intent.
_Avoid_: Interactive object, world entity, clickable point

**Object**:
A persistent entity the Player can collect. It is always present in one Scene,
carried in the Inventory, or terminally consumed; its identity and lifecycle
belong to the Game Project rather than a Scene.
_Avoid_: Scenery, synonym for Hotspot

**HUD**:
The Engine-owned overlay that presents Contextual Actions, Inventory, Choices,
play feedback and utility controls without reserving or cropping any region of
the Scene. At rest only small persistent controls such as the Inventory trigger
remain visible.
_Avoid_: Lower band, cropped Scene, world element

**HUD Theme**:
The Game Project's declarative visual language for the Engine-owned HUD,
including its original palette, font, cursors, borders, contextual prompts,
Inventory drawer, and Character speech colours. It adapts a stable interaction
structure without copying the visual assets of another Game Project or product.
_Avoid_: Custom DOM, custom CSS, Scene art

**Inventory**:
The acquisition-ordered collection of Objects currently carried by the Player
and presented in an Engine-owned drawer opened from a persistent trigger or
keyboard shortcut.
_Avoid_: Container, equipment, item stack

**Inventory Selection**:
The transient choice of one carried Object as the first Noun of the Player's
next Command. It prepares an interaction but does not itself execute Use.
_Avoid_: Use Command, Inventory activation, equipped Object

**Inventory Appearance**:
The visual presentation of an Object within the Inventory and while it
participates in a Command, distinct from its Appearance in a Scene.
_Avoid_: World Appearance, generic HUD icon

**Inventory Appearance Size**:
The project-wide square dimensions shared by every Inventory Appearance within
a Game Project's Logical Resolution.
_Avoid_: Screen icon size, per-Object icon size, HUD scale

**Interaction**:
A meaningful resolution of a Command against its Noun or Nouns, perceived by
the Player as a response or a change in the world.
_Avoid_: Click handler, silent no-op

**Verb**:
An authored action word used to construct a Command and resolve an Interaction.
The contextual overlay advertises only the Verb choices relevant to its Noun.
_Avoid_: Click handler, renderer action

**Preferred Verb**:
The state-appropriate Verb advertised as a Noun's primary Contextual Action
when no Object is selected.
_Avoid_: Only Verb, inferred click handler

**Secondary Verb**:
The optional state-appropriate Verb advertised as a Noun's secondary
Contextual Action. Its absence is meaningful: the right mouse button then has
no world action.
_Avoid_: Required alternative, inferred fallback

**Selected Object Verb**:
The state-appropriate Verb used as the primary Contextual Action when an Object
is selected from Inventory; it defaults to Use and may be authored as Give.
_Avoid_: Object callback, target-type inference

**Contextual Action**:
One complete player-facing Command phrase advertised beside a Noun and bound to
the primary or secondary mouse button for that moment.
_Avoid_: Verb grid entry, tooltip, click handler

**Noun**:
The player-facing name by which a Character, Object, Scenery, background
region, or Scene Passage participates in a Command.
_Avoid_: Identifier, hotspot label, target kind

**Noun Label**:
The localized player-facing text selected for a Noun from ordered conditional
variants and a required fallback. Knowledge represented by a label belongs to
declared Game State rather than inference by the Engine.
_Avoid_: Identifier, automatic discovery, rendered entity type

**Noun Definition**:
The declarative description of one Noun's labels, Preferred Verb, optional
Secondary and Selected Object Verbs, Command Cases, and local fallbacks
wherever that Noun is available to the Player. One Noun Definition belongs to
its Character, Object, Scenery, background region, or Scene Passage.
_Avoid_: Hotspot, entity definition, event handlers

**Command**:
A Player-authored sentence combining one Verb with one or two Nouns before it
is executed as a Player Intent.
_Avoid_: Click, callback, Interaction

**Command Lexicon**:
The Game Project's localized labels and sentence patterns for presenting
semantic Verb and Noun combinations without linguistic inference by the Engine.
_Avoid_: Locale detection, translated identifiers, automatic grammar

**Command Preview**:
The pointer-following presentation of one or two Contextual Action phrases,
clamped within the Logical Resolution and visually separated from Scene art.
_Avoid_: Interaction Response, dialogue text, generic tooltip, Sentence Line

**Command Case**:
An authored conditional alternative for resolving a Verb against one or two
Nouns; eligible cases are considered in their declared order and may produce a
Line, Command Response, Game Operations, or a Sequence.
_Avoid_: Handler, event listener, priority rule

**Command Fallback**:
The guaranteed response used when no Command Case matches, resolved locally on
a Noun before the Game Project's response-only fallback for that Verb.
_Avoid_: Silent no-op, exception, implicit default

**Interaction Condition**:
An authored proposition over the current Game State that determines whether an
Interaction Case is eligible; common conditions remain declarative.
_Avoid_: Validation rule, mutable state check

**Command Response**:
The player-perceivable, transient explanation of what happened when a Command
resolved, possibly accompanied by immediate world changes. It is not spoken by
a Character.
_Avoid_: Line, Narration, event handler, silent no-op, renderer effect

**Player Intent**:
The execution of a complete Command, including any required movement and
facing. A new Player Intent replaces one still in progress, and its Interaction
is resolved against the latest committed Game State only after arrival.
_Avoid_: Click, queued movement, Command State

**Fast Walk**:
The presentation of a Walk To Player Intent at increased movement speed. It has
the same destination, validation, and logical result as ordinary walking.
_Avoid_: Teleport, skipped Interaction, separate movement rule
