# Character animation requirements

Use this catalog to build a manifest, not as a command to generate every row.

## Core library

| Family | Default coverage | Playback | Starting point |
| --- | --- | --- | --- |
| Walk | right, left, front, back | loop | 6–8 frames, 8–12 fps |
| Idle | every facing used in play | loop | 4–8 frames, 2–6 fps |
| Speech | every facing used while speaking | loop with neutral exit | 4–6 frames, 6–10 fps |
| Turn | transitions that appear in play | one-shot | 2–4 frames |
| Interact | neutral action at required facings/heights | one-shot with recovery | 4–8 frames |

Treat left and right as distinct authored views and Runtime Assets. Never mirror one side into the other: hairstyle, clothing closures, bags, tools, injuries, handed actions, and light belong to a particular side even when the outline looks symmetrical.

Idle should include a restrained blink, breath, or weight shift while preserving the Ground Point. Speech should read through head, jaw, shoulder, and restrained hand movement at runtime scale; detailed lip shapes usually disappear at a 100-pixel Character height.

Turn and locomotion start/stop transitions prevent a visible snap, but keep them `capability-needed` until the Engine exposes their playback semantics.

## Content-derived library

Schedule only actions required by authored content or a clear reuse case:

- low, middle, and high reach or use;
- pick up, put down, give, receive, equip, and stow;
- push, pull, lift, carry, open, close, enter, and exit;
- climb up, climb down, step over, crouch, sit, and stand;
- fast walk or run when it needs motion distinct from faster playback;
- point, nod, shake head, shrug, wave, beckon, laugh, and salute;
- notice, surprise, recoil, pain, exhaustion, celebration, and defeat;
- prop-specific actions and unique Sequence performances.

Prefer one neutral interaction animation only when the silhouette remains truthful for every use. Split by reach height, prop, force, or emotion when reusing it would visibly contradict the authored action.

## Manifest schema

Use a table with these columns:

| ID | Purpose / used by | Facing | Playback | Poses | Frames / fps | Master | Runtime | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |

Use these statuses:

- `scheduled`: required but not generated;
- `master-ready`: generated and validated, without current runtime support;
- `supported`: integrated through the public Engine contract;
- `capability-needed`: blocked by an absent Engine Capability;
- `rejected`: retained only as diagnostic evidence;
- `excluded`: considered and intentionally unnecessary.

## Motion gates by family

- **Walk:** alternate planted contact feet; pass the free foot; counter-swing arms; keep head and torso volume stable; test the loop seam and foot sliding.
- **Idle:** keep displacement sub-pixel at runtime scale; avoid rhythmic motion that competes with speech or interaction.
- **Speech:** preserve a neutral first/exit frame; avoid changing identity with mouth motion; keep the loop asynchronous-looking rather than metronomic.
- **Turn:** preserve the Ground Point and volume while changing readable silhouette; avoid teleporting asymmetric details from one side to the other.
- **One-shot action:** include anticipation, readable action/contact, recovery, and a documented hold frame when the action changes state.
