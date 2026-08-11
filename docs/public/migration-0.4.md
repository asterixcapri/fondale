# Migrating an alpha Game Project to Fondale 0.4

Fondale 0.4 reorganizes the Engine around capability-owned modules without
adding package subpaths. Authors continue to import every supported contract
from `@asterixcapri/fondale`.

## Direction Step

The old `DirectStep` type has been removed. Use `DirectionStep`, and change its
discriminator from `type: "direct"` to `type: "direction"`:

```ts
import type { DirectionStep } from "@asterixcapri/fondale";

const entrance: DirectionStep = {
  type: "direction",
  directions: [
    { type: "camera", mode: "hold", point: { x: 160, y: 90 }, duration: 1 },
  ],
};
```

No compatibility alias or runtime shim is provided. The diagnostic codes
`definition.sequence.direct.empty` and
`definition.sequence.direct.unbounded` have likewise become
`definition.sequence.direction.empty` and
`definition.sequence.direction.unbounded`.

An authored `duration` is an upper bound: the Direction Step completes when
all finite directions finish or when that duration expires, whichever happens
first. Looping Animations and held/following Camera directions do not create a
finite boundary by themselves.

A `startAfter` Cue dependency must identify an earlier Animation direction.
Fondale reports `definition.sequence.cue-source` when the index instead names
a Motion or Camera direction.

## Animation validation

Animation now owns Appearance validation and logical frame progression. Frame
sources must be a URL or non-empty string, `loop` must be a boolean when
present, and Visual Anchor coordinates must be finite. Invalid definitions use
the capability-owned codes `definition.animation.frame-source`,
`definition.animation.loop`, and `definition.animation.visual-anchor`; the
last replaces `definition.point.finite` for an invalid Visual Anchor. A Cue at
logical second zero starts dependent directions immediately. Active Line and
Player Intent state now records `animationStartedTick` so Save Snapshots restore
their activity-local visual progress exactly.

## Authoring Diagnostic attribution

Every `AuthoringDiagnostic` now includes an `owner` identifying the capability
that rejected the definition (`game-project`, `world`, `interaction`,
`sequence`, `animation`, `camera`, `hud`, `save`, `game-session`, or `browser`).
Code that serializes diagnostics should retain this field.

## Save Snapshot compatibility

Fondale does not migrate 0.3 Save Snapshots. Give the 0.4 Game Project a new
Project Version and treat a failed `validateSaveSnapshot` result as an
incompatible save. Validation returns Save-owned structured diagnostics before
a `CoreSession` is created or changed, so a failed restore cannot partially
mutate play.

Update definitions, fixtures, recipes, and any vendored package together. A
successful migration passes `npm run build` and `npm run verify` against the
single package root.
