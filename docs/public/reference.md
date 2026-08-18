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

`DetailViewDefinition` describes one Detail View presented in place of the
world: an `image` that must match the Logical Resolution exactly, and ordered
`hotspots`. A
`DetailViewHotspotDefinition` requires a polygon `area` in Logical Resolution
coordinates, its own local `noun`, and an optional `when`; it accepts no
Approach Point, and a Detail View accepts no Baseline, Perspective Scale or
Walkable Region, because nothing walks inside one. Registry keys of the
optional `detailViews` registry are identities. A `present-detail-view`
Game Operation names one of them and a `dismiss-detail-view` Game Operation
returns the Player to the world; both may come from a Command Case, a Sequence
or any other authored operation group. At most one Detail View is presented at
a time, so presenting another replaces it rather than stacking. While one is
presented the Engine draws it instead of the Scene and draws no Character, its
Hotspots advertise their phrases exactly as Scene Hotspots do, a Command
against one resolves immediately with no movement stage, and the Inventory
remains reachable. The presented Detail View is committed Game State recorded
as `detailView` in the Save Snapshot; the Player Character keeps its Scene,
Ground Point and Facing throughout, and dismissal returns the world unchanged.

`CharacterDefinition` describes a persistent Character with initial Scene, Ground
Point, Facing, Appearance, positive `movementSpeed`, optional Noun, optional
`CharacterDialogueDefinition`, and named Appearances. Every Appearance owns named Animations and a required default
Animation Role. Every Character Animation owns synchronized `left`, `right`,
`front`, and `back` strips. The Engine selects the strip matching Facing and
never mirrors authored pixels. The Player Character also requires a walking Role.

`NarrativeFactDefinition` is a non-empty canonical `proposition` identified by
its `narrativeFacts` registry key, with an optional `setsVariable` naming a
declared Game Variable. When a Character learns that Narrative Fact the Engine
sets the variable to `true` in the same commit as the learning: either both
commit together or neither does. The variable is set only after Disclosure has
authorised the Fact and before any verbalisation is spoken, so a Fact answered
with a Cover Story, withheld, or belonging to a failed or cancelled Dialogue
Turn leaves it untouched. The result is an ordinary Game Variable that
Interaction Conditions, Hotspots, Passages, Sequences and alternative
eligibility read with no special casing. `ClaimDefinition` is a non-canonical,
non-empty `proposition` identified independently by its `claims` registry key.
A `CharacterDialogueDefinition` contains the
Character's initial Character Knowledge, directional Relationships and optional
qualitative Dialogue State, portrayal profile and Conversation handoffs. A
`ConversationHandoffDefinition` names an authored condition, one Sequence and
an explicit `close` or `resume` result. A Conversation presents its authored
`alternatives` and its free-form input field together, for its whole duration.
Each `ConversationAlternativeDefinition` declares its displayed `text`, an
optional eligibility condition, an optional `spoken` flag (default true), the
exact `response` the Character gives, and optional `operations` committed
atomically with the selection. An alternative may instead — or additionally —
name a `sequence` with an explicit `close` or `resume` outcome: that Sequence
becomes the dominant Game Activity, with its own Lines, Choices, timing, skip
behaviour and direction, and the free-form input field is not presented while
it plays. A resumed Conversation re-evaluates alternative eligibility against
the Game State the Sequence left behind. Eligibility is evaluated against the
latest committed Game State; ineligible alternatives are hidden rather than
presented as unavailable, and at most six may be eligible at once. Selecting
one produces the authored wording without reaching a Dialogue Provider. An
alternative declaring `once` is consumed by the selection that asks it and is
never presented again; every other alternative stays repeatable for as long as
it remains eligible, as a Choice alternative does. Consumption is committed by
a `ConsumeConversationAlternativeOperation` in the same atomic commit as the
selection's own Game Operations, is canonical Game State, and validates and
restores exactly in a Save Snapshot. It is independent of eligibility: an
alternative may be hidden by its condition, consumed, or both. Every
`CharacterKnowledgeDefinition` refers to one fact through `factId` and declares
`open`, `guarded`, or `secret` Disclosure. Guarded facts require minimum Trust
or a boolean Game Variable; secret facts always require an explicit Game
Variable unlock. Repeated references are invalid. A `CoverStoryDefinition`
associates one guarded or secret known fact with one declared Claim. Fondale
copies Character Knowledge, Relationships and Dialogue State into independent
Game State; committed `Testimony` remembers speaker, listener and Claim ID
without storing generated wording or treating the Claim as truth.

## Knowledge-Driven Dialogue

For ordinary startup, a Game Project that declares at least one Character
Dialogue Profile declares a non-empty project-level `narrativeContext` and
supplies `StartGameOptions.dialogueServerUrl`. Fondale creates
the browser HTTP adapter, assigns a fresh cryptographically random Game Session
identity, and checks the connection before mounting. Server credentials and
model configuration remain outside the browser. Low-level `dialogueProvider`
injection remains available to Engine tests, technical fixtures, and advanced
hosts; supplying both connection forms is invalid.

The `DialogueProvider` interface keeps `interpret`, `verbalize`, `reflect`, and
`reset` as separate responsibilities. Provider turns receive a transient
`DialogueTurnContext`, containing a non-canonical `turnId` and `AbortSignal`.
The context fields are `turnId` and `signal`.
Interpretation receives untrusted `playerInput`, speaker and listener
identities, the Game Project's presentation-only Narrative Context, and the
known `DialogueFactCandidate` values relevant to that Conversation. Its
`DialogueInterpretation` selects one declared `factId` or
returns `null` with a `reason` of `ambiguous` or `no-relevant-fact`.

After validating the interpretation, deterministic Dialogue policy applies
Disclosure, directional Trust, Game Variables and Dialogue Behavior. Fondale
sends a `DialogueVerbalizationRequest` with an authorised `ResponseStrategy`,
qualitative portrayal data, a `DialogueFactCandidate` only for `answer`, or a
`DialogueClaimCandidate` only for `cover-story`; blocked and `clarify` payloads
contain neither. The returned text is presented as a Line but is never parsed
for Game State changes. An answered fact teaches the Player Character, while a
successful Cover Story applies a `RecordTestimonyOperation`; either effect is
committed atomically only after verbalisation succeeds. Player speech must contain from 1 through
`dialogueInputMaxLength` (500) characters.

Only one Dialogue Turn may be pending. Leaving or stopping the Game Session
aborts it and ignores late provider results. Automatic continuation captures
an accepted turn only after its canonical effects commit; provider-owned
transcript, thread, model and usage data never enter a Save Snapshot. After an
accepted turn's canonical effects commit, the Engine may
evaluate a matching authored Conversation handoff. Its Sequence becomes the
dominant Game Activity and retains ownership of exact Lines, Choices, timing
and skip behavior. A resumable handoff stores only the canonical Conversation
continuation; the Continuation State retains the external provider identity.

`GameSession.startReflection()` opens Reflection only while the session is
idle and the Player Character has a Dialogue Profile. `reflect` receives a
`ReflectionRequest` containing that Character's committed Narrative Fact
propositions, remembered Claims attributed to their speakers, directional
Relationships, and the presentation-only Narrative Context. It cannot see
undiscovered Character Knowledge or the complete
Narrative Fact registry. A `ReflectionResponse` separates its supported
summary from optional Hypotheses and investigation suggestions; Fondale labels
the latter as uncertain and possible before presenting one Player Character
Line. The response, Hypotheses, suggestions, and Reflection thread never enter
Game State. Reflection has no interlocutor, Disclosure, Cover Story, Testimony,
or Game Operation path. With no known facts or Testimony, Fondale presents a
limited response without asking the provider to invent one. Conversation and
Reflection memory is recovered through the provider identity on Continue.

`FakeDialogueProvider` is the deterministic adapter used by Engine tests and
browser fixtures. Its `interpretations` map multiple exact Player formulations
to declared Narrative Fact IDs or `null`; its `verbalizations` map an authorised
fact ID, Claim ID, or non-answer Response Strategy to one response; its
`reflections` map turns Player input into a structured Reflection response. It has no
network, database, model, or credential dependency. Tests may configure
`pending` and `failure` outcomes, inspect and release pending turn IDs, and
observe provider-memory reset calls without relying on timing.
Controlled results use the `outcome` discriminator; pending results may set
`ignoreCancellation` only when a test needs to simulate a non-conforming late
adapter result. The fake's internal `resets` count is exposed through
`resetCount()`, and `threadKeys()` exposes distinct Conversation and Reflection
memory identities since the last reset.

`HttpDialogueProvider` is the reusable low-level browser adapter for advanced
hosts connecting to a remote Dialogue Server. Ordinary Game Projects let
`startGame` own it through `dialogueServerUrl`. It sends one
`DialogueHttpRequest` for interpretation, verbalisation, Reflection,
cancellation, or reset and accepts only a `DialogueHttpResponse`; its
`sessionId` isolates provider-owned memory and its request follows the Dialogue
Turn's `AbortSignal`. Server credentials, model configuration and failure
details never enter this adapter.

The authored condition fields are `trustAtLeast`, `variable`, and `equals`.
Conversation handoff fields are `handoffs` and `after`. Qualitative profile
fields are `biography`, `personality`, `behavior`, `voice`,
`relationships`, `talkativeness`, `honesty`, `discretion`, `suspiciousness`,
`withholding`, `verbosity`, `tone`, `vocabulary`, `trust`, `coverStories`,
`concealsFactId`, and `claimId`. Provider requests carry Engine-selected
`strategy`, `profile`, and optional `claim` fields. A directional Trust
operation names its target with `towards`.
Reflection request fields are `playerInput`, `character`, `facts`,
`testimonies`, and `relationships`; each directional Relationship uses
`towards` and `trust`. Reflection response fields are `summary`, `hypotheses`,
and `suggestions`. The Fake adapter's internal `threads` set backs the read-only
`threadKeys()` test observation.

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
registry and initial Scene; the optional `narrativeFacts` and `claims`
registries default empty. A project with any Character Dialogue Profile also
requires non-empty `narrativeContext`; projects without Knowledge-Driven
Dialogue do not. `startGame` validates and creates a private deeply
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
can set a Variable or Appearance, start a Sequence, present or dismiss a Detail
View, collect the target Object, give a named Object that is present in the
current Scene to the Player,
place the selected first Object, place a named Object, or consume the selected
Object. It also includes `LearnNarrativeFactOperation`, whose
`learn-narrative-fact` discriminator, Character identity and `factId` add
declared Character Knowledge monotonically, `RecordTestimonyOperation`,
which validates one authored Cover Story before remembering its Claim, and
`ConsumeConversationAlternativeOperation`, whose
`consume-conversation-alternative` discriminator, Character identity and
authored `alternative` index withdraw one authored alternative from that
Character's Conversation.
Operations in one group see
earlier writes and either commit together or fail without a partial commit.
Conditions always read the latest committed Game State.

`InventoryOperation` is the Interaction-owned subset of `GameOperation`: it
collects the target Object, gives a named current-Scene Object to the Player,
places the selected first Object at a Ground Point,
places a named Object in a Scene, or consumes the selected Object. Optional
placement Appearance changes are validated by Animation, while World validates
the destination in Scene Space.

## Runtime and persistence

`startGame` first compiles an isolated project snapshot and validates any
untrusted Save Snapshot, then resolves to `GameSession` after assets validate,
WebGL starts, and the first frame is drawn. `StartGameOptions` contains an
unowned `target`, optional unknown `snapshot`, ordinary `dialogueServerUrl`,
and alternative low-level `dialogueProvider`. A Game Project with a Dialogue
Profile requires exactly one connection form. `GameSession` exposes
`createSaveSnapshot`, `getStatus`, `getDiagnostics`, and idempotent terminal
`stop`.

A `SaveSnapshot` records format/project identity/project version and canonical
state, including an incomplete Command, Character Knowledge and Testimony.
Generated wording is not stored. Stored values are passed as `unknown`
to `startGame`; malformed, incompatible or semantically invalid values reject
with Save-owned diagnostics before browser effects.
Camera position, hover, pointer position and Player Preferences are not saved.
The ordinary browser adapter stores one Continuation State per Project
Identity, pairing the latest compatible Save Snapshot with its provider
session identity. Continue restores both sides of that association; New Game
replaces it. Player Preferences remain in separate browser storage.
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
| `AnimationFrame` | ordered sheet cell | integer x, y, width, and height in image pixels | top-left origin; `uniformGrid` generates regular row-major cells | frame and asset diagnostics | [Character](recipes/character-walking.ts) |
| `AnimationSheet` | coordinate-based frame source | one Runtime Asset image and ordered frames | a static Animation has one frame | frame and asset diagnostics | [Sequence](recipes/sequence.ts) |
| `CharacterAnimationSheets` | Character Animation presentations | left, right, front, and back sheets | all four share frame count and Runtime cell dimensions | Facing, frame, and asset diagnostics | [Character](recipes/character-walking.ts) |
| `AnimationTiming` | Animation traversal | positive frames per second, optional loop and named Cues | loop defaults false; Cues use logical seconds | Animation/Cue diagnostics | [Sequence](recipes/sequence.ts) |
| `AnimationDefinition` | transient visual performance | one sheet and timing | artwork and traversal are authored separately | Animation/Cue diagnostics | [Sequence](recipes/sequence.ts) |
| `CharacterAnimationDefinition` | transient Character performance | four synchronized Facing sheets and timing | timing and Cues are shared across Facing | Animation/Cue diagnostics | [Character](recipes/character-walking.ts) |
| `AnimationRoles` | semantic Engine selections | default, optional speaking and walking names | default is required; speaking falls back to default | missing Animation diagnostics | [Character](recipes/character-walking.ts) |
| `Appearance` | persistent non-directional visual condition | named Animations, roles, optional anchor | registry key identifies selected condition | Animation, role, asset, and anchor diagnostics | [Interaction](recipes/interaction.ts) |
| `CharacterAppearance` | persistent Character visual condition | named four-Facing Animations, roles, optional anchor | every Animation is directionally complete | Appearance and Facing diagnostics | [Character](recipes/character-walking.ts) |
| `EntityAppearance` | Object visual condition | definitive animated Appearance | retains the non-directional contract | Appearance diagnostics | [Interaction](recipes/interaction.ts) |
| `SceneryAppearance` | Scenery visual condition | animated Appearance or Background Region | Background Regions remain tied to their Scene | Appearance/polygon diagnostics | [Scene](recipes/first-scene.ts) |
| `BackgroundRegionAppearance` | Background cut-out | background-region and polygon | belongs to owning Background | polygon and bounds diagnostics | [Scene](recipes/first-scene.ts) |
| `CharacterDefinition` | persistent Character | initial values, appearances, speed, noun, dialogue | initial point is walkable | Character/reference diagnostics | [Character](recipes/character-walking.ts) |
| `NarrativeFactDefinition` | canonical authored truth | non-empty proposition | registry key is stable identity | Narrative Fact definition diagnostics | [Dialogue authoring](game-authoring.md) |
| `ClaimDefinition` | authored non-canonical proposition | non-empty proposition | registry key is stable identity; never enters Character Knowledge | Claim definition diagnostics | [Dialogue authoring](game-authoring.md) |
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
| `CoverStoryDefinition` | controlled false account | concealed fact and Claim identities | fact must be guarded/secret and known by the Character | Cover Story definition/reference diagnostics | [Dialogue authoring](game-authoring.md) |
| `ConversationHandoffDefinition` | authored transition from Conversation to Sequence | condition, Sequence identity, close or resume outcome | evaluates committed Game State; generated wording has no authority | condition/Sequence/profile diagnostics | [Dialogue authoring](game-authoring.md) |
| `ConversationAlternativeDefinition` | authored question offered inside a Conversation | displayed phrase, optional condition, `spoken` and `once` flags, exact `response` and/or a named `sequence` with a close or resume outcome, optional Game Operations | reaches no Dialogue Provider; at most six eligible at once; ineligible ones are hidden; repeatable unless `once` | alternative definition/condition/Sequence/limit diagnostics | [Dialogue authoring](game-authoring.md) |
| `CharacterDialogueDefinition` | optional Character dialogue profile | knowledge, Cover Stories, Relationships, handoffs, authored alternatives, qualitative portrayal and state | omission preserves authored behaviour | dialogue capability diagnostics | [Dialogue authoring](game-authoring.md) |
| `LearnNarrativeFactOperation` | monotonic Character Knowledge change | Character and Narrative Fact identities | repeated learning is idempotent | Character/fact reference diagnostics | [Dialogue authoring](game-authoring.md) |
| `ConsumeConversationAlternativeOperation` | withdraw one authored alternative | Character identity and authored alternative index | the index must exist for that Character; repeated consumption is idempotent | Character/alternative reference diagnostics | [Dialogue authoring](game-authoring.md) |
| `RecordTestimonyOperation` | remember a communicated Claim | speaker, listener, concealed fact and Claim identities | must match the speaker's authored Cover Story; repeated testimony is idempotent | Character/Claim/Cover Story reference diagnostics | [Dialogue authoring](game-authoring.md) |
| `SetTrustOperation` | directional Relationship change | source, target and qualitative Trust | only a declared Relationship edge may change | Character/Relationship diagnostics | [Dialogue authoring](game-authoring.md) |
| `SetDialogueStateOperation` | qualitative Dialogue State change | Character and state or null | only authored operations change canonical state | Character/state diagnostics | [Dialogue authoring](game-authoring.md) |
| `DialogueGameOperation` | Dialogue-owned canonical transition | learn fact, record Testimony, set Trust, set Dialogue State | participates in an atomic operation batch | operation/reference diagnostics | [Dialogue authoring](game-authoring.md) |
| `DialogueFactCandidate` | known fact eligible for interpretation | stable id and canonical proposition | Disclosure is applied after interpretation | unknown selections are rejected | [Dialogue authoring](game-authoring.md) |
| `DialogueClaimCandidate` | authorised Cover Story content | stable id and non-canonical proposition | sent only when policy selects its concealed fact's Cover Story | undeclared Claims never reach verbalisation | [Dialogue authoring](game-authoring.md) |
| `DialogueInterpretationRequest` | untrusted speech interpretation input | Narrative Context, playerInput, speaker, listener, candidates | candidates are frozen and capability-authorised | provider failure rejects the turn | [Dialogue authoring](game-authoring.md) |
| `DialogueInterpretation` | provider-selected semantic reference | declared factId, or null with an unresolved reason | ambiguity clarifies; no relevant fact withholds | unknown fact ID or reason rejects before verbalization | [Dialogue authoring](game-authoring.md) |
| `ResponseStrategy` | Engine-authorised conversational approach | answer, cover-story, withhold, evade, refuse, clarify | selected deterministically before verbalisation | invalid provider output rejects the turn | [Dialogue authoring](game-authoring.md) |
| `DialoguePortrayalProfile` | provider-visible qualitative portrayal | optional biography, Personality, Voice and Dialogue State | carries no semantic authority | validated at startup | [Dialogue authoring](game-authoring.md) |
| `DialogueVerbalizationRequest` | authorised expression input | Narrative Context, speech identities, strategy, portrayal and optional fact or Claim | a concealed fact is absent when its Cover Story Claim is present | empty response rejects the turn | [Dialogue authoring](game-authoring.md) |
| `DialogueTurnContext` | transient provider-call lifecycle | turn ID and AbortSignal | shared by Conversation phases or supplied to Reflection; never saved | lifecycle invalidation aborts the signal and ignores late results | [Dialogue authoring](game-authoring.md) |
| `ReflectionRequest` | authorised Player Character reflection context | Narrative Context, input, Character, known facts, attributed Testimony and directional Relationships | excludes hidden truth and every other Character's knowledge | provider failure rejects only the Reflection turn | [Dialogue authoring](game-authoring.md) |
| `ReflectionResponse` | non-canonical generated reflection | supported summary, optional Hypotheses and suggestions | Hypotheses and suggestions are labelled uncertain/possible and never saved | malformed or empty output rejects the turn | [Dialogue authoring](game-authoring.md) |
| `ReflectionTestimony` | provider-visible remembered Claim | speaker and declared Claim | preserves attribution without asserting truth | derived only from committed Testimony | [Dialogue authoring](game-authoring.md) |
| `ReflectionRelationship` | provider-visible directional Trust | `towards` Character and qualitative Trust | includes only the reflecting Character's outgoing Relationship | derived only from committed Relationship state | [Dialogue authoring](game-authoring.md) |
| `Testimony` | canonical memory of a communicated Claim | speaker, listener and Claim ID | set-like and idempotent; stores no wording or truth | Save state validation | [Dialogue authoring](game-authoring.md) |
| `DialogueProvider` | generated-dialogue adapter seam | interpret, verbalize, reflect, reset | ordinarily selected through a Dialogue Server URL; low-level injection remains available; Continue retains its memory identity | missing connection is a startup diagnostic | [Dialogue authoring](game-authoring.md) |
| `HttpDialogueProvider` | low-level browser-to-server Dialogue Provider adapter | endpoint and Game Session identity | advanced hosts only; follows turn cancellation and sends no server credentials | malformed or failed HTTP responses reject the turn | [Dialogue authoring](game-authoring.md) |
| `DialogueHttpRequest` | browser transport request | interpret, verbalize, reflect, cancel or reset | every turn operation carries session and transient turn identity | server rejects an invalid envelope | [Dialogue authoring](game-authoring.md) |
| `DialogueHttpResponse` | browser transport response | success value or public failure message | server failure details remain private | malformed responses reject the turn | [Dialogue authoring](game-authoring.md) |
| `FakeDialogueProvider` | deterministic Dialogue Provider adapter | interpretation, verbalization, reflection, pending/failure controls, thread keys and reset count | no external dependency, timing assumption or generated authority | missing configured mapping rejects the turn | [Dialogue authoring](game-authoring.md) |
| `FakeDialoguePendingOutcome` | deterministic suspended fake response | pending discriminator, eventual value and optional cancellation behavior | released explicitly by transient turn ID | ordinary cancellation rejects unless the test requests a late result | [Dialogue authoring](game-authoring.md) |
| `FakeDialogueFailureOutcome` | deterministic fake rejection | failure discriminator and message | rejects one configured provider phase | leaves canonical state unchanged | [Dialogue authoring](game-authoring.md) |
| `ObjectDefinition` | persistent Object | initial values, appearances, Inventory PNG, noun | begins in one Scene | Object/asset diagnostics | [Inventory](recipes/inventory.ts) |
| `InteractionCondition` | state predicate | variable equality or held Object | omission is unconditional | missing-reference diagnostics | [Command](recipes/command-case.ts) |
| `InventoryOperation` | Inventory and Object lifecycle change | collect target, give named, place selected, place named, consume selected | World owns placement validity; Animation owns Appearance validity | Interaction/World/Animation diagnostics | [Inventory](recipes/inventory.ts) |
| `GameOperation` | atomic state change | declared operation variants | order matters; group atomic | operation/reference diagnostics | [Inventory](recipes/inventory.ts) |
| `HotspotTarget` | interaction subject | Background, Character, Object, Scenery | target is required | target reference diagnostic | [Interaction](recipes/interaction.ts) |
| `ApproachPoint` | interaction destination | groundPoint and facing | must be walkable and HUD-safe | approach diagnostics | [Interaction](recipes/interaction.ts) |
| `HotspotDefinition` | Scene interaction surface | target, area, approach, condition; local noun only for Background | target kind discriminates Noun ownership; later overlap wins hit-test | geometry, target and owner-Noun diagnostics | [Interaction](recipes/interaction.ts) |
| `DetailViewHotspotDefinition` | Detail View interaction surface | area, local noun, condition | no Approach Point; Logical Resolution coordinates; later overlap wins hit-test | geometry, bounds and Noun diagnostics | [Concepts](concepts.md) |
| `DetailViewDefinition` | declarative image presented in place of the world | image and ordered Hotspots | one presented at a time; presenting another replaces it; no Scene Space, Character or approach | image, geometry and reference diagnostics | [Concepts](concepts.md) |
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
| `GameProject` | declarative project authoring | identity, version, resolution, registries, commands, theme, and Narrative Context when dialogue is used | startup captures an isolated immutable snapshot | aggregated startup diagnostics | [Scene](recipes/first-scene.ts) |
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
| `AuthoringDiagnosticOwner` | rule owner | eleven capabilities or browser adapter | owner is always present | no independent failure | [Scene](recipes/first-scene.ts) |
| `AuthoringDiagnostic` | one author-facing issue | code, family, owner, path, message, suggestion, cause | stable code/path ordering | describes owning failure | [Scene](recipes/first-scene.ts) |
| `AuthoringError` | aggregate failure | read-only diagnostics | one error per startup layer | thrown by startup | [Scene](recipes/first-scene.ts) |
| `SaveSnapshot` | JSON-safe committed state | format, project identities and state | exact fields only | save validation diagnostics | [Save](recipes/save-snapshot.ts) |
| `StartGameOptions` | browser mount options | target, optional snapshot, ordinary Dialogue Server URL or low-level Dialogue Provider | configured dialogue requires exactly one connection form; ordinary omitted-snapshot startup uses Continue or New Game | environment/save/dialogue diagnostics | [Save](recipes/save-snapshot.ts) |
| `GameSession` | running lifecycle handle | save, start Reflection, status, diagnostics, stop | Reflection starts only while idle; stop is idempotent and terminal | lifecycle diagnostics | [Save](recipes/save-snapshot.ts) |

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
`arrivalSequences`, `alternatives`, `fallback`, `steps`, `cases`, `skippable`,
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
`definition.narrative-fact.sets-variable`,
`definition.character-knowledge.duplicate`,
`definition.character-knowledge.disclosure`,
`definition.detail-view.image`, `definition.detail-view.bounds`,
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
`reference.detail-view`,
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
`reference.character-knowledge.fact`, `reference.cover-story.fact`,
`reference.cover-story.knowledge`, `reference.cover-story.claim`,
`reference.testimony.speaker`, `reference.testimony.listener`,
`reference.testimony.claim`, and `reference.testimony.cover-story`, plus
`reference.relationship.character` and `reference.relationship.missing` for
directional Relationship edges, and `reference.narrative-fact.variable` for the
Game Variable a Narrative Fact sets when it is learned.

Knowledge-Driven Dialogue definition and operation codes include
`definition.narrative-context.required`,
`definition.narrative-fact.identity`, `definition.narrative-fact.proposition`,
`definition.narrative-fact.sets-variable`,
`definition.claim.identity`, `definition.claim.proposition`,
`definition.character-knowledge.collection`,
`definition.character-knowledge.item`,
`definition.character-knowledge.disclosure`, `definition.character-knowledge.duplicate`,
`definition.cover-story.collection`, `definition.cover-story.item`,
`definition.cover-story.disclosure`, `definition.cover-story.duplicate`,
`definition.relationship.collection`, `definition.relationship.trust`,
`definition.dialogue.profile`, `definition.dialogue.biography`,
`definition.dialogue.personality`, `definition.dialogue.behavior`,
`definition.dialogue.voice`, `definition.dialogue.state`,
`definition.dialogue.handoffs`, `definition.dialogue.handoff`,
`definition.conversation-alternative.collection`,
`definition.conversation-alternative.item`,
`definition.conversation-alternative.condition`,
`definition.conversation-alternative.limit`,
`definition.conversation-alternative.sequence`,
`reference.conversation-alternative.index`, and
`reference.dialogue-operation.character`.

Runtime, save, asset and environment codes: `state.operation.invalid`,
`save.shape`, `save.fields.unexpected`, `save.format.version`,
`save.project.identity`, `save.project.version`, `save.state.command`,
`save.state.command-noun`, `save.state.intent-command`,
`save.state.intent-command-noun`, `save.state.invalid`,
`save.validation.project`, `save.validation.required`, `asset.load.failed`,
`asset.audio.load.failed`,
`asset.background.dimensions`, `asset.detail-view.dimensions`,
`asset.cursor.dimensions`, `asset.font.load.failed`,
`asset.inventory-appearance.dimensions`, `asset.animation-sheet.frame-bounds`,
`asset.animation-sheet.dimensions`, `asset.visual-anchor.bounds`,
`environment.dialogue-connection.ambiguous`,
`environment.dialogue-provider.missing`,
`environment.dialogue-server.connection-failed`,
`environment.dialogue-server.unreachable`, `environment.start.failed`,
`environment.target.occupied`, and
`environment.webgl.unavailable`.

See the [quick start](quick-start.md), [Game Project authoring guide](game-authoring.md),
[Support Baseline](support-baseline.md), and compiled [recipes](recipes/README.md).
