# Public reference

Every public symbol is imported from `@asterixcapri/fondale`. Deep imports are
not part of the contract. Defaults, invariants, failures, and minimal examples
below are normative for version 1.0.

## Definition helpers

### `defineScene`

Validates and freezes a Scene. Input fields:

- `background`: browser-resolvable PNG URL. Its decoded dimensions must equal
  the project Logical Resolution.
- `walkableRegion`: one finite, non-degenerate, non-self-intersecting polygon
  inside Scene Space.
- `perspectiveScale?`: positive `{ y, scale }` stops. Omission means scale `1`.
- `scenery?`: named inline definitions with `baseline`, optional `position`,
  `initialAppearance`, and named `appearances`. A Scenery Appearance is either
  `{ kind: "static", image, visualAnchor? }` or
  `{ kind: "background-region", area }`.
- `hotspots?`: ordered, Scene-local surfaces. Each has `target`, polygon
  `area`, `approach: { groundPoint, facing }`, optional `when`, a
  `primaryAction`, and optional `inventoryUse`.
- `entrances?`: named `{ groundPoint, facing }` arrivals.
- `passages?`: directional `{ area, approach, when?, destination }` links;
  `destination` names both Scene and Scene Entrance.

Local invalidity throws one `AuthoringError` containing all independent
definition diagnostics. See [first Scene recipe](recipes/first-scene.ts).

### `defineCharacter`

Validates a persistent Character. Fields are `initialScene`,
`initialGroundPoint`, `initialFacing`, `initialAppearance`, named `appearances`,
and positive finite `movementSpeed` in Scene pixels per second. `Facing` is
`"front" | "back" | "left" | "right"`.

An `EntityAppearance` is static or walking. `StaticAppearance` contains
`kind: "static"`, PNG `image`, and optional in-frame `visualAnchor`. A walking
Appearance contains `kind: "walking"`, matching `side`, `front`, and `back`
horizontal strips (`image`, positive integer `frames`), positive
`framesPerSecond`, and optional shared `visualAnchor`. The Engine mirrors the
side strip for left-facing movement; frame zero is idle.

### `defineObject`

Validates a collectible Object. Fields are `initialScene`,
`initialGroundPoint`, `initialAppearance`, named static `appearances`, and a
square PNG `inventoryAppearance`. Every Object begins in a Scene. Its Inventory
PNG must match `inventoryAppearanceSize` exactly.

### `defineSequence`

Validates and freezes a finite `SequenceDefinition` with `steps`:

- Line: `{ type: "line", text, character? }`.
- Choice: `{ type: "choice", alternatives, fallback }`; alternatives have
  `text`, optional `when`, and finite `steps`. The fallback is mandatory.
- Branch: `{ type: "branch", cases, fallback }`; the first matching case wins.
- Operations: `{ type: "operations", operations }`; each group commits
  atomically before the Sequence continues.

Cycles and nested Sequence starts are invalid. Lines wait for manual advance;
Choices expose only eligible alternatives and use fallback only when none is
eligible. See the [Sequence recipe](recipes/sequence.ts).

### `defineGame`

Composes registries into opaque `GameProject`. Required fields are Project
`identity`, Project `version`, `logicalResolution`, named `scenes`, and
`initialScene`. Optional fields are `letterboxColor` (default `#000000`), named
`characters`, `playerCharacter`, named `objects`, named `sequences`, boolean
`variables`, and positive integer `inventoryAppearanceSize`.

Registry keys are identities and registry order has no game meaning. The
helper validates all cross-references, initial state, geometry bounds,
conditions, operations, Sequence finiteness, passage destinations, and
Appearance selections, then returns an immutable, opaque `GameProject`.

## Interactions and operations

`InteractionCondition` is `{ variable, equals }` or `{ hasObject }`. A
Primary Action has ordered `cases` plus mandatory `fallback`; every case has
`label`, perceivable `response`, optional `when`, and exactly one of
`operations` or `behavior`. Inventory Use cases add `object` and explicit
`outcome: "success" | "failure"`; their mandatory fallback is failure.

`GameOperation` supports:

- `set-variable` with `variable` and boolean `value`;
- `set-appearance` with a Character, Object, or Scene Scenery `target` and
  named `appearance`;
- `start-sequence` with a root Sequence identity;
- `collect-target-object` on an Object Hotspot;
- `place-selected-object` with a current-Scene `groundPoint` and optional
  Appearance;
- `consume-selected-object`.

Operations in one group see earlier operations and either commit together or
fail the Game Session without a partial commit. A failed Inventory Use cannot
place or consume the selected Object. See the [Interaction](recipes/interaction.ts)
and [Inventory](recipes/inventory.ts) recipes.

`GameBehavior` is a synchronous callback receiving `GameBehaviorContext`:
read-only `reads.variable(name)` and `reads.hasObject(id)`, the authored
`target`, and controlled `operations.setVariable`, `setAppearance`, and
`startSequence`. It receives no raw state, DOM, renderer, input, clock, or
session lifecycle. A throw or invalid requested operation preserves the prior
committed state and terminally fails the session with the original cause.
Promises, timers, global randomness, network access, and mutable external state
are outside the contract. See the [Game Behavior recipe](recipes/game-behavior.ts).

## Runtime

### `startGame`

`StartGameOptions` is `{ target, snapshot? }`.
`startGame(project, { target, snapshot? })` returns `Promise<GameSession>` only
after every PNG has loaded and validated and the first WebGL frame is drawn.
The target must be an unowned `HTMLElement`; `snapshot`, when present, must be
the successful `ValidatedSaveSnapshot` returned for this project.

Startup rejects with `AuthoringError` for occupied target, unavailable WebGL,
unreachable or undecodable PNG, invalid Background/Inventory dimensions, or
inconsistent walking strips. It removes every partial mount before rejecting.

### `GameSession`

`createSaveSnapshot()` returns a `SaveSnapshot` of the latest committed Game State,
including activity progress. It throws after terminal stop or failure. `stop()` is
idempotent and terminal: it detaches renderer, input, clock, and target content.
`getStatus()` returns `"running"`, `"failed"`, or `"stopped"` without exposing
Game State. `getDiagnostics()` returns the contextual failure diagnostics,
including an original Game Behavior cause when available.

### `validateSaveSnapshot`

`validateSaveSnapshot(project, value: unknown)` never throws for expected bad
external data. `SaveSnapshotValidation` uses the `ok` discriminant and is
either `{ ok: true, snapshot }` or `{ ok: false, diagnostics }`. Compatibility requires exact format version `1`,
Project Identity, and Project Version. Missing/unexpected fields, non-JSON
values, unknown references, invalid Appearance selections, contradictory Object
locations/Inventory, and invalid activity progress are rejected without repair
or silent new game. See the [save recipe](recipes/save-snapshot.ts).

`SaveSnapshot` contains `formatVersion`, `projectIdentity`, `projectVersion`,
and canonical `state`. `ValidatedSaveSnapshot` is the only snapshot accepted by
`startGame`; its validation brand cannot be authored directly.

## Diagnostics

`AuthoringDiagnosticFamily` is `"definition" | "reference" | "state" |
"save" | "asset" | "environment" | "behavior"`.

`AuthoringDiagnostic` fields are stable `code`, stable `family`, author-facing
`path`, explanatory `message`, optional safe `suggestion`, and optional original
`cause`. `AuthoringError` extends `Error` and exposes its stably ordered,
read-only `diagnostics`. Fondale 1.0 emits errors only, not warnings.

Common stable codes include `definition.point.finite`,
`definition.polygon.vertices`, `definition.polygon.degenerate`,
`definition.polygon.self-intersection`, `definition.scene-space.bounds`,
`reference.scene.initial`, `reference.hotspot.target`, `reference.sequence`,
`state.operation.invalid`, `save.format.version`, `save.project.identity`,
`save.project.version`, `save.fields.unexpected`, `save.state.invalid`,
`asset.load.failed`, `asset.background.dimensions`,
`asset.inventory-appearance.dimensions`, `asset.walk-strip.frames`,
`asset.walk-strip.consistency`, `asset.visual-anchor.bounds`,
`environment.target.occupied`, `environment.webgl.unavailable`, and
`behavior.threw`.

## Value types

`Point` is finite `{ x, y }` in logical Scene Space pixels.
`LogicalResolution` is positive integer `{ width, height }`. `SceneDefinition`,
`CharacterDefinition`, `ObjectDefinition`, and `SequenceDefinition` are the
frozen values returned by their helper. `GameProject` is opaque.

### Structural contract index

This matrix makes every reachable structure independently checkable. “Owner”
means the helper named in the row aggregates the listed failure into its
`AuthoringError`; external snapshots instead return `SaveSnapshotValidation`.

| Structure | Purpose | Allowed values | Defaults and invariants | Errors | Executed example |
| --- | --- | --- | --- | --- | --- |
| `Point` | Scene/image coordinate | finite numeric `x`, `y` | no default; coordinate space is field-specific | owner: `definition.point.finite` or bounds code | [first Scene](recipes/first-scene.ts) |
| `LogicalResolution` | fixed frame size | positive integer `width`, `height` | required and shared by every Scene | `definition.logical-resolution.positive-integer` | [first Scene](recipes/first-scene.ts) |
| `Facing` | authored orientation | front, back, left, right | required where present | owner rejects invalid values | [Character](recipes/character-walking.ts) |
| `StaticAppearance` | one PNG visual | static `kind`, `image`, optional `visualAnchor` | anchor defaults to bottom-centre | asset and anchor diagnostics at startup | [Inventory](recipes/inventory.ts) |
| `WalkStrip` | directional strip | PNG `image`, positive integer `frames` | frame zero is idle | `definition.walking.frames`, asset strip codes | [Character](recipes/character-walking.ts) |
| `WalkingAppearance` | three-direction animation | walking `kind`, `side`, `front`, `back`, positive `framesPerSecond` | side is mirrored left; shared optional anchor | walking and strip diagnostics | [Character](recipes/character-walking.ts) |
| `BackgroundRegionAppearance` | Background cut-out | background-region `kind`, polygon `area` | area is finite, simple, in-frame | polygon and Scene Space codes | [Example Scene](../../examples/capri-1535/src/main.ts) |
| `EntityAppearance` | Character visual union | static or walking Appearance | registry key is identity | selected variant is validated | [Character](recipes/character-walking.ts) |
| `SceneryAppearance` | Scenery visual union | static or Background Region | registry key is identity | selected variant is validated | [Example Scene](../../examples/capri-1535/src/main.ts) |
| `CharacterDefinition` | persistent Character | initial Scene/Ground Point/Facing/Appearance, appearances, speed | speed positive; initial point walkable | Character and reference diagnostics | [Character](recipes/character-walking.ts) |
| `CharacterInput` | `defineCharacter` input | same fields as Character definition | no defaults | `defineCharacter` aggregates local failures | [Character](recipes/character-walking.ts) |
| `ObjectDefinition` | persistent collectible | initial Scene/Ground Point/Appearance, appearances, Inventory PNG | begins in exactly one Scene | Object, Appearance and asset diagnostics | [Inventory](recipes/inventory.ts) |
| `InteractionCondition` | state predicate | variable/equality or held Object | omission means unconditional | missing-reference diagnostics | [Interaction](recipes/interaction.ts) |
| `GameOperation` | atomic state transition | six operations listed above | order is significant; group is atomic | definition or `state.operation.invalid` | [Inventory](recipes/inventory.ts) |
| `GameBehaviorReads` | restricted synchronous reads | `variable`, `hasObject` methods | latest committed state only | unknown reference fails behavior operation | [Behavior](recipes/game-behavior.ts) |
| `GameBehaviorOperations` | restricted requested writes | set Variable/Appearance or start Sequence | requests commit after callback returns | invalid request fails session atomically | [Behavior](recipes/game-behavior.ts) |
| `GameBehaviorContext` | callback capability object | `reads`, operations, Hotspot `target` | ephemeral, immutable, synchronous | throw becomes `behavior.threw` | [Behavior](recipes/game-behavior.ts) |
| `GameBehavior` | exceptional authored callback | synchronous function only | no Promise/timer/randomness contract | throw preserves prior commit | [Behavior](recipes/game-behavior.ts) |
| `HotspotTarget` | interaction subject | Background, Character, Object, or Scenery | required | `reference.hotspot.target` | [Interaction](recipes/interaction.ts) |
| `ApproachPoint` | interaction destination | `groundPoint` plus `facing` | point must be in Walkable Region | approach bounds/walkable codes | [Interaction](recipes/interaction.ts) |
| `DeclarativeInteractionCase` | data-only outcome | optional condition, label, response, operations | behavior forbidden | operation/reference diagnostics | [Interaction](recipes/interaction.ts) |
| `BehavioralInteractionCase` | callback outcome | optional condition, label, response, behavior | operations forbidden | behavior diagnostics | [Behavior](recipes/game-behavior.ts) |
| `PrimaryInteractionCase` | Primary Action case union | declarative or behavioral | exactly one execution model | owner rejects inconsistent case | [Interaction](recipes/interaction.ts) |
| `PrimaryAction` | default Hotspot action | ordered `cases`, mandatory fallback | first match wins | condition/reference diagnostics | [Interaction](recipes/interaction.ts) |
| `InventoryUseCase` | selected-Object outcome | Object, optional condition, success/failure `outcome`, response, operations | successful use clears selection | failed use cannot place/consume | [Inventory](recipes/inventory.ts) |
| `InventoryUseFallback` | unmatched selected-Object outcome | failure, response, operations | mandatory when Inventory Use exists | failure-location diagnostic | [Inventory](recipes/inventory.ts) |
| `InventoryUse` | Hotspot item interaction | ordered cases and fallback | first match wins; failure keeps selection | Inventory operation diagnostics | [Inventory](recipes/inventory.ts) |
| `HotspotDefinition` | Scene-local interaction surface | target, polygon area, approach, optional condition, actions | array order controls overlap hit-testing | geometry/reference diagnostics | [Interaction](recipes/interaction.ts) |
| `SceneryDefinition` | depth-sorted Scene visual | finite `baseline`, appearances, optional position | initial Appearance required | Scenery/Appearance diagnostics | [Example Scene](../../examples/capri-1535/src/main.ts) |
| `SceneEntrance` | named passage arrival | Ground Point and Facing | point is walkable | entrance bounds/walkable codes | [Example Scene](../../examples/capri-1535/src/main.ts) |
| `ScenePassage` | conditional Scene transition | polygon, approach, optional condition, destination Scene/Entrance | transition commits atomically | passage reference and geometry codes | [Example Scene](../../examples/capri-1535/src/main.ts) |
| `PerspectiveScaleStop` | depth scale sample | finite in-frame `y`, positive `scale` | omitted scale curve means one | `definition.perspective-scale.stop` | [first Scene](recipes/first-scene.ts) |
| `SceneInput` | `defineScene` input | Background, Walkable Region and optional Scene structures | optional registries default empty | `defineScene` local diagnostics | [first Scene](recipes/first-scene.ts) |
| `SceneDefinition` | frozen local Scene | same values as Scene input | registry key supplies identity | global failures at `defineGame` | [first Scene](recipes/first-scene.ts) |
| `LineStep` | modal prose step | line `type`, text, optional Character | waits for manual advance | missing Character reference | [Sequence](recipes/sequence.ts) |
| `OperationsStep` | Sequence commit step | operations `type`, operation group | commits before continuation | nested Sequence/operation diagnostics | [Sequence](recipes/sequence.ts) |
| `ChoiceAlternative` | eligible branch | text, optional condition, finite steps | only matching alternatives display | condition/reference diagnostics | [Sequence](recipes/sequence.ts) |
| `ChoiceStep` | modal branch selection | choice `type`, alternatives, fallback | fallback only when none eligible | finite/cycle diagnostics | [Sequence](recipes/sequence.ts) |
| `BranchStep` | automatic conditional branch | branch `type`, ordered cases, fallback steps | first match wins | condition/cycle diagnostics | [Sequence](recipes/sequence.ts) |
| `SequenceStep` | finite step union | Line, Choice, Branch, or Operations | nested Sequence starts forbidden | Sequence diagnostics | [Sequence](recipes/sequence.ts) |
| `SequenceDefinition` | root modal flow | finite `steps` | registry key is identity | cycle/nested/reference diagnostics | [Sequence](recipes/sequence.ts) |
| `GameInput` | `defineGame` composition | identity/version/resolution/scenes/initial Scene plus optional registries | letterbox `#000000`; registries empty | aggregated definition/reference diagnostics | [first Scene](recipes/first-scene.ts) |
| `GameProject` | opaque validated project | only value returned by `defineGame` | immutable; no public fields | forged values rejected | [first Scene](recipes/first-scene.ts) |
| `AuthoringDiagnosticFamily` | diagnostic category | seven families listed below | stable strings | no independent failure | [first Scene](recipes/first-scene.ts) |
| `AuthoringDiagnostic` | one author-facing problem | code, family, path, message, optional suggestion/cause | stable ordering and read-only output | describes rather than throws | [first Scene](recipes/first-scene.ts) |
| `AuthoringError` | aggregated thrown failures | read-only diagnostics and message | one error per validation layer | used by helpers/startup/runtime | [first Scene](recipes/first-scene.ts) |
| `SaveSnapshot` | JSON-safe committed state | format/project identity/version and state | exact fields; format version one | external data must be validated | [Save](recipes/save-snapshot.ts) |
| `ValidatedSaveSnapshot` | restoration capability | successful validated snapshot only | runtime brand is unforgeable | `save.validation.required` | [Save](recipes/save-snapshot.ts) |
| `SaveSnapshotValidation` | explicit result union | true `ok` with snapshot or false with diagnostics | never repairs expected bad data | save diagnostic codes | [Save](recipes/save-snapshot.ts) |
| `StartGameOptions` | mounting options | unowned `target`, optional validated snapshot | snapshot omission starts new state | target/save/environment diagnostics | [Save](recipes/save-snapshot.ts) |
| `GameSession` | running lifecycle handle | save, status, diagnostics and stop methods | stop idempotent and terminal | save after stop/failure throws | [Save](recipes/save-snapshot.ts) |

Exact nested field spellings additionally include `equals`, `character`,
`scene`, `scenery`, `sequence`, `approach`, `entrance`, `perspectiveScale`,
`hotspots`, `entrances`, `passages`, and `alternatives`; their owning matrix
rows above define the permitted values and invariants.

### Stable diagnostic code index

Definition codes: `definition.approach.bounds`,
`definition.approach.walkable`, `definition.character.movement-speed`,
`definition.character.walkable`, `definition.entrance.walkable`,
`definition.inventory-appearance-size`,
`definition.inventory-use.failure-location`,
`definition.logical-resolution.positive-integer`,
`definition.operation.collect-target`, `definition.perspective-scale.stop`,
`definition.operation.ground-point`,
`definition.point.finite`, `definition.polygon.degenerate`,
`definition.polygon.self-intersection`, `definition.polygon.vertices`,
`definition.project.identity`, `definition.project.version`,
`definition.scene-space.bounds`, `definition.scenery.baseline`,
`definition.sequence.cycle`, `definition.sequence.nested`,
`definition.walking.frames`, and `definition.walking.frames-per-second`.

Reference codes: `reference.appearance`, `reference.appearance.initial`,
`reference.appearance.target`, `reference.character`,
`reference.character.initial-scene`, `reference.character.player`,
`reference.hotspot.target`, `reference.object`, `reference.object.initial-scene`,
`reference.passage.entrance`, `reference.passage.scene`, `reference.scene.initial`,
`reference.sequence`, and `reference.variable`.

Runtime and persistence codes: `state.operation.invalid`, `behavior.threw`,
`save.shape`, `save.fields.unexpected`, `save.format.version`,
`save.project.identity`, `save.project.version`, `save.state.invalid`,
`save.validation.required`, `asset.load.failed`, `asset.background.dimensions`,
`asset.inventory-appearance.dimensions`, `asset.walk-strip.frames`,
`asset.walk-strip.consistency`, `asset.visual-anchor.bounds`,
`environment.start.failed`, `environment.target.occupied`, and
`environment.webgl.unavailable`.

Return to the [quick start](quick-start.md) or inspect the complete
[Capri 1535 Example](../../examples/capri-1535/src/main.ts).
