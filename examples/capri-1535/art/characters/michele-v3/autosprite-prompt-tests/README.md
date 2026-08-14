# AutoSprite walking prompt tests

These are exploratory AutoSprite outputs for Michele v3's authored, eye-level,
right-facing source image. They are prompt tests, not production Art Masters or
Runtime Assets.

AutoSprite chose its standard Turbo video settings and spritesheet extraction.
Each test was requested as a loop. No frame count, frame rate, pose, frame size,
or background-removal override was supplied.

| Test | Prompt | Assessment |
| --- | --- | --- |
| A | `Natural relaxed walk in place with short grounded steps and restrained arm swing. Strict right-facing profile, fixed eye-level full-body camera. No turning, zooming, or camera movement.` | Preserves identity and facing, but reads as an idle weight shift rather than walking. |
| B | `Steady working man's walk in place, weight shifting gently from foot to foot. Preserve exact right-facing silhouette and body proportions. Locked eye-level camera; no turn or viewpoint change.` | Slightly more leg motion than A, but still no complete walking stride. |
| C | `He walks naturally to the right for several complete strides. A side-tracking camera keeps his full body centered at eye level. Exact side profile, level ground, no turns or zoom.` | Best locomotion of the six: recognisable full strides and stable identity. The extracted sequence contains long near-idle sections and is not yet a clean cycle. |
| D | `character walking facing image-right (east), camera elevation 0 degrees` | Correct directional/camera grammar and clear locomotion, but the gait is exaggerated: high knees, long steps, and excessive forward crouch. |
| E | `character walking naturally facing image-right (east), camera elevation 0 degrees, ordinary relaxed steps` | Direction remains correct, but the modifiers suppress the action until it again reads almost as idle. |
| F | `character walking facing image-right (east), camera elevation 0 degrees, natural gait, feet stay near the ground, no high knees, no crouching` | Preserves direction, camera, and identity, but produces only a small incomplete step followed by a return to idle. The negative gait constraints suppress locomotion instead of refining it. |

The useful prompt lesson is to keep AutoSprite's explicit direction and numeric
camera-elevation vocabulary, while avoiding `walk in place`, `restrained`, and
`relaxed steps`. The next test should retain the concise directional clause and
ask for a normal gait through concrete negative extremes, for example:

```text
character walking facing image-right (east), camera elevation 0 degrees,
natural gait, feet stay near the ground, no high knees, no crouching
```

Test F evaluated that proposal and showed that negative gait constraints also
suppress the action. None of the six results passes the walking acceptance
gates, so no test is promoted into Michele's definition.
