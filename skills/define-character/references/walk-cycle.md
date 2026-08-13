# Fondale walk-cycle workflow

Use this workflow whenever a Character needs a new or revised Walking
Animation. It is an animation task, not a sprite-sheet generation task.

## 1. Lock the locomotion contract

Record before drawing:

- intended gait, speed, stride length, cadence, and emotional energy;
- required Facings and direction-specific equipment visibility;
- Runtime cell, Ground Point, Visual Anchor, and target visible height;
- body landmarks to register: crown, sternum, pelvis, planted heel, and toe;
- costume parts allowed to overlap or trail, and their maximum excursion.

Choose cadence and movement speed together. Check the relationship
`world distance per cycle = movement speed × cycle duration`; the apparent foot
travel must plausibly support that distance. Reject obvious skating even when
the individual poses look attractive.

## 2. Build registered keys before artwork

Create a transparent registration template for every frame with identical cell
dimensions and guides for the Ground Point, pelvis line, crown range, and torso
centre. Draft the gait as silhouettes or a stick figure first.

For each step, author these four mechanically distinct phases:

1. `contact`: forward heel makes contact; legs are separated;
2. `down`: weight settles onto the forward foot; body reaches its low point;
3. `passing`: free foot passes the planted leg; pelvis is centred above support;
4. `up`: heel rises and the body reaches its restrained high point.

Author the opposite step with the legs and arm counter-swing reversed. An
eight-frame cycle therefore needs eight genuine locomotion poses. Do not obtain
eight frames by repeating four poses, cross-fading images, or relabelling the
same contact pose as its opposite.

Approve a monochrome silhouette flipbook before rendering costume detail. The
cycle must read correctly without facial features, texture, or colour.

## 3. Use image generation only as controlled assistance

Use the approved turnaround and the registered pose guide together as
references. Generate or edit one key pose at a time. State the exact gait phase,
supporting foot, forward leg, arm counter-swing, Facing, Ground Point, and
directional equipment rule in every prompt.

Never request a complete production walk sheet in one generation. Models often
repeat phases, change anatomy, drift scale, swap equipment sides, or produce
illustrations that cannot loop. Reject and regenerate a key when the requested
support leg or phase is wrong; do not repair semantic pose errors by cropping.

After generation, register each accepted key to the pelvis and Ground Point,
not to its trimmed bounding-box centre. Alpha extraction, cropping, and fitting
may remove background and place artwork in the cell; they must not rescale each
frame independently or manufacture missing motion.

## 4. In-between and clean up deliberately

Create in-betweens only after all keys pass. Preserve volumes and costume
landmarks frame to frame. Keep head bob and hip rise intentional and small for
an ordinary walk; never erase all vertical mechanics by normalising every
figure to the same bounding-box height.

Track at least these measurements per frame:

| Measurement | Requirement |
| --- | --- |
| Ground Point | identical cell coordinate |
| Pelvis x | stable around the registration line |
| Pelvis y | smooth gait arc, no one-frame jump |
| Crown y | follows the pelvis arc without scale drift |
| Torso width | stable except for genuine rotation |
| Planted foot | stationary during its support interval |
| Visible height | changes only from pose mechanics, never source rescaling |
| Equipment | follows the authored anatomical side in every frame |

Use onion-skin overlays and a frame-difference or landmark contact sheet. A
strip whose figures merely share a canvas size has not passed registration.
Run `scripts/audit-walk-strip.py` on every Runtime strip to record cell, alpha,
visible-height, and centroid diagnostics. Treat its warnings as inspection
prompts, not automatic proof that the gait is correct.

## 5. Acceptance gates

All gates are mandatory for every required Facing.

### Mechanical gate

- All eight phases are distinct and ordered correctly.
- Each foot alternates contact, support, lift, pass, and contact.
- Knees bend in the down and passing phases.
- Arm swing opposes the stepping leg and stays appropriate to portrayal.
- The loop transition has the same velocity and pose continuity as internal
  transitions.

### Registration gate

- Ground Point remains fixed in the Runtime cell.
- Pelvis follows one smooth arc with no scale pop or horizontal jitter.
- Head and torso preserve volume; limbs do not grow, shrink, or swap identity.
- Direction-specific costume and equipment remain correct.

### Playback gate

- Inspect a looping flipbook at 1× and 0.25× speed on a plain background.
- Inspect uninterrupted Engine travel for at least three complete cycles.
- Test left, right, front, and back independently; do not infer one from another.
- Compare character displacement with foot planting and reject visible sliding.
- Inspect at near, middle, and far Perspective Scales.

### Artifact gate

- Alpha is clean with no coloured rectangle, fringe, or disconnected residue.
- Every Runtime cell and strip has deterministic dimensions and ordering.
- The renderer never enlarges the Runtime Asset.
- Keep the guide, silhouette test, accepted keys, final Art Master, Runtime
  strip, and motion proof in the Character package.

## 6. Failure policy

Stop and label the cycle `draft` when any acceptance gate fails. Preserve useful
design exploration, but do not integrate it as the Walking Animation Role.
Build success, type safety, attractive individual frames, and a clean still
screenshot do not override a failed motion gate.
