# Fondale Scene package

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
   Scenery Baselines, and Perspective Scale stops.

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

- The Walkable Region is a valid non-self-intersecting polygon inside Scene
  Space.
- The Walkable Region is one broad connected surface without holes, using the
  fewest purposeful vertices and concavities needed by confirmed gameplay.
- Freestanding obstacles sit outside or on the boundary of the Walkable Region;
  the art does not imply collisions the navigation model cannot express.
- Representative routes between entrances, approaches, and focal areas remain
  wide, direct, and free of corner-grazing detours.
- Every Scene Entrance and Approach Point lies in or on the Walkable Region.
- Every Hotspot and Scene Passage has a valid in-bounds area.
- Scenery positions and Baselines remain inside the Scene Size.
- Perspective Scale stops are ordered by depth, use positive scales, and make
  Characters visually compatible with the painted perspective.
- Passage destinations and entrance names resolve within the Game Project.
- Debug geometry matches the final artwork rather than an earlier concept.

## Engine checks

- Validate the Scene with the current authoring diagnostics.
- Build the Game Project and run its relevant browser verification.
- Inspect at least one near, middle, and far Character placement.
- Exercise every entrance, passage, hotspot, and authored Scenery Appearance.
- Check foreground occlusion, camera limits, HUD-safe areas, and letterboxing at
  the supported display shapes.

Treat any failing item as incomplete production work, not a handoff caveat,
unless the user explicitly defers it.
