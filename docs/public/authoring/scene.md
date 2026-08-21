# Scene

## What a Scene is

A Scene is one place the Player Character can occupy. It owns a Background
image, the geometry that governs walking, the Scenery drawn in front of or
behind Characters, the surfaces that answer Commands, and the ways in and out.

Every coordinate a Scene declares lives in **Scene Space**: origin at the
top-left of the Background, one unit per Background pixel, spanning the
complete Scene Size. Scene Space is not the viewport. A Scene may be larger
than the visible frame on either axis, and the Camera reveals the rest.

The registry key under which a Game Project declares a Scene is its identity.
Every reference to that Scene — a Character's initial Scene, a Passage
destination, a Sequence owner — names that key.

## How you author one

```ts
import { type SceneDefinition } from "fondale";

export const harbour = {
  background: new URL("./harbour.png", import.meta.url),
  size: { width: 1600, height: 720 },
  walkableRegion: [
    { x: 120, y: 470 }, { x: 1480, y: 470 },
    { x: 1480, y: 690 }, { x: 120, y: 690 },
  ],
  perspectiveScale: [
    { y: 470, scale: 0.62 },
    { y: 690, scale: 1 },
  ],
  entrances: {
    fromTown: { groundPoint: { x: 200, y: 640 }, facing: "right" },
  },
} satisfies SceneDefinition;
```

`background` and `walkableRegion` are required; everything else is optional and
absent means the Scene simply does not offer that structure.

## Values and rules

| Field | Value | Rules |
| --- | --- | --- |
| `background` | URL of a PNG | must decode, and its pixel dimensions must exactly match the resolved Scene Size |
| `size` | positive integer width and height | omission defaults to Logical Resolution; neither axis may be smaller than the corresponding viewport axis |
| `walkableRegion` | finite simple polygon in Scene Space | at least three vertices, no self-intersection, no degenerate area; every point inside Scene Space |
| `perspectiveScale` | ordered stops of Scene Space `y` and positive `scale` | stops interpolate linearly between them and hold flat beyond the outermost stop; omission means scale `1` everywhere |
| `scenery` | named `SceneryDefinition` registry | see [Scenery](scenery.md) |
| `hotspots` | ordered `HotspotDefinition` values | see [Interaction](interaction.md) |
| `entrances` | named Ground Point and Facing | each Ground Point must lie inside the Walkable Region |
| `passages` | ordered `ScenePassage` values | each carries its own Noun, a `PassageDirection`, and a destination Scene and Entrance |
| `cases` | ordered `SceneOpeningCase` values | read from the top on every Scene Opening; the first eligible case applies |

A Scene reserves no region for the HUD. Authored geometry may use the complete
Scene Size, and the Engine draws its controls over whatever is there.

### Scene Size and the Camera

A Scene whose Size equals the Logical Resolution is fully visible and the
Camera never moves. A larger Scene is revealed by a Camera that follows the
visible Player Character: it eases during ordinary walking, snaps on startup,
on restoration and on Scene entry, clamps independently on each axis so the
world never shows past its own edge, and translates on whole logical pixels.

The Camera is derived, never authored and never saved. A Sequence may
temporarily cut, move, hold, or follow another subject within the same Scene;
completion and skip return it to following the Player Character.

### Scene Opening

A **Scene Opening** is the moment the Scene comes before the Player, whether
the Player arrives through a Scene Passage or the game begins in that Scene. A
Scene declares what it does then in `cases`, the same list every conditional
reaction in the Engine is written as: each case carries an optional `when`, at
most one of a `line`, a `response` or a `sequence`, and `operations` alongside
any of them. The Engine reads the list from the top and applies the first eligible
case, so cases are written from the specific to the general, and a case with no
`when` is the default for everything below it. A Scene need not react at all,
so the list may be empty, absent, or entirely conditional.

```ts
cases: [
  // Only the first time, and only for whoever comes up from the harbour.
  { entrance: "fromHarbour", when: { variable: "boatLanded", equals: false }, sequence: "boatArrival" },
  // Otherwise a single sentence, with no Sequence to declare.
  { line: { character: "player", text: "The wind has not dropped." } },
],
```

An `entrance` filters a case to the Player having come through that door. At
the start of a game no door was used, so a case naming an Entrance never
applies then, and a case naming none applies to every Scene Opening — the start
of the game included. There is no separate field for the start: to open only
once, condition the case on a Game Variable the Sequence raises among its own
operations and in its Skip Outcome.

A Sequence an opening starts takes control before the Player does, so no frame
of play is reachable before the staging begins.

Restoring a Save Snapshot is never a Scene Opening: a returning Player is not
shown the opening again, at the start of a game or anywhere else.

### Perspective Scale

Perspective Scale expresses depth and nothing else. It multiplies the drawn
size of a Character standing at a given Scene Space `y`, so a Character walking
away shrinks and one walking forward grows.

It is not a repair for artwork authored at the wrong size. A Character drawn
too large stays too large at every depth; correct the artwork, not the stops.

## Errors

Startup rejects a Game Project rather than running a broken Scene. Every
diagnostic carries a stable code, the capability that owns the rule, and the
authoring path that failed.

| Code | Cause |
| --- | --- |
| `asset.background.dimensions` | the Background PNG does not match the resolved Scene Size; the message reports actual and expected |
| `definition.scene-size.positive-integer` | a declared axis is not a positive integer |
| `definition.scene-size.viewport-minimum` | a declared axis is smaller than the corresponding Logical Resolution axis |
| `definition.polygon.vertices` | a polygon has fewer than three vertices |
| `definition.polygon.degenerate` | a polygon encloses no area |
| `definition.polygon.self-intersection` | a polygon crosses itself |
| `definition.point.finite` | a coordinate is not a finite number |
| `definition.scene-space.bounds` | authored geometry falls outside Scene Space |
| `definition.perspective-scale.stop` | a stop declares a non-positive scale or an invalid `y` |
| `definition.entrance.walkable` | an Entrance Ground Point is outside the Walkable Region |
| `definition.command-case.textual-outcome` | a case declares more than one outcome |
| `definition.command-case.empty` | a case declares no outcome at all |
| `definition.command-response.text` | a case answers with an empty Command Response |
| `definition.approach.walkable` | an Approach Point is outside the Walkable Region |
| `definition.approach.bounds` | an Approach Point falls outside Scene Space |
| `reference.scene` | something names a Scene the Game Project does not declare |
| `reference.scene.initial` | `initialScene` names a Scene that does not exist |
| `reference.passage.scene` | a Passage names a destination Scene that does not exist |
| `reference.passage.entrance` | a Passage names an Entrance the destination Scene does not declare |
| `reference.character.initial-scene` | a Character starts in a Scene that does not exist |
| `reference.object.initial-scene` | an Object starts in a Scene that does not exist |
| `reference.scene-opening.entrance` | a Scene Opening case names an Entrance the Scene does not declare |

The complete list is in [Diagnostics](../diagnostics.md).

## Example

The quay in [`world.ts`](../recipes/world.ts) is `1920×720` behind a `1280×720`
viewport, so the Camera follows and clamps. Its Walkable Region runs the length
of the quay, two depth stops carry the Perspective Scale, and its Passage to the
storeroom stays withdrawn until the lantern is lit.

## See also

[Scenery](scenery.md) for what stands inside a Scene · [Interaction](interaction.md) for Hotspots, Nouns and
Commands · [Character](character.md) for who walks in it · [Sequence](sequence.md) for the Sequences an opening starts and
Camera direction
