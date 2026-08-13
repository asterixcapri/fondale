# Michele character package

Michele is the Player Character and project-scale reference for the Capri 1535
Game Project. This package replaces his previous visual design; the previous
sprites were not used as visual references.

## Stable construction

- 23-year-old native of Capri, approximately 172 cm tall;
- lean, work-conditioned build, moderate shoulders, strong forearms and large
  working hands;
- narrow youthful Mediterranean face, sun-warmed olive skin, strong dark
  eyebrows, dark-brown eyes, nearly black uneven wavy hair and short stubble;
- ecru rolled-sleeve linen shirt and worn deep-petrol sleeveless wool doublet
  with an asymmetric closure;
- restrained terracotta waist sash, brown-olive knee breeches, bare lower legs
  and low dark-brown leather shoes;
- leather pouch and working cord on his anatomical left hip; no visible weapon;
- alert neutral expression, with one corner of the mouth slightly raised.

The pouch is directional construction, not decoration that follows the camera:

| Facing | Pouch presentation |
| --- | --- |
| `left` | visible on the profile |
| `right` | hidden behind the body; the visible right hip is clean |
| `front` | visible on image-right |
| `back` | visible on image-left |

The Engine must select the four authored presentations and must not mirror any
of them.

## Portrayal

Michele is practical, curious and ambitious enough to pursue an opportunity
before understanding its danger. His posture is attentive and slightly
forward-leading. Movement and gestures are quick but economical. Idle is nearly
imperceptible: his arms and hands remain still while only a minimal chest breath
changes. Speaking keeps both arms still and uses only restrained mouth and head
motion, so the silhouette never widens during dialogue.

## Art Masters

- `construction-draft.png`: initial identity, costume and palette exploration;
- `turnaround-chroma.png`: corrected generated turnaround source;
- `turnaround.png`: lossless RGBA turnaround with authored left, front, right
  and back views;
- `scale-sheet.png`: height, silhouette and colour construction reference;
- `idle-*.png`, `speaking-*.png`, `walking-*.png`, `use-winch-*.png` and
  `pick-up-*.png`: lossless RGBA key-pose sheets;
- matching `*-chroma.png` files: original generated sources before local alpha
  extraction;
- `engine-scale-check.png`: actual-size harbour composition at far, middle and
  near representative Perspective Scales.

The generated masters use the built-in image generation workflow documented in
`prompts.md`. Chroma-key removal used the installed image-generation helper with
a soft matte and despill. The side-walk source needed a colour-range matte
because the model returned a magenta gradient instead of the requested flat
field. `build-runtime.sh` deterministically crops the key poses, preserves one
scale within each Animation, and exports fitted RGBA Runtime strips.

## Runtime construction

Every Runtime cell is `192×288` RGBA and uses the Visual Anchor `(96, 288)`.
The upright figure reaches approximately 276 pixels. Runtime strips live beside
the Character definition under `src/characters/michele/` and are never enlarged
by the current Scene Perspective Scale.

The `workwear` Appearance owns:

- looping `idle`, `walking`, and `speaking` Animations;
- finite `resolve`, `use-winch`, and `pick-up` Animations;
- a `contact` cue at 0.3 seconds in both physical interaction Animations.

`resolve` reuses the restrained sash-and-horizon key poses as a finite directed
performance. It replaces the former persistent `determined` Appearance because
determination is transient acting, not a lasting visual condition.

Portraits and narrative disguises remain deliberately deferred.
