# Fondale — Scrolling Camera

Status: resolved

## Problem Statement

Fondale currently makes every Scene exactly the same size as the Game
Project's Logical Resolution. The Background, Walkable Region, Hotspots,
Passages, entrances, Scenery, Characters, and Objects must all remain inside
that visible rectangle. This prevents an Author from building one continuous
location that is wider or taller than the screen.

For the Player, a long dock, rising path, tower, or panoramic street must
therefore be compressed into one fixed composition or divided into several
Scene transitions. Neither result evokes the continuous exploration of classic
scrolling adventure locations such as the Mêlée Island docks or the rooms of
Thimbleweed Park. Capri 1535 cannot let Michele walk through a broad landscape
while the view follows him, even though Camera movement is one of the Engine
Capabilities required before Fondale reaches a stable release.

The fixed-camera assumption is present in several parts of the current
contract. Logical Resolution describes both the visible frame and the complete
Scene Space; Background assets must match it exactly; Game Project composition
validates all Scene geometry against it; pointer input maps the canvas directly
to it; and world-anchored overlays assume Scene Space and the visible frame are
identical. Camera scrolling must separate these meanings without disturbing
the Core's deterministic movement, pathfinding, Command resolution, or Save
Snapshot model.

## Solution

Fondale separates the dimensions of the visible logical frame from the
dimensions of a Scene. Logical Resolution remains the fixed viewport in which
the Engine renders the game and its HUD before uniform display scaling and
letterboxing. A Scene may additionally declare a two-dimensional Scene Size.
Scene Size defaults to the Logical Resolution, so every existing Game Project
retains its current fixed-camera behavior without migration.

A Scene Size may be wider, taller, or larger on both axes than the Logical
Resolution. Its Background covers the complete Scene Space and must match the
declared Scene Size exactly. All authored Scene geometry continues to use
Scene Space coordinates, now validated against Scene Size rather than the
viewport.

When the current Scene is larger than the viewport and contains the Player
Character, the Engine derives a Camera that follows that Character. The Player
Character may move within a narrow central Follow Region before the Camera
target moves. Camera motion catches up smoothly, without overshoot or
oscillation, and is clamped so the viewport never exposes space outside the
Scene. The internal Camera may retain subpixel precision while the world is
translated by whole logical pixels to keep pixel art crisp.

The Camera works on both axes. Capri 1535 first exercises the full behavior in
a playable coastal-fortification Scene derived from its existing art master:
Michele follows the rising path toward the tower while the Camera scrolls
vertically and diagonally. A controlled Engine fixture separately isolates
horizontal following in the style of a long dock.

Camera position is transient presentation state, not canonical Game State.
Entering a Scene, restoring a Save Snapshot, or discontinuously relocating the
Player Character positions the Camera immediately around the resulting Ground
Point before the Scene is presented. Ordinary walking uses smooth following.
The Camera is not serialized, remembered independently for each Scene, or
allowed to change logical outcomes.

The PixiJS world is translated by the Camera while the Engine-owned HUD remains
fixed in the Logical Resolution. Pointer coordinates are projected through the
current Camera before Core hit testing. Character speech and revealed Hotspots
are projected from Scene Space into the viewport; Inventory, Choices, Command
Responses, modals, and the pointer-following Command Preview remain fixed to
the viewport. A Line from another Character does not take Camera control away
from the Player Character.

## User Stories

1. As a Player, I want to walk through one continuous panoramic Scene, so that a long location feels like one place rather than several loading cuts.
2. As a Player, I want the Camera to follow the Player Character, so that I can continue exploring beyond the initial frame.
3. As a Player, I want horizontal Camera scrolling, so that docks, streets, and shorelines can extend naturally across the landscape.
4. As a Player, I want vertical Camera scrolling, so that towers, stairs, cliffs, and rising paths can reveal their height.
5. As a Player, I want diagonal Camera scrolling, so that a path may traverse a Scene freely rather than following one screen axis.
6. As a Player, I want the Player Character to move within a central Follow Region before the Camera reacts, so that the view does not twitch with every step.
7. As a Player, I want Camera movement to accelerate and settle smoothly, so that exploration has the considered feel of a modern classic adventure.
8. As a Player, I want Camera movement to avoid overshoot and oscillation, so that the view feels controlled rather than floating.
9. As a Player, I want the Camera to stop at the Scene's edges, so that letterbox colour or unpainted world space is never exposed.
10. As a Player, I want the Player Character to walk away from the centre when the Camera reaches an edge, so that every reachable point remains accessible.
11. As a Player, I want pixel art to remain crisp while the Camera moves, so that smooth following does not introduce texture blur or subpixel shimmer.
12. As a Player, I want a Scene to appear at the correct Camera position immediately after entry, so that I do not watch the Camera travel from an unrelated origin.
13. As a Player, I want a restored game to frame the Player Character immediately, so that Save and Load never reveal a stale view.
14. As a Player, I want an instantaneous Character relocation to reposition the Camera immediately, so that a teleport is not mistaken for a long pan.
15. As a Player, I want ordinary walking after a relocation to resume smooth Camera following, so that only discontinuous movement snaps.
16. As a Player, I want clicking visible ground after scrolling to move the Character to the corresponding Scene point, so that input remains spatially trustworthy.
17. As a Player, I want clicking a visible Hotspot after scrolling to activate that exact target, so that the Camera offset never changes Command meaning.
18. As a Player, I want right-click and double-click interactions to use the scrolled Scene coordinates, so that every supported pointer action remains consistent.
19. As a Player, I want passage cursors and contextual actions to match the target under the pointer after scrolling, so that navigation remains readable.
20. As a Player, I want the Command Preview to remain beside the pointer, so that world scrolling does not pull HUD feedback away from my input.
21. As a Player, I want Character speech to remain visually attached to its visible speaker, so that dialogue follows the Character through a scrolling Scene.
22. As a Player, I want Character speech to remain clamped to the readable viewport area, so that text is not cut off at Scene edges.
23. As a Player, I want revealed Hotspots to align with their visible world regions after scrolling, so that accessibility help remains accurate.
24. As a Player, I want revealed Hotspots outside the viewport to remain clipped, so that offscreen geometry does not cover the HUD or letterbox.
25. As a Player, I want Inventory, Choices, Options, Help, Save, and Load to remain fixed on screen, so that Camera movement never displaces controls.
26. As a Player, I want Command Responses and Narrations to retain their viewport placement, so that reading zones remain predictable while the world moves.
27. As a Player, I want dialogue from another Character to leave the Camera following the Player Character, so that speech does not cause an unsolicited cinematic pan.
28. As a Player, I want perspective scaling and visual depth to remain based on Scene Space, so that scrolling does not change a Character's apparent place in the world.
29. As a Player, I want Characters, Objects, and Scenery to preserve their occlusion order while scrolling, so that world composition remains believable.
30. As a Player, I want existing fixed-size Scenes to look and behave exactly as before, so that Camera support does not alter completed locations.
31. As a Player, I want letterboxing and integer display scaling to remain stable, so that a larger Scene does not change the physical size of the viewport.
32. As a Player, I want Save Snapshots to remain compatible with transient Camera movement, so that presentation state does not invalidate progress.
33. As a Player, I want Michele to climb toward Capri's coastal fortification while the Camera reveals the tower, so that the new capability is demonstrated by an authentic game location.
34. As an Author, I want to declare a Scene Size independently of Logical Resolution, so that the complete Scene may exceed the visible viewport.
35. As an Author, I want Scene Size to support width and height, so that one interface covers horizontal, vertical, and diagonal locations.
36. As an Author, I want omission of Scene Size to preserve the Logical Resolution default, so that existing Scene definitions need no migration.
37. As an Author, I want Scene Size dimensions to be positive integers no smaller than the Logical Resolution, so that the viewport always fits inside the Scene.
38. As an Author, I want the Background to match Scene Size exactly, so that Fondale never stretches, crops, or guesses the extent of Scene Space.
39. As an Author, I want Walkable Regions and other Scene geometry validated against Scene Size, so that panoramic coordinates are accepted and out-of-bounds coordinates remain actionable errors.
40. As an Author, I want Character and Object Ground Points validated against the complete Scene Space, so that persistent entities may begin outside the first Camera frame.
41. As an Author, I want entrances and Approach Points anywhere inside Scene Size, so that interactions and transitions can use the complete location.
42. As an Author, I want Perspective Scale stops to use the Scene's full vertical range, so that depth composition remains available in tall Scenes.
43. As an Author, I want asset diagnostics to report the declared Scene Size, so that an incorrectly exported panoramic Background is easy to correct.
44. As an Author, I want Camera following to work automatically in an oversized Scene, so that ordinary locations need no Camera script.
45. As an Author, I want one coherent Engine-owned following behavior, so that I do not tune dead zones and easing for every Scene.
46. As an Author, I want a Game Project without a visible Player Character to retain a deterministic initial view, so that non-player Scenes do not acquire undefined Camera state.
47. As an Author, I want Lines and Sequences to leave Camera ownership unchanged, so that dialogue authoring does not implicitly direct the view.
48. As an Author, I want public documentation to distinguish Scene Size from Logical Resolution, so that I can reason correctly about world coordinates, viewport coordinates, and assets.
49. As an Author, I want the public interface to describe Camera following without exposing PixiJS, so that my Game Project remains renderer-independent.
50. As a Maintainer, I want Camera state to remain outside canonical Game State, so that Core determinism and Save Snapshot validation remain unchanged.
51. As a Maintainer, I want Core movement, pathfinding, hit testing, and Command resolution to continue using Scene Space, so that Camera support remains a presentation concern.
52. As a Maintainer, I want one Scene-to-viewport projection owned by the browser renderer, so that world drawing, pointer input, speech, and diagnostics cannot disagree about the Camera offset.
53. As a Maintainer, I want the existing world container to move as one composition, so that Background, Scenery, Objects, and Characters share one Camera transform.
54. As a Maintainer, I want the existing Engine overlay to remain outside the world transform, so that fixed HUD behavior is obtained without compensating transforms in every control.
55. As a Maintainer, I want Camera presentation to settle independently of logical outcomes, so that frame rate cannot change movement destinations, interactions, or saved progress.
56. As a Maintainer, I want whole-logical-pixel rendering with internal smooth state, so that Camera motion can be eased without sacrificing the pixel profile.
57. As a Maintainer, I want fixed-size Scene tests to remain valid, so that backward compatibility is demonstrated rather than assumed.
58. As a Maintainer, I want scrolling tested through public Game Projects and `startGame`, so that tests survive internal renderer refactors.
59. As a Maintainer, I want Camera bounds, projection, and input covered without a public Camera inspection interface, so that a test convenience does not become product surface.
60. As a Maintainer, I want Capri 1535 and controlled fixtures to exercise the same Engine Capability, so that the implementation is both isolated and proven by a real game.

## Implementation Decisions

- Logical Resolution retains its current Game Project field and remains the
  fixed dimensions of the logical viewport, Engine overlay, output canvas, and
  uniformly scaled frame.
- The domain adds Scene Size: the positive-integer width and height of a
  Scene's complete Scene Space. It is distinct from display-target dimensions
  and from the Logical Resolution.
- A Scene accepts an optional Scene Size. Omission resolves to the Game
  Project's Logical Resolution during composition and preserves the current
  one-frame Scene contract.
- Each Scene Size axis must be at least the corresponding Logical Resolution
  axis. Smaller Scenes are invalid authoring rather than implicitly centred,
  tiled, stretched, or padded.
- The Background is the visual base of the complete Scene Space and must have
  the exact Scene Size. Asset loading reports the expected Scene dimensions in
  its diagnostic.
- Game Project composition validates Walkable Regions, Perspective Scale
  stops, Hotspots, Passage areas, Approach Points, entrances, Scenery
  positions and Background Region Appearances against Scene Size.
- Initial and operation-authored Character and Object Ground Points are
  validated against the destination Scene Size and their existing walkability
  rules.
- The Camera is an internal browser-renderer module with a small internal
  interface: it receives the viewport size, Scene Size, current Player
  Character Ground Point, and whether the position change is continuous; it
  returns the clamped Scene Space origin currently displayed by the viewport.
- Camera position is derived presentation state. It is absent from Game State,
  Core effects as a logical fact, Game Operations, Save Snapshots, validated
  save data, and the public Game Session interface.
- The Camera follows the Game Project's Player Character when that Character
  is present in the current Scene. An oversized Scene without a visible Player
  Character uses the clamped Scene origin and does not invent another follow
  target.
- The Player Character may move inside a narrow central Follow Region before
  the Camera target changes. The Engine owns the Follow Region and easing
  constants; the first capability exposes no Game Setting or per-Scene tuning.
- Camera motion approaches its target smoothly and monotonically. It may lag
  behind ordinary walking but does not overshoot, oscillate, or continue
  drifting after reaching the target.
- Camera bounds are derived independently on both axes. An axis whose Scene
  Size equals the Logical Resolution remains at origin; a larger axis clamps
  between zero and Scene Size minus Logical Resolution.
- Entering a Scene, starting or restoring a Game Session, and discontinuously
  relocating the Player Character snap the Camera to the correct clamped
  target before the resulting Scene is presented. Ordinary walking uses the
  smooth path.
- The Camera retains sufficient internal precision for smooth easing, while
  the world transform is rounded to whole logical pixels before rendering.
  Existing nearest-neighbour texture scaling and integer display scaling
  remain unchanged.
- Background, Background Region Scenery, static Scenery, Objects, Characters,
  and their depth ordering remain under one translated world container.
  Perspective Scale and z-order continue to use unprojected Scene Space `y`.
- The Engine overlay remains fixed to Logical Resolution and is not placed
  inside the Camera transform.
- Pointer projection has two explicit internal values: the viewport point used
  for pointer-following HUD placement and the Scene Space point obtained by
  adding the current Camera origin. Core hit testing and movement receive the
  Scene Space point.
- Left-click, right-click, double-click, hover, Passage cursor selection and
  contextual action resolution all use the same Scene Space projection.
- The Command Preview follows the pointer in viewport coordinates and retains
  its existing viewport clamping.
- Character Lines project the visible speaker's rendered position into the
  viewport and retain existing safe-area clamping. Lines do not select a new
  Camera target or pan toward a different speaker.
- Hotspot reveal geometry is projected through the Camera and clipped to the
  viewport. Offscreen Scene geometry is not drawn into the overlay.
- Inventory, Choices, Command Responses, Narrations, Options, Help, Save and
  Load retain their existing viewport-owned layout and input semantics.
- Scene transitions, Core movement, navigation paths, Command resolution,
  Game Activities and fixed-step logical time retain their existing semantics.
  Camera movement cannot delay or complete a logical activity.
- Existing Game Projects and Saves require no migration. A Scene without a
  declared Scene Size renders from origin exactly as it did before this
  capability.
- The public interface does not expose Camera coordinates, Camera commands,
  renderer callbacks, PixiJS objects, or a method for selecting a follow
  target.
- The ubiquitous language and public documentation are updated so Logical
  Resolution names the viewport, Scene Size names the full Scene Space extent,
  and Camera names the derived view of Scene Space.
- The architectural record that originally excluded Camera movement is
  superseded or amended explicitly. The deep browser renderer seam and the
  separation between canonical state and presentation remain in force.
- Capri 1535 adds a playable coastal-fortification Scene derived from the
  existing approved master. Its Walkable Region rises toward the tower and is
  large enough on both axes to demonstrate vertical and diagonal Camera
  following.
- A controlled browser fixture supplies a wide, viewport-height Scene with
  high-contrast landmarks so horizontal following, edge clamping and pointer
  projection can be verified independently of Capri content.

## Testing Decisions

- The primary testing seam is the public browser entry point. Browser tests
  author a Game Project through the package root, start it through `startGame`,
  provide player input, and observe the rendered canvas, overlay and committed
  gameplay results. They do not instantiate or inspect the internal Camera.
- Public authoring tests exercise Scene Size through `defineScene` and
  `defineGame`. They cover positive integers, omission, dimensions equal to the
  Logical Resolution, one larger axis, two larger axes, and rejection of an
  axis smaller than the viewport.
- Authoring diagnostics cover every existing Scene geometry family against an
  oversized Scene: Walkable Region, Perspective Scale, Scenery, Background
  Region Appearance, Hotspot, Passage, Approach Point, entrance, Character
  Ground Point, Object Ground Point and operation-authored placement.
- Asset-startup tests accept a Background matching Scene Size and reject a
  Background matching only Logical Resolution or otherwise differing from the
  declared Scene Size. Diagnostics state both actual and expected dimensions.
- Existing public-interface tests are prior art for immutable definition
  copying, aggregated diagnostics, Scene Space bounds and package-root type
  exposure.
- A controlled horizontal fixture uses a Background with distinct landmarks
  and a Walkable Region spanning beyond the viewport. Canvas observations
  prove that the world moves through intermediate whole-pixel positions,
  settles without overshoot and clamps at both horizontal edges.
- A controlled vertical or two-axis fixture proves the same bounds and
  following behavior on `y`, including diagonal Player movement and a Scene
  whose one axis exactly equals the viewport.
- Camera motion is tested through visible landmarks and entity pixels rather
  than an internal coordinate property or a test-only public interface.
  Assertions tolerate the internal easing curve while requiring monotonic
  approach, eventual settling, whole-pixel drawing and no exposed world void.
- Input tests scroll away from origin before hovering and activating known
  ground, Hotspots and Passages. The observed Player destination, Command
  response or Scene transition proves that viewport points were projected to
  the correct Scene Space coordinates.
- Input coverage includes left click, contextual right click, double-click
  fast movement and pointer hover after scrolling.
- Overlay tests prove that the Command Preview remains beside the viewport
  pointer, Character speech follows a visible moving speaker, revealed Hotspot
  polygons track and clip with the world, and Inventory, Choices, lower text
  and modals do not move with the Camera.
- Composition tests place Character, Object and Scenery landmarks across the
  scrolling Scene and prove that perspective size, Background Region masks and
  depth ordering are unchanged by Camera translation.
- Lifecycle tests cover initial startup, Scene entry from opposite entrances,
  Save Snapshot restoration and an instantaneous Player relocation. The first
  visible frame uses the correct snapped Camera, while subsequent ordinary
  walking follows smoothly.
- Persistence tests compare Save Snapshots before and after Camera motion and
  prove that Camera position adds no field and changes no canonical value.
- A Scene without a Player Character has a deterministic origin view. A Line
  from a non-player Character does not move the Camera away from the Player
  Character.
- Existing fixed-size browser fixtures and Capri Scenes remain regression
  coverage for exact origin rendering, world input, HUD layout, pixel scaling,
  letterboxing and Save/Load compatibility.
- Capri acceptance adds the coastal-fortification Scene to the playable
  project and walks Michele along its rising route. Screenshots at the lower
  approach, during the ascent and near the tower provide visual proof of
  vertical and diagonal scrolling on production art.
- Capri acceptance exercises at least one world interaction after the Camera
  has moved, ensuring that the example proves projection as well as visual
  panning.
- The complete package build, browser verification and Capri example build and
  acceptance suite remain the release gate. No new public Camera inspection
  seam is introduced solely for tests.

## Out of Scope

- Author-controlled Camera pans, cinematic framing, cutscene Camera paths or
  Sequence steps that direct the Camera.
- Selecting a follow target other than the Player Character or automatically
  panning to whichever Character is speaking.
- Edge scrolling driven by pointer position, keyboard Camera controls, drag
  panning, free-look or manual Camera input.
- Camera zoom, rotation, shake, parallax layers, split screen, multiple
  simultaneous Cameras or minimaps.
- Look-ahead based on Character facing or velocity, elastic overshoot and
  configurable inertia.
- Public or per-Scene Camera tuning for Follow Region, acceleration, speed,
  damping, pixel snapping or bounds.
- Persisting Camera position, remembering a separate view for each Scene or
  changing the Save Snapshot format for presentation state.
- Scenes smaller than the Logical Resolution, implicit centring of small
  Backgrounds, Background tiling, streaming, chunking or progressive loading.
- A new panoramic dock asset for Capri 1535. The isolated horizontal fixture
  establishes dock-like behavior while the existing coastal-fortification art
  provides the production example.
- Replacing the current navigation polygon, supporting multiple Walkable
  Regions or adding dynamic navigation obstacles.
- Changing Scene Passage semantics, Command resolution, Game Activities,
  Perspective Scale semantics, depth ordering or the Engine-owned HUD layout.
- Exposing PixiJS, renderer callbacks, Camera coordinates or internal
  projection helpers through the public package.

## Further Notes

- The existing Core already treats movement, pathfinding and hit testing as
  Scene Space operations. The main change is separating Scene bounds from
  viewport bounds and projecting the browser renderer and input consistently.
- The existing renderer already groups the complete world separately from the
  DOM overlay, providing the intended deep seam for one Camera transform.
- [ADR-0005](../../docs/adr/0005-public-web-native-engine.md) identifies Camera
  movement as one of the capabilities Fondale must demonstrate before its
  stable release.
- The original Fondale 1 rendering decision deliberately excluded Camera,
  panning and Scene Spaces larger than Logical Resolution. This feature is an
  explicit phase change to that decision, not an accidental interpretation of
  the old contract.
- Ron Gilbert's [Scrolling Rooms](https://blog.thimbleweedpark.com/scrolling_rooms.html)
  describes Thimbleweed Park room coordinates as independent of screen
  coordinates, uses an actor-following Camera, and discusses the smoother
  acceleration and settling that distinguish it from early SCUMM scrolling.
- The Capri adventure handoff already lists Castello Barbarossa and a coastal
  fortification among intended and visually explored locations. Its existing
  art master contains a rising route and tower suitable for the first
  production two-axis Camera demonstration.
