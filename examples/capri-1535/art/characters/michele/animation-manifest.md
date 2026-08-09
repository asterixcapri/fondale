# Michele animation manifest

## Identity lock

Michele is a 23-year-old Caprese working man in 1530. He has a lean, practical
build shaped by boats, ropes, steep paths, and daily labour rather than formal
training. He is Mediterranean, sun-tanned, with thick near-black brown hair
that is slightly untidy. His face is young, alert, curious, and expressive;
his physique is neither large nor overtly muscular.

His fixed costume follows the documented Italian garment system around 1530:
an undyed ivory linen shirt with a gathered round neck, narrow neckband, short
tied opening, and roomy sleeves bunched irregularly to the forearms; a fitted
plain walnut-brown wool farsetto with a natural-waist seam, close front
fastening, small shoulder wings, and short broad waist tabs; compact unslashed
blue-grey upper hose with a restrained integral codpiece; fitted dull wool
calze covering the full lower leg and tied below the knee; and low broad-toed
brown leather latchet shoes. A narrow leather belt reinforces the waist. He is
right-handed. A soft leather pouch stays on his left hip and a small plain
working knife in an undecorated sheath stays on his right hip. These
asymmetries must remain on their physical sides in every facing and must never
be mirrored.

He must read as a modest sixteenth-century islander who knows boats and local
paths, never as a Caribbean pirate, soldier, nobleman, or professional hero.
His posture is relaxed and self-assured on Capri. His acting uses observant eye
lines, dry reaction pauses, and expressive but practical hand gestures.

The visual treatment follows the approved Capri Backgrounds: an original,
hand-painted early-1990s VGA adventure aesthetic with simplified readable
forms, clustered painterly dithering, warm Mediterranean highlights, and
violet-brown shadows. Lighting comes from the upper left. The fixed camera is
slightly elevated and three-quarter where appropriate.

- Canonical Art Master height: 946 px maximum across the four turnaround views.
- Target Runtime Asset height: 100 px at 100% Perspective Scale.
- Smallest review scale: 55% (55 px apparent height).
- Runtime palette target: at most 32 colours per strip, preserving alpha.
- Palette and lighting sources: canonical `alley` and `harbour` Background Art
  Masters.
- Costume evidence and reconstruction limits:
  `../../../docs/michele-costume-1530-research.md`.
- Previous Michele sprite sheets and Runtime Assets are explicitly excluded as
  identity, costume, proportion, pose, palette, or motion references.

## Turnaround history

- `michele-turnaround-v1-rejected.png`: rejected because the front-view pouch
  and working knife swapped physical sides.
- `michele-turnaround-v2-rejected.png`: corrected accessory sides, then
  rejected because the waistcoat, breeches construction, and lace-up ankle
  boots read as later clothing rather than a historically credible 1530
  Caprese working costume.
- `michele-turnaround-v3-rejected.png`: introduced the researched 1530 garment
  system, then rejected because the calze retained a knitted texture, the shoes
  retained multi-lacing, the upper hose remained too baggy, and the codpiece
  construction was not readable.
- `michele-turnaround-v4.chroma.png`: generated chroma-key source for the final
  candidate.
- `michele-turnaround-v4.png`: RGBA turnaround candidate. Identity consistency,
  accessory sides, alpha edges, and Scene fit passed review and this version
  became the identity lock for the complete animation set.

The front view was reduced to a 36 x 100 px, 32-colour diagnostic Runtime Asset
with Visual Anchor `(18, 100)`. It was reviewed in the harbour Scene at 100%
and 55% Perspective Scale. This diagnostic was not committed as a Runtime
Asset because the turnaround is not an animation owned by the current public
Appearance contract.

## Animation set

| ID | Purpose / used by | Facing | Playback | Poses | Frames / fps | Master | Runtime | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `walk_front` | Player locomotion toward camera | front | loop | contact L, down L, passing L, up L, contact R, down R, passing R, up R | 8 / 10 | `walk-front-v2.png` | — | master-ready |
| `walk_back` | Player locomotion away from camera | back | loop | contact L, down L, passing L, up L, contact R, down R, passing R, up R | 8 / 10 | `walk-back-v1.png` | — | master-ready |
| `walk_left` | Player locomotion to screen left | left | loop | contact L, down L, passing L, up L, contact R, down R, passing R, up R | 8 / 10 | `walk-left-v1.png` | — | capability-needed |
| `walk_right` | Player locomotion to screen right | right | loop | contact R, down R, passing R, up R, contact L, down L, passing L, up L | 8 / 10 | `walk-right-v3.png` | — | capability-needed |
| `idle_front` | Neutral stopped pose and restrained ambient motion | front | loop | stable, breathe, blink, settle | 4 / 4 | `idle-front-v1.png` | — | master-ready |
| `idle_back` | Neutral stopped pose away from camera | back | loop | stable, breathe, weight shift, settle | 4 / 4 | `idle-back-v1.png` | — | master-ready |
| `idle_left` | Neutral stopped pose facing left | left | loop | stable, breathe, blink, settle | 4 / 4 | `idle-left-v1.png` | — | master-ready |
| `idle_right` | Neutral stopped pose facing right | right | loop | stable, breathe, blink, settle | 4 / 4 | `idle-right-v1.png` | — | master-ready |
| `talk_left` | Dialogue acting when the listener is to the left | left | loop with neutral exit | neutral, open gesture, dry reaction, hand emphasis, neutral | 5 / 8 | `talk-left-v1.png` | — | master-ready |
| `talk_right` | Dialogue acting when the listener is to the right | right | loop with neutral exit | neutral, open gesture, dry reaction, hand emphasis, neutral | 5 / 8 | `talk-right-v1.png` | — | master-ready |
| `use_mid_left` | General waist-height use, including harbour mechanisms | left | one-shot | stable, anticipation, reach, action, hold, recovery | 6 / 10 | `use-mid-left-v1.png` | — | master-ready |
| `use_mid_right` | General waist-height use, including harbour mechanisms | right | one-shot | stable, anticipation, reach, action, hold, recovery | 6 / 10 | `use-mid-right-v1.png` | — | master-ready |
| `pick_up_left` | Collect an Object from the ground | left | one-shot | stable, anticipation, crouch, grasp, lift, recovery | 6 / 10 | `pick-up-left-v1.png` | — | master-ready |
| `pick_up_right` | Collect an Object from the ground | right | one-shot | stable, anticipation, crouch, grasp, lift, recovery | 6 / 10 | `pick-up-right-v1.png` | — | master-ready |

## Motion generation history

- `walk-front-v1.png` was rejected because it supplied only seven figures for
  the required eight-frame cycle. `walk-front-v2.png` supplies the complete
  ordered cycle.
- `walk-right-v1.png` was rejected because adjacent figures overlapped and
  could not be separated into independent frames.
- `walk-right-v2.png` was rejected because the second row faced screen left.
  `walk-right-v3.png` keeps all eight figures facing screen right.
- Every accepted animation has a corresponding `.chroma.png` generation source
  and `.prompt.md` generation note. Alpha-processed `.png` files are the
  canonical motion Art Masters.

## Runtime diagnostic results

The accepted Art Masters were split in reading order, aligned from an
independently estimated shoe-sole Ground Point, normalized to 100 px cell
height, and quantized to 32 visible RGB colours while preserving alpha. These
diagnostic strips and previews are reproducible intermediates and therefore
are not committed as Art Masters or private Runtime Assets.

| Animation | Cell | Visual Anchor | Colours | Strip validation | Motion and Scene review |
| --- | --- | --- | --- | --- | --- |
| `walk_front` | 45 x 100 | (22, 97) | 32 | pass, no warnings | pass at 100% and 55% |
| `walk_back` | 40 x 100 | (19, 97) | 32 | pass, no warnings | pass at 100% and 55% |
| `walk_left` | 45 x 100 | (24, 97) | 32 | pass, no warnings | pass at 100% and 55% |
| `walk_right` | 57 x 100 | (28, 97) | 32 | pass, no warnings | pass at 100% and 55% |
| `idle_front` | 39 x 100 | (18, 97) | 32 | pass, no warnings | pass at 100% and 55% |
| `idle_back` | 39 x 100 | (19, 97) | 32 | pass, no warnings | pass at 100% and 55% |
| `idle_left` | 23 x 100 | (10, 97) | 32 | pass, no warnings | pass at 100% and 55% |
| `idle_right` | 24 x 100 | (12, 97) | 32 | pass, no warnings | pass at 100% and 55% |
| `talk_left` | 37 x 100 | (20, 97) | 32 | pass, no warnings | pass at 100% and 55% |
| `talk_right` | 33 x 100 | (13, 97) | 32 | pass, no warnings | pass at 100% and 55% |
| `use_mid_left` | 48 x 100 | (35, 97) | 32 | pass, no warnings | pass at 100% and 55% |
| `use_mid_right` | 64 x 100 | (16, 97) | 32 | pass, no warnings | pass at 100% and 55% |
| `pick_up_left` | 55 x 100 | (35, 97) | 32 | pass, no warnings | pass at 100% and 55% |
| `pick_up_right` | 50 x 100 | (21, 97) | 32 | pass, no warnings | pass at 100% and 55% |

## Integration note

The current public Engine interface supports only one `side` walking strip plus
`front` and `back`, and mirrors `side` for the opposite facing. Distinct
`walk_left` and `walk_right` Runtime Assets, and every idle, speech, use, and
pick-up animation, require an Engine Capability before integration. Preserve
their Art Masters separately; do not mirror them or introduce a private runtime
convention. Front and back walking are also left unintegrated so the Runtime
Asset set cannot accidentally combine the new identity with an unrelated side
strip.
