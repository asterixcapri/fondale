# AutoSprite walking Animation workflow

Use this workflow whenever a Character needs a new or revised Walking
Animation. Fondale specifies and verifies the locomotion contract; AutoSprite
authors every pose, transition, and sprite frame.

## 1. Lock the locomotion contract

Record intended gait, emotional energy, required Facings, movement speed,
cycle duration, Runtime cell, Ground Point, Visual Anchor, target visible
height, and direction-specific costume or equipment rules. Check that
`world distance per cycle = movement speed × cycle duration` can plausibly match
the visible stride.

Finish when the same contract can be supplied for all four Facings without an
unstated directional rule.

## 2. Approve four static Facing references

Create lossless `left`, `right`, `front`, and `back` still images at one scale
and with one stable construction. Store them in
`art/character/<character-name>/`, using the canonical Character identifier.
Show all four to the user at useful detail
and actual play size. Start AutoSprite generation only after the user explicitly
approves them.

Finish when identity, proportions, costume landmarks, anatomical equipment
sides, light direction, Ground Point, and Visual Anchor agree across the four
approved images.

## 3. Delegate the complete cycle to AutoSprite

Upload or register each approved Facing as its own directional AutoSprite
reference. Request the same walking contract, loop intent, duration, frame
size, frame count, background-removal quality, and output quality for all four.
Use the smallest generation scope that can prove the result before spending
credits on the remaining Facings. Ask the user before enabling optional sound
or another credit-bearing extra that was not part of the contract.

AutoSprite owns motion synthesis, gait phases, in-betweening, background
removal, and sprite-sheet generation. Preserve the returned image and metadata
directly beside the owning Character definition under the Game Project's `src/`
tree. Do not author or repair an Animation frame with another
image generator or local drawing, and do not manufacture motion by duplication,
interpolation, pose substitution, or aesthetic frame reordering. Regenerate
through AutoSprite when the motion or portrayal is wrong.

Finish when AutoSprite has produced one traceable export for every required
Facing from its approved reference.

## 4. Adapt without reinterpretation

Convert AutoSprite output to the current `AnimationSheet` contract only when
Fondale cannot consume the source layout directly. Use a lossless deterministic
adapter that preserves RGBA pixels, frame order, cell dimensions, and timing.
Record the AutoSprite Character or asset identifier, spritesheet identifier,
generation settings, and adapter command beside the owning definition under
`src/`.

Layout conversion, metadata translation, and transparent padding are allowed
only when they leave the generated motion unchanged. Cropping, per-frame
rescaling, pixel retouching, frame replacement, and semantic reordering require
regeneration instead.

Finish when the Runtime Asset is a reproducible representation of the
AutoSprite export rather than a second authored Animation.

## 5. Acceptance gates

Apply every gate independently to `left`, `right`, `front`, and `back`:

- motion: feet alternate believably, knees articulate, arm swing suits the
  portrayal, and the first-to-last transition loops continuously;
- registration: Ground Point stays fixed, pelvis and crown move smoothly,
  volumes remain stable, and directional equipment stays anatomical;
- playback: inspect the loop at 1× and 0.25×, then watch at least three
  uninterrupted Engine cycles at near, middle, and far Perspective Scales;
- travel: compare Engine displacement with foot planting and reject visible
  skating;
- artifact: alpha is clean, cells and order are deterministic, and the Engine
  never enlarges the Runtime Asset;
- portrayal: identity, costume, light, and silhouette remain faithful to the
  approved static Facing.

If any gate fails, label that Facing `draft` and regenerate it through
AutoSprite. Build success, attractive individual frames, or a still screenshot
cannot approve a walking Animation.
