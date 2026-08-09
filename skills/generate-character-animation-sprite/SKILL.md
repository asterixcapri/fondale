---
name: generate-character-animation-sprite
description: Generate, extend, normalize, or validate coherent character animation sprites for a Fondale Game Project. Use for directional walking, idle, speech, turns, interactions, reusable gestures, story-specific actions, animation Art Masters, runtime PNG strips, frame alignment, palette matching, loop previews, or diagnosing frame-to-frame character drift.
---

# Generate Character Animation Sprite

Produce animation as a small art pipeline: lock the Character's identity, author motion, build deterministic Runtime Assets, then judge the result in motion and in scene.

## Preserve the project contract

- Use the canonical terms in `CONTEXT.md`: Character, Appearance, Art Master, Runtime Asset, Ground Point, and Visual Anchor.
- Inspect the target Game Project before editing. Locate its Character definition, existing masters, Runtime Assets, representative Backgrounds, generation notes, and asset tools.
- Treat existing art as evidence. Preserve intentional asymmetry, costume construction, proportions, palette, lighting direction, and apparent camera height.
- Keep Art Masters and generation notes under the Game Project's art tree. Put each Runtime Asset beside the definition that owns it. Never import an Art Master at runtime.
- Inspect the current public definitions and renderer before promising integration. Record unsupported animations as ready Art Masters; change the Engine only when the user separately asks for that capability.

## Build the animation manifest

Read [animation-requirements.md](references/animation-requirements.md) before defining or expanding a Character's animation set.

Create or update `art/characters/<character>/animation-manifest.md`. For every animation, record:

- stable English identifier;
- purpose and authored use;
- facing or transition;
- loop, one-shot, or hold behavior;
- pose sequence, frame count, and playback rate;
- Art Master and intended Runtime Asset paths;
- `supported`, `master-ready`, or `capability-needed` integration status.

Derive optional actions from Game Definitions, Sequences, interactions, and the user's brief. Do not manufacture the complete optional catalog. The manifest is complete when every requested animation and every character action found in authored content is either scheduled or explicitly excluded.

## Lock identity and scale

Choose one canonical full-body pose and a front/side/back turnaround from existing masters. If either is missing, generate it before generating motion. Use the installed bitmap image-generation capability and attach the strongest existing Character and scene references.

Record a compact identity lock in the manifest or adjacent generation notes:

- invariant body and face proportions;
- garment shapes, closures, folds, footwear, hair, and carried items;
- left/right asymmetries;
- canonical standing height at the Art Master scale;
- target Runtime Asset height, palette source, and lighting source.

The identity lock is accepted only when the views depict the same Character and fit a representative Background at both near and far Perspective Scale.

## Author motion before generating pixels

Write an ordered pose schedule for each animation. Name mechanically meaningful poses such as contact, down, passing, up, settle, anticipation, action, recovery, and hold. Make the first frame a stable pose that can be displayed when playback stops. Make loops return cleanly to that pose.

Generate one action and one facing per sheet. For each generation or edit:

- attach the identity lock and canonical visual references;
- request the exact number and order of frames from the pose schedule;
- keep camera, scale, light, palette, costume, and facial construction fixed;
- use a flat removable background outside the Character palette or true transparency;
- keep the full body and every moving limb inside every cell;
- omit labels, borders, scenery, cast shadows, glow, motion blur, and duplicate figures;
- save the prompt or edit instruction beside the Art Master.

Generate left and right side masters separately. Never mirror a side view: bags, closures, tools, injuries, hair, handed actions, and lighting can differ even when the silhouette initially looks symmetrical.

Prefer editing from the canonical Character over regenerating independent frames. If the head, torso, garment construction, or carried items boil between frames, freeze those regions from a canonical frame and animate only the parts that must move. A smaller redraw is preferable to another unconstrained full-sheet generation.

## Build Runtime Assets

Extract generated grids into numbered RGBA frames, correcting cell boundaries manually when the generator did not honor an exact grid. Resolve the helper script relative to this `SKILL.md`.

The helper requires Pillow. If `python -c "from PIL import Image"` fails, create a task-local virtual environment outside the repository and install `scripts/requirements.txt` into it; keep Python tooling out of the Game Project's runtime dependencies.

Use the same canonical body height across the Character's animations, one scale factor across every frame in a strip, and preserve each frame's aspect ratio. Align every frame through its Ground Point. When bottom-center is not the true Ground Point, provide measured per-frame anchors.

```sh
python <skill-dir>/scripts/sprite_strip.py split master.png work/frames \
  --columns 8 --rows 1

python <skill-dir>/scripts/sprite_strip.py compose runtime.png work/frames/*.png \
  --height 100 --colours 32
```

The compose command reports the shared cell size and Visual Anchor. Store those values in the owning Appearance when the current Engine supports that animation.

Quantize color while preserving alpha. Compare the result with the representative Background rather than trusting a color count alone. Keep separate left and right outputs through the entire pipeline.

## Validate the result

Run deterministic checks first:

```sh
python <skill-dir>/scripts/sprite_strip.py validate runtime.png \
  --frames 8 --max-colours 32

python <skill-dir>/scripts/sprite_strip.py preview runtime.png preview.gif \
  --frames 8 --fps 10 --scale 3
```

Then inspect the contact sheet, the animated preview, and the animation composited into at least one representative Scene. Check at native near scale and the smallest expected Perspective Scale.

Reject or revise the animation when any of these gates fails:

- identity, outfit, or asymmetry changes between frames or facings;
- the Visual Anchor slides, planted feet skate, or the body changes scale;
- motion lives mainly in the torso or head when the action calls for limb motion;
- a loop pops at its seam or a one-shot lacks anticipation, action, and recovery;
- transparent edges show a fringe against the Scene;
- palette, contrast, or lighting makes the Character look pasted onto the Background;
- the silhouette does not communicate the action at Runtime Asset size;
- frame order, strip dimensions, playback rate, or engine metadata disagree.

An Art Master is not accepted from a static sheet alone. View real playback. If the environment cannot display animation, deliver the preview and mark motion approval as pending human review.

## Integrate only supported animations

Update the Character definition only for Appearance kinds exposed by the current public interface. Verify the exact contract in `src/public/definitions.ts`, asset loading, and the renderer.

For the current basic walking Appearance, confirm whether the Engine still accepts `side`, `front`, and `back` strips and mirrors `side` for left-facing movement. If so, mark distinct left/right walking integration as `capability-needed`; do not discard one side, silently mirror it, or select an inaccurate compromise strip. Keep idle, speech, turns, gestures, and other unsupported outputs at `master-ready` rather than inventing private runtime conventions.

When integration changes tracked code, run the repository's build and browser verification commands. Exercise every supported facing in the browser fixture.

## Finish with evidence

Report:

- Art Masters, prompt notes, Runtime Assets, manifest, and previews created or changed;
- frame count, cell size, Visual Anchor, playback rate, palette limit, and target height;
- which animations are integrated, master-ready, capability-needed, or rejected;
- the representative Scene and scales used for visual review;
- remaining art debt, especially boil, foot sliding, palette mismatch, or mirrored asymmetry.

Finish only when every manifest row has a disposition, every produced strip passes deterministic checks, every accepted animation has been viewed in motion, and supported runtime changes pass project verification.
