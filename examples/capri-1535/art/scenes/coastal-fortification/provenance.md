# Coastal fortification production artwork provenance

The production Scene package was regenerated on 2026-08-17 with the built-in
OpenAI image generation tool, using the earlier portrait fortification painting
as an architectural reference rather than as final production art. A precise
image edit widened the summit into a genuine upper terrace connected to the
painted stairs. The accepted frame was then fitted and reframed to the exact
`1280×1440` Scene Size, aligning that terrace with the Camera-safe lookout point.
The result remains a lossless full-colour PNG.

`composition.png` is the accepted assembled Composition Art Master. A second
precise image edit painted out the lower-edge parapet, rocks and vegetation to
produce `background.png`, the clean Background Art Master. Tightly traced,
feathered transparent crops produced the separated `left-foreground.png` and
`right-foreground.png` Scenery Art Masters. The accepted Composition was then
rendered from the clean Background and those exact fitted layers, making the
1:1 Runtime recomposition exact. Exact-size copies of all three fitted assets
live under `src/scenes/coastal-fortification/`; the foregrounds are positioned
at `(0,1440)` and `(1280,1440)` with bottom-edge Visual Anchors.
No Character, boat or moving element is baked into the clean Background.

Michele does not appear in production Scene artwork. The geometry diagnostic
uses reference silhouettes of 148, 200 and 243 pixels, derived from his
unchanged 256-pixel V3 Runtime cells at Perspective Scales `0.58`, `0.78` and
`0.95`. No reachable scale enlarges his Runtime artwork.

## Composition prompt

> Rebuild and widen the referenced Capri coastal watchtower into an exact 8:9
> portrait composition intended for a 1280×1440 vertically scrolling Scene.
> Preserve the watchtower, zig-zag stone stair climb, stacked landings, cliff
> and open sea. Show one broad continuous route from a spacious lower landing
> through wide stairs and a middle landing to a spacious upper lookout. Fit a
> 240-pixel-tall reference Character at the near landing and reduce the figure
> naturally toward the lookout. Add foreground parapets and vegetation at the
> lower edges for intentional occlusion without narrowing the route. Reserve
> unobstructed sea in the upper-left quadrant as the exact corridor for a later
> arriving boat, but depict no boat. Use an original hand-painted illustrated
> neo-retro 1990s graphic-adventure language with chunky masses, selective
> texture, late golden-hour amber light and cool violet-blue shadows. No people,
> Characters, animals, boats, ships, text, UI or watermark.

The source output remains in the local built-in generation store. Production
copies live in the Game Project; no runtime code depends on that external path.

## Clean-plate prompt

> Preserve the accepted composition exactly while painting out only the two
> lower-edge foreground occluders: the near parapet and agave at lower left,
> and the near rocks and shrubs at lower right. Reconstruct the broad sunlit
> stone landing behind them with matching perspective, texture, golden-hour
> light and cool shadows. Do not change the tower, summit terrace, stairs, sea,
> sky, route or framing. No people, boats, text, UI or watermark.
