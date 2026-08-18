# Concepts

An **Engine** is the reusable Fondale runtime. An **Author** supplies a
**Game Project**: immutable settings, named **Game Definitions**, local assets,
a **Command Lexicon**, Command fallbacks and a **HUD Theme**. A **Player**
controls one isolated **Game Session**.

Every committed fact belongs to the session's canonical **Game State**.
Fondale evolves it through validated, atomic **Game Operations**. Reflection
may summarise committed Character Knowledge and Testimony, but its generated
summary, Hypotheses, and suggestions remain non-canonical. Rendering,
loaded textures, screen coordinates, and animation frames are derived and do
not become canonical state. A **Game Activity** is the single dominant piece
of progress: a replaceable Player Intent, a direct Line, a modal Sequence, a
Conversation, or Player Character Reflection.

A **Logical Resolution** is the fixed visible frame and HUD canvas. A
**Scene** has a **Scene Size** that defaults to that frame and may be wider,
taller, or both; its **Scene Space** has its origin at the top-left and spans
the complete Background. The derived **Camera** follows the visible Player
Character through an oversized Scene without becoming independent Game State;
a Sequence may temporarily direct it from its saved logical progress. A
Character's **Ground Point**, a Scenery **Baseline**, and optional
**Perspective Scale** determine composition in Scene Space. A Walkable Region
governs movement; a Hotspot adds an Approach Point and identifies what is
interactive. A Character, Object, or Scenery owns its optional **Noun
Definition**, and every Hotspot that targets it resolves that same Noun. A
background region has no registry owner, so its Hotspot owns the Noun locally;
a Scene Passage also owns its own Noun.

A **Detail View** is a single presented image with its own Hotspots, shown in
place of the world so the Player may examine one subject closely. It has no
Scene Space, no Walkable Region and no presented Character, so its Hotspots
carry a Noun without an Approach Point and their Commands resolve immediately.
Game Operations present and dismiss one; at most one is presented at a time,
the Inventory stays reachable, a Sequence keeps running, and the Player
Character keeps its Scene, Ground Point and Facing until the world is watched
again.

An **Ending** is the terminal state of a Game Session: a Game Operation names
the Detail View that stays presented, the HUD withdraws, and no further Command
is accepted. It carries no image of its own, so a closing card, a dedication
and a final illustration with a detail worth clicking are all the same shape,
and a Game Project may author as many Endings as it has outcomes. The Ending is
committed Game State, so a reopened browser finds a finished game at its Ending
rather than in an exhausted world, and starting a new game leaves it behind.

An **Object** exists in exactly one place: a Scene, the acquisition-ordered
**Inventory**, or terminal consumption. A Command combines one semantic
**Verb** with one or two Nouns; **Walk To** remains implicit. Ordered
**Command Case** values resolve specific outcomes, then local and global
fallbacks guarantee visible feedback. A **Sequence** is a finite, modal path
of Character-bound Lines, explicit Narrations, Choices, branches, operation
groups, and Direction Steps. One Direction Step may start concurrent
**Animation**, **Motion**, and Camera directions and waits for every finite
boundary. An **Appearance** owns named Animations and semantic default,
speaking, and walking **Animation Roles**; only the selected Appearance is
persistent. **Animation Cues** coordinate directions without callbacks. A
direct Line or neutral Command Response may also conclude one Command without
introducing a one-step Sequence.

The Camera projects world input, Character speech and revealed Hotspots between
Scene Space and the viewport. The Engine owns the semantic HUD:
pointer-following Contextual Actions, the
Inventory trigger and drawer, Choices, Options and Help. A Noun's
Preferred Verb supplies the primary action, while optional Secondary and
Selected Object Verbs control the right mouse button and Object-first Commands.
HUD prepares narrative text, Choice numbering, text timing, speech colour,
layout intent, Player Preferences and modal transitions once. The browser maps
those facts to accessible DOM, plays audio, forwards timers and actions, and
stores Player Preferences and one Project Identity-specific Continuation State.
The project-owned HUD Theme may choose local font and cursor assets, colours,
opacity and speech styling, but cannot rearrange those controls.

A **Save Snapshot** is an inspectable JSON-safe copy of the latest committed
Game State, identified by Project Identity, Project Version, and Fondale's
format version. Stored data remains `unknown`; `startGame` validates it against
the current project before doing browser or Runtime Asset work.

A **Continuation State** is the browser-owned record that pairs the latest
compatible Save Snapshot with the Dialogue Provider session identity whose
Conversation and Reflection memory remains in PostgreSQL. Ordinary startup
offers Continue when that record is valid and New Game to replace it; the
Player does not create named saves or restore a historical state. Player
Preferences use separate browser storage and never enter either the Save
Snapshot or Continuation State.

An **Authoring Diagnostic** has stable code, family, and author-facing path.
Invalid definitions and external save data reject `startGame` with an
`AuthoringError`; environment, visual asset and Line audio checks happen only
after semantic validation succeeds.

See the [Game Project authoring guide](game-authoring.md) for complete current
examples, the [reference](reference.md) for precise fields, and the
[Support Baseline](support-baseline.md) for browser and input commitments.
