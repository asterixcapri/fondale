# Spec — Authored Character presentations for every Facing

**Status:** ready-for-agent

## Problem Statement

Fondale currently asks an Author for one lateral `side` strip and lets the
renderer mirror it when a Character faces the opposite direction. That
transformation changes more than orientation: it reverses lighting, costume
construction, handed actions, carried items, facial asymmetry, and every other
directional choice embedded in the artwork. The Engine therefore invents one
visible presentation instead of selecting artwork the Author supplied.

This prevents a production Character package from owning both lateral views
and makes accurate direction-specific performance impossible. It also leaves
the public authoring interface unable to express a distinction the Game
Project already models through Facing.

## Solution

Every Character Animation provides four synchronized authored presentations:
`left`, `right`, `front`, and `back`. The Engine selects the presentation whose
name matches the Character's current Facing and applies only Perspective Scale;
it never mirrors or otherwise derives one Facing from another.

Character authoring receives a dedicated Appearance and Animation contract so
the four presentations are required by TypeScript. Runtime validation enforces
the same completeness for JavaScript and untyped input. All four strips share
frame count, timing, Runtime cell dimensions, and a stable Visual Anchor within
an Appearance, allowing the Character to change Facing or Animation without a
spatial jump or temporal discontinuity.

This is an intentional alpha breaking change. The former `side` field is
removed without a compatibility path, and every Engine fixture, recipe, test,
Example Character, and Game Project migrates to the four-Facing contract.

## User Stories

1. As an Author, I want to provide separate left-facing and right-facing artwork, so that the Engine never reverses my visual decisions.
2. As an Author, I want every Character Animation to provide left, right, front, and back presentations, so that every Facing has explicit artwork.
3. As an Author, I want the Character's Facing to select the correspondingly named presentation, so that the authoring model and visible result agree.
4. As an Author, I want the Engine to preserve direction-specific lighting, so that a Character remains illuminated consistently with the Scene.
5. As an Author, I want direction-specific costume construction to remain intact, so that closures, patches, tools, and accessories do not swap sides.
6. As an Author, I want handed actions to use authored artwork for each Facing, so that a Character does not silently change dominant hand.
7. As an Author, I want carried Objects to remain on their authored side, so that their position and meaning stay coherent.
8. As an Author, I want facial and bodily asymmetry to survive a change of Facing, so that the Character retains a stable identity.
9. As an Author, I want `idle` to provide all four Facing presentations, so that a stationary Character is still directionally complete.
10. As an Author, I want `speaking` to provide all four Facing presentations, so that dialogue never falls back to artwork facing the wrong way.
11. As an Author, I want `walking` to provide all four Facing presentations, so that movement follows authored directional cycles.
12. As an Author, I want directed Animations to provide all four Facing presentations, so that Sequences can preserve orientation without renderer inference.
13. As an Author, I want the TypeScript interface to reject an incomplete Character Animation, so that missing Facing artwork is caught while authoring.
14. As a JavaScript Author, I want startup validation to reject an incomplete Character Animation, so that the same contract applies without TypeScript.
15. As an Author, I want Character Appearance types to differ from Object and Scenery Appearance types, so that only subjects with Facing carry directional requirements.
16. As an Author, I want Object and Scenery Animations to remain non-directional when appropriate, so that they do not acquire meaningless Facing fields.
17. As an Author, I want all four presentations of an Animation to use the same frame count, so that changing Facing preserves animation phase and duration.
18. As an Author, I want timing, looping, and Animation Cues to remain shared by the four presentations, so that direction does not alter logical choreography.
19. As an Author, I want Runtime cells to share dimensions across every Facing in an Appearance, so that changing Facing does not change the coordinate basis.
20. As an Author, I want one stable Visual Anchor across every Facing and Animation in an Appearance, so that the Ground Point never jumps.
21. As an Author, I want changing Facing to select the new presentation immediately, so that the Engine does not invent an intermediate turn.
22. As an Author, I want a visible turn to remain an explicitly authored Animation, so that transitional performance stays under authorial control.
23. As an Author, I want the renderer to keep horizontal scale positive for every Facing, so that no sprite transformation reverses authored pixels.
24. As an Author, I want Perspective Scale to affect every Facing equally, so that depth remains independent of orientation.
25. As an Author, I want asset loading to resolve all four strips independently, so that missing directional assets produce precise diagnostics.
26. As an Author, I want invalid strip dimensions and frame counts to identify the affected Facing, so that asset errors are straightforward to repair.
27. As an Author, I want the Engine to accept independently authored sides even when they happen to look similar, so that validation does not attempt subjective image comparison.
28. As an Author, I want no validator rule comparing left and right file identities or pixels, so that legitimate pipelines remain unrestricted.
29. As an artist, I want the acceptance process to judge the visible presentations rather than police how I created them, so that production technique remains my choice.
30. As an artist, I want the Character skill to require inspection of all four presentations at actual play size, so that visual defects are caught in context.
31. As an artist, I want lighting continuity checked between Facing presentations, so that turning does not reverse the Scene's light source.
32. As an artist, I want every four-Facing cycle inspected through its loop transition, so that all directions animate cleanly.
33. As an artist, I want the same Ground Point verified across all four presentations, so that the Character remains planted while turning or speaking.
34. As an Engine maintainer, I want one direct mapping from Facing to presentation, so that the renderer contains no lateral fallback or mirroring branch.
35. As an Engine maintainer, I want Character directionality expressed at the animation interface seam, so that callers do not reconstruct the rule.
36. As an Engine maintainer, I want the old `side` contract removed, so that no legacy path can reintroduce mirroring.
37. As an Engine maintainer, I want existing Character definitions migrated in one change, so that the repository has one directional convention.
38. As an Engine maintainer, I want public recipes to demonstrate four authored Facing presentations, so that new Authors learn the intended contract.
39. As an Engine maintainer, I want browser fixtures to exercise distinct left and right images, so that accidental mirroring is observable.
40. As an Engine maintainer, I want tests to distinguish the left and right assets visibly, so that selecting the wrong strip cannot pass unnoticed.
41. As a Player, I want a Character to retain their visual identity when turning, so that the world feels deliberately illustrated.
42. As a Player, I want a Character's lighting to remain part of the Scene, so that orientation changes do not look like lighting changes.
43. As a Player, I want actions and held items to remain physically coherent in every direction, so that animation supports rather than contradicts the fiction.
44. As a contributor, I want the public build to fail on residual `side` authoring, so that the migration cannot remain partial.
45. As a contributor, I want the Example to verify the new contract without network or model dependencies, so that a fresh checkout covers the feature.

## Implementation Decisions

**Facing is authored presentation selection.** Facing remains the discrete
left, right, front, or back orientation of a Character. For an animated
Character it selects artwork carrying the same name; it is not implemented as
a transform of another presentation.

**Every Character Animation is directional.** The four-Facing requirement
applies to all Character Animations, including idle, speaking, walking, and
Animations named directly by Sequences. A Character never uses a
non-directional frame list.

**Character contracts are separate.** Character Appearance and Character
Animation interfaces require four directional strips. The existing general
Appearance and Animation contracts remain available to Objects and Scenery,
whose presentation has no Character Facing.

**No mirroring or fallback.** The renderer selects `left`, `right`, `front`, or
`back` directly and keeps horizontal scale positive. It does not mirror a
texture, fall back between lateral presentations, or substitute another Facing
when an asset is absent.

**No backward compatibility.** The `side` field is removed from the public
interface and implementation. This project is in alpha, so a compatibility
union or deprecation window would preserve precisely the behavior being
rejected. All first-party authoring migrates atomically.

**Synchronized presentations.** The four strips of one Animation share frame
count, frames per second, loop behavior, duration, and Animation Cues. The
presentations represent the same logical performance from different Facing
directions.

**Stable Runtime construction.** Every Facing and Animation within one
Character Appearance uses the same Runtime cell width and height and the same
Visual Anchor. Art Masters may use different source canvases; fitted Runtime
export establishes the common cell contract.

**Immediate Facing changes.** A change of Facing immediately selects the new
authored presentation. The Engine does not synthesize a turning transition. An
Author who wants a visible turn directs an explicit Animation.

**Validation is structural, not visual.** TypeScript and startup validation
enforce four present strips, valid asset references, positive equal frame
counts, compatible Runtime dimensions, and valid Visual Anchors. The Engine
does not compare left and right references, filenames, hashes, or pixels and
does not infer whether one was produced from the other.

**Art acceptance owns visual truth.** The Character workflow verifies the four
presentations in motion and at actual play size, including lighting,
asymmetry, anatomy, costume, carried items, actions, loop boundaries, and
Ground Point stability. The method used to create the artwork is not part of
the Engine contract.

**Modules affected.** The Animation capability gains Character-specific
directional definitions and validation. The World capability uses those
definitions for Character authoring while retaining general Appearance for
Objects and Scenery. The browser asset adapter loads and slices four strips;
the renderer selects them directly from Facing. Game Project validation,
cloning, public exports, tests, recipes, fixtures, and Example Characters move
to the new interface.

**Domain and architectural record.** The glossary defines Facing as authored
presentation selection and records the four synchronized presentations owned
by each Character Animation. ADR-0018 records the choice to accept higher
authoring cost in exchange for visual authority and to remove `side` without
compatibility.

## Testing Decisions

A good test observes behavior through the highest available seam. It supplies
a Game Project containing visibly distinguishable artwork for every Facing,
changes the Character's Facing through supported Engine behavior, and observes
the selected presentation. It does not assert on renderer branches, Pixi
internals, texture-cache keys, private state, or implementation-specific
transform calls.

**Primary seam — `startGame` browser behavior.** Extend the existing browser
fixtures and Character movement coverage with four deliberately distinct
directional assets. Verify that left, right, front, and back each display the
corresponding authored pixels at positive scale, including after movement and
Facing changes. A left/right pair with asymmetric markers makes accidental
mirroring or asset substitution externally visible. This is the confirmed
highest seam for the feature.

**Secondary seam — Game Project startup validation.** Exercise an authored
Game Project through the existing startup validation path. Verify precise
Authoring Diagnostics for a missing Facing, unequal frame counts, incompatible
strip dimensions, invalid assets, and an out-of-bounds Visual Anchor. Verify
that complete four-Facing Character Animations start successfully and that
non-directional Objects and Scenery remain valid.

**Compile-time seam — public TypeScript interface.** Extend the existing
declaration and recipe build coverage so an incomplete Character Animation or
legacy `side` field fails type checking, while valid four-Facing Character
authoring and ordinary Object or Scenery animation compile. These tests protect
the distinction between Character-specific and general Appearance contracts.

**Capability-level prior art.** Reuse Animation capability tests for frame
validation, duration, frame selection, and Animation Roles. Reuse browser
animated-sequence and walking tests for movement-driven Facing changes and
directed Animations. Replace legacy `side` expectations instead of layering a
second compatibility test suite over them.

**Repository gates.** `npm run build` must reject any remaining first-party
`side` authoring or incompatible public documentation. `npm run verify` must
exercise all four presentations in Chrome without external services.

## Out of Scope

- Regenerating or redesigning Raffaele or any other specific Character artwork.
- Defining the artistic technique used to create left and right Art Masters.
- Comparing directional images by reference, filename, hash, metadata, or pixels.
- Automatically deriving one Facing from another during asset production.
- Synthesizing intermediate turning Animations.
- Adding diagonal or continuous orientation beyond left, right, front, and back.
- Giving Facing to Objects or Scenery.
- Changing Character movement, navigation, Perspective Scale, Ground Point, or depth ordering semantics.
- Changing Animation Roles, Animation Cue timing, Sequence direction, or Game State beyond selecting presentation from existing Facing.
- Providing a compatibility adapter for the removed `side` contract.

## Further Notes

The repository contained a partial experimental conversion while this spec was
being discussed. It is not the specification's source of truth and must be
audited or reverted before implementation begins; tickets should start from
the accepted contract above rather than assuming those edits are complete.

The decision deliberately separates structural correctness from art review.
Fondale can prove that every Facing exists and is synchronized, but only actual
play-size inspection can establish that the four authored presentations portray
one stable Character under coherent Scene lighting.
