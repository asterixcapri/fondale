# Object

## What an Object is

An Object is a portable thing with exactly one location at any moment: a Scene,
the Inventory, or terminal consumption. Nothing else is possible, and the
transitions between them are the Object's whole lifecycle.

An Object owns one Noun, and that same Noun governs it in the world and in the
Inventory. Looking at a key on the ground and looking at it in your hand ask
the same Noun.

It also owns two independent presentations: animated Appearances for the world,
and one square Inventory Appearance for the drawer.

## How you author one

```ts
import { type ObjectDefinition } from "@asterixcapri/fondale";

export const oilFlask = {
  initialScene: "harbour",
  initialGroundPoint: { x: 690, y: 596 },
  initialAppearance: "full",
  inventoryAppearance: new URL("./flask-inventory.png", import.meta.url),
  appearances: {
    full: { animations: { idle: fullIdle }, roles: { default: "idle" } },
    empty: { animations: { idle: emptyIdle }, roles: { default: "idle" } },
  },
  noun: flaskNoun,
} satisfies ObjectDefinition;
```

Object Appearances are non-directional: an Object has no Facing.

### The lifecycle

An Object starts in a Scene at a Ground Point. It reaches the Inventory through
a collect operation — either collecting the Command's own target, or being
given to the Player by another definition in the same Scene. It returns to a
Scene through a place operation, either at an authored Ground Point or where
the Player put it. It leaves play through consumption, which is terminal.

The Inventory is ordered by acquisition. The Player selects a carried Object,
and the selected Object becomes the first Noun of the next Command, which is
how "use the key with the door" is expressed without a parser.

### Ground Points that must fit everywhere

A `place-selected-object` operation names a Ground Point that must be valid in
every Scene where the owning Noun or Sequence can run. Because a portable
Object, a Player Character Noun and a Sequence can all travel, they are checked
against every registered Scene Size — not only the one you had in mind.

## Values and rules

| Field | Value | Rules |
| --- | --- | --- |
| `initialScene` | Scene key | must exist; an Object always begins in the world |
| `initialGroundPoint` | Scene Space point | must lie inside that Scene |
| `initialAppearance` | Appearance key | must exist in `appearances` |
| `appearances` | named Appearance registry | non-directional animated Appearances |
| `inventoryAppearance` | URL of a square PNG | drawn in the Inventory drawer at the project's Inventory Appearance Size |
| `noun` | `NounDefinition` | optional; an Object with no Noun cannot be addressed |

The Inventory Appearance is authored in UI scale, not world scale. It is not
affected by Perspective Scale and does not need to match the world artwork
pixel for pixel — only to be recognisably the same thing.

## Errors

| Code | Cause |
| --- | --- |
| `reference.object.initial-scene` | the initial Scene does not exist |
| `definition.inventory-appearance-size` | the declared Inventory Appearance Size is invalid |
| `asset.inventory-appearance.dimensions` | the PNG is not square or does not match the declared size |
| `definition.operation.collect-target` | a collect-target operation is used where there is no Command target |
| `definition.operation.ground-point` | a place operation names a Ground Point invalid in some reachable Scene |
| `reference.object` | an operation or condition names an Object that does not exist |
| `definition.hotspot.target-noun.required` | a Hotspot targets an Object that declares no Noun |

## Example

The lantern in [`lantern.ts`](../recipes/lantern.ts) is picked up from the quay,
lit against the brazier — which swaps its Appearance — and carried into the
storeroom. One Noun answers for it in the world and in the Inventory alike.

## See also

[Interaction](interaction.md) · [Scene](scene.md) · [Game State](game-state.md)
