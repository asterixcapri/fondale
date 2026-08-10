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

`defineScene` owns the Background, optional Scene Size, Walkable Region,
optional Perspective Scale, Scenery, Hotspots, Entrances, and Scene Passages.
Logical Resolution is the fixed viewport. Scene Size is the complete Scene
Space extent and defaults to Logical Resolution; each declared axis must be a
positive integer no smaller than the corresponding viewport axis. Every Scene
coordinate and the Background's exact pixel dimensions use the resolved Scene
Size. Character Ground Points must remain in the Walkable Region, while Object
Ground Points must remain inside the Scene Size. Scenery uses its Baseline and
optional position for depth.
An Object placement authored on a portable Object, the Player Character, or a
Sequence must fit every registered Scene Size because it can execute in any
current Scene. Scene-local Nouns validate placements only against their owning
Scene.

```ts
const harbour = defineScene({
  background: new URL("./harbour.png", import.meta.url),
  size: { width: 640, height: 360 },
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

When `size` is omitted, a 320×180 project expects a 320×180 Background and
keeps the fixed view at origin. In the panoramic example above, Fondale expects
a 640×360 Background, follows the Player Character automatically, clamps the
Camera at the Scene edges, and keeps Camera position out of Save Snapshots.
The first capability does not expose Camera coordinates, cinematic pans, zoom,
alternative follow targets, edge scrolling, or Author-controlled easing.

A Scene Passage owns its Noun and direction because it is itself the semantic
navigation target. Holding Tab reveals available Hotspots and Passages.

## Give interactive targets one Noun

A Character, Object, or Scenery owns at most one Noun Definition. Every
Hotspot that identifies that target uses the owner's labels, contextual Verbs,
Command Cases, responses, Lines, Sequences, and Game Operations.
The complete compiled [Interaction recipe](recipes/interaction.ts) defines one
Character, Object, Scenery, and Background Hotspot together and composes their
required owners through `defineGame` in the recipe tests.

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

```ts
const muralHotspot: HotspotDefinition = {
  target: { kind: "background" },
  area: [{ x: 35, y: 5 }, { x: 50, y: 5 }, { x: 50, y: 20 }],
  approach: { groundPoint: { x: 45, y: 35 }, facing: "back" },
  noun: defineNoun({
    labels: [{ text: "Mural" }],
    preferredVerbs: [{ verb: "look-at" }],
    cases: [{ verb: "look-at", response: { text: "Faded paint." } }],
  }),
};
```

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
width and colours, and directional cursors used by the Engine-owned HUD:

```ts
const hudTheme = defineHUDTheme({
  font: { family: "Example Serif", source: "./example-serif.woff2" },
  colors: {
    text: "#f4dfb4", preferred: "#f2ad62", selected: "#58d6d2",
    backing: "#0c1626", border: "#5c7182", inventoryWell: "#152536",
  },
  opacity: 0.9,
  maxSpeechWidth: 160,
  cursors: {
    left: "./cursor-left.svg", right: "./cursor-right.svg",
    up: "./cursor-up.svg", down: "./cursor-down.svg", enter: "./cursor-enter.svg",
  },
  speechColors: { host: "#f2ad62" },
});
```

The complete form is compiled in the [HUD Theme recipe](recipes/hud-theme.ts).
Input, Camera projection, browser, layout, Inventory, speech, Save/Load, and exclusion commitments
are listed in the [Support Baseline](support-baseline.md). See the executable
[Save Snapshot recipe](recipes/save-snapshot.ts) for restoration handling.
