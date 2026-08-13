# Fondale Character package

Use current repository interfaces as the schema source of truth.

## Deliverables

- lossless scale sheet, silhouette, turnaround, and colour reference;
- a separate lossless Art Master and derived Runtime strip for every `left`,
  `right`, `front`, and `back` presentation of every Animation;
- an explicit looping `idle` Animation for every Appearance, plus a distinct
  looping `speaking` Animation where the Character design requires one;
- distinct left, right, front, and back Runtime strips for every Character
  Animation;
- stable Ground Point and Visual Anchor documentation;
- `CharacterDefinition` and any required Scene integration;
- actual-size diagnostic compositions at near, middle, and far depth.

## Visual checks

- Build a native-resolution table before export. For every representative or
  reachable depth band, record Runtime Asset frame height, Perspective Scale,
  displayed height, and enlargement factor, where
  `displayed height = frame height × Perspective Scale` and
  `enlargement factor = max(1, Perspective Scale)`.
- Size Runtime Asset frames so the Engine displays them at 1:1 or reduces them
  throughout the required Scene space. If any required Perspective Scale is
  greater than 1, increase the project-wide native Character size and
  recalibrate Scene Perspective Scale stops together; do not accept renderer
  enlargement as the Character-scale mechanism.
- Judge effective source resolution, not only displayed size: a large canvas
  containing a previously enlarged small sprite still fails the gate.
- Preserve RGB/RGBA colour, controlled anti-aliasing, and alpha edges through
  Runtime export. Apply palette quantization or nearest-neighbour resampling only
  when the project's confirmed art direction requires it and an actual-size
  comparison shows no objectionable banding, jaggedness, or matte fringe.
- Preserve height, body proportions, costume landmarks, and palette across
  `left`, `right`, `front`, and `back` frames.
- Author `left`, `right`, `front`, and `back` presentations and derive a
  separate Runtime strip for each. The Engine selects the strip matching the
  Character Facing and never mirrors Character artwork. Judge the authored
  result rather than policing how an artist produced it.
- Keep Runtime cell dimensions and the Visual Anchor identical across every
  Facing and Animation in one Appearance.
- Inspect every presentation. Hands, feet, carried items, costume closures,
  lighting, and Visual Anchor must remain coherent while preserving genuine
  direction-specific construction and action.
- Keep facing changes spatially centred on the same Ground Point.
- Use one stable Visual Anchor across frames and compatible Appearances.
- Check lighting in every required Scene so a Facing change never reverses the
  Scene's light source; preserve the shared material and edge language.
- Verify silhouettes against Background and Scenery at actual play size.
- Inspect an actual-size Engine screenshot at 1:1 display pixels. The package
  fails when Character edges or interior features reveal visible upscaling,
  block pixels, palette banding, or chroma-key fringe that is absent from the
  Art Master.

## Animation checks

- Give every Appearance an explicit looping `idle` Animation and assign it to
  the Default Animation Role. A walking cycle or static fallback is not an idle
  performance.
- When the Character design calls for a distinct speaking performance, give the
  Appearance an explicit looping `speaking` Animation and assign it to the
  Speaking Animation Role. Otherwise document the intentional Engine fallback
  from Speaking to Default.
- Keep idle motion restrained and seamless at its first-to-last transition;
  preserve the Character's stable Ground Point and avoid mechanical whole-body
  bobbing.
- Make speaking visibly distinct from idle through readable mouth, head, hand,
  or posture changes appropriate to the Character's Voice; keep it neutral
  enough to support every authored Line unless a directed performance owns a
  more specific Animation.
- Give every moving Character a Walking Animation Role with required facings.
- Follow [walk-cycle.md](walk-cycle.md) for every new or revised Walking
  Animation. Approve its registered keys and motion proof before integration.
- Keep the frame count synchronized across all four presentations. Timing,
  loop behavior, duration, and Animation Cues belong to the Animation and must
  remain shared across Facing.
- Play every `left`, `right`, `front`, and `back` cycle and inspect each
  first-to-last transition at actual size.
- Verify idle and speaking in every Facing in which the Character may converse,
  including distinct `left` and `right` presentations.
- Keep strip frame dimensions and ordering deterministic.
- Place Animation Cues within duration at the visible moment of contact or
  transfer they coordinate.
- Inspect the first-to-last transition of every looping Animation.

## Definition checks

- Initial Scene and Ground Point exist and are walkable.
- Initial Appearance exists; every Animation Role names an available Animation.
- Movement speed is positive and visually compatible with the walk cycle.
- Noun interactions and Sequence references resolve.
- Stable portrayal fields do not author Narrative Facts or change Game State.
- Dialogue-owned fields remain unchanged unless `$define-dialogue` is in scope.
