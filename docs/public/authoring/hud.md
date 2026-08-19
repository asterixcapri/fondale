# HUD

## What the HUD is

The Engine owns the interface a Player uses: the contextual action that follows
the pointer, the Inventory trigger and drawer, Choices, Options and Help,
speech and narration.

You do not lay it out and you cannot rearrange it. What you supply is a
**theme**: one font, six colours, an opacity, a speech width, five cursors, and
the speech colour of each Character.

This is deliberate. The controls are part of the Engine's contract with the
Player, so a Fondale game is never unplayable because its interface was
reinvented.

## How you author it

```ts
import { type HUDTheme } from "@asterixcapri/fondale";

export const hudTheme = {
  font: { family: "Alegreya", source: new URL("./alegreya.woff2", import.meta.url) },
  colors: {
    text: "#f4ece0",
    preferred: "#ffd479",
    selected: "#ffb347",
    backing: "#1b1a17",
    border: "#3a352c",
    inventoryWell: "#12110f",
  },
  opacity: 0.9,
  maxSpeechWidth: 520,
  cursors: {
    left: new URL("./cursor-left.png", import.meta.url),
    right: new URL("./cursor-right.png", import.meta.url),
    up: new URL("./cursor-up.png", import.meta.url),
    down: new URL("./cursor-down.png", import.meta.url),
    enter: new URL("./cursor-enter.png", import.meta.url),
  },
  speechColors: { michele: "#f4ece0", raffaele: "#c8d9c0" },
} satisfies HUDTheme;
```

## Values and rules

| Field | Value | Rules |
| --- | --- | --- |
| `font` | a family name and a local font file | one font, loaded locally; no remote fonts |
| `colors` | six CSS hex colours | `text`, `preferred`, `selected`, `backing`, `border`, `inventoryWell` |
| `opacity` | number between 0 and 1 | applies to HUD backing |
| `maxSpeechWidth` | positive number | in logical pixels; speech wraps within it |
| `cursors` | one asset per `PassageDirection` | `left`, `right`, `up`, `down`, `enter` |
| `speechColors` | Character-keyed hex colours | the colour that Character's speech is drawn in |

The HUD lives in viewport space, not Scene Space. It is measured against the
Logical Resolution and is unaffected by Perspective Scale. Inventory artwork
belongs to this scale too, not to the world.

A Scene reserves no space for the HUD. Compose so that essential information is
not permanently under the controls.

The cursors are the Passage directions: they tell the Player which way an exit
leads before they take it.

## Errors

| Code | Cause |
| --- | --- |
| `definition.hud-theme.font` | the font declaration is incomplete |
| `definition.hud-theme.color` | a colour is not a CSS hex colour |
| `definition.hud-theme.speech-color` | a speech colour is invalid or names an unknown Character |
| `definition.hud-theme.opacity` | opacity is outside 0–1 |
| `definition.hud-theme.speech-width` | the speech width is not a positive number |
| `definition.hud-theme.cursor` | a required cursor is missing |
| `asset.cursor.dimensions` | a cursor image has unusable dimensions |
| `asset.font.load.failed` | the font file cannot be loaded |

## Example

The example game themes the HUD in the warm palette of its harbour and gives
each Character a distinct speech colour.

## See also

[Project](project.md) · [Interaction](interaction.md) · [Object](object.md)
