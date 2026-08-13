---
name: define-character
description: Define complete production-ready Fondale Characters, including project-scale visual design, Art Masters, Appearances, directional Animations, Visual Anchors, stable portrayal, CharacterDefinition authoring, and in-engine verification. Use for creating a Character, redesigning one, adding an Appearance or Animation, or bringing character artwork into a Game Project.
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

### 4. Create Art Masters and Animations

Follow [character-package.md](references/character-package.md). Create lossless
Art Masters for every confirmed Appearance and Animation. Keep frame dimensions,
proportions, lighting logic, and Visual Anchor stable. Derive fitted Runtime
Assets without overwriting Art Masters. Inspect strips and individual frames at
1:1 pixels and in motion. Preserve full RGB/RGBA colour and antialiased alpha by
default; palette reduction is a confirmed art-direction decision, not a routine
export step. Author and verify separate `left`, `right`, `front`, and `back` Art
Masters and Runtime strips as documented in
[character-package.md](references/character-package.md). The Engine selects
these presentations directly; it never mirrors or falls back between them.
For every Appearance, create an explicit looping `idle` Animation and assign it
to the Default Animation Role. When the Character design calls for a distinct
speaking performance, author a looping `speaking` Animation and assign it to
the Speaking Animation Role; otherwise document the intentional fallback to
Default.

Finish when every Animation loops or completes cleanly, every cue lands on the
intended action, and no Appearance jumps at its Visual Anchor.

### 5. Author and integrate

Create or update the `CharacterDefinition` using current public interfaces.
Author initial placement, facing, Appearance, movement speed, Animation Roles,
Noun, and stable portrayal. Preserve fields owned by `$define-dialogue`.
Coordinate initial Scene placement and Hotspot geometry through `$define-scene`
when they change.

Finish when every asset and semantic name resolves and every referenced
Appearance, Animation, cue, Scene, and Sequence remains valid.

### 6. Verify in the Engine

Build and run relevant browser verification. Inspect idle, walking, speaking,
and directed Animations in every required facing, at representative Perspective
Scales, and across Appearance changes. Exercise the Character's Hotspot and
Noun. Finish when all checks in
[character-package.md](references/character-package.md) hold at actual play size.

## Handoff

Report Art Masters, Runtime Assets, Character definition, scale sheet,
Animations and cues, Scene integration, verification, and explicitly deferred
dialogue work.
