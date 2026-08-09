# <Character> — <pose name> master

Use case: stylized-concept

Asset type: one animation frame for a 2D hand-painted point-and-click adventure
game Character Art Master

Primary request: <Character>, <age and role in one line>, full body, <view:
facing the camera / seen from behind / in profile facing right>, in the pose
described below.

Subject: reproduce the SAME character as the attached reference, exactly — same
face, same volume and shape of the hair, <garment by garment: shirt, waistcoat,
sash, breeches, footwear, accessories>. The head, the hair volume, the shoulder
width and every costume detail are IDENTICAL to the reference; only the limbs and
the vertical position of the body change. Do not redesign, do not restyle, do not
re-interpret the character.

Style/medium: <the project's declared style, e.g. hand-painted cartoon
adventure-game character art, clean readable outlines, flat saturated colours,
soft cel shading>. No photorealism, no anime, no pixel art, no 3D render look.

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
character.

Lighting/mood: <the Scene's light, e.g. warm Mediterranean late-afternoon light
from the upper left>, matching the palette of <the Scene the Character stands in>.

Constraints: no glow, no halo, no coloured rim light, no outer outline of any
colour, no gradient, no vignette, no text, no label, no caption, no frame, no
border, no watermark. <Asymmetric details pinned to one side, e.g. the satchel and
the sash knot are on the character's right side.>

Avoid: <the design drift to exclude, e.g. Caribbean pirate look, modern clothing,
fantasy costume>.

Output: one single image, the figure about <three times the in-game height> pixels
tall.

Pose: <<one pose from references/pose-catalogue.md>>

---

Generated with <tool> from the reference sheet at <path>, and processed by
`tools/build_sprite.py` into the Runtime Asset under `src/characters/<character>/`.
