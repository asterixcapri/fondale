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
_Avoid_: Game Project feature, renderer detail

**Knowledge-Driven Dialogue**:
An Engine Capability through which the Player addresses a Character in
free-form language and receives an Engine-governed response derived from what
that Character may know and disclose in the current Game Session; it governs
exploratory conversation rather than exact authored wording or choreography.
Generated speech may add expressive colour but cannot establish an
unauthorised Narrative Fact. The MVP enforces disclosure by withholding
unauthorised propositions from verbalisation and tests provider conformance; it
does not semantically verify generated text.
_Avoid_: Example experiment, dialogue tree, LLM feature, Sequence, Choice

**Narrative Fact**:
An Author-declared true proposition with stable identity about the people,
places, events, or clues of a Game Project that may affect story or puzzle
reasoning. It is defined once in the Game Project's Narrative Fact registry;
its identity remains independent from its wording. An Author may declare the
Game Variable that a Character learning it sets, which the Engine commits in
the same atomic step as the learning, after Disclosure has authorised the Fact.
_Avoid_: Generated detail, conversational colour, World fact

**Claim**:
An Author-declared proposition with stable identity, defined once in the Game
Project's Claim registry, that a Character may communicate without the Engine
endorsing it as a Narrative Fact.
_Avoid_: Narrative Fact, generated invention, Character Knowledge

**Cover Story**:
An Author-declared Character-specific association from a concealed Narrative
Fact to a Claim that the Character may intentionally communicate instead during
authored or Knowledge-Driven Dialogue.
_Avoid_: Secret, improvised lie, false Narrative Fact

**Testimony**:
A committed record that one Character communicated a Claim to another, without
making that Claim true or adding it to the listener's Character Knowledge.
_Avoid_: Narrative Fact, belief, transcript, trusted knowledge

**Hypothesis**:
A non-canonical possibility that a Character may derive from its Character
Knowledge and remembered Testimony and must express as uncertain. It neither
enters Character Knowledge nor changes Game State unless an Author separately
defines a corresponding canonical effect.
_Avoid_: Narrative Fact, automatic deduction, learned fact, puzzle solution

**Relationship**:
The directional social state of one Character toward another in the current
Game Session. The MVP represents only Trust.
_Avoid_: symmetric bond, Personality, inferred sentiment

**Trust**:
The low, medium, or high confidence one Character currently places in another;
it changes only through an authored Game Operation.
_Avoid_: numeric score, mutual trust, Dialogue Provider inference

**Character Knowledge**:
References by stable identity to the Narrative Facts available to one Character
in the current Game Session, initialised from the Game Project and changed
atomically as that Character learns. The MVP only adds knowledge; it does not
forget or retract it.
_Avoid_: Biography, Claim, Testimony, prompt context, generated transcript, world truth

**Disclosure**:
The Character-specific authored constraint attached to a Character Knowledge
reference and governing when that Character may communicate the referenced
Narrative Fact. Open facts are eligible when relevant, guarded facts require an
ordinary condition chosen by the Author for that Character Knowledge reference,
such as a specified Trust level, and secret facts require an explicit authored
unlock that Trust alone cannot provide.
_Avoid_: Character Knowledge, Personality, prompt instruction, probabilistic leak

**Biography**:
Author-written prose that contextualises a Character's identity and history
without independently authorising Narrative Facts in generated speech.
_Avoid_: Background, Character Knowledge, gameplay rule, prompt authority

**Personality**:
Qualitative Author-declared traits that keep a Character's portrayal consistent
without authorising Narrative Facts or deciding Game State.
_Avoid_: Voice, Dialogue Behavior, numeric simulation, gameplay rule

**Dialogue Behavior**:
A small Engine-interpreted profile that determines how much authorised
information a Character volunteers and which safe Response Strategies it
prefers when withholding information.
_Avoid_: Personality, Voice, arbitrary rule language, numeric trait formula

**Dialogue State**:
An optional qualitative and temporary Character condition, such as afraid or
drunk, selected and changed through authored Game Operations when a Game
Project needs it. A Dialogue Provider may portray but cannot infer or change it.
_Avoid_: numeric emotion simulation, Personality, sentiment inference, generic state

**Voice**:
An Author-declared language profile governing how authorised content is phrased
without changing what the Character communicates.
_Avoid_: Personality, Dialogue Behavior, Response Strategy, Character Knowledge

**Narrative Context**:
A brief Author-written description of the Game Project's overall fictional
setting that guides generated phrasing without authorising Narrative Facts.
_Avoid_: Game State, Scene, Biography, prompt authority

**Response Strategy**:
The Engine-authorised conversational approach for one Dialogue Turn, such as
answering, withholding part of an answer, evading, refusing, or expressing an
authorised Cover Story as a lie. When interpretation is ambiguous, clarify asks
the Player to disambiguate without producing canonical effects.
_Avoid_: Generated speech, prompt instruction, Voice

**Dialogue Provider**:
An Author-selected integration that interprets the Player's free-form language
and verbalises an Engine-authorised response with enough Conversation context
for continuity, without gaining authority over Narrative Facts or Game State.
It owns non-canonical agent memory concerns such as transcripts, context-window
management, and summaries; a Continuation State retains the identity needed to
recover that external memory. It is ordinarily selected through a separately
run Dialogue Server URL, while tests and advanced hosts may supply a low-level
implementation.
_Avoid_: LLM, OpenAI client, Engine service, narrative authority

**Dialogue Turn**:
One free-form Player input and its corresponding Engine-authorised Character
response within Knowledge-Driven Dialogue. Accepted input is presented as a
Line spoken by the Player Character without becoming a Narrative Fact; the
response uses the same Line presentation. The turn either completes atomically
with Game Operations for only the Narrative Facts or Claims that the Engine
selected for communication before verbalisation, or fails without changing
Game State. While pending it blocks another turn but remains cancellable;
leaving the Conversation, starting a new game, or stopping invalidates it and
any late provider result is ignored. Player text is length-bounded untrusted
speech and never a provider or Engine instruction.
_Avoid_: Prompt, request, Line, partial state update

**Conversation**:
The dominant Game Activity in which the Player conducts Knowledge-Driven
Dialogue with one Character over one or more Dialogue Turns, normally opened by
resolving Talk To against a Character configured for it. It may present
authored alternatives and free-form input together, leaving the Player free to
choose either at any point: an authored alternative yields exact authored
language and never reaches a Dialogue Provider, while free-form input opens a
Dialogue Turn. An authored alternative may instead, or additionally, hand
direction of play to a named Sequence, which then becomes the dominant Game
Activity and closes or resumes the Conversation when it completes; free-form
input is not presented while it plays. An authored alternative may be consumed
by the selection that asks it, and is then never offered again; which
alternatives were consumed is canonical Game State. Where the Engine rather
than the Player chooses, the Character's own Interaction Cases decide: read from
the top, the first eligible one directs its Sequence and declares whether the
Conversation closes or resumes afterwards. Its provider-owned transcript and
context memory are not Game State; a Continuation State retains their external
identity across browser reloads.
_Avoid_: Sequence, dialogue tree, arbitrary input prompt, Save Snapshot transcript

**Reflection**:
A Knowledge-Driven Dialogue mode in which the Player consults the Player
Character's own Character Knowledge, remembered Testimony, and possible
Hypotheses. It has no second interlocutor and does not apply Disclosure, Cover
Stories, or new Testimony.
_Avoid_: Conversation with oneself, omniscient hint system, Narrative Fact deduction

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
normally follows the visible Player Character, but a Sequence may temporarily
direct its framing immediately or over logical time, hold it, or make it follow
another subject before it returns to following that Character. It never
belongs independently to Game State.
_Avoid_: Saved viewport, Camera state, Motion

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
Engine Capabilities.
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

**Ending**:
The terminal state of a Game Session, in which a Detail View stays presented and
no further Command is accepted. It is committed Game State, so restoring a
concluded Game Session resumes at its Ending rather than in the world.
_Avoid_: Game over, credits, final Scene, quitting

**Save Snapshot**:
A JSON-safe representation of one committed Game State, identified by its Game
Project and compatibility versions and suitable for exact restoration.
_Avoid_: Save slot, storage record, event log

**Continuation State**:
The single locally retained record that pairs a Game Project's latest Save
Snapshot with the Dialogue Provider memory identity needed to continue after a
browser reload; starting a new game replaces it.
_Avoid_: Save Slot, manual save, checkpoint history

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
A named, finite progression that directs Lines, Narrations, Choices,
conditions, Animations, Motions, the Camera, and Game Operations while
temporarily taking direction of play away from the Player as the dominant Game
Activity. Its steps progress sequentially, while one step may direct several
Animations and Motions concurrently and completes when its finite directions
finish; its exact logical progress belongs to the Game State. It remains within
the Scene in which it started and cannot direct a Scene transition.
_Avoid_: Cutscene, multi-Scene sequence, Choreography layer, authored Dialogue as a separate activity model, nested sequence, scripted async function

**Direction Step**:
A sequential Sequence step that directs concurrent Animations, Motions, and the
Camera and completes when all finite directions finish or its authored duration
elapses.
_Avoid_: Direct Step, Directed Step, Choreography

**Skip Outcome**:
The authored Game Operations applied when a skippable Sequence is skipped so
its logical result remains coherent without executing its remaining steps.
_Avoid_: Cancellation, implicit fast-forward, renderer cleanup

**Line**:
A single phrase spoken by a Character, supplied by authored content or an
accepted Dialogue Turn. Its presentation may advance by timing or Player input;
while active it directs a speaking Animation from the Character's current
Appearance, with an optional authored override.
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
represent an interior or an outdoor location and declares the Interaction Cases
with which it reacts to its own Scene Opening, subject to the current Game State
and an optional Scene Entrance filter. An applicable case takes control before
Player control resumes. A Scene is not itself a controlled sequence of actions.
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

**Scene Opening**:
The moment a Scene comes before the Player, whether by arriving through a Scene
Passage or by the game beginning in that Scene. Restoring a Save Snapshot is
never a Scene Opening: it resumes a Playthrough rather than presenting a Scene
anew.
_Avoid_: Arrival, startup, Scene Entrance, first frame

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
The persistent semantic visual condition of a Character, Object, or Scenery,
such as normal, disguised, open, or repaired. Its named selection belongs to
the Game State and owns the Animations available while selected.
_Avoid_: Animation, asset, sprite, texture

**Animation**:
The transient visual performance of a Character, Object, or Scenery, such as
walking, speaking, gesturing, or turning. It may accompany an Appearance
change or depict travel, but does not itself change Game State or position in
Scene Space. Every Character Animation owns synchronized authored left, right,
front, and back presentations; the Engine selects the presentation matching the
Character's Facing without transforming another presentation. A Sequence that
explicitly names an unavailable Animation is invalid authoring.
_Avoid_: Appearance, Game Operation, animation frame

**Motion**:
The authored progression of a Character's or Object's Ground Point, or a
Scenery's position, through Scene Space over logical time. A Character follows
Scene navigation to a destination, while an Object or Scenery follows an
authored path. A Scenery Motion ends at its authored resting position; any
lasting change is expressed through Game Operations, such as selecting an
Appearance, rather than by persisting an arbitrary position. Motion has no
world identity and remains separate from Animation.
_Avoid_: Animation, entity, teleport, sprite offset

**Default Animation**:
The required looping Animation presented for the selected Appearance whenever
no other Animation temporarily replaces it. It may consist of one static frame.
_Avoid_: Appearance, Character-only idle animation, Sequence step

**Animation Role**:
An Appearance-owned semantic selection through which the Engine automatically
uses an Animation for default presentation, speaking, or walking. Speaking is
optional and falls back to the Default Animation; walking is required whenever
a Character moves in that Appearance.
_Avoid_: Animation name convention, Sequence instruction, renderer state

**Animation Cue**:
A named instant within an Animation at which a Sequence may coordinate another
Animation, Motion, or sound without relying on an authored elapsed-time delay.
It does not itself change Game State.
_Avoid_: Timer, frame callback, Game Operation

**Ground Point**:
The point where a Character or Object meets the walkable surface and from
which its position, depth, and perspective are interpreted.
_Avoid_: Sprite origin, center point

**Visual Anchor**:
The point within a visual asset that aligns it to a Ground Point or Baseline
and remains consistent across its animation frames.
_Avoid_: Pivot, sprite origin

**Facing**:
The discrete left, right, front, or back direction toward which a Character is
oriented; it selects corresponding authored presentation rather than
transforming artwork owned by another Facing.
_Avoid_: Sprite flip, inferred direction, Motion

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
The local surface that makes something interactive: within a Scene, Scenery, a
Character, an Object present in the Scene, or a background region; within a
Detail View, a region of its image. It has no identity apart from what it makes
interactive; while inactive it neither receives nor advertises Player Intent.
_Avoid_: Interactive object, world entity, clickable point

**Detail View**:
A single presented image with its own Hotspots, shown in place of the world so
the Player may examine one subject closely. It has no Scene Space, no Walkable
Region and no presented Character, so its Commands never approach before they
execute, and it represents something the world already contains rather than
being a place within it. At most one is presented at a time, and the Inventory
remains available while it is.
_Avoid_: Scene, screen, overlay, popup, close-up

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
variants whose final variant carries no condition. Knowledge represented by a label belongs to
declared Game State rather than inference by the Engine.
_Avoid_: Identifier, automatic discovery, rendered entity type

**Noun Definition**:
The declarative description of one Noun's labels, Preferred Verb, optional
Secondary and Selected Object Verbs, and Command Cases wherever that Noun is
available to the Player. One Noun Definition belongs to
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

**Interaction Case**:
An authored conditional alternative through which something in the world reacts
to a moment: eligible cases are considered in their declared order and the first
one applies, producing at most one of a Line, a Command Response, a Sequence, or
further Sequence steps, with optional Game Operations. The final case for a
given selector carries no Interaction Condition and is therefore the default;
no unconditional case may precede a conditional one.
_Avoid_: Handler, event listener, priority rule, trigger, fallback field

**Command Case**:
An Interaction Case selected by a Verb against one or two Nouns.
_Avoid_: Handler, event listener, priority rule

**Command Fallback**:
The Game Project's response-only guarantee for a Verb, used when a Noun declares
no unconditional Command Case for it. It makes a Command impossible to leave
unanswered.
_Avoid_: Silent no-op, exception, implicit default, local fallback field

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
