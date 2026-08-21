# Dialogue Provider protocol

How the Engine talks to a Dialogue Provider, and what a provider may and may
not decide. For authoring Character Knowledge, Disclosure, Cover Stories and
Conversations, see [Dialogue](authoring/dialogue.md).

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
accepted turn's canonical effects commit, the Engine may evaluate the
Character's Conversation cases and apply the first eligible one. Its Sequence
becomes the dominant Game Activity and retains ownership of exact Lines,
Choices, timing and skip behavior. A resuming case stores only the canonical
Conversation continuation; the Continuation State retains the external provider
identity.

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
Conversation case fields are `cases` and `after`. Qualitative profile fields
are `biography`, `personality`, `behavior`, `voice`,
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
View, end the Game Session on a Detail View, collect the target Object, give a
named Object that is present in the current Scene to the Player,
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

## See also

[Dialogue](authoring/dialogue.md) for authoring Character Knowledge,
Disclosure, Cover Stories and Conversations ·
[Contract index](contract-index.md) for the exact shape of every type named
here · [Diagnostics](diagnostics.md) for the codes a failed connection reports.
