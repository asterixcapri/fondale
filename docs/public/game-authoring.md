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
        idle: { frames: [new URL("./host.png", import.meta.url)], framesPerSecond: 1 },
      },
      roles: { default: "idle" },
    },
  },
  movementSpeed: 60,
  noun: hostNoun,
} satisfies CharacterDefinition;
```

Registry keys are identities. Cross-definition references use those keys and
are resolved by the owning capability. A Scene `size` omitted at authoring
defaults to the Logical Resolution during compilation. Other optional
registries default to empty registries and `letterboxColor` defaults to
`#000000`.

## Initial Character Knowledge

Knowledge-Driven Dialogue begins with ordinary declarative data. Narrative
Facts live once in the Game Project registry; a Character's optional `dialogue`
profile refers to those identities and declares Character-specific Disclosure,
directional Relationships and qualitative portrayal:

```ts
import {
  type CharacterDefinition,
  type CharacterDialogueDefinition,
  type NarrativeFactDefinition,
} from "@asterixcapri/fondale";

const harbourFact = {
  proposition: "The harbour chain was cut.",
} satisfies NarrativeFactDefinition;

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
} satisfies CharacterDialogueDefinition;

const antonio = {
  initialScene: "harbour",
  initialGroundPoint: { x: 180, y: 120 },
  initialFacing: "left",
  initialAppearance: "idle",
  appearances: {
    idle: {
      animations: {
        idle: { frames: [new URL("./antonio.png", import.meta.url)], framesPerSecond: 1 },
      },
      roles: { default: "idle" },
    },
  },
  movementSpeed: 60,
  dialogue: antonioDialogue,
} satisfies CharacterDefinition;

const dialogueProject = {
  ...project,
  variables: { "antonio-ready-to-confess": false },
  narrativeFacts: {
    "harbour-chain-cut": harbourFact,
    "antonio-cut-chain": { proposition: "Antonio cut the harbour chain." },
  },
  characters: { antonio },
};
```

Startup rejects empty propositions, missing fact or Relationship references,
incoherent Disclosure and unsupported qualitative values. The Engine copies
valid Character Knowledge, Relationships and Dialogue State into Game State;
`learn-narrative-fact`, `set-trust` and `set-dialogue-state` operations change
it atomically, and Save Snapshots validate and restore it exactly. Trust is
directional, and Trust alone can never unlock a `secret` fact.

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
