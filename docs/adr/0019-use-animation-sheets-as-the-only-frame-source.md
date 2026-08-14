# Use Animation Sheets as the only frame source

Fondale requires every Animation to use one `AnimationSheet`: a Runtime Asset
image plus an ordered sequence of axis-aligned `AnimationFrame` rectangles. An
Object or Scenery Animation owns one `sheet`; a Character Animation owns
directional `sheets` for `left`, `right`, `front`, and `back`; both keep their
shared playback rules in `AnimationTiming`. A static Animation is an
`AnimationSheet` with one frame, and `uniformGrid` provides row-major frame
coordinates for regular grids.

This replaces horizontal `AnimationStrip` values and separate-image frame
lists without backward compatibility during alpha. It keeps one Engine frame
source independent of AutoSprite or another exporter: Game Project asset
pipelines must pack separate source images before authoring, and vendor JSON is
not part of Fondale's public interface. Trimming, rotation, per-frame pivots,
fractional coordinates, and implicit clipping remain outside the contract;
`startGame` validates the resulting declarative sheets and their Appearance
cell-size invariants.
