# Public reference

Every public symbol is imported from `@asterixcapri/fondale`; deep imports are
not supported. This is the normative Fondale 0.4 alpha contract. The npm
package version is `0.4.0`; it is independent from an Author's Project Version
and from Fondale's Save Snapshot format version.

## Commands and HUD

`commandVerbs` lists the semantic Command actions: `open`, `pick-up`, `push`,
`close`, `look-at`, `pull`, `give`, `talk-to`, `use`. `CommandVerb` is that union and
`Verb` also includes implicit `walk-to`.

`NounDefinition` describes `labels` and
`preferredVerbs` are ordered conditional variants with exactly one
unconditional final fallback. Optional `secondaryVerbs` and `objectVerbs` use
the same conditional contract. They advertise the right-button action at rest
and the primary action when an Inventory Object is selected, respectively;
Selected Object Verb defaults to Use. `cases` are ordered `CommandCase` values. Give is
binary, Use may be unary or binary, and all other visible verbs are unary. A
case may provide exactly one textual outcome: a direct Character `line`, a
neutral `CommandResponse`, or a `sequence`. Allowed `GameOperation` values may
accompany that outcome. `fallbacks` map a Verb to a local `CommandFallback`.

`CommandLexicon` declares all nine semantic Verb
labels, localized `inventory` `select`/`deselect` phrases, plus explicit `unary`, `give`, and `use` sentence patterns. The required
placeholders are `{verb}`, `{noun}`, `{first}`, and `{second}` as appropriate.
Startup rejects Nouns without a lexicon and rejects any complete Command
that lacks a specific case, local fallback, or response-only global fallback.

`HUDTheme` supplies one local font,
six CSS-hex colours, HUD `opacity`, `maxSpeechWidth`, five directional cursor
assets, and Character-keyed `speechColors`. `PassageDirection` is `left`,
`right`, `up`, `down`, or `enter`. Theme data styles the stable Engine-owned
contextual prompts, Inventory drawer and speech; it cannot change their
controls or structure.

## Definitions

`SceneDefinition` describes a Scene with a PNG
`background`, optional `size`, finite simple `walkableRegion`, optional `perspectiveScale`,
named Scenery, ordered Hotspots, named Entrances, and ordered Passages.
Omission means scale `1`. A Hotspot requires `target`, polygon `area`,
`approach`, and optional `when`. The target discriminates ownership: a
Background Hotspot requires a local `noun`; Character, Object, and Scenery
Hotspots reject `noun` and resolve the target owner's Noun at use time. A
Passage additionally requires its own Noun,
`PassageDirection`, and a destination Scene/Entrance. The Scene has no region
reserved for the HUD; authored geometry may use the complete Scene Size.
Scene Size has positive-integer width and height. During startup compilation, omission
defaults Scene Size to Logical Resolution and every declared axis must be at
least as large as the corresponding viewport axis. The Background must exactly
match the resolved Scene Size; its startup diagnostic reports actual and
expected dimensions.

`CharacterDefinition` describes a persistent Character with initial Scene, Ground
Point, Facing, Appearance, positive `movementSpeed`, optional Noun, optional
`CharacterDialogueDefinition`, and named Appearances. Every Appearance owns named Animations and a required default
Animation Role. The Player Character also requires a walking Role; directional
walking uses side/front/back strips and mirrors the side strip when facing left.

`NarrativeFactDefinition` is a non-empty canonical `proposition` identified by
its `narrativeFacts` registry key. A `CharacterDialogueDefinition` contains the
Character's initial Character Knowledge, directional Relationships and optional
qualitative Dialogue State and portrayal profile. Every
`CharacterKnowledgeDefinition` refers to one fact through `factId` and declares
`open`, `guarded`, or `secret` Disclosure. Guarded facts require minimum Trust
or a boolean Game Variable; secret facts always require an explicit Game
Variable unlock. Repeated references are invalid. Fondale copies Character
Knowledge, Relationships and Dialogue State into independent Game State.

## Knowledge-Driven Dialogue

`DialogueProvider` is the provider-agnostic startup seam for a Game Project
that declares at least one Character Dialogue Profile. `StartGameOptions`
receives it as `dialogueProvider`; Fondale never creates a model client. The
interface keeps `interpret`, `verbalize`, and `reset` as separate
responsibilities. Interpretation receives untrusted `playerInput`, speaker and
listener identities, and the known `DialogueFactCandidate` values relevant to
that Conversation. Its `DialogueInterpretation` selects one declared `factId`
or returns `null` with a `reason` of `ambiguous` or `no-relevant-fact`.

After validating the interpretation, deterministic Dialogue policy applies
Disclosure, directional Trust, Game Variables and Dialogue Behavior. Fondale
sends a `DialogueVerbalizationRequest` with an authorised `ResponseStrategy`,
qualitative portrayal data, and a fact only for `answer`; blocked and `clarify`
payloads contain no Narrative Fact. The returned text is presented as a Line
but is never parsed for Game State changes. Only an answered fact is taught to
the Player Character atomically. Player speech must contain from 1 through
`dialogueInputMaxLength` (500) characters.

`FakeDialogueProvider` is the deterministic adapter used by Engine tests and
browser fixtures. Its `interpretations` map multiple exact Player formulations
to declared Narrative Fact IDs or `null`; its `verbalizations` map an authorised
fact ID or non-answer Response Strategy to one response. It has no network,
database, model, or credential dependency.

The authored condition fields are `trustAtLeast`, `variable`, and `equals`.
Qualitative profile fields are `biography`, `personality`, `behavior`, `voice`,
`relationships`, `talkativeness`, `honesty`, `discretion`, `suspiciousness`,
`withholding`, `verbosity`, `tone`, `vocabulary`, and `trust`. Provider requests
carry Engine-selected `strategy` and `profile` fields. A directional Trust
operation names its target with `towards`.

`ObjectDefinition` describes an Object with initial Scene, Ground Point, Appearance,
named animated Appearances, square `inventoryAppearance`, and optional Noun. An
Object is in one Scene, in Inventory, or consumed. Its one Noun governs both
world and Inventory interactions. A `place-selected-object` Ground Point must
fit every Scene in which its owning Noun or Sequence can execute; portable
Objects, Player Character Nouns, and Sequences are therefore checked against
every registered Scene Size.

`SequenceDefinition` declares a finite flow. `SequenceStep` is a
Character-bound Line, explicit Narration, Choice, Branch, atomic Operations
group, or concurrent Direction Step. A Line may declare an audio asset and an
Animation override; its playback duration participates in
automatic advancement. Narration contains narrator prose and never identifies
a Character. A `ChoiceAlternative` has
text, optional condition, optional `spoken` (default true), and steps. At most
six alternatives are allowed. A skippable Sequence must declare the atomic
`skipOutcome` applied when its transient direction is interrupted. A directed
Sequence names one owning Scene and may coordinate Animation, Motion and Camera
directions, including starts caused by named Animation Cues.
Sequence owns nested traversal, Choice eligibility, Branch selection, Skip
Outcome requests, and resumable activity state. Game Session applies requested
Game Operations atomically, while browser presentation consumes resolved Line,
Narration, Choice, and Direction facts without resolving authored paths again.

`GameProject` is ordinary declarative TypeScript data, commonly checked with
`satisfies`. Required values are identity, version, Logical Resolution, Scene
registry and initial Scene; the optional `narrativeFacts` registry defaults
empty. `startGame` validates and creates a private deeply
immutable snapshot. Optional registries default empty; letterbox has default
`#000000` (that is, default `#000000`). Registry keys are identities. Cross-references, geometry,
conditions, operation targets, Nouns, fallbacks and assets are validated before
play.

A Character, Object, or Scenery may omit its Noun when it is not interactive.
If a Hotspot references such an owner, startup reports one
`definition.hotspot.target-noun.required` diagnostic at the owner path (for
example `objects.key.noun`), even when several Hotspots reference it. A missing
target remains the distinct `reference.hotspot.target` failure.

`InteractionCondition` reads a boolean Variable or held Object. `GameOperation`
can set a Variable or Appearance, start a Sequence, collect the target Object,
place the selected first Object, place a named Object, or consume the selected
Object. It also includes `LearnNarrativeFactOperation`, whose
`learn-narrative-fact` discriminator, Character identity and `factId` add
declared Character Knowledge monotonically. Operations in one group see
earlier writes and either commit together or fail without a partial commit.
Conditions always read the latest committed Game State.

`InventoryOperation` is the Interaction-owned subset of `GameOperation`: it
collects the target Object, places the selected first Object at a Ground Point,
places a named Object in a Scene, or consumes the selected Object. Optional
placement Appearance changes are validated by Animation, while World validates
the destination in Scene Space.

## Runtime and persistence

`startGame` first compiles an isolated project snapshot and validates any
untrusted Save Snapshot, then resolves to `GameSession` after assets validate,
WebGL starts, and the first frame is drawn. `StartGameOptions` contains an
unowned `target`, optional unknown `snapshot`, and the `dialogueProvider`
required when any Character declares a Dialogue Profile. `GameSession` exposes
`createSaveSnapshot`, `getStatus`, `getDiagnostics`, and idempotent terminal
`stop`.

A `SaveSnapshot` records format/project identity/project version and canonical
state, including an incomplete Command and Character Knowledge. Stored values are passed as `unknown`
to `startGame`; malformed, incompatible or semantically invalid values reject
with Save-owned diagnostics before browser effects.
Camera position, hover, pointer position and Player Preferences are not saved.
On oversized Scenes the internal Camera normally follows the visible Player
Character, eases ordinary walking, snaps on startup, restoration and Scene
entry, clamps independently on both axes, and translates the world on whole
logical pixels. A Sequence may cut, move, hold, or follow another subject in
its current Scene; completion and skip restore Player following. World pointer
input, Character speech, and revealed Hotspots are projected; Engine-owned HUD
controls remain in viewport space.

`AuthoringError` contains stably ordered `AuthoringDiagnostic` values. Each has
stable `code`, `family`, capability `owner`, `path`, `message`, optional
`suggestion`, and optional `cause`. `AuthoringDiagnosticFamily` is definition,
reference, state, save, asset, or environment. `AuthoringDiagnosticOwner`
identifies the capability or browser adapter responsible for the rule.

## Structural contract index

| Structure | Purpose | Allowed values | Defaults and invariants | Errors | Executed example |
| --- | --- | --- | --- | --- | --- |
| `Point` | Scene/image coordinate | finite numeric x and y | field-specific coordinate space | finite and bounds diagnostics | [Scene](recipes/first-scene.ts) |
| `LogicalResolution` | fixed viewport dimensions | positive integer width and height | shared by output canvas and HUD | positive-integer diagnostic | [Scene](recipes/first-scene.ts) |
| `SceneSize` | complete Scene Space extent | positive integer width and height | omission defaults to Logical Resolution; neither axis may be smaller | Scene-size diagnostics | [Scene](recipes/first-scene.ts) |
| `Facing` | authored orientation | front, back, left, right | required where present | type and reference validation | [Character](recipes/character-walking.ts) |
| `AnimationStrip` | horizontal frame source | image and positive count | directions share one declarative shape | frame and asset diagnostics | [Character](recipes/character-walking.ts) |
| `AnimationFrames` | Animation frame source | image list or side/front/back strips | concrete frames remain derived | frame and asset diagnostics | [Sequence](recipes/sequence.ts) |
| `AnimationDefinition` | transient visual performance | frames, positive rate, loop, named Cues | loop defaults false | Animation/Cue diagnostics | [Sequence](recipes/sequence.ts) |
| `AnimationRoles` | semantic Engine selections | default, optional speaking and walking names | default is required; speaking falls back to default | missing Animation diagnostics | [Character](recipes/character-walking.ts) |
| `Appearance` | persistent semantic visual condition | named Animations, roles, optional anchor | registry key identifies selected condition | Animation, role, asset, and anchor diagnostics | [Character](recipes/character-walking.ts) |
| `EntityAppearance` | Character/Object visual condition | definitive animated Appearance | alias preserves entity-specific signatures | Appearance diagnostics | [Character](recipes/character-walking.ts) |
| `SceneryAppearance` | Scenery visual condition | animated Appearance or Background Region | Background Regions remain tied to their Scene | Appearance/polygon diagnostics | [Scene](recipes/first-scene.ts) |
| `BackgroundRegionAppearance` | Background cut-out | background-region and polygon | belongs to owning Background | polygon and bounds diagnostics | [Scene](recipes/first-scene.ts) |
| `CharacterDefinition` | persistent Character | initial values, appearances, speed, noun, dialogue | initial point is walkable | Character/reference diagnostics | [Character](recipes/character-walking.ts) |
| `NarrativeFactDefinition` | canonical authored truth | non-empty proposition | registry key is stable identity | Narrative Fact definition diagnostics | [Dialogue authoring](game-authoring.md) |
| `QualitativeLevel` | shared qualitative scale | low, medium, high | no numeric simulation | compile-time restriction and capability validation | [Dialogue authoring](game-authoring.md) |
| `Trust` | directional Relationship confidence | qualitative level | changes only through authored operations | Relationship diagnostics | [Dialogue authoring](game-authoring.md) |
| `DialogueVariableCondition` | boolean authored unlock | variable identity and expected value | reads committed Game Variables only | variable-reference diagnostics | [Dialogue authoring](game-authoring.md) |
| `DialogueTrustCondition` | guarded minimum confidence | qualitative Trust threshold | reads source-to-listener Relationship | Relationship diagnostics | [Dialogue authoring](game-authoring.md) |
| `OpenDisclosure` | unrestricted Disclosure | open level | eligible whenever relevant | capability validation | [Dialogue authoring](game-authoring.md) |
| `GuardedDisclosure` | conditional Disclosure | Trust minimum or boolean Game Variable | condition is Character-specific | condition/reference diagnostics | [Dialogue authoring](game-authoring.md) |
| `SecretDisclosure` | explicitly unlocked Disclosure | boolean Game Variable condition | Trust alone never unlocks it | condition/reference diagnostics | [Dialogue authoring](game-authoring.md) |
| `Disclosure` | Character-specific communication policy | open, guarded, or secret | secret requires a Game Variable unlock | capability-owned definition/reference diagnostics | [Dialogue authoring](game-authoring.md) |
| `PersonalityDefinition` | qualitative portrayal traits | four qualitative traits | cannot authorise facts or state changes | profile diagnostics | [Dialogue authoring](game-authoring.md) |
| `DialogueBehaviorDefinition` | deterministic withholding preference | withhold, evade, or refuse | cannot override Disclosure | profile diagnostics | [Dialogue authoring](game-authoring.md) |
| `VoiceDefinition` | qualitative phrasing profile | verbosity, tone, vocabulary | cannot change authorised content | profile diagnostics | [Dialogue authoring](game-authoring.md) |
| `DialogueState` | optional qualitative current condition | calm, afraid, angry, drunk | changed only by authored operation | state diagnostics | [Dialogue authoring](game-authoring.md) |
| `RelationshipDefinition` | initial directional social state | qualitative Trust | source and target identities remain distinct | Character/Trust diagnostics | [Dialogue authoring](game-authoring.md) |
| `CharacterKnowledgeDefinition` | initial known fact reference | factId and Disclosure | one reference per Character and fact | knowledge reference/duplicate diagnostics | [Dialogue authoring](game-authoring.md) |
| `CharacterDialogueDefinition` | optional Character dialogue profile | knowledge, Relationships, qualitative portrayal and state | omission preserves authored behaviour | dialogue capability diagnostics | [Dialogue authoring](game-authoring.md) |
| `LearnNarrativeFactOperation` | monotonic Character Knowledge change | Character and Narrative Fact identities | repeated learning is idempotent | Character/fact reference diagnostics | [Dialogue authoring](game-authoring.md) |
| `SetTrustOperation` | directional Relationship change | source, target and qualitative Trust | only a declared Relationship edge may change | Character/Relationship diagnostics | [Dialogue authoring](game-authoring.md) |
| `SetDialogueStateOperation` | qualitative Dialogue State change | Character and state or null | only authored operations change canonical state | Character/state diagnostics | [Dialogue authoring](game-authoring.md) |
| `DialogueGameOperation` | Dialogue-owned canonical transition | learn fact, set Trust, set Dialogue State | participates in an atomic operation batch | operation/reference diagnostics | [Dialogue authoring](game-authoring.md) |
| `DialogueFactCandidate` | known fact eligible for interpretation | stable id and canonical proposition | Disclosure is applied after interpretation | unknown selections are rejected | [Dialogue authoring](game-authoring.md) |
| `DialogueInterpretationRequest` | untrusted speech interpretation input | playerInput, speaker, listener, candidates | candidates are frozen and capability-authorised | provider failure rejects the turn | [Dialogue authoring](game-authoring.md) |
| `DialogueInterpretation` | provider-selected semantic reference | declared factId, or null with an unresolved reason | ambiguity clarifies; no relevant fact withholds | unknown fact ID or reason rejects before verbalization | [Dialogue authoring](game-authoring.md) |
| `ResponseStrategy` | Engine-authorised conversational approach | answer, withhold, evade, refuse, clarify | selected deterministically before verbalisation | invalid provider output rejects the turn | [Dialogue authoring](game-authoring.md) |
| `DialoguePortrayalProfile` | provider-visible qualitative portrayal | optional biography, Personality, Voice and Dialogue State | carries no semantic authority | validated at startup | [Dialogue authoring](game-authoring.md) |
| `DialogueVerbalizationRequest` | authorised expression input | speech identities, strategy, portrayal and optional fact | a blocked fact is absent | empty response rejects the turn | [Dialogue authoring](game-authoring.md) |
| `DialogueProvider` | generated-dialogue adapter seam | interpret, verbalize, reset | supplied at startup; Engine creates no client | missing adapter is a startup diagnostic | [Dialogue authoring](game-authoring.md) |
| `FakeDialogueProvider` | deterministic Dialogue Provider adapter | interpretation and verbalization maps | no external dependency or generated authority | missing configured mapping rejects the turn | [Dialogue authoring](game-authoring.md) |
| `ObjectDefinition` | persistent Object | initial values, appearances, Inventory PNG, noun | begins in one Scene | Object/asset diagnostics | [Inventory](recipes/inventory.ts) |
| `InteractionCondition` | state predicate | variable equality or held Object | omission is unconditional | missing-reference diagnostics | [Command](recipes/command-case.ts) |
| `InventoryOperation` | Inventory and Object lifecycle change | collect target, place selected, place named, consume selected | World owns placement validity; Animation owns Appearance validity | Interaction/World/Animation diagnostics | [Inventory](recipes/inventory.ts) |
| `GameOperation` | atomic state change | ten declared operation variants | order matters; group atomic | operation/reference diagnostics | [Inventory](recipes/inventory.ts) |
| `HotspotTarget` | interaction subject | Background, Character, Object, Scenery | target is required | target reference diagnostic | [Interaction](recipes/interaction.ts) |
| `ApproachPoint` | interaction destination | groundPoint and facing | must be walkable and HUD-safe | approach diagnostics | [Interaction](recipes/interaction.ts) |
| `HotspotDefinition` | Scene interaction surface | target, area, approach, condition; local noun only for Background | target kind discriminates Noun ownership; later overlap wins hit-test | geometry, target and owner-Noun diagnostics | [Interaction](recipes/interaction.ts) |
| `SceneryDefinition` | depth-sorted visual | baseline, appearances, position, noun | initial Appearance required | Scenery diagnostics | [Scene](recipes/first-scene.ts) |
| `SceneEntrance` | named arrival | Ground Point and Facing | point must be walkable | entrance diagnostics | [Scene](recipes/first-scene.ts) |
| `ScenePassage` | directional transition | area, approach, noun, direction, destination | transition is atomic | passage diagnostics | [Scene](recipes/first-scene.ts) |
| `ArrivalSequenceRule` | post-Passage direction transfer | Sequence, optional Entrance and condition | at most one rule may apply; startup/restore are not arrivals | ambiguity/reference diagnostics | [Sequence](recipes/sequence.ts) |
| `PerspectiveScaleStop` | depth-scale sample | Scene Space y and positive scale | stops interpolate linearly | perspective diagnostic | [Scene](recipes/first-scene.ts) |
| `SceneDefinition` | declarative Scene | Background, optional size, region and optional structures | size defaults to Logical Resolution; registry key supplies identity | Scene/composition diagnostics | [Scene](recipes/first-scene.ts) |
| `Line` | Character-spoken phrase | text, Character, optional audio and Animation override | speaking role falls back to default | Line/Character/Animation diagnostics | [Command](recipes/command-case.ts) |
| `LineStep` | modal Character speech | line type plus Line fields | waits for advance and audio duration | Line/Character/asset diagnostics | [Sequence](recipes/sequence.ts) |
| `NarrationStep` | narrator prose | narration type and non-empty text | lower warm presentation | Narration diagnostics | [Sequence](recipes/sequence.ts) |
| `OperationsStep` | Sequence state commit | operations type and operation group | commits before continuation | nested/operation diagnostics | [Sequence](recipes/sequence.ts) |
| `ChoiceAlternative` | eligible answer | text, condition, spoken, steps | spoken defaults true | condition/cycle diagnostics | [Sequence](recipes/sequence.ts) |
| `ChoiceStep` | modal answer set | alternatives and fallback | maximum six alternatives | choice-limit diagnostic | [Sequence](recipes/sequence.ts) |
| `BranchStep` | automatic branch | ordered cases and fallback | first eligible case wins | condition/cycle diagnostics | [Sequence](recipes/sequence.ts) |
| `DirectedSubject` | target of transient direction | Character, Object, or current-Scene Scenery | declarative registry identity | subject/reference diagnostics | [Sequence](recipes/sequence.ts) |
| `CueStart` | causal direction start | earlier direction index and Cue name | source must be an earlier Animation | Cue/order diagnostics | [Sequence](recipes/sequence.ts) |
| `AnimationDirection` | explicit transient playback | subject, Animation name and optional Cue start | finite playback blocks; loops need another boundary | Animation/Cue diagnostics | [Sequence](recipes/sequence.ts) |
| `MotionDirection` | transient Scene Space movement | subject, path, optional Character facing or non-Character duration | Character uses navigation; Scenery position remains derived | Motion/subject diagnostics | [Sequence](recipes/sequence.ts) |
| `CameraDirection` | transient framing | cut, move, hold or follow | clamped to owning Scene and returns to Player following | Camera/subject diagnostics | [Sequence](recipes/sequence.ts) |
| `SequenceDirection` | concurrent direction | Animation, Motion, or Camera | starts with its Direction Step or Cue | direction diagnostics | [Sequence](recipes/sequence.ts) |
| `DirectionStep` | concurrent directed beat | directions and optional duration | all finite boundaries or authored duration, whichever is first | finite-boundary diagnostics | [Sequence](recipes/sequence.ts) |
| `SequenceStep` | finite step union | Line, Narration, Choice, Branch, Operations, Direction | nested starts forbidden | Sequence diagnostics | [Sequence](recipes/sequence.ts) |
| `SequenceDefinition` | root modal flow | finite steps, optional owning Scene, skippable and Skip Outcome | directed flows remain in one Scene | cycle/reference/direction diagnostics | [Sequence](recipes/sequence.ts) |
| `GameProject` | declarative project authoring | identity, version, resolution, registries, commands, theme | startup captures an isolated immutable snapshot | aggregated startup diagnostics | [Scene](recipes/first-scene.ts) |
| `NounLabel` | conditional visible name | text and optional condition | one final unconditional label | conditional/text diagnostics | [Interaction](recipes/interaction.ts) |
| `PreferredVerbCase` | conditional contextual action | Verb and optional condition | one final unconditional Verb per declared set | conditional diagnostic | [Interaction](recipes/interaction.ts) |
| `SelectedObjectVerbCase` | Object-first contextual action | Give or Use and optional condition | one final unconditional Verb when declared | conditional diagnostic | [Inventory](recipes/inventory.ts) |
| `CommandResponse` | neutral Command outcome | non-empty explanatory text | never speech or Narration | response diagnostics | [Interaction](recipes/interaction.ts) |
| `CommandCase` | specific resolution | Verb, firstNoun, condition, line/response/sequence, operations | one textual outcome; arity is fixed | outcome/arity/reference diagnostics | [Command](recipes/command-case.ts) |
| `CommandFallback` | local final resolution | response, operations, sequence | used after specific cases | response/reference diagnostics | [Interaction](recipes/interaction.ts) |
| `NounDefinition` | common interaction model | labels, Preferred, Secondary and Selected Object Verbs, cases, fallbacks | secondary/object sets optional; immutable | Noun/Command diagnostics | [Interaction](recipes/interaction.ts) |
| `CommandLexicon` | localized Command and Inventory-action grammar | nine Verb labels, select/deselect phrases and three Command patterns | Engine never infers grammar | lexicon diagnostics | [Scene](recipes/first-scene.ts) |
| `CommandVerb` | semantic Verb union | nine commandVerbs values | fixed Engine vocabulary | compile-time restriction | [Interaction](recipes/interaction.ts) |
| `Verb` | complete Verb union | CommandVerb or walk-to | walk-to is implicit | compile-time restriction | [Scene](recipes/first-scene.ts) |
| `PassageDirection` | Passage cursor direction | left, right, up, down, enter | every Passage declares one | cursor/reference diagnostics | [Scene](recipes/first-scene.ts) |
| `HUDTheme` | project visual language | font, colours, opacity, width, cursors, speech colours | complete local asset set | theme/asset diagnostics | [HUD Theme](recipes/hud-theme.ts) |
| `AuthoringDiagnosticFamily` | rejecting layer | six stable category strings | category is always present | no independent failure | [Scene](recipes/first-scene.ts) |
| `AuthoringDiagnosticOwner` | rule owner | ten capabilities or browser adapter | owner is always present | no independent failure | [Scene](recipes/first-scene.ts) |
| `AuthoringDiagnostic` | one author-facing issue | code, family, owner, path, message, suggestion, cause | stable code/path ordering | describes owning failure | [Scene](recipes/first-scene.ts) |
| `AuthoringError` | aggregate failure | read-only diagnostics | one error per startup layer | thrown by startup | [Scene](recipes/first-scene.ts) |
| `SaveSnapshot` | JSON-safe committed state | format, project identities and state | exact fields only | save validation diagnostics | [Save](recipes/save-snapshot.ts) |
| `StartGameOptions` | browser mount options | target, optional snapshot and Dialogue Provider | omitted snapshot starts fresh; configured dialogue requires its adapter | environment/save/dialogue diagnostics | [Save](recipes/save-snapshot.ts) |
| `GameSession` | running lifecycle handle | save, status, diagnostics, stop | stop idempotent and terminal | lifecycle diagnostics | [Save](recipes/save-snapshot.ts) |

Exact reachable fields also include `x`, `y`, `width`, `height`, `kind`,
`image`, `visualAnchor`, `frames`, `side`, `front`, `back`, `framesPerSecond`,
`count`, `loop`, `cues`, `animations`, `roles`, `default`, `speaking`, `walking`,
`area`, `facing`, `font`, `initialScene`, `initialGroundPoint`, `initialFacing`,
`initialAppearance`, `appearances`, `movementSpeed`, `noun`, `source`, `family`,
`colors`, `text`, `preferred`, `selected`, `backing`, `border`, `inventoryWell`,
`opacity`, `maxSpeechWidth`, `cursors`, `speechColors`, `equals`, `hasObject`,
`type`, `variable`, `value`, `target`, `character`, `object`, `scenery`, `scene`,
`appearance`, `sequence`, `groundPoint`, `baseline`, `position`, `approach`,
`when`, `direction`, `destination`, `entrance`, `scale`, `background`, `size`,
`walkableRegion`, `perspectiveScale`, `hotspots`, `entrances`, `passages`,
`arrivalSequences`, `alternatives`, `fallback`, `steps`, `cases`, `skippable`,
`skipOutcome`, `subject`, `animation`, `animationStartedTick`, `startAfter`, `cue`, `duration`, `mode`,
`point`, `from`, `to`, `directions`,
`identity`, `version`,
`logicalResolution`, `scenes`, `narrativeFacts`, `proposition`, `characters`,
`dialogue`, `knowledge`, `factId`, `disclosure`, `level`, `characterKnowledge`,
`id`, `playerInput`, `speaker`, `listener`, `candidates`, `fact`, `interpretations`,
`verbalizations`, `dialogueProvider`,
`playerCharacter`, `objects`,
`sequences`, `variables`, `inventoryAppearanceSize`, `initialScene`,
`letterboxColor`, `commandLexicon`, `commandFallbacks`, `hudTheme`, `verb`,
`line`, `audio`, `firstNoun`, `response`, `operations`, `fallbacks`,
`labels`, `preferredVerbs`, `verbs`, `patterns`, `unary`, `give`, `use`, `code`,
`path`, `message`, `suggestion`, `cause`, `formatVersion`, `projectIdentity`,
`projectVersion`, `state`, `ok`, `snapshot`, `diagnostics`, and `target`.

## Stable diagnostics

Definition codes: `definition.approach.bounds`,
`definition.approach.walkable`, `definition.character.movement-speed`,
`definition.character.walkable`, `definition.choice.limit`,
`definition.choice.player-character`,
`definition.command-case.arity`, `definition.command-case.empty`,
`definition.command-case.object-feedback`,
`definition.command-case.textual-outcome`,
`definition.command-lexicon.label`, `definition.command-lexicon.pattern`,
`definition.command-lexicon.required`, `definition.command-response.text`,
`definition.command-response.semantic`, `definition.line.character`,
`definition.hotspot.target-noun.required`,
`definition.line.text`, `definition.narration.text`,
`definition.command.silent`, `definition.conditional-fallback`,
`definition.entrance.walkable`, `definition.hud-theme.color`,
`definition.hud-theme.cursor`, `definition.hud-theme.font`,
`definition.hud-theme.opacity`, `definition.hud-theme.speech-color`,
`definition.hud-theme.speech-width`, `definition.inventory-appearance-size`,
`definition.logical-resolution.positive-integer`,
`definition.scene-size.positive-integer`,
`definition.scene-size.viewport-minimum`,
`definition.noun-label.text`, `definition.operation.collect-target`,
`definition.operation.ground-point`, `definition.perspective-scale.stop`,
`definition.point.finite`, `definition.polygon.degenerate`,
`definition.polygon.self-intersection`, `definition.polygon.vertices`,
`definition.project.identity`, `definition.project.version`,
`definition.narrative-fact.identity`,
`definition.narrative-fact.proposition`,
`definition.character-knowledge.duplicate`,
`definition.character-knowledge.disclosure`,
`definition.scene-space.bounds`, `definition.scenery.baseline`,
`definition.sequence.cycle`, `definition.sequence.nested`,
`definition.sequence.skip-outcome`, `definition.sequence.skip-outcome.unused`,
`definition.sequence.selected-object-operation`,
`definition.sequence.direction.empty`, `definition.sequence.duration`,
`definition.sequence.cue-order`, `definition.sequence.cue-source`,
`definition.sequence.cue-name`,
`definition.sequence.direction.unbounded`, `definition.motion.path`,
`definition.motion.character-path`, `definition.motion.character-duration`,
`definition.motion.duration`, `definition.motion.bounds`,
`definition.motion.walkable`, `definition.camera.duration`,
`definition.camera.point.finite`, `definition.camera.bounds`,
`definition.arrival-sequence.ambiguous`,
`definition.appearance.animations`, `definition.appearance.default-role`,
`definition.motion.scenery-rest`, `definition.animation.frames`,
`definition.animation.directional-frame-count`,
`definition.animation.frame-source`, `definition.animation.frames-per-second`,
`definition.animation.loop`, `definition.animation.cue`, and
`definition.animation.visual-anchor`.

Reference codes: `reference.appearance`, `reference.appearance.initial`,
`reference.appearance.target`, `reference.character`,
`reference.character.initial-scene`, `reference.character.player`,
`reference.hotspot.target`, `reference.object`, `reference.object.initial-scene`,
`reference.passage.entrance`, `reference.passage.scene`,
`reference.scene`, `reference.scene.initial`, `reference.sequence`,
`reference.sequence.scene`, `reference.sequence.subject`, `reference.entrance`,
`reference.sequence.subject-scene`,
`reference.animation`, `reference.animation.role`,
`reference.animation.walking-role`, `reference.animation.cue`,
`reference.animation.line`, `reference.camera.subject`,
`reference.camera.subject-scene`, and `reference.variable`.
Knowledge-Driven Dialogue references use
`reference.character-knowledge.character` and
`reference.character-knowledge.fact`, plus `reference.relationship.character`
and `reference.relationship.missing` for directional Relationship edges.

Knowledge-Driven Dialogue definition and operation codes include
`definition.character-knowledge.collection`,
`definition.character-knowledge.item`,
`definition.character-knowledge.disclosure`,
`definition.relationship.collection`, `definition.relationship.trust`,
`definition.dialogue.profile`, `definition.dialogue.biography`,
`definition.dialogue.personality`, `definition.dialogue.behavior`,
`definition.dialogue.voice`, `definition.dialogue.state`, and
`reference.dialogue-operation.character`.

Runtime, save, asset and environment codes: `state.operation.invalid`,
`save.shape`, `save.fields.unexpected`, `save.format.version`,
`save.project.identity`, `save.project.version`, `save.state.command`,
`save.state.command-noun`, `save.state.intent-command`,
`save.state.intent-command-noun`, `save.state.invalid`,
`save.validation.project`, `save.validation.required`, `asset.load.failed`,
`asset.audio.load.failed`,
`asset.background.dimensions`,
`asset.cursor.dimensions`, `asset.font.load.failed`,
`asset.inventory-appearance.dimensions`, `asset.animation-strip.frames`,
`asset.animation-strip.dimensions`, `asset.visual-anchor.bounds`,
`environment.dialogue-provider.missing`, `environment.start.failed`,
`environment.target.occupied`, and
`environment.webgl.unavailable`.

See the [quick start](quick-start.md), [Game Project authoring guide](game-authoring.md),
[Support Baseline](support-baseline.md), and compiled [recipes](recipes/README.md).
