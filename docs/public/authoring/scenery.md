# Scenery

## What Scenery is

Scenery is a visual that belongs to one Scene and sorts by depth against
Characters and Objects. A crate a Character can walk behind, a boat moored at
the quay, a well whose rope changes when you cut it: all Scenery.

Scenery has persistent named Appearances, so it carries state that survives
across visits. It never moves by itself and never walks; a Sequence may direct
it, but its resting position is what you author.

Scenery is not a Character and not an Object: it is never collected, never
carried, and never leaves its Scene.

## How you author it

```ts
import { type SceneryDefinition } from "fondale";

export const gozzo = {
  baseline: 462,
  position: { x: 450, y: 462 },
  initialAppearance: "moored",
  appearances: {
    moored: { animations: { idle: mooredIdle }, roles: { default: "idle" } },
    adrift: { animations: { idle: adriftIdle }, roles: { default: "idle" } },
  },
  noun: gozzoNoun,
} satisfies SceneryDefinition;
```

Declare Scenery inside the owning Scene's `scenery` registry. The registry key
is its identity: Hotspots target it by that name, Game Operations change its
Appearance by that name.

### Two kinds of Appearance

An **animated Appearance** carries its own image and named Animations, exactly
like a Character Appearance but without Facings.

A **Background Region** carries no image of its own. It names a polygon cut out
of the Scene's own Background, which the Engine draws in front of Characters
when depth requires it. Use it for something already painted into the
Background that a Character must be able to pass behind.

```ts
appearances: {
  default: { kind: "background-region", area: [{ x: 1080, y: 345 }, /* … */] },
}
```

A Background Region belongs to its Scene's Background and cannot be reused
elsewhere.

## Values and rules

| Field | Value | Rules |
| --- | --- | --- |
| `baseline` | Scene Space `y` | the depth line Scenery sorts on; required |
| `position` | Scene Space point | optional; a Background Region takes its place from its own polygon |
| `initialAppearance` | Appearance key | required, and must exist in `appearances` |
| `appearances` | named Appearance registry | each is either animated or a Background Region |
| `noun` | `NounDefinition` | optional; omit when the Scenery is not interactive |

Depth sorting compares the Baseline with the Ground Point of Characters and
Objects: anything standing in front of the Baseline is drawn over the Scenery,
anything behind it is drawn under.

Scenery is not scaled by Perspective Scale. It is painted at the size it
should appear at its own depth, which is why its Baseline must agree with where
it looks like it stands.

If a Hotspot targets Scenery that declares no Noun, startup reports one
`definition.hotspot.target-noun.required` at the Scenery's own path — not once
per Hotspot.

## Errors

| Code | Cause |
| --- | --- |
| `definition.scenery.baseline` | the Baseline is missing or not a finite number |
| `definition.appearance.animations` | an Appearance declares no Animation |
| `definition.appearance.default-role` | an Appearance declares no default Animation Role |
| `reference.appearance.initial` | `initialAppearance` names an Appearance that does not exist |
| `reference.appearance.target` | an operation names an Appearance the target does not declare |
| `definition.polygon.vertices`, `definition.polygon.degenerate`, `definition.polygon.self-intersection` | a Background Region polygon is invalid |
| `definition.scene-space.bounds` | a Background Region falls outside its Scene |
| `definition.hotspot.target-noun.required` | a Hotspot targets Scenery that declares no Noun |
| `definition.motion.scenery-rest` | a Sequence leaves directed Scenery away from its authored resting position |

## Example

The crate in [`world.ts`](../recipes/world.ts) is Scenery: it has a Baseline, so
the Player passes in front of it or behind it depending on where they stand, and
the lantern lies at its foot.

## See also

[Scene](scene.md) · [Interaction](interaction.md) · [Sequence](sequence.md)
