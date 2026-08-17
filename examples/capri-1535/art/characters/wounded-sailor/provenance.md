# Wounded sailor artwork provenance

`static-art-master.png` is the untouched `1254×1254` lossless output produced
on 2026-08-16 with Codex's built-in image-generation tool. The prompt requested
one unnamed wounded 1535 Mediterranean sailor, seated/reclining toward
screen-left and lit by the boat Scene's blue-violet dusk and coral rim light.
A focused edit removed the initially generated oilskin bundle and placed his
empty hand on his bandaged ribs, preserving the later Object handoff. Both
requests prohibited alternate poses, animation sheets, modern objects, text
and gore.

The generated source already contains native alpha with transparent corners;
no chroma removal was necessary. The sole Runtime image is Lanczos-fitted into
a transparent `256×256` cell, then receives one Scene-matching derivative
grade: brightness `76%`, saturation `68%`, a `12%` indigo dusk tint and a
`0.25 px` edge-softening blur. The Art Master remains unchanged. The Runtime
image lives at `src/characters/wounded-sailor/static.png`; its stable Visual
Anchor is `(128, 252)`. Every authored Facing references that same single image
and one-frame presentation; there are no visual variants.

`actual-size-diagnostic.png` presents that `256×256` Runtime cell at 1:1 inside
the `1280×720` Logical Resolution, with its cell bounds and Visual Anchor drawn.
It is the record of the size review this package passed, and the only
diagnostic it keeps.
