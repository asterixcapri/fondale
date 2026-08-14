# Fondale Character package

Use current repository interfaces as the schema source of truth.

Store each Character's authored visual source package under
`art/character/<character-name>/`, using the canonical Character identifier.
Keep the four approved static Facing Art Masters there. Download AutoSprite
sprite sheets and required generation metadata directly beside the owning
Character definition under the Game Project's `src/` tree. Keep any lossless
Runtime adaptation there too; never route generated sprite sheets through the
Art Master directory.

## Deliverables

- lossless scale sheet, silhouette, colour reference, and four user-approved
  static Facing Art Masters for every Appearance;
- the AutoSprite sprite sheet and any derived Runtime sheet under `src/` for
  every `left`, `right`, `front`, and `back` presentation of every Animation,
  with provenance and generation settings;
- an AutoSprite `idle` Animation for every Appearance, plus an AutoSprite
  `speaking` Animation where the Character design requires one;
- distinct left, right, front, and back Runtime sheets for every Character
  Animation;
- stable Ground Point and Visual Anchor documentation;
- `CharacterDefinition` and any required Scene integration;
- Game Project imports that register every approved AutoSprite-derived sheet,
  Facing, returned timing rule, cue, Visual Anchor, and Animation Role;
- actual-size diagnostic compositions at near, middle, and far depth.

## Static Facing and transport checks

Apply portrayal, lighting, silhouette, scale, and construction checks to the
four static Facing Art Masters before user approval. For AutoSprite output,
check only that storage, layout adaptation, metadata translation, and Engine
playback preserve what AutoSprite returned.

- Build a native-resolution table before export. For every representative or
  reachable depth band, record Runtime Asset frame height, Perspective Scale,
  displayed height, and enlargement factor, where
  `displayed height = frame height × Perspective Scale` and
  `enlargement factor = max(1, Perspective Scale)`.
- Use AutoSprite's returned frame size as source data. Record any Engine
  enlargement without using it to request, rescale, or reject generated frames.
- Preserve the exact colour, alpha, and edge data returned by AutoSprite through
  Runtime export.
- Preserve height, body proportions, costume landmarks, and palette across the
  four static `left`, `right`, `front`, and `back` Facing Art Masters.
- Author `left`, `right`, `front`, and `back` static references and register the
  separate AutoSprite Runtime sheet returned for each. The Engine selects the
  sheet matching the Character Facing and never mirrors Character artwork.
- Approve the four static Facing Art Masters before AutoSprite generation. Give
  AutoSprite one explicit directional reference per Facing so Animation
  generation never depends on mirroring or an inferred unseen view.
- Use the Appearance Visual Anchor required by the current Engine interface. If
  AutoSprite's returned sheet geometries cannot satisfy an Engine invariant
  without changing generated pixels or frames, report an integration gap.
- Inspect hands, feet, carried items, costume closures, lighting, and Visual
  Anchor across the four static Facing Art Masters before user approval.
- Keep facing changes spatially centred on the same Ground Point.
- Use one stable Visual Anchor across the four static Facings and compatible
  Appearances; use it to place AutoSprite frames without grading their motion.
- Check the approved static Facings in every required Scene so a Facing change
  preserves the Scene's light source, material language, and silhouette at
  actual play size.
- Inspect an actual-size Engine screenshot at 1:1 display pixels. The package
  fails when the Runtime adaptation introduces block pixels, palette banding,
  alpha fringe, missing frames, or other artifacts absent from AutoSprite's
  returned source.

## AutoSprite Animation integration checks

- Give every Appearance an AutoSprite `idle` Animation and assign it to the
  Default Animation Role with AutoSprite's returned playback metadata.
- When the Character design calls for a distinct speaking performance, give the
  Appearance an AutoSprite `speaking` Animation and assign it to the Speaking
  Animation Role with AutoSprite's returned playback metadata. Otherwise
  document the intentional Engine fallback from Speaking to Default.
- Give every moving Character a Walking Animation Role with required facings.
- Follow [walk-cycle.md](walk-cycle.md) for every new or revised Walking
  Animation. Use AutoSprite's returned output without locally selected poses,
  frames, FPS, duration, cadence, or loop construction.
- Keep every returned frame and its order. Preserve each sheet's returned cell
  geometry and metadata without normalizing the four presentations.
- Derive `framesPerSecond` only when the Fondale interface requires it, using
  AutoSprite's returned frame count divided by its declared duration.
- Play every `left`, `right`, `front`, and `back` output and confirm that the
  Engine follows the returned order, duration, and loop behavior.
- Place Animation Cues within duration at the visible moment of contact or
  transfer they coordinate without modifying AutoSprite frames.
- Treat an output that Fondale cannot represent faithfully as an integration
  gap; keep the AutoSprite source unchanged.

## Definition checks

- Approved AutoSprite output lives inside the Game Project as Runtime Assets;
  external exports and previews do not satisfy integration.
- Initial Scene and Ground Point exist and are walkable.
- Initial Appearance exists; every Animation Role names an available Animation.
- Movement speed is positive; do not use it to grade or modify AutoSprite's
  walking Animation.
- Noun interactions and Sequence references resolve.
- Stable portrayal fields do not author Narrative Facts or change Game State.
- Dialogue-owned fields remain unchanged unless `$define-dialogue` is in scope.
