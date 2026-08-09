---
name: character-animation-frames
description: Produce the image-generation prompt set that turns one Fondale Character into usable animation frames — idle, walk cycle, run, talk, look, pick up — together with the acceptance checks that decide whether the generated frames can ship. Use this whenever a Character needs artwork, whenever someone asks how to prompt an image model for a character sprite, walk cycle, sprite sheet or animation frames, whenever generated frames look wobbly or shimmer between frames, and whenever an existing Character gains a new Appearance or pose. Reach for it before asking any image model for a character sheet, because asking for a whole sheet is the known failure mode in this repository.
---

# Character animation frames

## Why this skill exists

This repository already spent four attempts on this exact problem and measured the
outcome. Read `examples/capri-1535/.scratch/vertical-slice/issues/01-sprite-di-michele.md`
before starting — it is the evidence behind every rule below. Its opening line is
the whole lesson:

> Backgrounds generate; eight consistent frames of the same character do not.

The diagnosis was specific. In a generated sheet each cell is an independent
drawing with the motion merely *suggested*, so the legs walk while the hair
volume, the shoulder width and the waistcoat fastening change underneath. Played
back, the legs move and the rest boils.

Two consequences shape everything that follows.

**Ask for one pose per image, never a sheet.** A sheet buys no consistency — the
cells are independent generations either way — and it costs you a coloured halo
that cannot be keyed out, an irregular grid that no slicing tool can read, feet
sitting at different heights, and figures far too small to use.

**Protect the upper body, not the legs.** In an authentic walk cycle the change
between consecutive frames concentrates in the legs. When it concentrates in the
torso, the set is unusable. That is a measurable property, not a matter of taste,
and it is the acceptance test at the end of this skill.

## What the engine can consume today

Check this before generating frames, so nobody produces artwork the engine cannot
play. Fondale 1.1 accepts exactly two Appearance kinds for a Character
(`src/public/definitions.ts`):

- `static` — one PNG, used whenever the Character is not walking.
- `walking` — three horizontal PNG strips (`side`, `front`, `back`), each with a
  frame count, plus one `framesPerSecond`. The renderer plays a walking strip
  **only while the player Character is walking** (`src/browser/renderer.ts`), and
  the side strip serves both left and right by mirroring.

So walk frames land in the engine today. Idle breathing, talking, picking up and
every other loop have **no** engine support yet — the frames are still worth
producing, but say so plainly when handing them over, and expect an engine
capability to be added before they can be seen in play. Do not invent an
Appearance kind in a prompt file; that is an engine decision recorded in
`CONTEXT.md` and `docs/adr/`, not an art decision.

## Gather this before writing any prompt

Ask for whatever is missing rather than guessing — a wrong costume detail
propagates into every frame and forces the whole set to be regenerated.

- **Character identity and period.** Include what the design must *avoid*. Capri
  1535 excludes the "Caribbean pirate" look explicitly, and three of the four
  Michele attempts drifted straight into it.
- **Costume inventory**, item by item, in words you will repeat verbatim in every
  prompt: garments, colours, fabrics, footwear, accessories.
- **A reference image** to attach to every generation. Without it, consistency is
  hopeless. A single approved figure or a design sheet both work — a design sheet
  that failed as animation frames is still an excellent reference.
- **Asymmetric details**, listed on purpose: a satchel on one shoulder, a knotted
  sash, an eyepatch. These decide the mirroring rule below.
- **Target height in the game**, in logical pixels. Everything scales from it.
- **The Scene palette** the Character has to sit inside. Michele shipped with a
  declared debt for exactly this: more saturated and lighter than the sunset
  alley, so he detached from the scene instead of belonging to it.

## Produce the prompt set

Write one file per pose under `art/characters/<character>/`, named after the pose:
`idle-front.prompt.md`, `walk-side-1-contact.prompt.md`, and so on. That directory
holds Art Masters and their generation notes only — the game never imports from it
(`examples/capri-1535/art/README.md`). Write them in English, as the repository's
existing prompt files do.

Start from `assets/prompt-template.md` in this skill. It carries the fixed
technical block; you fill in the character description and one `Pose:` line. Copy
it once per pose rather than writing prompts freehand — the constraints in it are
each there to prevent a specific defect:

- **Flat `#00ff00` background, no glow, no rim light, no outer outline.** A
  coloured halo is not removable: it leaves a dark fringe after keying, and it
  collides with any red or green the costume already uses. This is what killed
  attempt v1. Note that a *black* background is worse than green for a character
  with dark hair or dark garments, because the silhouette bleeds into it.
- **One figure, centred, whole silhouette, generous padding.** Cropped limbs and
  touching neighbours cannot be sliced apart.
- **Feet on one straight horizontal ground line, no cast shadow.** Every frame of
  a strip must share a ground line, or the Character bobs. Shadows belong to the
  Scene, not to the frame.
- **Identical head, hair volume, shoulder width and costume; only limbs and
  vertical body position change.** This is the sentence that fights the boiling
  effect. Keep it prominent in every prompt.
- **Figure roughly three times its in-game height.** Generate large and downscale.
  The reduction absorbs most of the residual inconsistency, which is precisely why
  attempt v4 was acceptable at 84–100 px in play. At the game's own resolution
  there is nothing left to absorb it.

Record provenance at the end of each file, the way the existing masters do: which
tool generated it and which script turned it into the Runtime Asset.

## Choose the poses

`references/pose-catalogue.md` holds the ready-to-paste `Pose:` text for every
pose, including the four named walk-cycle phases. Read it when writing the set.

The phase names matter more than they look. Attempts v2 and v3 asked for walking
and got walking *suggested*; v4 asked for poses anchored to a sequence and was the
only one of the four where the change between frames landed in the legs. So name
the phase — contact, down, passing, up — and describe the body in it, rather than
asking for "a walking pose".

Minimum viable set for a playable Character: idle in the three views, plus the
side, front and back walk cycles. Everything else — run, talk, look, pick up —
extends what the Character can express and can be produced later, once the engine
can play it.

## Mirroring

Fondale mirrors the side strip to walk the other way. If the Character carries
anything asymmetric, mirroring moves it to the wrong side and it reads as an
error. Two acceptable resolutions, and the choice belongs to the Author:

- Pin the asymmetric detail to one side in every side view — add
  `the satchel and the sash knot are on the character's right side` to the fixed
  block — and accept that it swaps when walking left. Cheap, and invisible in most
  scenes.
- Generate both side directions as separate strips. Doubles the work and needs an
  engine change, since the engine mirrors today rather than loading two sides.

Raise it explicitly rather than letting it be discovered in play.

## Accept or reject the frames

The project's own standard, from the same issue: a frame set is resolved not when
a method has been chosen in theory, but when a real cycle has been **watched in
motion at game scale**. Apply it in this order — the cheap checks first.

1. **Overlay test.** Stack the frames of one strip. The head should stay in place
   and keep its shape; the legs should be what moves. If the head changes volume
   or the shoulders change width, that frame is a reject — regenerate it, do not
   patch it.
2. **Where does the change concentrate?** Measure it, as the issue did: the share
   of change between consecutive frames belonging to legs versus torso. Legs
   dominant means an authentic cycle; torso dominant means boiling. This
   distinguishes a usable set from a plausible-looking one.
3. **Watch it move.** `examples/capri-1535/tools/preview_walk.py` renders a GIF at
   game scale over a real Background. Judgement on movement belongs to a human —
   produce the GIF and hand it over rather than approving the frames yourself.
4. **Check the palette against the Scene** it will stand in, not against white.

## When the frames keep failing

Do not escalate to more generations — the fourth attempt was not much better than
the second. Fall back to construction, which the issue already designed:

> One frame supplies the canonical body from the waist up; the different leg poses
> are mounted underneath it, aligned on the waistband.

Consistency then holds by construction, because the head and torso are literally
the same pixels in every frame, and the quality of the drawing survives. Taken
further, the same idea is the cut-out puppet approach: generate one excellent
figure, separate it into parts, and animate the parts — which scales up to
high-resolution artwork instead of degrading with it.

## Turning masters into Runtime Assets

`examples/capri-1535/tools/build_sprite.py` already does this, and two details in
it were paid for in bugs — keep them if you write anything similar:

- **Scale every frame by the same factor**, taken from the tallest frame. Frames
  normalised individually make a wider stride come out a different height, and the
  Character appears to hop.
- **Quantise colour, not alpha.** A palette pass over RGBA turns soft edges into
  fringe. Extract the alpha channel first and reattach it afterwards.

Runtime Assets live beside their owning definition under `src/`, never in `art/`.
Generated variants, previews and other reproducible intermediates are not
committed. Commit the master and its `.prompt.md`; leave the GIFs and the
experiments out.
