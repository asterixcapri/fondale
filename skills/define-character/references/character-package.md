# Fondale Character package

Use current repository interfaces as the schema source of truth.

## Deliverables

- lossless scale sheet, silhouette, turnaround, and colour reference;
- Art Masters and Runtime Assets for every Appearance and Animation;
- stable Ground Point and Visual Anchor documentation;
- `CharacterDefinition` and any required Scene integration;
- actual-size diagnostic compositions at near, middle, and far depth.

## Visual checks

- Preserve height, body proportions, costume landmarks, and palette across
  front, back, and side frames.
- Keep facing changes spatially centred on the same Ground Point.
- Use one stable Visual Anchor across frames and compatible Appearances.
- Keep lighting neutral enough to inhabit required Scenes while preserving the
  shared material and edge language.
- Verify silhouettes against Background and Scenery at actual play size.

## Animation checks

- Give every Appearance a Default Animation Role.
- Give every moving Character a Walking Animation Role with required facings.
- Let speaking fall back to default only when that performance is intentional.
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
