# Concepts

An **Engine** is the reusable Fondale runtime. An **Author** supplies a
**Game Project**: immutable settings, named **Game Definitions**, local assets,
a **Command Lexicon**, Command fallbacks and a **HUD Theme**. A **Player**
controls one isolated **Game Session**.

Every committed fact belongs to the session's canonical **Game State**.
Fondale evolves it through validated, atomic **Game Operations**. Rendering,
loaded textures, screen coordinates, and animation frames are derived and do
not become canonical state. A **Game Activity** is the single dominant piece
of progress: a replaceable Player Intent, a direct Line, or a modal Sequence.

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

An **Object** exists in exactly one place: a Scene, the acquisition-ordered
**Inventory**, or terminal consumption. A Command combines one semantic
**Verb** with one or two Nouns; **Walk To** remains implicit. Ordered
**Command Case** values resolve specific outcomes, then local and global
fallbacks guarantee visible feedback. A **Sequence** is a finite, modal path
of Character-bound Lines, explicit Narrations, Choices, branches, operation
groups, and directed steps. One directed step may start concurrent
**Animation**, **Motion**, and Camera directions and waits for every finite
boundary. An **Appearance** owns named Animations and semantic default,
speaking, and walking **Animation Roles**; only the selected Appearance is
persistent. **Animation Cues** coordinate directions without callbacks. A
direct Line or neutral Command Response may also conclude one Command without
introducing a one-step Sequence.

The Camera projects world input, Character speech and revealed Hotspots between
Scene Space and the viewport. The Engine owns the semantic HUD:
pointer-following Contextual Actions, the
Inventory trigger and drawer, Choices, Options, Help and Save/Load. A Noun's
Preferred Verb supplies the primary action, while optional Secondary and
Selected Object Verbs control the right mouse button and Object-first Commands.
The project-owned HUD Theme may choose local font and cursor assets, colours,
opacity and speech styling, but cannot rearrange those controls.

A **Save Snapshot** is an inspectable JSON-safe copy of the latest committed
Game State, identified by Project Identity, Project Version, and Fondale's
format version. Stored data is always `unknown` until `validateSaveSnapshot`
returns a validated value.

An **Authoring Diagnostic** has stable code, family, and author-facing path.
Definitions fail at helpers or `defineGame`; external save data returns an
explicit result; environment, visual asset and Line audio checks happen
asynchronously at startup.

See the [Game Project authoring guide](game-authoring.md) for complete current
examples, the [reference](reference.md) for precise fields, and the
[Support Baseline](support-baseline.md) for browser and input commitments.
