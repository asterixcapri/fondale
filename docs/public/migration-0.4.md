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
