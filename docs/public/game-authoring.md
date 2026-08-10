# Authoring a Game Project

Fondale exposes every supported Engine Capability from
`@asterixcapri/fondale`. A game imports only that package root and describes its
world as immutable, validated Game Definitions. The focused sources under
[`recipes/`](recipes/README.md) compile against the same distributable package
and are the smallest executable examples of each capability.

## Compose the world

A Game Project declares its identity and Project Version, one Logical
Resolution, named registries, the initial Scene, and optional presentation and
Command settings:

```ts
const project = defineGame({
  identity: "com.example.adventure",
  version: "1",
  logicalResolution: { width: 320, height: 180 },
  scenes: { alley, harbour },
  characters: { player, host },
  playerCharacter: "player",
  objects: { key },
  sequences: { hostConversation },
  variables: { gateOpen: false },
  commandLexicon,
  commandFallbacks,
  hudTheme,
  initialScene: "alley",
});
```

Registry keys are definition identities and all cross-references remain those
declarative strings. `defineGame` validates them together and returns an opaque,
frozen Game Project. See the compiled [first Scene recipe](recipes/first-scene.ts).

## Define Scene space and navigation

`defineScene` owns the Background, Walkable Region, optional Perspective Scale,
Scenery, Hotspots, Entrances, and Scene Passages. Coordinates use the shared
Logical Resolution. Character and Object Ground Points must remain in the
Walkable Region; Scenery uses its Baseline and optional position for depth.

```ts
const harbour = defineScene({
  background: new URL("./harbour.png", import.meta.url),
  walkableRegion: harbourFloor,
  perspectiveScale: [{ y: 120, scale: 0.7 }, { y: 180, scale: 1 }],
  entrances: {
    fromAlley: { groundPoint: { x: 30, y: 165 }, facing: "right" },
  },
  passages: [{
    area: alleyExitArea,
    approach: { groundPoint: { x: 20, y: 165 }, facing: "left" },
    noun: defineNoun({
      labels: [{ text: "To the alley" }],
      preferredVerbs: [{ verb: "walk-to" }],
      cases: [],
    }),
    direction: "left",
    destination: { scene: "alley", entrance: "fromHarbour" },
  }],
});
```

A Scene Passage owns its Noun and direction because it is itself the semantic
navigation target. Holding Tab reveals available Hotspots and Passages.

## Give interactive targets one Noun

A Character, Object, or Scenery owns at most one Noun Definition. Every
Hotspot that identifies that target uses the owner's labels, contextual Verbs,
Command Cases, responses, Lines, Sequences, and Game Operations.

An Object Noun drives both its world Hotspot and Inventory entry:

```ts
const key = defineObject({
  initialScene: "alley",
  initialGroundPoint: { x: 118, y: 170 },
  initialAppearance: "unused",
  appearances: { unused: { kind: "static", image: keyImage } },
  inventoryAppearance: keyInventoryImage,
  noun: defineNoun({
    labels: [
      { when: { variable: "keyCleaned", equals: true }, text: "Clean key" },
      { text: "Dirty key" },
    ],
    preferredVerbs: [
      { when: { hasObject: "key" }, verb: "use" },
      { verb: "pick-up" },
    ],
    secondaryVerbs: [{ verb: "look-at" }],
    cases: [{
      verb: "pick-up",
      response: { text: "You take the key." },
      operations: [{ type: "collect-target-object" }],
    }],
  }),
});

const alley = defineScene({
  // Background and Walkable Region omitted here.
  hotspots: [{
    target: { kind: "object", object: "key" },
    area: keyArea,
    approach: keyApproach,
  }],
});
```

Characters and Scenery follow the same ownership rule:

```ts
const host = defineCharacter({
  // Initial Scene, Ground Point, Facing, Appearance and movementSpeed omitted.
  noun: defineNoun({
    labels: [{ text: "Host" }],
    preferredVerbs: [{ verb: "talk-to" }],
    objectVerbs: [{ verb: "give" }],
    cases: [{ verb: "talk-to", sequence: "hostConversation" }],
  }),
});

const tavern = defineScene({
  // ...
  scenery: {
    gate: {
      baseline: 150,
      initialAppearance: "closed",
      appearances: { closed: { kind: "background-region", area: gateArea } },
      noun: defineNoun({
        labels: [{ text: "Gate" }],
        preferredVerbs: [{ verb: "open" }],
        cases: [{ verb: "open", response: { text: "It is locked." } }],
      }),
    },
  },
  hotspots: [
    { target: { kind: "character", character: "host" }, area: hostArea, approach: hostApproach },
    { target: { kind: "scenery", scenery: "gate" }, area: gateArea, approach: gateApproach },
  ],
});
```

A background region has no registry owner, so its Hotspot requires a local
Noun. Character, Object, and Scenery Hotspots reject a local Noun. An owner may
omit its Noun while non-interactive; if a Hotspot references it, `defineGame`
reports `definition.hotspot.target-noun.required` at the owner's `noun` path.

## Resolve Commands declaratively

A Noun declares ordered conditional labels, Preferred Verbs, optional Secondary
Verbs, optional Selected Object Verbs, specific Command Cases, and local
fallbacks. Conditions read Game Variables or Inventory membership. A case may
produce one direct Character Line, one neutral Command Response, or start one
Sequence, accompanied by atomic Game Operations.

```ts
const gateNoun = defineNoun({
  labels: [{ when: { variable: "gateOpen", equals: true }, text: "Open gate" },
    { text: "Closed gate" }],
  preferredVerbs: [{ verb: "look-at" }],
  secondaryVerbs: [{ verb: "open" }],
  objectVerbs: [{ verb: "use" }],
  cases: [{
    verb: "use",
    firstNoun: "key",
    response: { text: "The key opens the gate." },
    operations: [
      { type: "set-variable", variable: "gateOpen", value: true },
      {
        type: "set-appearance",
        target: { kind: "scenery", scene: "alley", scenery: "gate" },
        appearance: "open",
      },
    ],
  }],
  fallbacks: { open: { response: { text: "It will not move." } } },
});
```

The supported operations set Variables and Appearances, start Sequences,
collect the target Object, place the selected Object, or consume it. A complete
Command that has no local match uses the project's response-only global
fallback. `defineCommandLexicon` supplies all visible Verb labels, Inventory
phrases, and unary/Give/Use grammar. See the [Interaction](recipes/interaction.ts),
[Inventory](recipes/inventory.ts), and [Command Case](recipes/command-case.ts)
recipes.

## Author Characters, Appearances, and Sequences

Characters support static or directional walking Appearances, authored Facing,
movement speed, and optional Nouns. Objects have static world Appearances plus
a square Inventory Appearance. Scenery supports static images or regions cut
from the owning Background. Named Appearance changes belong to Game State.

A Sequence is a finite modal progression of Character Lines, Narrations,
Choices, automatic branches, and operation groups. Choices may conditionally
expose at most six alternatives; selected text is spoken by the Player
Character unless `spoken: false`. Sequence progress is saved exactly.

```ts
const greeting = defineSequence({
  skippable: true,
  steps: [
    { type: "line", character: "host", text: "Welcome." },
    { type: "narration", text: "Rain taps against the shutters." },
    {
      type: "choice",
      alternatives: [{
        text: "Ask about the harbour.",
        when: { variable: "gateOpen", equals: true },
        steps: [{ type: "line", character: "host", text: "Follow the lamps." }],
      }],
      fallback: { text: "Leave.", spoken: false, steps: [] },
    },
  ],
});
```

See the compiled [Character](recipes/character-walking.ts) and
[Sequence](recipes/sequence.ts) recipes.

## Start, save, restore, and stop

`startGame` validates browser assets and mounts one Game Session. The returned
session can create a JSON-safe Save Snapshot, report status and diagnostics,
and stop idempotently. Treat stored JSON as `unknown`; only a successful
`validateSaveSnapshot` result can restore a session.

```ts
const session = await startGame(project, { target: gameElement });
const stored = JSON.stringify(session.createSaveSnapshot());
const result = validateSaveSnapshot(project, JSON.parse(stored) as unknown);

if (result.ok) {
  session.stop();
  await startGame(project, { target: gameElement, snapshot: result.snapshot });
}
```

`defineHUDTheme` optionally supplies the local font, palette, opacity, speech
width and colours, and directional cursors used by the Engine-owned HUD. Input,
browser, layout, Inventory, speech, Save/Load, and exclusion commitments are
listed in the [Support Baseline](support-baseline.md). See the executable
[Save Snapshot recipe](recipes/save-snapshot.ts) for restoration handling.
