# Oilskin bundle artwork provenance

The three masters were drawn procedurally with ImageMagick vector primitives on
2026-08-17 because no AI image-generation tool or key was available in the
ticket environment; the deterministic draw scripts are retained in the ticket
work notes. `master.png` (wrapped, `224×144`), `opened-master.png` (opened,
`288×176`) and `inventory-master.png` (`128×128`) are the lossless Art Masters
and remain unchanged by derivation.

The wrapped master depicts one dark oilskin parcel lashed with two rope
straps, a small wax seal and a coral dusk rim light matching the drifting-boat
Scene palette. The opened master unfolds the same oilskin into a cloth mat
holding the torn parchment registry fragment and the broken ship seal in two
offset halves; identity is preserved through palette, strap colour and seal
hue rather than pixel reuse. The inventory master is an independent `128×128`
icon of the wrapped parcel.

Runtime derivation mirrors the wounded sailor's grade: each master is
Lanczos-fitted to its Runtime cell (`56×36` wrapped Scene, `72×44` opened
Scene, `32×32` Inventory), then receives brightness `88%`, saturation `78%`
and a `10%` indigo dusk tint with restored alpha, so the Object sits inside
the boat Scene's dusk illumination. Derived Runtime Assets never overwrite
the masters.

The opened Scene Appearance was retired when the prologue finale changed: what
the untied bundle holds is now presented as a Detail View rather than laid back
on the deck, so the Object never returns to the Scene and `opened-master.png`
keeps no Runtime copy. The master stays here, and the diagnostic still records
the size review the retired Appearance passed.

`engine-scale-check.png` is the `1280×720` actual-play-size diagnostic: the
wrapped Appearance at its `94%` Perspective Scale ground point beside the
sailor, the opened Appearance at the same anchor on the open deck, and the
Inventory Appearance at native resolution.
