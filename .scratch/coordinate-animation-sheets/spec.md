# Spec — Coordinate-based Animation Sheets

**Status:** ready-for-agent

## Problem Statement

Fondale currently treats a sprite sheet as a horizontal `AnimationStrip` whose
frame count implicitly divides the image width. This prevents an Author from
using a regular multi-row sheet directly, even when an art tool has already
exported complete frame coordinates. The 25-frame AutoSprite walking output for
Michele is a concrete example: its frames occupy a `5 × 5` grid, while the
Engine accepts only a `25 × 1` strip.

The current authoring contract also supports an unrelated alternative in which
one Animation references a list of separate image files. Supporting implicit
horizontal slicing and separate-image playback alongside coordinate-based
sheets would leave the Engine with several frame-source representations and
move format decisions into every validator, asset loader, renderer path,
fixture, and recipe.

An Author needs one predictable representation that accepts horizontal strips,
regular grids, and deliberately placed untrimmed cells without teaching the
Engine a vendor's JSON schema. The representation must work equally for
Character, Object, and Scenery Animations, preserve the existing four-Facing
Character contract, and keep temporal behavior separate from artwork.

## Solution

Every Animation uses an `AnimationSheet`. The sheet names one Runtime Asset
image and contains a non-empty ordered sequence of `AnimationFrame` rectangles.
Each frame supplies integer `x`, `y`, `width`, and `height` values in image
pixels, measured from the image's top-left corner. Array order is playback
order. A static Animation is an ordinary sheet containing one frame.

Object and Scenery Animations own one `sheet`. Character Animations own
directional `sheets`, represented by `CharacterAnimationSheets` with required
`left`, `right`, `front`, and `back` entries. Every entry is the same
`AnimationSheet` concept; directionality adds selection, not another frame
format.

Every Animation also owns `timing`, an `AnimationTiming` value containing
frames per second, optional loop behavior, and optional Animation Cues. Artwork
therefore determines which ordered frames exist, while timing determines how
the Engine traverses them.

Fondale exports `uniformGrid`, a declarative authoring helper that returns
ordered `AnimationFrame` values for a regular grid. It accepts frame width,
frame height, column count, frame count, and optional origin and row/column gap
values defaulting to zero. It generates frames from left to right and then top
to bottom, allowing the final row to be incomplete. It does not validate by
throwing during module import; `startGame` remains the single validation point.

The former horizontal strip, separate-image list, and related public types are
removed without compatibility during alpha. A Game Project whose source art is
stored as separate images must pack those images into a Runtime Asset sheet
before authoring the Animation.

## User Stories

1. As an Author, I want every Animation to use one sprite-sheet concept, so that I learn one frame-source contract.
2. As an Author, I want to identify frames with explicit rectangles, so that I can use multi-row sheets without rearranging their pixels.
3. As an Author, I want frame order to follow the authored array, so that playback never depends on object-key or filename ordering.
4. As an Author, I want frame coordinates measured from the top-left in image pixels, so that the coordinate system is unambiguous.
5. As an Author, I want horizontal strips to remain expressible as ordinary sheets, so that existing art can migrate without losing frames.
6. As an Author, I want regular grids to remain expressible as ordinary sheets, so that exports from sprite-generation tools can be used directly.
7. As an Author, I want deliberately placed axis-aligned cells to be expressible, so that a sheet need not fill every grid position.
8. As an Author, I want a static Animation represented as a one-frame sheet, so that the Engine needs no special static-image case.
9. As an Author, I want Object Animations to use `AnimationSheet`, so that Objects share the same frame model as other animated subjects.
10. As an Author, I want Scenery Animations to use `AnimationSheet`, so that animated world elements share the same frame model.
11. As an Author, I want Character Animations to use four directional sheets, so that the existing authored Facing contract remains intact.
12. As an Author, I want `left`, `right`, `front`, and `back` to remain required, so that the Engine never invents or mirrors a missing presentation.
13. As an Author, I want the four Facing sheets to contain the same number of frames, so that direction does not change Animation duration or phase.
14. As an Author, I want different Animations to use different frame counts, so that idle, walking, speaking, and directed performances retain appropriate detail.
15. As an Author, I want artwork and temporal behavior declared separately, so that changing grid layout does not change playback semantics.
16. As an Author, I want frames per second inside `AnimationTiming`, so that playback speed remains explicit.
17. As an Author, I want loop behavior inside `AnimationTiming`, so that finite and repeating performances remain distinguishable.
18. As an Author, I want Animation Cues inside `AnimationTiming`, so that named moments remain tied to the Animation timeline.
19. As an Author, I want Cue values to retain their existing seconds-based meaning, so that Sequence choreography does not change during migration.
20. As an Author, I want `uniformGrid` to generate coordinates for a common layout, so that I do not repeat simple rectangle arithmetic.
21. As an Author, I want `uniformGrid` to accept a frame count independently of rows, so that an incomplete final row needs no placeholder frames.
22. As an Author, I want optional grid origins, so that a sheet may reserve pixels before its first cell.
23. As an Author, I want optional row and column gaps, so that spaced cells remain describable without manual coordinates.
24. As an Author, I want all grid defaults to be zero, so that contiguous sheets remain concise.
25. As an Author, I want `uniformGrid` to generate row-major order, so that its output matches conventional visual reading and the AutoSprite export.
26. As an Author, I want invalid authoring reported by `startGame`, so that all Game Project diagnostics arrive through one established seam.
27. As an Author, I want `uniformGrid` to avoid import-time validation failures, so that loading a definition does not partially validate it.
28. As a TypeScript Author, I want the public interfaces to require sheet-based Animations, so that separate-image lists fail during authoring.
29. As a JavaScript Author, I want startup validation to enforce the same sheet contract, so that untyped input receives equivalent protection.
30. As an Author, I want every sheet to contain at least one frame, so that an Animation can always present artwork.
31. As an Author, I want coordinates and dimensions to be integers, so that frame extraction maps exactly to image pixels.
32. As an Author, I want non-negative coordinates, origins, and gaps, so that no implicit clipping or reverse layout occurs.
33. As an Author, I want positive frame dimensions, counts, and column counts, so that every generated or explicit cell is meaningful.
34. As an Author, I want every rectangle contained within its image, so that an invalid sheet fails before gameplay.
35. As an Author, I want duplicated rectangles to remain valid, so that I can intentionally hold the same pose for more than one logical frame.
36. As an Author, I want overlapping rectangles to remain valid, so that the Engine does not reject harmless or deliberate layout choices.
37. As an Author, I want every sheet in one Appearance to share cell dimensions, so that its Visual Anchor uses one stable coordinate basis.
38. As an Author, I want the cell-size rule applied equally to Character, Object, and Scenery Appearances, so that it is not a Character-only exception.
39. As an Author, I want different Appearances to remain free to use different compatible Runtime construction, so that persistent visual states remain independently authored.
40. As an Author, I want missing or invalid images diagnosed with the owning Animation and Facing, so that asset errors are straightforward to locate.
41. As an Author, I want no AutoSprite-specific parser in Fondale, so that the Engine's public interface remains provider-neutral.
42. As an Author, I want to transcribe or generate rectangles from any exporter outside the Engine, so that vendor schema changes do not alter Fondale.
43. As an Author, I want the Engine to ignore undocumented vendor timing fields, so that `AnimationTiming` remains authoritative.
44. As an artist, I want Source Assets kept separate from fitted Runtime Asset sheets, so that production exports can satisfy the Engine without overwriting masters.
45. As an artist, I want a multi-row sheet to remain compact, so that a 25-frame Animation does not require an unnecessarily wide texture.
46. As a Player, I want sheet layout changes to preserve visible frame order and timing, so that asset representation does not alter the performance.
47. As a Player, I want Facing changes to preserve frame phase, so that a Character does not jump temporally when turning.
48. As a Player, I want every animated subject to remain spatially anchored, so that switching Animation does not cause visible jumps.
49. As an Engine maintainer, I want one coordinate-based asset-slicing path, so that strips, grids, and static frames do not require separate renderer branches.
50. As an Engine maintainer, I want frame count derived from the ordered rectangles, so that no independent `count` can disagree with the artwork.
51. As an Engine maintainer, I want Character directionality layered over `AnimationSheet`, so that Facing selection does not duplicate sheet semantics.
52. As an Engine maintainer, I want timing represented once in `AnimationTiming`, so that Character and non-Character Animations share temporal rules without a generic public source type.
53. As an Engine maintainer, I want the old strip and image-list contracts removed, so that later work cannot accidentally preserve multiple frame formats.
54. As an Engine maintainer, I want first-party Game Projects, fixtures, recipes, and documentation migrated atomically, so that the repository demonstrates only the accepted contract.
55. As a contributor, I want precise Authoring Diagnostic paths for the affected sheet, frame, Animation, Appearance, and Facing, so that failures are actionable.
56. As a contributor, I want public documentation to distinguish Animation Sheet coordinates from vendor atlas JSON, so that compatibility claims remain accurate.
57. As a contributor, I want repository verification to reject residual `AnimationStrip`, separate-image Animation frames, and flat timing properties, so that migration cannot remain partial.
58. As a contributor, I want all standard tests to remain independent of AutoSprite, network access, and expiring URLs, so that verification is deterministic.
59. As a contributor, I want an existing multi-row sheet represented in a browser fixture, so that the new capability is proven rather than inferred from types.
60. As a contributor, I want the alpha breaking change documented, so that removal of the old authoring shapes is intentional and discoverable.

## Implementation Decisions

**One frame-source representation.** Every Animation uses an
`AnimationSheet`. A sheet consists of one image and a non-empty ordered sequence
of `AnimationFrame` rectangles. A one-frame Animation uses the same shape as a
multi-frame Animation. Separate-image sequences and bare image sources are not
accepted.

**Explicit, axis-aligned rectangles.** An `AnimationFrame` declares integer
`x`, `y`, `width`, and `height` values in image pixels with a top-left origin.
Coordinates are non-negative, dimensions are positive, and the complete
rectangle must lie inside the decoded image. Rectangle order is playback order.
Duplicate and overlapping rectangles are legal.

**Uniform Runtime cells.** Every frame in every Animation Sheet belonging to
one Appearance shares the same width and height. The rule applies uniformly to
Character, Object, and Scenery Appearances. It preserves one stable Visual
Anchor coordinate basis across Animation changes. Different Appearances remain
independently authored.

**Directional Character sheets.** `CharacterAnimationSheets` requires one
`AnimationSheet` for each left, right, front, and back Facing. The four sheets
of one Character Animation contain equal frame counts and share one timing
value. Different Character Animations may use different counts while retaining
the Appearance cell dimensions.

**Distinct singular and plural authoring.** Object and Scenery Animation
definitions expose `sheet`. Character Animation definitions expose `sheets`.
This expresses their actual cardinality without a generic source property or a
union accepting unrelated frame formats.

**Composed timing.** Both Animation definition forms contain `timing`, whose
`AnimationTiming` value owns frames per second, optional loop behavior, and
optional named Animation Cues in logical seconds. Existing duration, frame
selection, Cue scheduling, and forced walking-loop semantics continue to derive
from these values and the number of ordered sheet frames.

**Public regular-grid authoring.** Fondale exports `uniformGrid`. Its required
inputs are frame width, frame height, columns, and count. Optional `x`, `y`,
`columnGap`, and `rowGap` inputs default to zero. It returns readonly
`AnimationFrame` values in row-major order and supports an incomplete final
row. It is provider-neutral and receives neither an image nor vendor metadata.

**Validation remains at startup.** Calling `uniformGrid` does not perform
partial public Game Project validation or throw authoring failures during
module import. The Animation capability reports structural Authoring
Diagnostics during `startGame`; browser asset validation additionally verifies
rectangle bounds against decoded image dimensions. This preserves the
startup-validation decision recorded in ADR-0012.

**Renderer consumes authored coordinates.** Asset loading creates one texture
view for each ordered frame rectangle rather than inferring equal horizontal
slices from image width. Playback and Facing selection consume the resulting
ordered textures through their existing presentation behavior.

**No provider seam.** Fondale does not parse AutoSprite JSON and does not add an
AutoSprite adapter. Exporter metadata may inform authored rectangles or
external asset tooling, but it never becomes a public Engine contract. The
decision is recorded in ADR-0019.

**Intentional format limits.** The sheet contract does not support trimming,
rotation, logical source-size reconstruction, per-frame pivot or Visual Anchor,
fractional coordinates, implicit clipping, or generic packed-atlas semantics.
An asset pipeline must normalize such inputs into untrimmed axis-aligned
Runtime cells before authoring.

**Alpha breaking migration.** `AnimationStrip`, `AnimationFrames`, and
`CharacterAnimationFrames` are removed or replaced by the new sheet contracts.
Horizontal `{ image, count }` values, separate-image arrays, flat
`framesPerSecond`, flat `loop`, and flat `cues` receive no compatibility union
or deprecation period. All first-party definitions and public guidance migrate
in the same change.

**Modules affected.** The Animation capability owns the new definitions,
timing semantics, helpers, and structural diagnostics. Game Project compilation
and World definitions consume the revised Appearance contracts. The browser
asset module loads images and slices explicit rectangles. Renderer-facing frame
lookup remains derived and does not expose the sheet representation. Public
exports, cloning, Examples, fixtures, recipes, migration guidance, reference
documentation, and release verification move to the new contract.

**Domain documentation.** `AnimationSheet`, `AnimationFrame`,
`CharacterAnimationSheets`, `AnimationTiming`, and `uniformGrid` are technical
interface vocabulary and do not enter the domain glossary. ADR-0019 records the
durable frame-source decision; the existing Animation, Appearance, Facing,
Visual Anchor, Runtime Asset, and Animation Cue terms remain authoritative.

## Testing Decisions

A good test observes the authored Game Project through the highest available
Engine seam. It verifies visible frame selection, playback, Facing, and
startup diagnostics rather than private texture-cache keys, rectangle helper
calls, renderer branches, or PixiJS implementation details.

**Primary seam — `startGame` browser behavior.** A deterministic browser fixture
uses visually distinguishable multi-row sheets for Character, Object, and
Scenery Animations. It observes row-major playback, an incomplete final row,
static one-frame sheets, temporal progression, looping, all four Character
Facings, Perspective Scale, and Visual Anchor stability. The fixture uses local
assets and no generator, network request, provider SDK, or expiring URL.

**Startup-validation seam.** Authored Game Projects pass through the existing
`startGame` compilation and asset-loading flow. Coverage includes an empty
sheet, invalid image source, fractional or negative coordinates, non-positive
dimensions, out-of-bounds rectangles, inconsistent cell dimensions within an
Appearance, missing directional sheets, unequal Character frame counts,
invalid timing, and Animation Cues outside the resulting duration. Diagnostics
identify the owning subject, Appearance, Animation, Facing when present, and
frame index.

**Compile-time public-interface seam.** Existing package type checking and
public recipe compilation prove that valid `sheet`, `sheets`, `timing`, and
`uniformGrid` authoring compile. They also ensure that strips, image arrays,
bare images, `CharacterAnimationFrames`, and flat timing fields no longer
compile. This is the only appropriate seam for behavior that exists solely in
the TypeScript interface.

**Capability-level support.** Focused Animation tests cover deterministic
`uniformGrid` geometry, row-major order, origins, gaps, incomplete rows, frame
count, duration, frame index, loop behavior, and Cue ticks. These support the
higher seams but do not replace them.

**Prior art.** Reuse the established browser coverage for authored Character
Facing selection and Character Animation cell dimensions, the Animation
capability coverage for validation and temporal calculations, Game Project
compilation coverage for defensive copying and Authoring Diagnostics, and
public recipe fixtures for package-level authoring. Replace old-format
expectations instead of adding a parallel compatibility suite.

**Repository gates.** `npm run build` must pass with no old public contract or
documentation remaining. `npm run verify` must demonstrate coordinate-based
sheet playback in Chrome. Documentation verification must cover the revised
public exports and examples.

## Out of Scope

- Parsing AutoSprite JSON or adding an AutoSprite-specific adapter.
- Accepting any vendor's raw atlas schema as a public Engine interface.
- Generating, regenerating, downloading, or integrating Michele's final walking artwork.
- Spending AutoSprite credits or invoking generation jobs.
- Supporting one-image-per-frame Animation authoring.
- Keeping bare images, image arrays, or horizontal strips as convenience alternatives.
- Backward compatibility, deprecation aliases, or automatic migration at runtime.
- Packed-atlas trimming, rotation, extrusion, logical source-size restoration, or per-frame pivots.
- Per-frame duration; `AnimationTiming` continues to use a uniform frame rate.
- Per-frame Visual Anchors; the Appearance retains one stable Visual Anchor.
- Changing Character Facing, mirroring, movement, Motion, Perspective Scale, or Ground Point semantics.
- Changing Sequence timing, Animation Cue meaning, Animation Roles, Save Snapshot semantics, or Game State.
- Comparing frame pixels, detecting visual duplication, or judging animation quality.
- Requiring every Art Master to be stored as a sheet; the decision concerns Runtime Assets and Engine authoring.
- Adding a public asset-packing tool beyond the coordinate-only `uniformGrid` helper.

## Further Notes

The design was established through a `grill-with-docs` session and is recorded
by ADR-0019. The supporting sprite-sheet research found no universal atlas JSON
standard: PNG and JSON standardize containers and syntax, while exporters and
engines disagree on frame metadata. The provider-neutral rectangle contract is
therefore intentional rather than an incomplete AutoSprite integration.

The existing AutoSprite walking output for Michele is a useful acceptance
example because it contains 25 `256 × 256` frames in a `5 × 5` row-major grid.
The feature must be capable of describing that layout without discarding
frames or repacking it into a `6400 × 256` horizontal strip. The asset itself is
not required for deterministic repository verification and its production art
acceptance remains separate work.
