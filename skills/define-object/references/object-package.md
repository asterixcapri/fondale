# Fondale Object package

Use current repository interfaces as the schema source of truth.

## Deliverables

- lossless Art Masters and Runtime Assets for all Scene Appearances;
- one fitted square Inventory Appearance;
- stable Ground Point and Visual Anchor documentation;
- `ObjectDefinition`, Noun interactions, and required Scene integration;
- verification of Scene, Inventory, and consumed lifecycle states.

## Asset checks

- Keep Scene Appearances in world scale and Inventory Appearance in UI scale.
- Match every world frame to the shared visual direction and Scene lighting.
- Preserve a stable Visual Anchor through compatible Appearances and frames.
- Keep transparent bounds free from cropped shadows and alpha fringes.
- Preserve recognisable silhouette and colour cues at Inventory size.

## Lifecycle checks

- Start in one valid Scene at a walkable Ground Point.
- Move to Inventory only through an explicit collection operation.
- Move between Scenes, change Appearance, or become consumed only through valid
  Game Operations.
- Treat consumed as terminal unless the domain model explicitly changes.
- Keep Animation transient; express lasting state through Appearance or location.

## Interaction checks

- Give every advertised Verb a matching resolution or local fallback.
- Use selected-Object verbs for Use or Give combinations.
- Resolve all target identities, Sequence names, variables, and Appearances.
- Keep canonical effects explicit and atomic.
- Verify unsupported combinations produce intentional feedback without state
  change.
