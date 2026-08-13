---
name: define-object
description: Define complete production-ready Fondale Objects, including project-scale Art Masters, Scene Appearances, Inventory Appearance, Animations, Visual Anchors, collectible lifecycle, Noun interactions, ObjectDefinition authoring, Scene integration, and in-engine verification. Use for creating an Object, redesigning one, adding states or animations, or changing how an inventory item is collected, used, given, or consumed.
---

# Define Object

Produce one persistent collectible Object whose world presentation, Inventory
presentation, interactions, and lifecycle remain coherent.

## Workflow

### 1. Inspect the Object lifecycle

Read `CONTEXT.md`, `docs/agents/visual-direction.md`, current Object, Animation,
Interaction, and Game Operation interfaces, the target Scenes, existing Objects,
Inventory settings, and relevant Sequences. For a modification, trace every
Appearance, location, Hotspot, Noun case, operation, and reference.

Finish when the current lifecycle—Scene, Inventory, or consumed—and every
decision gap are explicit.

### 2. Grill the Object brief

Invoke `$grilling`. Resolve narrative purpose, initial location, collection,
world states, Inventory presentation, uses, targets, giving, consumption,
feedback, Animations, and preservation constraints. Find project facts directly.
Do not create production artifacts until the frontier is empty and the user
confirms the Object contract.

### 3. Design both presentation scales

Follow `docs/agents/visual-direction.md` and
[object-package.md](references/object-package.md). Design Scene Appearances in
the project world scale around their Ground Point and Visual Anchor. Design the
Inventory Appearance independently in the project UI scale and at the declared
Inventory Appearance Size. Preserve identity through silhouette, palette, and
distinctive details rather than pixel reuse.

Finish when the Object is recognisable both in the Scene and Inventory at actual
play size.

### 4. Create assets and interactions

Create lossless Art Masters for every confirmed Scene Appearance, Animation,
and Inventory Appearance; derive fitted Runtime Assets. Author the Noun's labels,
verbs, cases, fallbacks, responses, Sequences, and explicit Game Operations.
Keep Animation separate from lasting Appearance and location changes.

Finish when every interaction has a visible or textual outcome and every state
transition is explicit.

### 5. Author and integrate

Create or update the `ObjectDefinition`. Coordinate placement, Hotspot,
Perspective Scale, Approach Point, and occlusion through `$define-scene` when
they change. Validate all object references in Sequences and interactions.

Finish when the initial location is valid, world and Inventory assets resolve,
and collection, use, giving, Appearance changes, and consumption reach only
valid states.

### 6. Verify in the Engine

Build and run relevant browser verification. Inspect every Scene Appearance at
representative depth, collect the Object, page and select it in Inventory,
exercise every supported target and fallback, and verify terminal consumption.
Finish when every check in [object-package.md](references/object-package.md)
holds.

## Handoff

Report Art Masters, Runtime Assets, Object definition, lifecycle, interactions,
Scene integration, verification, and deferred combinations.
