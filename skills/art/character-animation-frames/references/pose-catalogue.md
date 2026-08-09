# Pose catalogue

Ready-to-paste text for the `Pose:` line of `assets/prompt-template.md`. One pose
per generation, the fixed block repeated every time, the reference image attached
every time.

- [Walk cycle](#walk-cycle) — the four phases, and why they are named
- [Run cycle](#run-cycle)
- [Idle](#idle)
- [Action poses](#action-poses)
- [How many frames to ask for](#how-many-frames-to-ask-for)

## Walk cycle

A walk cycle is four body positions and their mirror. Naming the phase is what
separates a usable frame from a decorative one: a request for "a walking pose"
returns a figure that looks like it might be walking, and the resulting strip
boils. A request for the *down* position returns a body at the lowest point of its
cycle, which is a fact the model can draw.

Generate all four for one leg, then repeat the four with the legs exchanged. That
is eight frames, the count the engine's walking strips expect.

```
CONTACT — left leg stretched forward with the heel just touching the ground,
right leg stretched back with only the toes touching, right arm swung forward and
left arm swung back in opposition, torso upright, head level.
```

```
DOWN — both knees bent, the forward leg taking the full weight, hips and head at
their LOWEST point of the cycle, arms passing close to the body.
```

```
PASSING — the supporting leg perfectly straight and vertical under the body, the
other leg passing beside it with the knee bent and the foot lifted clear of the
ground, arms hanging nearly vertical at the sides.
```

```
UP — hips and head at their HIGHEST point of the cycle, the supporting leg pushing
off on the toes, the other leg swinging forward, arms beginning to swing apart.
```

For the second half, add: `same phase, legs exchanged — the right leg leads and
the left leg trails, arms swapped accordingly.`

### The three views

The engine wants `side`, `front` and `back` strips. Keep the same four phases and
change only the view:

- **Side** — `in profile facing right`. Mirrored in play, so read the mirroring
  section of `SKILL.md` before pinning asymmetric details.
- **Front** — `facing the camera, walking towards the viewer`. The hardest of the
  three to get right, because the phase reads mostly in the knees and the shoulder
  line rather than in the stride. Expect more rejects here.
- **Back** — `seen from directly behind, walking away from the viewer`.

## Run cycle

The same four phases, exaggerated, plus a forward lean. Both feet leave the ground
in a run, which is what distinguishes it from a fast walk:

```
RUN CONTACT — body leaning clearly forward, left leg reaching far ahead with the
ball of the foot about to land, right leg folded up behind with the heel close to
the buttock, arms bent sharply at the elbows in strong opposition.
```

```
RUN DOWN — the landing leg deeply bent absorbing the impact, body at its lowest,
torso still leaning forward, the other leg swinging through beneath the hips.
```

```
RUN PASSING — the supporting leg straight and driving, the other knee lifted high
in front, both arms mid-swing close to the ribs.
```

```
RUN AIRBORNE — both feet clear of the ground, body at its highest and most
extended, front leg reaching forward, back leg trailing behind.
```

## Idle

Idle is what makes a Character look alive rather than pasted onto the Background,
and it is cheap: two frames are enough, because the eye reads the alternation as
breathing.

```
IDLE — standing still, weight evenly on both feet, arms relaxed at the sides,
calm neutral expression.
```

```
IDLE BREATHING — identical to the idle pose in every respect, but the chest
slightly raised and the shoulders a touch higher, as if breathing in.
```

Produce idle for each view the Character can be seen in while standing: front,
back and side.

## Action poses

These express what the Character does when a Command resolves. Three frames each
is usually enough — a start, a peak and a return — and the peak is the one that
has to read clearly at game scale.

```
TALK — standing, one hand raised in a small explaining gesture at chest height,
mouth open mid-sentence, head slightly tilted towards the listener.
```

```
LOOK — standing, one hand shading the eyes, head tilted slightly up, weight on
the back foot as if peering into the distance.
```

```
PICK UP — crouching down, one knee bent low and one knee near the ground, the
near hand reaching towards the ground just in front of the feet, back rounded.
```

```
INTERACT — standing close to something at chest height, both hands raised towards
it, elbows bent, weight shifted onto the front foot as if pushing or turning it.
```

```
USE OBJECT — standing, one hand holding a small unidentified object at chest
height, the other hand reaching towards it, head lowered to look at what the
hands are doing.
```

Leave the object unidentified unless the pose exists for one specific Object. A
generic pose serves many Commands; a pose gripping one particular flask serves
exactly one.

## How many frames to ask for

Start small and prove the method before scaling it. The cost of a frame is not the
generation, it is the rejection and the regeneration.

| Set | Frames | When |
| --- | --- | --- |
| Proof of method | 8 (side walk) | First Character, or first time a new tool or style is tried. Watch it move before producing anything else. |
| Playable Character | 8 × 3 views + 2 idle × 3 views | The Character walks and stands in the game. |
| Expressive Character | above, plus 3 per action pose | Once the engine can play loops that are not walking. |

If the proof of method fails the acceptance checks in `SKILL.md`, stop and switch
to construction — mounting leg poses under one canonical body — rather than
generating the remaining thirty frames and rejecting them one by one.
