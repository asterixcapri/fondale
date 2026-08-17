# Michele V3 Character package

Michele is the Player Character and the scale reference for the Capri 1535
Game Project. His current V3 artwork is approved and is reused unchanged; this
package does not regenerate or creatively derive any Character sprite.

## Stable portrayal

- young Caprese harbour worker with a lean, practical silhouette;
- dark wavy hair, warm olive complexion and restrained expression;
- ecru rolled-sleeve shirt, olive work waistcoat, brown cropped trousers and
  low dark leather shoes;
- muted red sash, leather pouch and coiled working rope as stable equipment;
- economical posture and gesture, with no weapon or heroic costume language.

The four previously approved directional Art Masters remain the construction
and stable-portrayal authority:
`left-autosprite-source.png`, `right-autosprite-source.png`,
`front-autosprite-source.png` and `back-autosprite-source.png`.
`turnaround.png` presents them together. The Player's explicit approval of the
left-hand option in the animated side-by-side comparison makes its four-Facing
Runtime sheets, rather than an experimental candidate directory, the
production motion authority. The Engine selects each Facing directly and never
mirrors it.

## Runtime contract

The approved source sheets live beside the Character definition under
`src/characters/michele/`. Ticket 06 derives lossless production adapters with
`256×292` RGBA cells and the stable Visual Anchor `(128, 288)`: the existing
`256×256` cells receive transparent top padding, while the `192×288` action
cells receive transparent side and bottom padding. No source pixel, frame or
order changes. Idle and Speaking retain
their selected 8 FPS playback; Walking retains its selected 16 FPS playback.
At the configured movement speed of 80 Scene Space units per second, one
one-second Walking cycle advances Michele by 80 units.

The single `workwear` Appearance provides looping Default, Walking and Speaking
roles plus the finite directed `pick-up` Animation used to pull the harbour
nets. Frames are not mirrored, redrawn, reordered, cropped, rescaled or
retouched. The source files were previously staged with a
`-godmode-preview` suffix; the active adapters retain their exact pixels.

The existing `192×288` `use-winch` source sheets remain unchanged and dormant
for later action integration. The `pick-up` sheets are now integrated through
transparent-padding-only Runtime adapters because the playable harbour reveal
requires that approved action without changing its pixels.

## Production provenance

The selected left-hand option in the side-by-side comparison comprised all four
Facing presentations. The following SHA-256 values identify both each
production file and its byte-identical source named with the former
`-godmode-preview` suffix:

| Animation | Left | Right | Front | Back |
| --- | --- | --- | --- | --- |
| Idle | `152b524725a9cef107ef0ac6537f6949e439cb65e06886de02cc712c9d3e9d21` | `30dc075bbc21a96be5eedb4ac1985f31ce44956584741288ee48ad992168f8ae` | `3b4072c59479ef2e5c7540ddd1c8ad38104598b517c8b62b9c017ca47a9a229a` | `5430776fc1c417ab2d543f3ddf5a4f22e35d3c3f41998dff2a07d6c6cf4adc6f` |
| Walking | `a892fa03d2b27f65131676aaf7ba727f3ed07a6a17e40dabecf545b2469f941e` | `40d44d0baf0cf27f5b1e6ce04d78b5665efef076c81a9b05b057ee433c2a848c` | `ee622b4afce31ba2732f801db98303f6fec02250982883a4473df108fc4b04a3` | `2f770dc13794a6a0371f8928d9f4e8cd3ce6d703599991e7989d202a158942c4` |
| Speaking | `5ed88a9baf15f8d1bc374f502730a4d361697c0f3eb738ced7fbe2d58b8d0e0d` | `2ca81c5ee7b8dcb8b1c5088b1b0dc5f5583155e53b7475e37632887dca2d317b` | `38c5210d48498ddad09a378853a9a9b02820fc2c9269a87e71a78b1e64410623` | `7f5316fc02ea0391f3f9995fd44fdede4389cca11e0af438332df5f773eba2da` |

No exporter sidecar accompanied these promoted files. Their authoritative
source record is therefore the selected source path, checksum, geometry and
playback already wired in the comparison: 8 FPS Idle, 16 FPS Walking and 8 FPS
Speaking, all looping. Promotion used a direct filesystem copy with only the
filename suffix removed; there was no frame adapter or pixel transformation.

See `scale.md` and the lossless `scale-sheet.svg` diagnostic. Biography,
Personality, Voice
and Character Knowledge remain owned by the existing Character definition and
are intentionally unchanged by this visual package.
