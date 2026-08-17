# Harbour production artwork provenance

Generated on 2026-08-16 with the built-in OpenAI image generation tool. The
previous harbour was supplied only as a loose location and panoramic-layout
reference; none of its pixels are present in these masters.

## Composition and clean plate

The composition prompt requested a completely new `8:3` morning harbour at
Capri in 1535 in Fondale's illustrated neo-retro language: a broad connected
stone quay, sheltered cobalt inlet, limestone architecture, a gozzo, a reserved
Raffaele work position, a winch visibly missing its handle, covering fishing
nets, and left/right connections. It required architecture sized around
Michele's approximately `249 px` near silhouette and `145 px` far silhouette,
with no characters, visible oil flask, text, UI, modern objects, photorealism,
pixel enlargement, or watermark.

The clean-plate edit removed only the gozzo, winch, and net heap from that new
composition and requested complete water, quay edge, and limestone paving
behind them with no fragments, duplicate shadows, holes, or ghost silhouettes.
The accepted `composition.png` is the exact 1:1 recomposition of
`background.png` plus the three fitted Runtime Assets at their authored Scene
Space positions.

## Separated Scenery

Three generation prompts recreated the accepted gozzo, missing-handle winch,
and covering net heap as isolated subjects under the same upper-left morning
light and perspective. Each requested a flat `#ff00ff` chroma field, generous
padding, no unrelated Scene content, text, or watermark. The winch explicitly
forbade a crank handle; the nets explicitly required enough density to conceal
an oil flask without depicting the flask.

The first winch and nets outputs introduced studio gradients and were rejected.
Targeted edits changed only those backgrounds to uniform magenta. The installed
imagegen chroma-removal helper then produced the final RGBA Art Masters using
border sampling, soft matte, thresholds `12/220`, and despill. Runtime Assets
are trimmed and downscaled derivatives; Art Masters remain lossless PNGs.

## Moved nets Appearance

Ticket 06 edited only the approved covering-net subject into a lower compact
heap concentrated on the right, preserving its material identity, viewing
angle, scale, warm morning illumination and canvas. The built-in image workflow
produced a flat `#ff00ff` source; the installed chroma-removal helper used
border sampling, soft matte, thresholds `12/220`, and despill to create
`nets-moved-master.png`. The `440×178` Runtime derivative keeps the covering
Appearance's bounds, Baseline, position and Visual Anchor. A lossless two-frame
sheet pairs the covering and moved Runtime images for the Cue-driven reveal.

## Installed winch Appearance

Ticket 08 recomposes the accepted missing-handle Art Master with the isolated
installed Appearance from the persistent winch-handle Object. The handle was
produced through the built-in OpenAI image editing workflow documented in its
Object package, then fitted at `192×208` master pixels at offset `1224,360`.
The same deterministic composition uses the `48×52` Runtime handle at offset
`306,90`. This produces `winch-installed-master.png` and its `384×255` Runtime
derivative without changing any missing-state winch pixel. Both winch states
therefore share the exact cell size, position and `192,255` Visual Anchor; the
persistent installed rendering separates the unchanged winch Scenery from the
single Object-owned handle at those coordinates.

## Retained files

Ticket 12 removed the abandoned exploration and diagnostic outputs that had
accumulated beside this package: an alternate quay composition and its clean
plate, the pre-rebuild boat and winch subjects, the superseded blocking
diagram, raster copies of the geometry overlay, and stale Engine screenshots.
Every file that remains is production art or its record:

- `background-master.png`: the lossless `2048×768` clean Background Art Master.
  `src/scenes/harbour/background.png` is its `1920×720` Runtime derivative.
- `gozzo-master.png`, `nets-covering-master.png`, `nets-moved-master.png`,
  `winch-missing-handle-master.png` and `winch-installed-master.png`: the
  separated Scenery Art Masters described above, each with a fitted Runtime
  derivative under `src/scenes/harbour/`.
- `composition.png`: the approved `1920×720` recomposition of the Background
  and those Runtime Assets at their authored Scene Space positions.
- `geometry.svg`: the lossless Scene Space overlay drawn over `composition.png`.
