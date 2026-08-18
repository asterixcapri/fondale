# Oilskin bundle close-up provenance

`close-up-art-master.png` is the untouched `1536×1024` generated result and is
the Art Master for the Detail View that ends the prologue: the opened oilskin
with the broken seal of the *Santa Marta* and the torn registry fragment.

Two Runtime images are fitted from it, both at the `1280x720` Logical
Resolution a Detail View image must match exactly. `src/detail-views/oilskin-bundle/close-up.png`
is the reading image: the Art Master cropped to `1536x864` at `+0+90`, which
keeps the whole find and drops the empty planking above it, then Lanczos-resized.
`src/detail-views/oilskin-bundle/closing.png` is the image the Game Session ends
on: the same fit graded down to brightness `62%` and saturation `58%`, with a
`14%` indigo tint and an elliptical vignette centred on the seal, so the
prologue closes on the light going out of what Michele found. Neither image
carries Hotspot geometry; the seal and the fragment are authored as Detail View
Hotspots in `src/detail-views/oilskin-bundle/index.ts`.

Unlike every other Art Master in this Example, it was not produced with Codex's
built-in image-generation tool. It was generated on 2026-08-17 through the
`imagegen` skill's CLI fallback against the OpenAI image API, in edit mode with
`src/scenes/drifting-boat/background.png` supplied as a style, lighting and
palette reference at low input fidelity.

The prompt asked for an extreme close-up of the opened oilskin on the deck
planking, a broken red wax ship seal cracked in half with its device still part
legible, and a torn rag-paper registry fragment carrying worn iron-gall script
and a column of figures that must never read as transcribable words. A first
attempt came back dominated by amber and was rejected; the accepted version
restates the cold blue-violet dusk as the key across the whole frame and admits
warmth only where the lantern touches the wax and the paper.
