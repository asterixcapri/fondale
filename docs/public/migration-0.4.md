# Migrating an alpha Game Project to Fondale 0.4

Fondale 0.4 reorganizes the Engine around capability-owned modules without
adding package subpaths. Authors continue to import every supported contract
from `@asterixcapri/fondale`.

## Game Project composition

Remove every authoring builder call. Export ordinary objects checked with the
focused package-root types and `satisfies`, then compose them into an object
that `satisfies GameProject`. Pass that declarative project directly to
`startGame`.

`startGame` now validates and compiles a private deeply immutable snapshot.
Invalid composition rejects with one `AuthoringError` containing complete,
deterministically ordered diagnostics before browser work. The authored object
remains mutable and unfrozen; a running session observes only its isolated
startup snapshot.

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

## Camera validation and presentation

Camera now owns its cut, logical-time move, hold, and subject-follow semantics.
Invalid authored Camera coordinates report
`definition.camera.point.finite` instead of the World-owned
`definition.point.finite`. Camera presentation advances from logical ticks,
remains outside Save Snapshots, and returns to Player following after a
Direction Step completes or is skipped.

## Sequence ownership

Sequence definitions and every Sequence Step contract are now exported from
the package's single root entry point by their owning capability. Sequence
interprets nested paths, conditions, Choices, branches, operations, skipping,
and restoration once. This does not change authored step shapes: Game Session
applies requested Game Operations atomically, and browser presentation receives
resolved Line, Narration, Choice, and Direction facts instead of interpreting the
definition independently.

## World ownership

World now owns Scene, Character, Object, Scenery, Hotspot, Scene Space, entity
presence, hit testing, Perspective Scale, and spatial placement rules. Public
imports and authoring shapes are unchanged and remain available only from the
package root. Diagnostics for composed Scene geometry, membership, Passage
destinations, Hotspot targets, and Perspective Scale now consistently use the
`world` owner. World presentation facts are transient and do not add fields to
Game State or Save Snapshots.

## HUD ownership

HUD now prepares Line, Narration, Choice, Command Response, Inventory and
system-overlay presentation from resolved capability facts. It also owns text
timing, speech visibility and colour, Choice numbering, layout intent, Player
Preference semantics and modal transitions. The browser remains the adapter
for DOM, focus application, audio playback, timers, localStorage and physical
input; Save continues to decide whether each stored Save Slot is compatible.
These internal ownership changes do not alter `HUDTheme`, keyboard shortcuts,
Save Slot storage, or the Player-visible overlay structure.

## Authoring Diagnostic attribution

Every `AuthoringDiagnostic` now includes an `owner` identifying the capability
that rejected the definition (`game-project`, `world`, `interaction`,
`sequence`, `animation`, `camera`, `hud`, `save`, `game-session`, or `browser`).
Code that serializes diagnostics should retain this field.

## Save Snapshot compatibility

Fondale does not migrate 0.3 Save Snapshots. Give the 0.4 Game Project a new
Project Version and pass stored data as `unknown` in the `snapshot` startup
option. `startGame` rejects incompatible data with Save-owned structured
diagnostics before a Game Session or browser adapter is created, so a failed
restore cannot partially mutate play.

Update definitions, fixtures, recipes, and any vendored package together. A
successful migration passes `npm run build` and `npm run verify` against the
single package root.
