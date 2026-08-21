# Contract index

One row per exported structure: what it is for, which values it allows, the
defaults and invariants that hold, the diagnostics that reject it, and a
compiled example that uses it.

This is a lookup table, not a guide. To learn how to build something, read the
[authoring guides](README.md#build-a-game); come here when you already know
what you are doing and need the exact allowed value.

Every public symbol is imported from `fondale`; deep imports are not supported.
The one other entry point is `fondale/testing`, which a shipped game never
imports. This is the normative Fondale 0.4 alpha contract. The npm package
version is `0.4.0`; it is independent from an Author's Project Version and from
Fondale's Save Snapshot format version.

| Structure | Purpose | Allowed values | Defaults and invariants | Errors | Executed example |
| --- | --- | --- | --- | --- | --- |
| `Point` | Scene/image coordinate | finite numeric x and y | field-specific coordinate space | finite and bounds diagnostics | [Scene](recipes/world.ts) |
| `LogicalResolution` | fixed viewport dimensions | positive integer width and height | shared by output canvas and HUD | positive-integer diagnostic | [Scene](recipes/world.ts) |
| `SceneSize` | complete Scene Space extent | positive integer width and height | omission defaults to Logical Resolution; neither axis may be smaller | Scene-size diagnostics | [Scene](recipes/world.ts) |
| `Facing` | authored orientation | front, back, left, right | required where present | type and reference validation | [Character](recipes/characters.ts) |
| `AnimationFrame` | ordered sheet cell | integer x, y, width, and height in image pixels | top-left origin; `uniformGrid` generates regular row-major cells | frame and asset diagnostics | [Character](recipes/characters.ts) |
| `AnimationSheet` | coordinate-based frame source | one Runtime Asset image and ordered frames | a static Animation has one frame | frame and asset diagnostics | [Sequence](recipes/sequences.ts) |
| `CharacterAnimationSheets` | Character Animation presentations | left, right, front, and back sheets | all four share frame count and Runtime cell dimensions | Facing, frame, and asset diagnostics | [Character](recipes/characters.ts) |
| `AnimationTiming` | Animation traversal | positive frames per second, optional loop and named Cues | loop defaults false; Cues use logical seconds | Animation/Cue diagnostics | [Sequence](recipes/sequences.ts) |
| `AnimationDefinition` | transient visual performance | one sheet and timing | artwork and traversal are authored separately | Animation/Cue diagnostics | [Sequence](recipes/sequences.ts) |
| `CharacterAnimationDefinition` | transient Character performance | four synchronized Facing sheets and timing | timing and Cues are shared across Facing | Animation/Cue diagnostics | [Character](recipes/characters.ts) |
| `AnimationRoles` | semantic Engine selections | default, optional speaking and walking names | default is required; speaking falls back to default | missing Animation diagnostics | [Character](recipes/characters.ts) |
| `Appearance` | persistent non-directional visual condition | named Animations, roles, optional anchor | registry key identifies selected condition | Animation, role, asset, and anchor diagnostics | [Interaction](recipes/world.ts) |
| `CharacterAppearance` | persistent Character visual condition | named four-Facing Animations, roles, optional anchor | every Animation is directionally complete | Appearance and Facing diagnostics | [Character](recipes/characters.ts) |
| `EntityAppearance` | Object visual condition | definitive animated Appearance | retains the non-directional contract | Appearance diagnostics | [Interaction](recipes/world.ts) |
| `SceneryAppearance` | Scenery visual condition | animated Appearance or Background Region | Background Regions remain tied to their Scene | Appearance/polygon diagnostics | [Scene](recipes/world.ts) |
| `BackgroundRegionAppearance` | Background cut-out | background-region and polygon | belongs to owning Background | polygon and bounds diagnostics | [Scene](recipes/world.ts) |
| `CharacterDefinition` | persistent Character | initial values, appearances, speed, noun, dialogue | initial point is walkable | Character/reference diagnostics | [Character](recipes/characters.ts) |
| `NarrativeFactDefinition` | canonical authored truth | non-empty proposition | registry key is stable identity | Narrative Fact definition diagnostics | [Dialogue](authoring/dialogue.md) |
| `ClaimDefinition` | authored non-canonical proposition | non-empty proposition | registry key is stable identity; never enters Character Knowledge | Claim definition diagnostics | [Dialogue](authoring/dialogue.md) |
| `QualitativeLevel` | shared qualitative scale | low, medium, high | no numeric simulation | compile-time restriction and capability validation | [Dialogue](authoring/dialogue.md) |
| `Trust` | directional Relationship confidence | qualitative level | changes only through authored operations | Relationship diagnostics | [Dialogue](authoring/dialogue.md) |
| `DialogueVariableCondition` | boolean authored unlock | variable identity and expected value | reads committed Game Variables only | variable-reference diagnostics | [Dialogue](authoring/dialogue.md) |
| `DialogueTrustCondition` | guarded minimum confidence | qualitative Trust threshold | reads source-to-listener Relationship | Relationship diagnostics | [Dialogue](authoring/dialogue.md) |
| `OpenDisclosure` | unrestricted Disclosure | open level | eligible whenever relevant | capability validation | [Dialogue](authoring/dialogue.md) |
| `GuardedDisclosure` | conditional Disclosure | Trust minimum or boolean Game Variable | condition is Character-specific | condition/reference diagnostics | [Dialogue](authoring/dialogue.md) |
| `SecretDisclosure` | explicitly unlocked Disclosure | boolean Game Variable condition | Trust alone never unlocks it | condition/reference diagnostics | [Dialogue](authoring/dialogue.md) |
| `Disclosure` | Character-specific communication policy | open, guarded, or secret | secret requires a Game Variable unlock | capability-owned definition/reference diagnostics | [Dialogue](authoring/dialogue.md) |
| `PersonalityDefinition` | qualitative portrayal traits | four qualitative traits | cannot authorise facts or state changes | profile diagnostics | [Dialogue](authoring/dialogue.md) |
| `DialogueBehaviorDefinition` | deterministic withholding preference | withhold, evade, or refuse | cannot override Disclosure | profile diagnostics | [Dialogue](authoring/dialogue.md) |
| `VoiceDefinition` | qualitative phrasing profile | verbosity, tone, vocabulary | cannot change authorised content | profile diagnostics | [Dialogue](authoring/dialogue.md) |
| `DialogueState` | optional qualitative current condition | calm, afraid, angry, drunk | changed only by authored operation | state diagnostics | [Dialogue](authoring/dialogue.md) |
| `RelationshipDefinition` | initial directional social state | qualitative Trust | source and target identities remain distinct | Character/Trust diagnostics | [Dialogue](authoring/dialogue.md) |
| `CharacterKnowledgeDefinition` | initial known fact reference | factId and Disclosure | one reference per Character and fact | knowledge reference/duplicate diagnostics | [Dialogue](authoring/dialogue.md) |
| `CoverStoryDefinition` | controlled false account | concealed fact and Claim identities | fact must be guarded/secret and known by the Character | Cover Story definition/reference diagnostics | [Dialogue](authoring/dialogue.md) |
| `ConversationHandoffDefinition` | authored transition from Conversation to Sequence | condition, Sequence identity, close or resume outcome | evaluates committed Game State; generated wording has no authority | condition/Sequence/profile diagnostics | [Dialogue](authoring/dialogue.md) |
| `ConversationAlternativeDefinition` | authored question offered inside a Conversation | displayed phrase, optional condition, `spoken` and `once` flags, exact `response` and/or a named `sequence` with a close or resume outcome, optional Game Operations | reaches no Dialogue Provider; at most six eligible at once; ineligible ones are hidden; repeatable unless `once` | alternative definition/condition/Sequence/limit diagnostics | [Dialogue](authoring/dialogue.md) |
| `CharacterDialogueDefinition` | optional Character dialogue profile | knowledge, Cover Stories, Relationships, handoffs, authored alternatives, qualitative portrayal and state | omission preserves authored behaviour | dialogue capability diagnostics | [Dialogue](authoring/dialogue.md) |
| `LearnNarrativeFactOperation` | monotonic Character Knowledge change | Character and Narrative Fact identities | repeated learning is idempotent | Character/fact reference diagnostics | [Dialogue](authoring/dialogue.md) |
| `ConsumeConversationAlternativeOperation` | withdraw one authored alternative | Character identity and authored alternative index | the index must exist for that Character; repeated consumption is idempotent | Character/alternative reference diagnostics | [Dialogue](authoring/dialogue.md) |
| `RecordTestimonyOperation` | remember a communicated Claim | speaker, listener, concealed fact and Claim identities | must match the speaker's authored Cover Story; repeated testimony is idempotent | Character/Claim/Cover Story reference diagnostics | [Dialogue](authoring/dialogue.md) |
| `SetTrustOperation` | directional Relationship change | source, target and qualitative Trust | only a declared Relationship edge may change | Character/Relationship diagnostics | [Dialogue](authoring/dialogue.md) |
| `SetDialogueStateOperation` | qualitative Dialogue State change | Character and state or null | only authored operations change canonical state | Character/state diagnostics | [Dialogue](authoring/dialogue.md) |
| `DialogueGameOperation` | Dialogue-owned canonical transition | learn fact, record Testimony, set Trust, set Dialogue State | participates in an atomic operation batch | operation/reference diagnostics | [Dialogue](authoring/dialogue.md) |
| `DialogueFactCandidate` | known fact eligible for interpretation | stable id and canonical proposition | Disclosure is applied after interpretation | unknown selections are rejected | [Dialogue](authoring/dialogue.md) |
| `DialogueClaimCandidate` | authorised Cover Story content | stable id and non-canonical proposition | sent only when policy selects its concealed fact's Cover Story | undeclared Claims never reach verbalisation | [Dialogue](authoring/dialogue.md) |
| `DialogueInterpretationRequest` | untrusted speech interpretation input | Narrative Context, playerInput, speaker, listener, candidates | candidates are frozen and capability-authorised | provider failure rejects the turn | [Dialogue](authoring/dialogue.md) |
| `DialogueInterpretation` | provider-selected semantic reference | declared factId, or null with an unresolved reason | ambiguity clarifies; no relevant fact withholds | unknown fact ID or reason rejects before verbalization | [Dialogue](authoring/dialogue.md) |
| `ResponseStrategy` | Engine-authorised conversational approach | answer, cover-story, withhold, evade, refuse, clarify | selected deterministically before verbalisation | invalid provider output rejects the turn | [Dialogue](authoring/dialogue.md) |
| `DialoguePortrayalProfile` | provider-visible qualitative portrayal | optional biography, Personality, Voice and Dialogue State | carries no semantic authority | validated at startup | [Dialogue](authoring/dialogue.md) |
| `DialogueVerbalizationRequest` | authorised expression input | Narrative Context, speech identities, strategy, portrayal and optional fact or Claim | a concealed fact is absent when its Cover Story Claim is present | empty response rejects the turn | [Dialogue](authoring/dialogue.md) |
| `DialogueTurnContext` | transient provider-call lifecycle | turn ID and AbortSignal | shared by Conversation phases or supplied to Reflection; never saved | lifecycle invalidation aborts the signal and ignores late results | [Dialogue](authoring/dialogue.md) |
| `ReflectionRequest` | authorised Player Character reflection context | Narrative Context, input, Character, known facts, attributed Testimony and directional Relationships | excludes hidden truth and every other Character's knowledge | provider failure rejects only the Reflection turn | [Dialogue](authoring/dialogue.md) |
| `ReflectionResponse` | non-canonical generated reflection | supported summary, optional Hypotheses and suggestions | Hypotheses and suggestions are labelled uncertain/possible and never saved | malformed or empty output rejects the turn | [Dialogue](authoring/dialogue.md) |
| `ReflectionTestimony` | provider-visible remembered Claim | speaker and declared Claim | preserves attribution without asserting truth | derived only from committed Testimony | [Dialogue](authoring/dialogue.md) |
| `ReflectionRelationship` | provider-visible directional Trust | `towards` Character and qualitative Trust | includes only the reflecting Character's outgoing Relationship | derived only from committed Relationship state | [Dialogue](authoring/dialogue.md) |
| `Testimony` | canonical memory of a communicated Claim | speaker, listener and Claim ID | set-like and idempotent; stores no wording or truth | Save state validation | [Dialogue](authoring/dialogue.md) |
| `DialogueProvider` | generated-dialogue adapter seam | interpret, verbalize, reflect, reset | ordinarily selected through a Dialogue Server URL; low-level injection remains available; Continue retains its memory identity | missing connection is a startup diagnostic | [Dialogue](authoring/dialogue.md) |
| `HttpDialogueProvider` | low-level browser-to-server Dialogue Provider adapter | endpoint and Game Session identity | advanced hosts only; follows turn cancellation and sends no server credentials | malformed or failed HTTP responses reject the turn | [Dialogue](authoring/dialogue.md) |
| `DialogueHttpRequest` | browser transport request | interpret, verbalize, reflect, cancel or reset | every turn operation carries session and transient turn identity | server rejects an invalid envelope | [Dialogue](authoring/dialogue.md) |
| `DialogueHttpResponse` | browser transport response | success value or public failure message | server failure details remain private | malformed responses reject the turn | [Dialogue](authoring/dialogue.md) |
| `FakeDialogueProvider` | deterministic Dialogue Provider adapter | interpretation, verbalization, reflection, pending/failure controls, thread keys and reset count | no external dependency, timing assumption or generated authority | missing configured mapping rejects the turn | [Dialogue](authoring/dialogue.md) |
| `FakeDialoguePendingOutcome` | deterministic suspended fake response | pending discriminator, eventual value and optional cancellation behavior | released explicitly by transient turn ID | ordinary cancellation rejects unless the test requests a late result | [Dialogue](authoring/dialogue.md) |
| `FakeDialogueFailureOutcome` | deterministic fake rejection | failure discriminator and message | rejects one configured provider phase | leaves canonical state unchanged | [Dialogue](authoring/dialogue.md) |
| `ObjectDefinition` | persistent Object | initial values, appearances, Inventory PNG, noun | begins in one Scene | Object/asset diagnostics | [Inventory](recipes/lantern.ts) |
| `InteractionCondition` | state predicate | variable equality or held Object | omission is unconditional | missing-reference diagnostics | [Command](recipes/commands.ts) |
| `InventoryOperation` | Inventory and Object lifecycle change | collect target, give named, place selected, place named, consume selected | World owns placement validity; Animation owns Appearance validity | Interaction/World/Animation diagnostics | [Inventory](recipes/lantern.ts) |
| `GameOperation` | atomic state change | declared operation variants | order matters; group atomic | operation/reference diagnostics | [Inventory](recipes/lantern.ts) |
| `HotspotTarget` | interaction subject | Background, Character, Object, Scenery | target is required | target reference diagnostic | [Interaction](recipes/world.ts) |
| `ApproachPoint` | interaction destination | groundPoint and facing | must be walkable and HUD-safe | approach diagnostics | [Interaction](recipes/world.ts) |
| `HotspotDefinition` | Scene interaction surface | target, area, approach, condition; local noun only for Background | target kind discriminates Noun ownership; later overlap wins hit-test | geometry, target and owner-Noun diagnostics | [Interaction](recipes/world.ts) |
| `DetailViewHotspotDefinition` | Detail View interaction surface | area, local noun, condition | no Approach Point; Logical Resolution coordinates; later overlap wins hit-test | geometry, bounds and Noun diagnostics | [Detail View](authoring/detail-view.md) |
| `DetailViewDefinition` | declarative image presented in place of the world | image and ordered Hotspots | one presented at a time; presenting another replaces it; no Scene Space, Character or approach | image, geometry and reference diagnostics | [Detail View](authoring/detail-view.md) |
| `SceneryDefinition` | depth-sorted visual | baseline, appearances, position, noun | initial Appearance required | Scenery diagnostics | [Scene](recipes/world.ts) |
| `SceneEntrance` | named arrival | Ground Point and Facing | point must be walkable | entrance diagnostics | [Scene](recipes/world.ts) |
| `ScenePassage` | directional transition | area, approach, noun, direction, destination | transition is atomic | passage diagnostics | [Scene](recipes/world.ts) |
| `SceneOpeningCase` | how a Scene reacts to its own Scene Opening | optional condition and Entrance, at most one outcome, optional operations | read from the top, first eligible case applies; an Entrance filters to that door; restoration is never an opening | outcome/reference diagnostics | [Scene](recipes/world.ts) |
| `PerspectiveScaleStop` | depth-scale sample | Scene Space y and positive scale | stops interpolate linearly | perspective diagnostic | [Scene](recipes/world.ts) |
| `SceneDefinition` | declarative Scene | Background, optional size, region and optional structures | size defaults to Logical Resolution; registry key supplies identity | Scene/composition diagnostics | [Scene](recipes/world.ts) |
| `Line` | Character-spoken phrase | text, Character, optional audio and Animation override | speaking role falls back to default | Line/Character/Animation diagnostics | [Command](recipes/commands.ts) |
| `LineStep` | modal Character speech | line type plus Line fields | waits for advance and audio duration | Line/Character/asset diagnostics | [Sequence](recipes/sequences.ts) |
| `NarrationStep` | narrator prose | narration type and non-empty text | lower warm presentation | Narration diagnostics | [Sequence](recipes/sequences.ts) |
| `OperationsStep` | Sequence state commit | operations type and operation group | commits before continuation | nested/operation diagnostics | [Sequence](recipes/sequences.ts) |
| `ChoiceAlternative` | eligible answer | text, condition, spoken, steps | spoken defaults true | condition/cycle diagnostics | [Sequence](recipes/sequences.ts) |
| `ChoiceStep` | modal answer set | alternatives and fallback | maximum six alternatives | choice-limit diagnostic | [Sequence](recipes/sequences.ts) |
| `BranchStep` | automatic branch | ordered cases and fallback | first eligible case wins | condition/cycle diagnostics | [Sequence](recipes/sequences.ts) |
| `DirectedSubject` | target of transient direction | Character, Object, or current-Scene Scenery | declarative registry identity | subject/reference diagnostics | [Sequence](recipes/sequences.ts) |
| `CueStart` | causal direction start | earlier direction index and Cue name | source must be an earlier Animation | Cue/order diagnostics | [Sequence](recipes/sequences.ts) |
| `AnimationDirection` | explicit transient playback | subject, Animation name and optional Cue start | finite playback blocks; loops need another boundary | Animation/Cue diagnostics | [Sequence](recipes/sequences.ts) |
| `MotionDirection` | transient Scene Space movement | subject, path, optional Character facing or non-Character duration | Character uses navigation; Scenery position remains derived | Motion/subject diagnostics | [Sequence](recipes/sequences.ts) |
| `CameraDirection` | transient framing | cut, move, hold or follow | clamped to owning Scene and returns to Player following | Camera/subject diagnostics | [Sequence](recipes/sequences.ts) |
| `SequenceDirection` | concurrent direction | Animation, Motion, or Camera | starts with its Direction Step or Cue | direction diagnostics | [Sequence](recipes/sequences.ts) |
| `DirectionStep` | concurrent directed beat | directions and optional duration | all finite boundaries or authored duration, whichever is first | finite-boundary diagnostics | [Sequence](recipes/sequences.ts) |
| `SequenceStep` | finite step union | Line, Narration, Choice, Branch, Operations, Direction | nested starts forbidden | Sequence diagnostics | [Sequence](recipes/sequences.ts) |
| `SequenceDefinition` | root modal flow | finite steps, optional owning Scene, skippable and Skip Outcome | directed flows remain in one Scene | cycle/reference/direction diagnostics | [Sequence](recipes/sequences.ts) |
| `GameProject` | declarative project authoring | identity, version, resolution, registries, commands, theme, and Narrative Context when dialogue is used | startup captures an isolated immutable snapshot | aggregated startup diagnostics | [Scene](recipes/world.ts) |
| `NounLabel` | conditional visible name | text and optional condition | one final unconditional label | conditional/text diagnostics | [Interaction](recipes/world.ts) |
| `PreferredVerbCase` | conditional contextual action | Verb and optional condition | one final unconditional Verb per declared set | conditional diagnostic | [Interaction](recipes/world.ts) |
| `SelectedObjectVerbCase` | Object-first contextual action | Give or Use and optional condition | one final unconditional Verb when declared | conditional diagnostic | [Inventory](recipes/lantern.ts) |
| `CommandResponse` | neutral Command outcome | non-empty explanatory text | never speech or Narration | response diagnostics | [Interaction](recipes/world.ts) |
| `CommandCase` | one ordered resolution of a Command | Verb, firstNoun, condition, line/response/sequence, operations | one textual outcome; arity is fixed; a Verb's case with no first Noun and no condition comes last and is its default | outcome/arity/order/reference diagnostics | [Command](recipes/commands.ts) |
| `NounDefinition` | common interaction model | labels, Preferred, Secondary and Selected Object Verbs, cases | secondary/object sets optional; immutable; every Verb answered by an unconditional case or a global Command Fallback | Noun/Command diagnostics | [Interaction](recipes/world.ts) |
| `CommandLexicon` | localized Command and Inventory-action grammar | nine Verb labels, select/deselect phrases and three Command patterns | Engine never infers grammar | lexicon diagnostics | [Scene](recipes/world.ts) |
| `CommandVerb` | semantic Verb union | nine commandVerbs values | fixed Engine vocabulary | compile-time restriction | [Interaction](recipes/world.ts) |
| `Verb` | complete Verb union | CommandVerb or walk-to | walk-to is implicit | compile-time restriction | [Scene](recipes/world.ts) |
| `PassageDirection` | Passage cursor direction | left, right, up, down, enter | every Passage declares one | cursor/reference diagnostics | [Scene](recipes/world.ts) |
| `HUDTheme` | project visual language | font, colours, opacity, width, cursors, speech colours | complete local asset set | theme/asset diagnostics | [HUD](recipes/commands.ts) |
| `AuthoringDiagnosticFamily` | rejecting layer | six stable category strings | category is always present | no independent failure | [Scene](recipes/world.ts) |
| `AuthoringDiagnosticOwner` | rule owner | eleven capabilities or browser adapter | owner is always present | no independent failure | [Scene](recipes/world.ts) |
| `AuthoringDiagnostic` | one author-facing issue | code, family, owner, path, message, suggestion, cause | stable code/path ordering | describes owning failure | [Scene](recipes/world.ts) |
| `AuthoringError` | aggregate failure | read-only diagnostics | one error per startup layer | thrown by startup | [Scene](recipes/world.ts) |
| `SaveSnapshot` | JSON-safe committed state | format, project identities and state | exact fields only | save validation diagnostics | [Save](recipes/save.ts) |
| `StartGameOptions` | browser mount options | target, optional snapshot, ordinary Dialogue Server URL or low-level Dialogue Provider | configured dialogue requires exactly one connection form; ordinary omitted-snapshot startup uses Continue or New Game | environment/save/dialogue diagnostics | [Save](recipes/save.ts) |
| `GameSession` | running lifecycle handle | save, start Reflection, status, diagnostics, stop | Reflection starts only while idle; stop is idempotent and terminal | lifecycle diagnostics | [Save](recipes/save.ts) |

Exact reachable fields also include `x`, `y`, `width`, `height`, `kind`,
`image`, `visualAnchor`, `sheet`, `sheets`, `timing`, `frames`, `left`, `right`, `front`, `back`,
`framesPerSecond`, `loop`, `cues`, `animations`, `roles`, `default`, `speaking`, `walking`,
`area`, `facing`, `font`, `initialScene`, `initialGroundPoint`, `initialFacing`,
`initialAppearance`, `appearances`, `movementSpeed`, `noun`, `source`, `family`,
`colors`, `text`, `preferred`, `selected`, `backing`, `border`, `inventoryWell`,
`opacity`, `maxSpeechWidth`, `cursors`, `speechColors`, `equals`, `hasObject`,
`type`, `variable`, `value`, `target`, `character`, `object`, `scenery`, `scene`,
`appearance`, `sequence`, `groundPoint`, `baseline`, `position`, `approach`,
`when`, `direction`, `destination`, `entrance`, `scale`, `background`, `size`,
`walkableRegion`, `perspectiveScale`, `hotspots`, `entrances`, `passages`,
`alternatives`, `fallback`, `steps`, `cases`, `skippable`,
`skipOutcome`, `subject`, `animation`, `animationStartedTick`, `startAfter`, `cue`, `duration`, `mode`,
`point`, `from`, `to`, `directions`,
`identity`, `version`,
`logicalResolution`, `scenes`, `narrativeContext`, `narrativeFacts`, `claims`, `proposition`, `characters`,
`dialogue`, `knowledge`, `factId`, `disclosure`, `level`, `characterKnowledge`,
`coverStories`, `concealsFactId`, `claimId`, `testimonies`,
`id`, `playerInput`, `speaker`, `listener`, `candidates`, `fact`, `claim`, `interpretations`,
`verbalizations`, `dialogueServerUrl`, `dialogueProvider`,
`playerCharacter`, `objects`,
`sequences`, `variables`, `inventoryAppearanceSize`, `initialScene`,
`letterboxColor`, `commandLexicon`, `commandFallbacks`, `hudTheme`, `verb`,
`line`, `audio`, `firstNoun`, `response`, `operations`,
`labels`, `preferredVerbs`, `verbs`, `patterns`, `unary`, `give`, `use`, `code`,
`path`, `message`, `suggestion`, `cause`, `formatVersion`, `projectIdentity`,
`projectVersion`, `state`, `ok`, `snapshot`, `diagnostics`, and `target`.

## See also

[Documentation index](README.md) · [Vocabulary](vocabulary.md) ·
[Diagnostics](diagnostics.md) · [Dialogue Provider protocol](dialogue-provider.md) ·
[What the Player gets](player-experience.md) · [Recipes](recipes/README.md)
