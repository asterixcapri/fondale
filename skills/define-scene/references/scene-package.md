# Fondale Scene package

## Contents

- [Deliverables](#deliverables)
- [Project scale contract](#project-scale-contract)
- [Separation rules](#separation-rules)
- [Background integration](#background-integration)
- [Scenery placement](#scenery-placement)
- [Character scale](#character-scale)
- [Asset checks](#asset-checks)
- [Geometry checks](#geometry-checks)
- [Engine checks](#engine-checks)

Use the current repository as the schema source of truth. Read `CONTEXT.md` for
the ubiquitous language and inspect the exported Scene interfaces before
writing definitions; do not rely on cached field lists in this reference.
Use `docs/public/game-authoring.md` and `docs/public/recipes/first-scene.ts` for
public authoring patterns. Reuse the target Game Project's adjacent Scene
modules, `art/scenes/` layout, and saved source or prompt notes as local visual
and packaging conventions.

For a Scene modification, begin with an impact inventory covering the existing
Art Masters, Runtime Assets, definition module, tests, inbound passages, shared
entities, and project registration. Preserve every item outside the confirmed
change contract.

## Project scale contract

Establish one scale contract for the Game Project before defining a Scene:

- Treat the Logical Resolution as the visible world viewport and the reference
  for composition, Character size, and UI legibility.
- Give a fixed Scene a Scene Size at least as large as the Logical Resolution.
  Make a scrolling Scene wider or taller; give its Runtime Background exactly
  the Scene Size. Let the Engine Camera reveal the larger Scene Space.
- Use a 1:1 mapping between Runtime Asset pixels and Scene Space units unless
  the Game Project explicitly defines a different asset pipeline.
- Calibrate Background architecture, Characters, Scenery, and in-Scene Object
  Appearances as one world scale. Use the reference Character as the ruler.
- Express positions, Baselines, Visual Anchors, Hotspots, Walkable Region,
  Approach Points, entrances, and passages in the same Scene Space.
- Use Perspective Scale only for depth within that world scale. Do not use it to
  repair an asset authored at the wrong project-wide size.
- Calibrate HUD, text, cursors, and Inventory Appearances against the Logical
  Resolution as a separate UI scale; do not apply Scene perspective to them.
- When Logical Resolution changes, inventory every world and UI asset and every
  authored coordinate before treating existing Scenes as compatible. Prefer
  deliberate redrawing and reauthoring over blind mechanical scaling.

The contract is complete when a reference Character, representative Scenery,
an in-Scene Object, and the HUD can be shown together at actual play size with
intentional and consistent proportions.

## Deliverables

A completed Scene package contains:

1. **Composition Art Master** — the accepted lossless visual target for the
   fully assembled Scene.
2. **Background Art Master** — the lossless visual base spanning the complete
   Scene Space, with separately rendered elements painted out cleanly.
3. **Scenery Art Masters** — aligned lossless transparent artwork for every
   Scene-local element requiring its own depth, position, behavior, Appearance,
   or Animation.
4. **Runtime Assets** — fitted and optimized files stored beside their owning
   Game Project definitions under `src/`.
5. **Scene definition** — TypeScript satisfying the current `SceneDefinition`
   interface and using canonical Fondale terms.
6. **Diagnostic artifact** — a labelled rendering of the Scene geometry,
   including Walkable Region, Hotspots, passages, entrances, Approach Points,
   Scenery bounds, footprints, positions, Baselines, Visual Anchors, and
   Perspective Scale stops at the exact Runtime Background dimensions.

Follow the target Game Project's layout when it already has one. In the Fondale
example convention, preserve Art Masters under `art/scenes/<scene-id>/` and put
Runtime Assets and `index.ts` under `src/scenes/<scene-id>/`.

## Separation rules

- Keep fixed architecture, terrain, sky, and decorative details in the
  Background when they require no independent depth or behavior.
- Separate an element as Scenery when it moves, animates, changes Appearance,
  participates in depth sorting, or must be positioned independently.
- Represent an interactive painted region with a background Hotspot when it
  does not need independent identity or artwork.
- Keep Characters and Objects in their owning Game Project registries. Place
  them into the Scene through their existing definitions rather than treating
  them as Scenery.
- Preserve transparent padding or record a Visual Anchor so every Scenery
  Appearance aligns without visual jumps.

## Background integration

- Design Background and Scenery first as one assembled composition. Separate
  them only after scale, perspective, overlap, lighting, and placement agree.
- Paint a complete clean plate behind every separated element. Removing a
  Scenery asset must reveal a plausible wall, floor, sky, or surrounding surface.
- Match local value, hue, saturation, edge softness, texture scale, and light
  direction across the separation boundary.
- Assign contact shadows according to lifecycle. Include a shadow in Scenery
  when it moves or disappears with the element; paint it into the Background
  only when it remains valid for every Appearance and state.
- Give every Appearance the same visual footprint, position, Baseline, and
  Visual Anchor unless a confirmed state change requires different geometry.
- Preserve intentional foreground overlaps and depth ordering without baking a
  Scenery element into unrelated Background pixels.
- Recompose every Appearance over the clean Background and compare it with the
  accepted Composition Art Master at actual play size.

## Scenery placement

- Establish placement in Scene Space before cropping or generating the isolated
  asset. Record visible bounds and ground contact on the full-Scene spatial plan.
- Derive `position`, `baseline`, and `visualAnchor` from that recorded placement;
  do not estimate them independently after asset generation.
- Use the union of every Appearance's visible bounds when reserving surrounding
  space and checking overlaps.
- Align each Scenery asset by its Visual Anchor, then verify its ground contact
  against the Background at 1:1 pixels.
- Keep blocking Scenery outside the Walkable Region or make its ground-contact
  footprint define part of the Region boundary. Do not place an apparent solid
  obstacle inside walkable ground.
- Verify intentional occlusion with Characters immediately in front of and
  behind the Scenery Baseline.

## Character scale

- Choose one existing Player Character as the project-wide reference and record
  its unscaled visible height, Ground Point, and Visual Anchor.
- Preserve the Game Project's established ratio when one exists. For a new
  visual system, begin with a reference height near one third of the Logical
  Resolution height at `Perspective Scale` 1, then confirm it from an actual
  Scene composition.
- For a `1280×720` Game Project using this starting ratio, test a reference
  Character around `240 px` tall at scale `1`; treat the value as an art-direction
  baseline rather than an Engine constant.
- Create near, middle, and far silhouettes by multiplying the reference asset
  height by the Scene's Perspective Scale at each Ground Point.
- Design doors, stairs, furniture, Scenery, clearances, and interaction distances
  around those silhouettes before generating final artwork.
- Keep Character Runtime Assets at their project-wide size. Use Perspective
  Scale for depth and change the shared assets only when deliberately changing
  the entire Game Project's character scale.

## Asset checks

- Background Runtime Asset dimensions equal the resolved Scene Size.
- Art Masters remain lossless and are not overwritten by optimized derivatives.
- Transparent assets have clean alpha without halos, matte fringes, or cropped
  shadows.
- Every Scenery Appearance shares a stable position, Baseline, and Visual Anchor.
- Recomposing Background and Scenery reproduces the accepted composition at the
  intended default state.
- Viewing the clean Background without Scenery reveals no holes, duplicate
  details, residual shadows, or painted fragments of the removed element.
- Every non-default Appearance preserves the Scene's perspective, illumination,
  material treatment, and surrounding occlusion.
- Animated assets keep framing, lighting, proportions, and anchor placement
  stable across frames.

## Geometry checks

- The diagnostic overlay, Runtime Background, and Scene Space share the same
  width, height, origin, and 1:1 coordinate system.
- Every coordinate comes from the final full-resolution artwork or authored
  geometry, never a thumbnail, scaled screenshot, or approximate visual guess.
- The Walkable Region is a valid non-self-intersecting polygon inside Scene
  Space.
- The Walkable Region is one broad connected surface without holes, using the
  fewest purposeful vertices and concavities needed by confirmed gameplay.
- Freestanding obstacles sit outside or on the boundary of the Walkable Region;
  the art does not imply collisions the navigation model cannot express.
- Representative routes between entrances, approaches, and focal areas remain
  wide, direct, and free of corner-grazing detours.
- Walkable boundaries follow the visible ground and are inset from solid forms
  enough to keep the widest required Character silhouette from clipping at the
  applicable Perspective Scale.
- Every required route has enough visual width for that Character, not merely
  enough mathematical width for its Ground Point.
- Reference Character silhouettes fit the Scene at every reachable depth without
  clipping architecture, Scenery, or the frame unintentionally.
- Every Scene Entrance and Approach Point lies in or on the Walkable Region.
- Every Hotspot and Scene Passage has a valid in-bounds area.
- Scenery positions and Baselines remain inside the Scene Size.
- Every Scenery visible bound, ground contact, position, Baseline, and Visual
  Anchor agrees between the spatial plan, isolated asset, recomposition, and
  TypeScript definition.
- Perspective Scale stops are ordered by depth, use positive scales, and make
  Characters visually compatible with the painted perspective.
- Passage destinations and entrance names resolve within the Game Project.
- Debug geometry matches the final artwork rather than an earlier concept.

## Engine checks

- Validate the Scene with the current authoring diagnostics.
- Build the Game Project and run its relevant browser verification.
- Inspect at least one near, middle, and far Character placement.
- Compare each rendered placement against the corresponding reference silhouette
  in the diagnostic overlay.
- Exercise every entrance, passage, hotspot, and authored Scenery Appearance.
- Check foreground occlusion, camera limits, HUD-safe areas, and letterboxing at
  the supported display shapes.

Treat any failing item as incomplete production work, not a handoff caveat,
unless the user explicitly defers it.
