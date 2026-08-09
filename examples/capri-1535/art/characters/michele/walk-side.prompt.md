# Michele — side walk cycle master

One Art Master, eight frames, generated one frame per image. The fixed block
below is repeated verbatim for every frame; only the `Pose:` line changes. Attach
`idle-side-right.png` as the reference image to every generation — the strip is
mirrored in play, so the whole cycle is drawn facing right.

Produced with the `character-animation-frames` skill
(`skills/art/character-animation-frames/`). Read its acceptance checks before
accepting any of these frames.

## Fixed block

Use case: stylized-concept

Asset type: one animation frame for a 2D point-and-click adventure game Character
Art Master

Primary request: Michele, a young Capri lad of the sixteenth century, full body,
in profile facing right, in the pose described below.

Subject: reproduce the SAME character as the attached reference, exactly — same
face, same volume and shape of the curly brown hair, cream linen shirt with
sleeves rolled to the elbow, blue-grey buttoned waistcoat, red waist sash knotted
at the side with its tail hanging, tan knee-length breeches with turned-up cuffs,
brown leather sandals, tan leather satchel on a diagonal shoulder strap. The head,
the hair volume, the shoulder width and every costume detail are IDENTICAL to the
reference; only the limbs and the vertical position of the body change. Do not
redesign, do not restyle, do not re-interpret the character, and do not change his
age or his proportions.

Style/medium: high-resolution pixel-inspired adventure-game character art with a
dark outline, flat warm palette and grouped highlights, exactly as in the
reference. No photorealism, no anime, no smooth vector look, no 3D render look.

Composition/framing: ONE single full-body figure, centred, entire silhouette
visible, generous empty padding on all four sides, nothing cropped, no second
figure, no added props.

Camera: eye level, flat orthographic look, same distance and same figure height as
the reference.

Ground: both feet resting on one straight horizontal ground line at the same
height as the reference. No cast shadow, no floor plane, no ground texture, no
perspective floor.

Production ground: one perfectly flat uniform `#00ff00` chroma green background,
edge to edge, for local background removal. Never use `#00ff00` anywhere on the
character. The cream shirt is nearly the value of the reference set's off-white
background, which is why green is required here rather than white or black.

Lighting/mood: warm Mediterranean late-afternoon light from the upper left,
matching the palette of the Scene the Character stands in.

Constraints: no glow, no halo, no coloured rim light, no outer outline of any
colour other than the character's own line art, no gradient, no vignette, no text,
no label, no caption, no frame, no border, no watermark. The satchel and the knot
of the sash are on the character's right side in every frame, so that mirroring the
strip keeps them together.

Avoid: Caribbean pirate look, tricorn hat, buckled boots, modern clothing, fantasy
costume, weapons.

Output: one single image, the figure about 900 pixels tall.

## The eight poses

Frames 1–4 lead with the left leg; frames 5–8 repeat the same four phases with the
legs exchanged. Naming the phase is what makes the difference between a pose of a
sequence and a figure that merely looks like it might be walking — the failure
diagnosed on the v2 and v3 sheets.

1. `Pose: CONTACT — left leg stretched forward with the heel just touching the
   ground, right leg stretched back with only the toes touching, right arm swung
   forward and left arm swung back in opposition, torso upright, head level.`

2. `Pose: DOWN — both knees bent, the forward left leg taking the full weight,
   hips and head at their LOWEST point of the cycle, arms passing close to the
   body.`

3. `Pose: PASSING — the left supporting leg perfectly straight and vertical under
   the body, the right leg passing beside it with the knee bent and the foot
   lifted clear of the ground, arms hanging nearly vertical at the sides.`

4. `Pose: UP — hips and head at their HIGHEST point of the cycle, the left
   supporting leg pushing off on the toes, the right leg swinging forward, arms
   beginning to swing apart.`

5. `Pose: CONTACT, legs exchanged — right leg stretched forward with the heel just
   touching the ground, left leg stretched back with only the toes touching, left
   arm swung forward and right arm swung back in opposition, torso upright, head
   level.`

6. `Pose: DOWN, legs exchanged — both knees bent, the forward right leg taking the
   full weight, hips and head at their LOWEST point of the cycle, arms passing
   close to the body.`

7. `Pose: PASSING, legs exchanged — the right supporting leg perfectly straight and
   vertical under the body, the left leg passing beside it with the knee bent and
   the foot lifted clear of the ground, arms hanging nearly vertical at the sides.`

8. `Pose: UP, legs exchanged — hips and head at their HIGHEST point of the cycle,
   the right supporting leg pushing off on the toes, the left leg swinging forward,
   arms beginning to swing apart.`

## Before generating the front and back strips

This side strip is the proof of method. Run the acceptance checks on it — overlay
the frames, measure whether the change concentrates in the legs, and watch the GIF
at game scale over a real Background — before spending generations on the front and
back cycles. If it fails, switch to construction rather than generating thirty more
frames to reject.

---

Processed by `tools/build_sprite.py` into the Runtime Asset under
`src/characters/michele/`.
