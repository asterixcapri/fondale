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

## The dead Appearance

The prologue ends over the sailor's body, so the Character carries a second
Runtime image, `src/characters/wounded-sailor/dead.png`, at the same `166x166`
deck scale and on the same `(83, 164)` Visual Anchor: nothing shifts on screen
when he stops breathing.

`dead-art-master.png` is the untouched `1024×1024` generated result behind it,
produced on 2026-08-18 through the `imagegen` skill's CLI fallback against the
OpenAI image API — `gpt-image-1.5`, edit mode, `static-art-master.png` supplied
at high input fidelity so the man, his clothing, his bandage and the dusk key
light carry over unchanged. The prompt asked only for the pose and the life to
change: the torso settled back onto the deck, the head fallen back with the jaw
slack, the hand slipped off the bandages and lying open palm-up, the legs
relaxed and rolled outward, the skin drained. It prohibited gore, props, text,
other figures and any ground, shadow or scenery, and the generated source
carries native alpha, so no chroma removal was necessary.

The Runtime image is Lanczos-fitted from it at the scale that keeps his head
the size it is in `static.png`, which lands the body at `142×133` inside the
`166×166` cell, and is placed so its ground contact sits on the shared Visual
Anchor. It then receives the Scene-matching derivative grade, one step colder
and duller than the living Appearance: brightness `74%`, saturation `55%`, a
`14%` indigo dusk tint and the same `0.25 px` edge-softening blur. The Art
Master remains unchanged.

`actual-size-diagnostic.png` presents that `256×256` Runtime cell at 1:1 inside
the `1280×720` Logical Resolution, with its cell bounds and Visual Anchor drawn.
It is the record of the size review this package passed, and the only
diagnostic it keeps.
