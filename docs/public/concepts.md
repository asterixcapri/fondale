# Concepts

An **Engine** is the reusable Fondale runtime. An **Author** supplies a
**Game Project**: immutable settings, named **Game Definitions**, PNG assets,
and exceptional synchronous **Game Behaviors**. A **Player** controls one
isolated **Game Session**.

Every committed fact belongs to the session's canonical **Game State**.
Fondale evolves it through validated, atomic **Game Operations**. Rendering,
loaded textures, screen coordinates, and animation frames are derived and do
not become canonical state. A **Game Activity** is the single dominant piece
of progress: either a replaceable Player Intent or a modal Sequence.

A **Scene** fills the fixed Logical Resolution. Its **Scene Space** has its
origin at the top-left. A Character's **Ground Point**, a Scenery **Baseline**,
and optional **Perspective Scale** determine composition. A Walkable Region
governs movement; a Hotspot adds an Approach Point and an Interaction.

An **Object** exists in exactly one place: a Scene, the acquisition-ordered
**Inventory**, or terminal consumption. A selected Object changes a Hotspot
from Primary Action to Inventory Use. A **Sequence** is a finite, modal path of
Lines, Choices, branches, and operation groups.

A **Save Snapshot** is an inspectable JSON-safe copy of the latest committed
Game State, identified by Project Identity, Project Version, and Fondale's
format version. Stored data is always `unknown` until `validateSaveSnapshot`
returns a validated value.

An **Authoring Diagnostic** has stable code, family, and author-facing path.
Definitions fail at helpers or `defineGame`; external save data returns an
explicit result; environment and PNG checks happen asynchronously at startup.

See the [reference](reference.md) for precise fields and the
[Support Baseline](support-baseline.md) for browser and input commitments.
