---
name: define-character
description: Define complete production-ready Fondale Characters, including project-scale visual design, Art Masters, Appearances, AutoSprite-delegated directional Animations, Visual Anchors, stable portrayal, CharacterDefinition authoring, and in-engine verification. Use for creating a Character, redesigning one, adding an Appearance or Animation, or bringing character artwork into a Game Project.
---

# Define Character

Produce one persistent Character whose visual identity, motion, portrayal, and
world definition remain coherent throughout the Game Project.

## Workflow

### 1. Inspect the Character system

Read `CONTEXT.md`, `docs/agents/visual-direction.md`, the current Character and
Animation interfaces, existing Character definitions, representative Scenes,
and the Game Project's Art Master and Runtime Asset conventions. For a
modification, inventory every Appearance, Animation, Visual Anchor, Sequence
reference, initial placement, Noun, and dialogue field before proposing change.

Own the Character's visual design, world definition, Noun, Biography,
Personality, and Voice. Preserve Dialogue Behavior, Dialogue State, Character
Knowledge, Cover Stories, Relationships, handoffs, and alternatives unless the
request also invokes `$define-dialogue`. Finish when the existing contract and
every decision gap are explicit.

### 2. Grill the Character brief

Invoke `$grilling`. Resolve narrative role, silhouette, proportions, costume,
stable portrayal, required Appearances, directional needs, Animations,
interaction role, initial placement, and preservation constraints. Find project
facts directly. Do not create production artifacts until the design-tree
frontier is empty and the user confirms the Character contract.

### 3. Establish scale and construction

Choose the project reference Character and preserve the established
Character-to-viewport ratio. Create a full-resolution height chart, silhouette,
turnaround, colour plan, Ground Point, and stable Visual Anchor. Test the design
inside representative near, middle, and far Scene compositions. Before deriving
Runtime Assets, calculate the displayed pixel height at every reachable
Perspective Scale and pass the native-resolution gate in
[character-package.md](references/character-package.md). Finish when anatomy,
costume landmarks, palette, and scale remain recognisable in every required
Facing and depth band, including distinct `left` and `right` presentations,
with no Runtime Asset enlarged by the Engine.

Store the four static Facing Art Masters in
`art/character/<character-name>/`, where `<character-name>` is the canonical
Character identifier used by the Game Project.

### 4. Approve Facings and delegate Animations to AutoSprite

Follow [character-package.md](references/character-package.md). Create one
lossless static Art Master for each `left`, `right`, `front`, and `back` Facing
of every confirmed Appearance in `art/character/<character-name>/`. Keep frame
dimensions, proportions, lighting,
costume construction, Ground Point, and Visual Anchor stable. Present the four
Facing images to the user and wait for explicit approval before starting any
Animation generation or spending AutoSprite credits.

After approval, give each authored Facing to AutoSprite as its own directional
reference. Delegate the complete motion synthesis, in-betweening, background
removal, and sprite-sheet generation to AutoSprite. Use AutoSprite's native
animation workflow and place its sprite-sheet output directly beside the owning
Character definition under the Game Project's `src/` tree. Do not
draw, generate, interpolate, duplicate, reorder for aesthetic purposes, or
retouch Animation frames outside AutoSprite. If identity, pose mechanics,
registration, equipment, timing, or loop continuity fails, revise the static
Facing or AutoSprite request and regenerate through AutoSprite.

Derive Runtime Assets only through lossless, deterministic layout adaptation
required by the current Fondale interfaces. This adaptation may unpack or
repack cells and record timing or provenance; it must preserve the pixels,
frame order, and motion returned by AutoSprite. Preserve full RGBA colour and
antialiased alpha by default. The Engine selects the four authored
presentations directly; it never mirrors or falls back between them.

For a Walking Animation, follow the AutoSprite delegation and acceptance gates
in [walk-cycle.md](references/walk-cycle.md). AutoSprite owns every locomotion
pose and transition; Fondale owns the contract, integration, and verification.

For every Appearance, create an explicit looping `idle` Animation and assign it
to the Default Animation Role. When the Character design calls for a distinct
speaking performance, author a looping `speaking` Animation and assign it to
the Speaking Animation Role; otherwise document the intentional fallback to
Default.

Finish when every Animation loops or completes cleanly, every cue lands on the
intended action, and no Appearance jumps at its Visual Anchor.

### 5. Author and integrate

Keep the approved AutoSprite sprite sheets beside their owning Game Project
definition under `src/` and create or update the `CharacterDefinition` using
current public interfaces. Register all four directional sheets, shared timing,
loop behavior, Animation Cues, Visual Anchor, and Animation Roles. Author initial
placement, facing, Appearance, movement speed, Noun, and stable portrayal.
Preserve fields owned by `$define-dialogue`. Coordinate initial Scene placement
and Hotspot geometry through `$define-scene` when they change.

Finish when every asset and semantic name resolves and every referenced
Appearance, Animation, cue, Scene, and Sequence remains valid. An AutoSprite
export left outside the Game Project is a draft, not a completed Character
Animation.

### 6. Verify in the Engine

Build and run relevant browser verification. Inspect idle, walking, speaking,
and directed Animations in every required facing, at representative Perspective
Scales, and across Appearance changes. Exercise the Character's Hotspot and
Noun. Finish when all checks in
[character-package.md](references/character-package.md) hold at actual play size.
For walking, capture or record uninterrupted travel in each required Facing and
apply every gate in [walk-cycle.md](references/walk-cycle.md). A still screenshot
cannot approve a walk cycle. If a gate fails, report the Animation as a draft and
iterate; never describe it as production-ready merely because it builds.

The Character task is complete only when the approved AutoSprite output plays
through the Game Project's `CharacterDefinition` in the Engine.

## Handoff

Report approved Facing Art Masters, AutoSprite identifiers and source exports,
Runtime Assets, Character definition, scale sheet, Animations and cues, Scene
integration, Engine verification, and explicitly deferred dialogue work.
