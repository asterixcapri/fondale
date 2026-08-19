# Character

## What a Character is

A Character is a persistent inhabitant of the world: it stands in one Scene at
a Ground Point, faces one of four directions, wears one Appearance at a time,
walks, speaks, and may answer Commands through its own Noun.

One Character is the Player Character, named by the Game Project's
`playerCharacter`. It is the one the Camera follows, the one Commands move, and
the only one that may reflect on what it knows.

Characters are the only definitions with **Facing**. Every Character Animation
supplies four authored presentations — `left`, `right`, `front`, and `back` —
and the Engine selects the one matching the current Facing.
It never mirrors or falls back to another presentation.

## How you author one

```ts
import { type CharacterDefinition, uniformGrid } from "@asterixcapri/fondale";

const idleFrames = uniformGrid({ frameWidth: 256, frameHeight: 256, columns: 1, count: 1 });

export const michele = {
  initialScene: "harbour",
  initialGroundPoint: { x: 330, y: 625 },
  initialFacing: "front",
  initialAppearance: "workwear",
  movementSpeed: 180,
  appearances: {
    workwear: {
      visualAnchor: { x: 128, y: 252 },
      animations: {
        idle: {
          sheets: {
            left: { image: new URL("./idle-left.png", import.meta.url), frames: idleFrames },
            right: { image: new URL("./idle-right.png", import.meta.url), frames: idleFrames },
            front: { image: new URL("./idle-front.png", import.meta.url), frames: idleFrames },
            back: { image: new URL("./idle-back.png", import.meta.url), frames: idleFrames },
          },
          timing: { framesPerSecond: 1, loop: true },
        },
      },
      roles: { default: "idle" },
    },
  },
  noun: micheleNoun,
} satisfies CharacterDefinition;
```

`uniformGrid` computes row-major frame rectangles from a regular sheet; you may
also list `frames` by hand when the sheet is irregular.

### Appearances, Animations and Roles

An **Appearance** is a persistent visual condition — the same person in
different clothes, wounded, carrying something. Only the selected Appearance is
persistent state; a Game Operation changes it and the change survives saving.

An **Animation** is a transient performance inside an Appearance. Its artwork
is four sheets; its `timing` — `framesPerSecond`, `loop`, named `cues` — is
shared by all four, so the presentations stay synchronized.

**Animation Roles** tell the Engine which Animation to play when. `default` is
required. `speaking` is optional and falls back to `default`. `walking` is
required for any Character the game moves, including the Player Character.

### Visual Anchor

The `visualAnchor` is the point inside a Runtime frame that sits on the
Character's Ground Point. Set one stable anchor per Appearance and export every
Facing and Animation of that Appearance with the same cell dimensions, so
changing Facing or Animation never shifts the Character in Scene Space.

## Values and rules

| Field | Value | Rules |
| --- | --- | --- |
| `initialScene` | Scene key | must exist |
| `initialGroundPoint` | Scene Space point | must lie inside that Scene's Walkable Region |
| `initialFacing` | `left`, `right`, `front`, `back` | required |
| `initialAppearance` | Appearance key | must exist in `appearances` |
| `appearances` | named `CharacterAppearance` registry | every Animation supplies all four Facings |
| `movementSpeed` | positive number | Scene Space units per second |
| `noun` | `NounDefinition` | optional; omit for a Character nothing can address |
| `dialogue` | `CharacterDialogueDefinition` | optional; see [Dialogue](dialogue.md) |

Within one Animation every Facing must declare the same frame count. Within one
Appearance every sheet must use common Runtime cell dimensions. The Visual
Anchor must fall inside those cells.

Perspective Scale applies equally to every Facing and never reverses artwork.

### Inspecting the artwork

Keep one lossless Art Master per Facing and derive one fitted Runtime sheet
from it. The Engine judges the authored result; it never generates a missing
direction.

Inspect every directional loop at 1:1 Runtime pixels and at actual play size,
including its first-to-last transition. Check anatomy, costume construction,
carried items, handed actions, facial and bodily asymmetry, and Ground Point
stability in all four presentations. Review the Character inside its Scene so
illumination stays coherent with the Scene's light source when Facing changes,
and repeat the play-size check at every reachable Perspective Scale.

## Errors

| Code | Cause |
| --- | --- |
| `definition.character.walkable` | the initial Ground Point is outside the Walkable Region |
| `definition.character.movement-speed` | movement speed is not a positive finite number |
| `reference.character.initial-scene` | the initial Scene does not exist |
| `reference.character.player` | `playerCharacter` names a Character that does not exist |
| `definition.appearance.animations` | an Appearance declares no Animation |
| `definition.appearance.default-role` | an Appearance declares no default Animation Role |
| `reference.animation.role` | a Role names an Animation the Appearance does not declare |
| `reference.animation.walking-role` | a moving Character declares no walking Role |
| `definition.animation.directional-frame-count` | the four Facings disagree on frame count |
| `definition.animation.frames`, `definition.animation.frame-source` | a sheet declares no usable frames |
| `definition.animation.frames-per-second`, `definition.animation.loop` | invalid timing |
| `definition.animation.visual-anchor`, `asset.visual-anchor.bounds` | the anchor is invalid or outside the cell |
| `asset.animation-sheet.frame-bounds` | the image is missing frames the definition declares |

## Example

[`characters.ts`](../recipes/characters.ts) authors the Player Character and the
Keeper with the same construction: four Facings, one stable Visual Anchor, and a
figure 240 pixels tall inside a `256×256` cell — a third of the frame.

## See also

[Scene](scene.md) · [Interaction](interaction.md) · [Sequence](sequence.md) · [Dialogue](dialogue.md)
