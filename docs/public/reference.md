# Public reference

Every public symbol is imported from `@asterixcapri/fondale`; deep imports are
not supported. This is the normative Fondale 1.1 contract.

## Commands and HUD

`commandVerbs` fixes the visible grid order: `open`, `pick-up`, `push`, `close`,
`look-at`, `pull`, `give`, `talk-to`, `use`. `CommandVerb` is that union and
`Verb` also includes implicit `walk-to`.

`defineNoun` validates and freezes a `NounDefinition`. Its `labels` and
`preferredVerbs` are ordered conditional variants with exactly one
unconditional final fallback. `cases` are ordered `CommandCase` values. Give is
binary, Use may be unary or binary, and all other visible verbs are unary. A
case may provide a `CommandResponse`, `GameOperation` values, a `sequence`, or
a combination. `fallbacks` map a Verb to a local `CommandFallback`.

`defineCommandLexicon` validates and freezes a `CommandLexicon`: all nine Verb
labels plus explicit `unary`, `give`, and `use` sentence patterns. The required
placeholders are `{verb}`, `{noun}`, `{first}`, and `{second}` as appropriate.
`defineGame` rejects Nouns without a lexicon and rejects any complete Command
that lacks a specific case, local fallback, or response-only global fallback.

`defineHUDTheme` validates and freezes a `HUDTheme`. It supplies one local font,
six CSS-hex colours, HUD `opacity`, `maxSpeechWidth`, five directional cursor
assets, and Character-keyed `speechColors`. `PassageDirection` is `left`,
`right`, `up`, `down`, or `enter`. Theme data styles the stable Engine-owned
HUD; it cannot change its controls or structure.

## Definitions

`defineScene` validates and freezes a `SceneDefinition`. A Scene has a full-size
PNG `background`, finite simple `walkableRegion`, optional `perspectiveScale`,
named Scenery, ordered Hotspots, named Entrances, and ordered Passages.
Omission means scale `1`. A Hotspot requires `target`, polygon `area`, `approach`, one
Noun and optional `when`. A Passage additionally requires one Noun,
`PassageDirection`, and a destination Scene/Entrance. With a Command Lexicon,
interactive geometry must remain above the bottom 60 logical pixels reserved
for the HUD.

`defineCharacter` validates a persistent Character with initial Scene, Ground
Point, Facing, Appearance, positive `movementSpeed`, optional Noun, and static
or walking Appearances. A walking Appearance has side/front/back strips,
positive frame counts and rate; the side strip is mirrored for left movement.

`defineObject` validates an Object with initial Scene, Ground Point, Appearance,
named static Appearances, square `inventoryAppearance`, and optional Noun. An
Object is in one Scene, in Inventory, or consumed.

`defineSequence` validates a finite `SequenceDefinition`. `SequenceStep` is a
Line, Choice, Branch, or atomic Operations group. A `ChoiceAlternative` has
text, optional condition, optional `spoken` (default true), and steps. At most
six alternatives are allowed. A Sequence may be `skippable`.

`defineGame` composes a `GameInput` into an opaque immutable `GameProject`.
Required values are identity, version, Logical Resolution, Scene registry and
initial Scene. Optional registries default empty; letterbox has default
`#000000` (that is, default `#000000`). Registry keys are identities. Cross-references, geometry,
conditions, operation targets, Nouns, fallbacks and assets are validated before
play.

`InteractionCondition` reads a boolean Variable or held Object. `GameOperation`
can set a Variable or Appearance, start a Sequence, collect the target Object,
place the selected first Object, or consume it. Operations in one group see
earlier writes and either commit together or fail without a partial commit.
Conditions always read the latest committed Game State.

## Runtime and persistence

`startGame` resolves to `GameSession` after assets validate,
WebGL starts, and the first frame is drawn. `StartGameOptions` contains an
unowned `target` and optional validated snapshot. `GameSession` exposes
`createSaveSnapshot`, `getStatus`, `getDiagnostics`, and idempotent terminal
`stop`.

`validateSaveSnapshot` returns
`SaveSnapshotValidation`; expected bad external data does not throw. A
`SaveSnapshot` records format/project identity/project version and canonical
state, including an incomplete Command. Only the branded
`ValidatedSaveSnapshot` from successful validation may restore a session.
Hover, pointer position and Player Preferences are not saved.

`AuthoringError` contains stably ordered `AuthoringDiagnostic` values. Each has
stable `code`, `family`, `path`, `message`, optional `suggestion`, and optional
`cause`. `AuthoringDiagnosticFamily` is definition, reference, state, save,
asset, or environment.

## Structural contract index

| Structure | Purpose | Allowed values | Defaults and invariants | Errors | Executed example |
| --- | --- | --- | --- | --- | --- |
| `Point` | Scene/image coordinate | finite numeric x and y | field-specific coordinate space | finite and bounds diagnostics | [Scene](recipes/first-scene.ts) |
| `LogicalResolution` | fixed frame dimensions | positive integer width and height | shared by every Scene | positive-integer diagnostic | [Scene](recipes/first-scene.ts) |
| `Facing` | authored orientation | front, back, left, right | required where present | type and reference validation | [Character](recipes/character-walking.ts) |
| `StaticAppearance` | single PNG visual | static kind, image, optional anchor | anchor defaults bottom-centre | asset and anchor diagnostics | [Inventory](recipes/inventory.ts) |
| `WalkStrip` | directional strip | image and positive frame count | frame zero is idle | walking frame diagnostics | [Character](recipes/character-walking.ts) |
| `WalkingAppearance` | moving Character visual | three strips, rate, optional anchor | side mirrors for left | rate and strip diagnostics | [Character](recipes/character-walking.ts) |
| `BackgroundRegionAppearance` | Background cut-out | background-region and polygon | belongs to owning Background | polygon and bounds diagnostics | [Scene](recipes/first-scene.ts) |
| `EntityAppearance` | Character visual union | static or walking | registry key identifies variant | selected variant validation | [Character](recipes/character-walking.ts) |
| `SceneryAppearance` | Scenery visual union | static or Background Region | registry key identifies variant | selected variant validation | [Scene](recipes/first-scene.ts) |
| `CharacterDefinition` | persistent Character | initial values, appearances, speed, noun | initial point is walkable | Character/reference diagnostics | [Character](recipes/character-walking.ts) |
| `CharacterInput` | Character helper input | Character definition fields | no additional defaults | helper aggregates failures | [Character](recipes/character-walking.ts) |
| `ObjectDefinition` | persistent Object | initial values, appearances, Inventory PNG, noun | begins in one Scene | Object/asset diagnostics | [Inventory](recipes/inventory.ts) |
| `InteractionCondition` | state predicate | variable equality or held Object | omission is unconditional | missing-reference diagnostics | [Command](recipes/command-case.ts) |
| `GameOperation` | atomic state change | six declared operation variants | order matters; group atomic | operation/reference diagnostics | [Inventory](recipes/inventory.ts) |
| `HotspotTarget` | interaction subject | Background, Character, Object, Scenery | target is required | target reference diagnostic | [Interaction](recipes/interaction.ts) |
| `ApproachPoint` | interaction destination | groundPoint and facing | must be walkable and HUD-safe | approach diagnostics | [Interaction](recipes/interaction.ts) |
| `HotspotDefinition` | Scene interaction surface | target, area, approach, noun, condition | later overlap wins hit-test | geometry/reference diagnostics | [Interaction](recipes/interaction.ts) |
| `SceneryDefinition` | depth-sorted visual | baseline, appearances, position, noun | initial Appearance required | Scenery diagnostics | [Scene](recipes/first-scene.ts) |
| `SceneEntrance` | named arrival | Ground Point and Facing | point must be walkable | entrance diagnostics | [Scene](recipes/first-scene.ts) |
| `ScenePassage` | directional transition | area, approach, noun, direction, destination | transition is atomic | passage diagnostics | [Scene](recipes/first-scene.ts) |
| `PerspectiveScaleStop` | depth-scale sample | in-frame y and positive scale | stops interpolate linearly | perspective diagnostic | [Scene](recipes/first-scene.ts) |
| `SceneInput` | Scene helper input | Background, region and optional structures | optional collections are empty | helper diagnostics | [Scene](recipes/first-scene.ts) |
| `SceneDefinition` | frozen local Scene | same values as SceneInput | registry key supplies identity | project adds references | [Scene](recipes/first-scene.ts) |
| `LineStep` | modal spoken/narrated text | line type, text, optional Character | waits for advance | Character reference diagnostic | [Sequence](recipes/sequence.ts) |
| `OperationsStep` | Sequence state commit | operations type and operation group | commits before continuation | nested/operation diagnostics | [Sequence](recipes/sequence.ts) |
| `ChoiceAlternative` | eligible answer | text, condition, spoken, steps | spoken defaults true | condition/cycle diagnostics | [Sequence](recipes/sequence.ts) |
| `ChoiceStep` | modal answer set | alternatives and fallback | maximum six alternatives | choice-limit diagnostic | [Sequence](recipes/sequence.ts) |
| `BranchStep` | automatic branch | ordered cases and fallback | first eligible case wins | condition/cycle diagnostics | [Sequence](recipes/sequence.ts) |
| `SequenceStep` | finite step union | Line, Choice, Branch, Operations | nested starts forbidden | Sequence diagnostics | [Sequence](recipes/sequence.ts) |
| `SequenceDefinition` | root modal flow | finite steps and skippable flag | registry key is identity | cycle/reference diagnostics | [Sequence](recipes/sequence.ts) |
| `GameInput` | project composition | identity, version, resolution, registries, commands, theme | empty registries; black letterbox | aggregated diagnostics | [Scene](recipes/first-scene.ts) |
| `GameProject` | validated opaque project | only returned by defineGame | immutable and fieldless | forged project rejected | [Scene](recipes/first-scene.ts) |
| `NounLabel` | conditional visible name | text and optional condition | one final unconditional label | conditional/text diagnostics | [Interaction](recipes/interaction.ts) |
| `PreferredVerbCase` | conditional quick action | Verb and optional condition | one final unconditional Verb | conditional diagnostic | [Interaction](recipes/interaction.ts) |
| `CommandResponse` | perceivable outcome | text, speech/narration, speaker | speech uses Player by default | text/speaker diagnostics | [Interaction](recipes/interaction.ts) |
| `CommandCase` | specific resolution | Verb, firstNoun, condition, response, operations, sequence | ordered; arity is fixed | arity/reference diagnostics | [Command](recipes/command-case.ts) |
| `CommandFallback` | local final resolution | response, operations, sequence | used after specific cases | response/reference diagnostics | [Interaction](recipes/interaction.ts) |
| `NounDefinition` | common interaction model | labels, Preferred Verbs, cases, fallbacks | immutable; response guaranteed globally | Noun/Command diagnostics | [Interaction](recipes/interaction.ts) |
| `CommandLexicon` | localized Command grammar | nine labels and three patterns | Engine never infers grammar | lexicon diagnostics | [Scene](recipes/first-scene.ts) |
| `CommandVerb` | visible Verb union | nine commandVerbs values | stable grid order | compile-time restriction | [Interaction](recipes/interaction.ts) |
| `Verb` | complete Verb union | CommandVerb or walk-to | walk-to is implicit | compile-time restriction | [Scene](recipes/first-scene.ts) |
| `PassageDirection` | Passage cursor direction | left, right, up, down, enter | every Passage declares one | cursor/reference diagnostics | [Scene](recipes/first-scene.ts) |
| `HUDTheme` | project visual language | font, colours, opacity, width, cursors, speech colours | complete local asset set | theme/asset diagnostics | [migration](migration-1.1.md) |
| `AuthoringDiagnosticFamily` | rejecting layer | six stable category strings | category is always present | no independent failure | [Scene](recipes/first-scene.ts) |
| `AuthoringDiagnostic` | one author-facing issue | code, family, path, message, suggestion, cause | stable code/path ordering | describes owning failure | [Scene](recipes/first-scene.ts) |
| `AuthoringError` | aggregate failure | read-only diagnostics | one error per validation layer | thrown by helpers/startup | [Scene](recipes/first-scene.ts) |
| `SaveSnapshot` | JSON-safe committed state | format, project identities and state | exact fields only | save validation diagnostics | [Save](recipes/save-snapshot.ts) |
| `ValidatedSaveSnapshot` | restoration capability | successfully validated snapshot | runtime brand cannot be authored | validation-required diagnostic | [Save](recipes/save-snapshot.ts) |
| `SaveSnapshotValidation` | validation result union | ok snapshot or diagnostics | never repairs bad input | save diagnostics | [Save](recipes/save-snapshot.ts) |
| `StartGameOptions` | browser mount options | target and optional snapshot | omitted snapshot starts fresh | environment/save diagnostics | [Save](recipes/save-snapshot.ts) |
| `GameSession` | running lifecycle handle | save, status, diagnostics, stop | stop idempotent and terminal | lifecycle diagnostics | [Save](recipes/save-snapshot.ts) |

Exact reachable fields also include `x`, `y`, `width`, `height`, `kind`,
`image`, `visualAnchor`, `frames`, `side`, `front`, `back`, `framesPerSecond`,
`area`, `facing`, `font`, `initialScene`, `initialGroundPoint`, `initialFacing`,
`initialAppearance`, `appearances`, `movementSpeed`, `noun`, `source`, `family`,
`colors`, `text`, `preferred`, `selected`, `backing`, `border`, `inventoryWell`,
`opacity`, `maxSpeechWidth`, `cursors`, `speechColors`, `equals`, `hasObject`,
`type`, `variable`, `value`, `target`, `character`, `object`, `scenery`, `scene`,
`appearance`, `sequence`, `groundPoint`, `baseline`, `position`, `approach`,
`when`, `direction`, `destination`, `entrance`, `scale`, `background`,
`walkableRegion`, `perspectiveScale`, `hotspots`, `entrances`, `passages`,
`alternatives`, `fallback`, `steps`, `cases`, `skippable`, `identity`, `version`,
`logicalResolution`, `scenes`, `characters`, `playerCharacter`, `objects`,
`sequences`, `variables`, `inventoryAppearanceSize`, `initialScene`,
`letterboxColor`, `commandLexicon`, `commandFallbacks`, `hudTheme`, `verb`,
`presentation`, `speaker`, `firstNoun`, `response`, `operations`, `fallbacks`,
`labels`, `preferredVerbs`, `verbs`, `patterns`, `unary`, `give`, `use`, `code`,
`path`, `message`, `suggestion`, `cause`, `formatVersion`, `projectIdentity`,
`projectVersion`, `state`, `ok`, `snapshot`, `diagnostics`, and `target`.

## Stable diagnostics

Definition codes: `definition.approach.bounds`,
`definition.approach.walkable`, `definition.character.movement-speed`,
`definition.character.walkable`, `definition.choice.limit`,
`definition.command-case.arity`, `definition.command-case.empty`,
`definition.command-lexicon.label`, `definition.command-lexicon.pattern`,
`definition.command-lexicon.required`, `definition.command-response.text`,
`definition.command.silent`, `definition.conditional-fallback`,
`definition.entrance.walkable`, `definition.hud-reserved.approach`,
`definition.hud-reserved.hotspot`, `definition.hud-reserved.passage`,
`definition.hud-reserved.walkable-region`, `definition.hud-theme.color`,
`definition.hud-theme.cursor`, `definition.hud-theme.font`,
`definition.hud-theme.opacity`, `definition.hud-theme.speech-color`,
`definition.hud-theme.speech-width`, `definition.inventory-appearance-size`,
`definition.logical-resolution.positive-integer`,
`definition.noun-label.text`, `definition.operation.collect-target`,
`definition.operation.ground-point`, `definition.perspective-scale.stop`,
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
`reference.passage.entrance`, `reference.passage.scene`,
`reference.scene.initial`, `reference.sequence`, and `reference.variable`.

Runtime, save, asset and environment codes: `state.operation.invalid`,
`save.shape`, `save.fields.unexpected`, `save.format.version`,
`save.project.identity`, `save.project.version`, `save.state.invalid`,
`save.validation.required`, `asset.load.failed`, `asset.background.dimensions`,
`asset.cursor.dimensions`, `asset.font.load.failed`,
`asset.inventory-appearance.dimensions`, `asset.walk-strip.frames`,
`asset.walk-strip.consistency`, `asset.visual-anchor.bounds`,
`environment.start.failed`, `environment.target.occupied`, and
`environment.webgl.unavailable`.

See the [quick start](quick-start.md), [migration guide](migration-1.1.md),
[Support Baseline](support-baseline.md), and compiled [recipes](recipes/README.md).
