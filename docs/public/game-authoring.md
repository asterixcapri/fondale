# Game Project authoring

Fondale games are ordinary declarative TypeScript data. Import public types
from the package root, organize definitions in focused files, and use
`satisfies` to check each definition without changing its inferred type.

```ts
import {
  startGame,
  type GameProject,
  type SceneDefinition,
} from "@asterixcapri/fondale";

export const harbour = {
  background: new URL("./harbour.png", import.meta.url),
  size: { width: 640, height: 360 },
  walkableRegion: [
    { x: 0, y: 0 }, { x: 640, y: 0 },
    { x: 640, y: 360 }, { x: 0, y: 360 },
  ],
} satisfies SceneDefinition;

const project = {
  identity: "com.example.harbour",
  version: "1",
  logicalResolution: { width: 320, height: 180 },
  scenes: { harbour },
  initialScene: "harbour",
} satisfies GameProject;

const session = await startGame(project, {
  target: document.querySelector<HTMLElement>("#game")!,
});
```

`startGame` validates every local definition and cross-definition reference,
aggregates capability-owned `AuthoringDiagnostic` values, applies supported
defaults, and creates a private deeply immutable copy. It does not modify or
freeze Author-owned data. Mutating that data later cannot affect a running Game
Session; another `startGame` call captures a new independent snapshot.

## Focused definitions

The package root exports `CharacterDefinition`, `ObjectDefinition`,
`SceneDefinition`, `SequenceDefinition`, `NounDefinition`, `CommandLexicon`,
and `HUDTheme`. They allow a project to remain modular without authoring
functions:

```ts
import {
  type CharacterDefinition,
  type NounDefinition,
} from "@asterixcapri/fondale";

const hostNoun = {
  labels: [{ text: "Host" }],
  preferredVerbs: [{ verb: "talk-to" }],
  cases: [{ verb: "talk-to", line: { character: "host", text: "Welcome." } }],
} satisfies NounDefinition;

export const host = {
  initialScene: "harbour",
  initialGroundPoint: { x: 150, y: 120 },
  initialFacing: "front",
  initialAppearance: "idle",
  appearances: {
    idle: {
      animations: {
        idle: {
          frames: {
            left: { image: new URL("./host-idle-left.png", import.meta.url), count: 1 },
            right: { image: new URL("./host-idle-right.png", import.meta.url), count: 1 },
            front: { image: new URL("./host-idle-front.png", import.meta.url), count: 1 },
            back: { image: new URL("./host-idle-back.png", import.meta.url), count: 1 },
          },
          framesPerSecond: 1,
        },
      },
      roles: { default: "idle" },
    },
  },
  movementSpeed: 60,
  noun: hostNoun,
} satisfies CharacterDefinition;
```

## Four-Facing Character artwork

Every Character Animation owns authored `left`, `right`, `front`, and `back`
presentations. The Engine selects the strip whose name matches the Character's
current Facing; it never mirrors or falls back to another presentation.
Perspective Scale applies equally to every Facing and does not reverse the
artwork. Objects and Scenery keep their non-directional Animation contracts.

For each Animation, preserve one lossless Art Master and derive one fitted
Runtime strip for each of the four presentations. The four Art Masters may be
produced with any artistic technique, but acceptance judges the authored
result rather than accepting Engine-generated directionality. Within one
Animation, every strip has the same frame count. `framesPerSecond`, `loop`,
duration, and Animation Cues belong to the Animation and are therefore shared
by all four presentations.

Within one Appearance, export every Facing and Animation with common Runtime
cell dimensions and set one stable `visualAnchor`. That anchor keeps every
frame aligned to the Character's Ground Point as Facing or Animation changes.
`startGame` reports missing presentations, mismatched frame counts, invalid
assets, incompatible Runtime cell dimensions, and out-of-bounds Visual Anchors
as Authoring Diagnostics.

Inspect every directional loop at 1:1 Runtime pixels and at actual play size,
including its first-to-last transition. Check anatomy, costume construction,
carried items, handed actions, facial and bodily asymmetry, and Ground Point
stability in all four presentations. Review the Character in its Scene so
illumination remains coherent with the Scene's light source when Facing
changes. Repeat the play-size check at every reachable Perspective Scale.

The [four-Facing Character recipe](recipes/character-walking.ts) shows
dedicated looping Default, Speaking, and Walking Animations using the public
`CharacterDefinition` interface. If a Character design intentionally has no
distinct speaking performance, omit the Speaking Role and document the
Engine's fallback to the Default Animation in the Character package.

Registry keys are identities. Cross-definition references use those keys and
are resolved by the owning capability. A Scene `size` omitted at authoring
defaults to the Logical Resolution during compilation. Other optional
registries default to empty registries and `letterboxColor` defaults to
`#000000`.

## Initial Character Knowledge

Knowledge-Driven Dialogue begins with ordinary declarative data. Narrative
Facts and non-canonical Claims live once in separate Game Project registries; a
Character's optional `dialogue` profile refers to those identities and declares
Character-specific Disclosure, Cover Stories, directional Relationships and
qualitative portrayal:

```ts
import {
  type CharacterDefinition,
  type CharacterDialogueDefinition,
  type ClaimDefinition,
  type NarrativeFactDefinition,
} from "@asterixcapri/fondale";

const harbourFact = {
  proposition: "The harbour chain was cut.",
} satisfies NarrativeFactDefinition;

const denial = {
  proposition: "Antonio did not cut the harbour chain.",
} satisfies ClaimDefinition;

const antonioDialogue = {
  personality: {
    talkativeness: "low",
    honesty: "medium",
    discretion: "high",
    suspiciousness: "high",
  },
  behavior: { withholding: "evade" },
  voice: { verbosity: "short", tone: "dry", vocabulary: "simple" },
  state: "afraid",
  relationships: { michele: { trust: "low" } },
  knowledge: [
    {
      factId: "harbour-chain-cut",
      disclosure: { level: "open" },
    },
    {
      factId: "antonio-cut-chain",
      disclosure: {
        level: "secret",
        when: { variable: "antonio-ready-to-confess", equals: true },
      },
    },
  ],
  coverStories: [{
    concealsFactId: "antonio-cut-chain",
    claimId: "antonio-denial",
  }],
  handoffs: [{
    when: { variable: "antonio-ready-to-confess", equals: true },
    sequence: "antonio-confession",
    after: "resume",
  }],
  alternatives: [{
    text: "Who cut the harbour chain?",
    response: "I never saw who cut it.",
  }, {
    text: "Where is the winch handle?",
    when: { variable: "winch-handle-missing", equals: true },
    response: "Behind the customs house, where it has always been.",
    operations: [{ type: "set-variable", variable: "winch-handle-found", value: true }],
  }, {
    text: "Show me what happened that night.",
    sequence: "antonio-confession",
    after: "resume",
    once: true,
  }],
} satisfies CharacterDialogueDefinition;

const antonio = {
  initialScene: "harbour",
  initialGroundPoint: { x: 180, y: 120 },
  initialFacing: "left",
  initialAppearance: "idle",
  appearances: {
    idle: {
      animations: {
        idle: {
          frames: {
            left: { image: new URL("./antonio-idle-left.png", import.meta.url), count: 1 },
            right: { image: new URL("./antonio-idle-right.png", import.meta.url), count: 1 },
            front: { image: new URL("./antonio-idle-front.png", import.meta.url), count: 1 },
            back: { image: new URL("./antonio-idle-back.png", import.meta.url), count: 1 },
          },
          framesPerSecond: 1,
        },
      },
      roles: { default: "idle" },
    },
  },
  movementSpeed: 60,
  dialogue: antonioDialogue,
} satisfies CharacterDefinition;

const dialogueProject = {
  ...project,
  variables: {
    "antonio-ready-to-confess": false,
    "winch-handle-missing": true,
    "winch-handle-found": false,
  },
  narrativeFacts: {
    "harbour-chain-cut": harbourFact,
    "antonio-cut-chain": { proposition: "Antonio cut the harbour chain." },
  },
  claims: { "antonio-denial": denial },
  characters: { antonio },
};
```

Startup rejects empty propositions, missing fact, Claim or Relationship
references, incoherent Cover Stories or Disclosure, and unsupported qualitative
values. A Conversation presents the Character's authored `alternatives` and the
free-form input field together, from the moment it opens until it closes, and
the Player moves between them freely: nothing gates either path. Selecting an
alternative pronounces its phrase as the Player Character — unless it declares
`spoken: false` — answers with the exact authored `response`, and commits its
`operations` atomically, without reaching a Dialogue Provider, writing provider
memory or costing a model call. Eligibility reads committed Game State only;
ineligible alternatives are hidden rather than shown unavailable, and startup
rejects an authored set that could ever offer more than six at once. A
selection made while a Dialogue Turn is still pending is refused until that
turn settles, and an alternative cannot start a Sequence through a
`start-sequence` operation. It may name one instead: an alternative declaring a
`sequence` and an explicit `close` or `resume` outcome hands direction of play
to that Sequence, which keeps its own Lines, Choices, timing, skip behaviour and
direction. The Conversation is not presented while the Sequence plays, so the
free-form input field steps aside and returns when the Conversation resumes,
with alternative eligibility re-evaluated against the Game State the Sequence
left behind. An alternative carrying both a `response` and a `sequence` speaks
its authored answer first and directs the Sequence when that Line ends. Startup
rejects an alternative naming an unknown Sequence, one belonging to another
Scene, or a `sequence` and outcome declared without each other. An alternative
declaring `once: true` is consumed by the selection that asks it and is never
offered again, so a pivotal question is asked once; an alternative that says
nothing stays repeatable for as long as it remains eligible, exactly as a
Choice alternative does. Consumption is committed with the selection's own
Game Operations in one atomic commit — including when the alternative only
directs a Sequence — and is canonical Game State that a Save Snapshot restores
exactly. It is independent of eligibility, so an alternative may be withdrawn
by its condition, by consumption, or by both; a Save Snapshot naming an unknown
Character or an alternative index that Character does not offer is rejected.
A Conversation handoff evaluates its authored condition against
committed Game State, gives control to its named Sequence, and explicitly
`close`s or `resume`s the Conversation when that Sequence ends. Generated
wording cannot trigger the handoff. When Dialogue policy selects a Cover Story, the provider receives its
Claim but not the concealed Narrative Fact. A successful turn records one
idempotent Testimony containing speaker, listener and Claim ID; it does not add
the Claim to Character Knowledge or save generated wording. The Engine copies
valid Character Knowledge, Relationships, Dialogue State and Testimony into
Game State; `learn-narrative-fact`, `record-testimony`, `set-trust` and
`set-dialogue-state` operations change it atomically, and Save Snapshots
validate and restore it exactly. Trust is directional, and Trust alone can
never unlock a `secret` fact.

Give a Narrative Fact a `setsVariable` to let what the Player discovers by
typing advance the game:

```ts
narrativeFacts: {
  "harbour-chain-cut": {
    proposition: "The harbour chain was cut.",
    setsVariable: "chainKnown",
  },
},
variables: { chainKnown: false },
```

A Character learning that Fact sets the named Game Variable to `true` in the
same commit as the learning, so no Save Snapshot can hold a Character who knows
something the world has not registered. The Engine performs it, never generated
wording, and only after Disclosure has authorised the Fact: a Fact answered
with a Cover Story, withheld, or belonging to a failed or cancelled Dialogue
Turn leaves the variable untouched, and a secret nobody revealed can never open
a puzzle. Learning the same Fact again adds nothing to Character Knowledge and
re-asserts the same `true` value, so a Character who knows the Fact always
leaves the commit with its variable set — including when an ordinary
`set-variable` operation cleared it in between. A Fact learned
through an authored path — a `learn-narrative-fact` operation on an alternative
or inside a Sequence — sets the same variable, so both routes stay consistent.
What results is an ordinary Game Variable: Interaction Conditions, Hotspots,
Passages, Sequences and alternative eligibility read it with no special casing.
Startup rejects a `setsVariable` that is empty or names an undeclared Game
Variable.

## Player Character Reflection

Give the Player Character a Dialogue Profile to make Reflection available,
then expose an Example-specific control that calls the running Game Session:

```ts
const session = await startGame(dialogueProject, { target, dialogueProvider });

document.querySelector("#reflect")?.addEventListener("click", () => {
  session.startReflection();
});
```

The provider's `reflect` method receives a `ReflectionRequest` containing only
the Player Character's committed facts, attributed Testimony, and directional
Relationships. It returns a `ReflectionResponse` with a summary and optional
Hypotheses or investigation suggestions. Fondale labels Hypotheses as uncertain
and suggestions as possible, presents the result as the Player Character's
Line, and never adds generated material to Game State. A Dialogue Provider
adapter must keep Conversation and Reflection memory in distinct threads;
Fondale resets all provider memory on Load.

## Startup diagnostics

Invalid projects reject before the target, environment, Runtime Assets, or
mount are touched:

```ts
import { AuthoringError, startGame } from "@asterixcapri/fondale";

try {
  await startGame(project, { target });
} catch (error) {
  if (error instanceof AuthoringError) {
    for (const diagnostic of error.diagnostics) {
      console.error(diagnostic.owner, diagnostic.path, diagnostic.message);
    }
  }
}
```

## Save and restore

`GameSession.createSaveSnapshot()` returns a JSON-safe `SaveSnapshot`. Treat
stored data as untrusted and pass it directly to `startGame`; Save validates
its shape, Project Identity, Project Version, and complete Game State before
any browser work.

```ts
const stored: unknown = JSON.parse(localStorage.getItem("save") ?? "null");
const restored = await startGame(project, { target, snapshot: stored });
```

Malformed, incompatible, or semantically invalid snapshots reject with
Save-owned diagnostics and cannot partially restore or mount a Game Session.

See the [recipes](recipes/README.md) for complete compiled examples and the
[reference](reference.md) for every public contract and diagnostic code.
