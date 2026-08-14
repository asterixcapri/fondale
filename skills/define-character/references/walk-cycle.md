# AutoSprite walking Animation integration

Use this workflow whenever a Character needs a new or revised Walking
Animation. AutoSprite owns the complete walking cycle; Fondale stores and plays
the result.

## 1. Approve four static Facing references

Create lossless `left`, `right`, `front`, and `back` still images at one scale
and with one stable construction. Store them in
`art/character/<character-name>/`, using the canonical Character identifier.
Show all four to the user at useful detail and actual play size. Start
AutoSprite only after the user explicitly approves them.

Finish when the four source images are approved. Their approval is the final
local art-direction decision before animation generation.

## 2. Delegate walking to AutoSprite

Give each approved Facing to AutoSprite as its directional reference and request
the semantic walking Animation. Let AutoSprite choose frame count, frame size,
poses, motion, cadence, duration, FPS, and loop construction. Omit optional
generation parameters unless the user explicitly requests an override. Ask the
user before enabling sound or another credit-bearing extra outside the request.

Download every returned sprite sheet and its metadata directly beside the
owning Character definition under the Game Project's `src/` tree. Treat those
outputs as authoritative.

Finish when all four AutoSprite outputs and their metadata are present under
`src/`.

## 3. Integrate without animation authoring

Use the returned cells, frames, order, duration, and loop behavior exactly as
AutoSprite declares them. If Fondale requires `framesPerSecond`, calculate it as
`returned frame count / returned duration`; do not select a preferred FPS.

Perform only lossless layout and metadata translation required by the current
`AnimationSheet` interface. Preserve every generated pixel and frame. Keep the
AutoSprite Character or asset identifier, spritesheet identifier, returned
metadata, and adapter command beside the owning definition under `src/`.

If Fondale cannot represent the returned output faithfully, preserve it and
report the interface gap. Do not normalize Facings or change frames, poses,
timing, cadence, or loop construction to make the output fit.

Finish when the `CharacterDefinition` references all four outputs and the
Engine plays the metadata-derived Animation.

## 4. Verify integration

Build the Game Project and confirm that each Facing loads, stays aligned to the
configured Visual Anchor, follows AutoSprite's frame order and duration, and
plays according to AutoSprite's loop metadata. Verify that Scene movement still
functions and record the displayed scale without grading AutoSprite's frame
size.

Treat AutoSprite's artistic and locomotion choices as accepted source data.
Technical verification detects integration errors; it does not grade or repair
the generated walk.
