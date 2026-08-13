---
name: define-scene
description: Define complete production-ready Fondale Scenes, including illustrated neo-retro Art Masters, Background and Scenery Runtime Assets, Scene Space geometry, interactions, TypeScript definitions, and in-engine visual verification. Use for creating a new Scene, modifying an existing Scene, or turning a location brief or concept image into integrated Game Project content.
---

# Define Scene

Produce a playable Scene as one coherent stage. Treat composition, traversable
space, interactive content, separated artwork, and authoring data as one design
problem.

## Workflow

### 1. Inspect the project and the existing Scene

Read the Game Project, `CONTEXT.md`, and the current Fondale Scene types before
authoring. Also inspect `docs/public/game-authoring.md`,
`docs/public/recipes/first-scene.ts`, adjacent Scene modules, existing Art
Masters, and any saved generation prompts that bear on the location.

For a new Scene, identify the conventions it must join. For a modification,
inspect the current Scene in the Engine and inventory its definitions, artwork,
geometry, tests, inbound passages, and downstream references before proposing a
change. Identify:

- the Scene's narrative purpose and dominant mood;
- required characters, Objects, Scenery, interactions, entrances, and passages;
- the project's Logical Resolution and the intended Scene Size;
- the navigation budget: broad routes, unavoidable obstacles, and the simplest
  Walkable Region that can support the required play;
- existing character proportions, runtime asset conventions, and visual
  continuity with adjacent Scenes;
- persistent Scenery Appearances and short ambient Animations required by play.

Find repository facts directly; reserve questions for decisions. Finish when
the current state, project conventions, and decision gaps are explicit.

### 2. Grill the Scene brief

Invoke `$grilling` and interview the user with a design tree before
fixing the Scene contract. Ask the whole currently unblocked frontier in each
round, number every question, and provide a recommended answer. Cover narrative
purpose, connectivity, interactions, persistent states, composition, mood,
lighting, colour, scale, animation, navigation simplicity, obstacle placement,
and preservation constraints.

For a modification, seed the tree from the inspected Scene and ask about the
intended delta, invariants, compatibility, and acceptable asset regeneration.
Keep settled parts out of the frontier. Do not create or modify production
artifacts until the user confirms the shared understanding. Finish when the
design-tree frontier is empty and the user has confirmed the resulting Scene
contract.

### 3. Block the playable stage

Design the Scene in Scene Space before generating finished art. Establish the
camera framing, depth bands, Walkable Region, Perspective Scale, focal areas,
Approach Points, Scene Entrances, Scene Passages, and HUD-safe composition.
Reserve clear silhouettes for interactive targets and enough negative space for
Characters to move and speak without covering essential information.

Create a full-Scene spatial plan at the exact Runtime Background dimensions.
For every planned Scenery element, record its Scene Space visible bounds,
ground-contact footprint, position, Baseline, Visual Anchor, maximum extent
across Appearances, depth role, and Approach Point. Measure coordinates on this
1:1 plan, never on a resized preview or an image-generation approximation.

Make navigation-first composition the default. Design one broad connected
walking surface expressible as a simple polygon with the fewest purposeful
vertices. Place furniture, columns, rocks, vegetation, and other blocking forms
outside it or along its boundary. Avoid isolated floor obstacles, narrow
channels, unnecessary concavities, and decorative geometry that forces a
complicated route. Add complexity only when it carries confirmed gameplay.

Create a labelled 1:1 geometry SVG over the blocking image. Show the Walkable
Region, Scenery bounds and footprints, Baselines, Visual Anchors, Perspective
Scale stops, Hotspots, Approach Points, Scene Entrances, and Scene Passages.
Finish when every required point and polygon has an exact coordinate and
representative routes remain direct, wide, and visually obvious.

### 4. Create the composition Art Master

Read [art-direction.md](references/art-direction.md) in full. Generate a complete
composition at the final Scene aspect ratio and inspect the actual image. Iterate
on staging, value structure, palette, depth, and character readability before
separating assets. Compose every planned Scenery element in place so its scale,
perspective, overlap, lighting, contact, and negative space are solved together
with the Background. Keep geometry stable after accepting the composition.

Finish when the composition satisfies every art-direction check and supports the
blocked gameplay at actual play size. Then align the spatial plan to the final
artwork, correct every boundary and Scenery measurement that changed, and freeze
the geometry before asset separation.

### 5. Separate production artwork

Read [scene-package.md](references/scene-package.md) in full. Classify every
visible element as Background or Scenery according to the Fondale domain model.
Using the accepted composition as the visual reference:

1. Produce a clean Background Art Master with removable elements painted out.
2. Produce aligned transparent Art Masters for each Scenery Appearance.
3. Produce consistent frames or sheets for required ambient Animations.
4. Derive fitted Runtime Assets without modifying the Art Masters.

Inspect seams, transparency, dimensions, lighting, contact shadows, and
alignment by recomposing every Scenery Appearance over the clean Background.
Also inspect the clean Background alone so removed Scenery leaves a complete,
plausible surface. Finish only when each recomposition matches the accepted
composition and every stateful or depth-sensitive element is independently
usable at the exact position recorded in the spatial plan.

### 6. Author the playable Scene

Create or update the Game Project's Scene module using the current public
interfaces. Author the Background, Scene Size, Walkable Region, Perspective
Scale, Scenery, Hotspots, Approach Points, Scene Entrances, Scene Passages, and
required Arrival Sequences. Keep narrative rules in the owning Game Project
definitions rather than encoding them into artwork.

Update the 1:1 diagnostic overlay from the authored values and render it over
the final recomposed Scene. Finish when it agrees with the spatial plan, every
Scenery asset lands on its intended pixel and ground contact, every visual target
maps to the intended definition, and every authored coordinate lies inside its
valid bounds.

### 7. Verify in the Engine

Run the narrowest available validation, build, and browser verification. Inspect
the Scene in the Engine with representative Characters at the near, middle, and
far depth bands. Exercise every passage, entrance, approach, hotspot, Appearance,
occlusion boundary, and camera edge.

Iterate on art and authoring together when a failure crosses the seam. Finish
when the project builds, relevant verification passes, all package checks in
[scene-package.md](references/scene-package.md) hold, and the Scene remains
readable during actual play.

## Handoff

Report the created Art Masters, Runtime Assets, Scene definition, diagnostic
artifact, verification performed, and any explicitly deferred authored content.
Do not call a concept image or an unverified composite a completed Scene.
