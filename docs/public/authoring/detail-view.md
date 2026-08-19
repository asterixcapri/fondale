# Detail View

## What a Detail View is

A Detail View is a single image presented in place of the world, so the Player
can examine one thing closely: a letter, a map, a mechanism, a painting.

It is not a Scene. It has no Scene Space, no Walkable Region, no Perspective
Scale and no Character in it, because nothing walks inside a Detail View. Its
Hotspots therefore carry no Approach Point, and their Commands resolve
immediately with no movement stage.

At most one Detail View is presented at a time. Presenting another replaces it
rather than stacking.

## How you author one

```ts
import { type DetailViewDefinition } from "@asterixcapri/fondale";

export const letter = {
  image: new URL("./letter.png", import.meta.url),
  hotspots: [
    {
      area: [{ x: 420, y: 260 }, { x: 860, y: 260 }, { x: 860, y: 380 }, { x: 420, y: 380 }],
      noun: sealNoun,
    },
  ],
} satisfies DetailViewDefinition;
```

Declare Detail Views in the Game Project's `detailViews` registry; the key is
the identity operations name.

Two Game Operations control presentation: `present-detail-view` names one, and
`dismiss-detail-view` returns the Player to the world. Either may come from a
Command Case, a Sequence, or any other operation group.

### While one is presented

The Engine draws the Detail View instead of the Scene and draws no Character.
Its Hotspots advertise their phrases exactly as Scene Hotspots do, and their
Nouns behave identically: Command Cases answer with a Line or a Command
Response, run Game Operations, start a Sequence, and accept a selected
Inventory Object with the same first-Noun semantics.

The Inventory stays reachable. A running Sequence keeps running. The Player
Character keeps its Scene, Ground Point and Facing throughout, and dismissal
returns the world exactly as it was.

The presented Detail View is committed Game State: it is saved, restored, and
carried by the Continuation State, so reopening the browser returns to the same
close-up. Restoring into one is not an arrival and starts no arrival Sequence.

### Endings

An `end-game` operation names the Detail View a Game Session ends on. It
presents that Detail View and concludes the session: whatever was running
stops, the HUD withdraws entirely, and no further Command, advance or movement
is accepted.

The Ending carries no image of its own — the closing Detail View keeps its
ordinary Hotspots. A closing card, a dedication, and a final illustration with
one detail still worth clicking are therefore all the same shape, and a game
may author as many Endings as it has outcomes.

The Ending is committed Game State, so a reopened browser finds a finished game
at its Ending rather than in an exhausted world. Starting a new game leaves it
behind.

## Values and rules

| Field | Value | Rules |
| --- | --- | --- |
| `image` | URL of a PNG | must decode and match the Logical Resolution exactly |
| `hotspots` | ordered `DetailViewHotspotDefinition` values | polygon `area` in Logical Resolution coordinates, a local `noun`, optional `when` |

A Detail View Hotspot accepts no Approach Point and no target: it always owns
its Noun locally. Where areas overlap, the later Hotspot wins the hit test. A
`when` that stops holding withdraws its Hotspot.

## Errors

| Code | Cause |
| --- | --- |
| `definition.detail-view.image` | the image declaration is invalid |
| `asset.detail-view.dimensions` | the PNG does not match the Logical Resolution |
| `definition.detail-view.bounds` | a Hotspot polygon falls outside the frame |
| `reference.detail-view` | an operation names a Detail View that does not exist |
| `save.state.detail-view` | a stored Detail View the project no longer declares |
| `save.state.ending` | a stored Ending without a presented Detail View |

## Example

The example game ends on a Detail View of the open sea, whose one Hotspot still
answers when the Player looks at it.

## See also

[Interaction](interaction.md) · [Game State](game-state.md) · [Save](save.md)
