# Game Project

## What a Game Project is

A Game Project is the complete declaration of one game: ordinary TypeScript
data, with no framework object to construct and no authoring functions to call.
You hand it to `startGame`, which validates every definition and every
cross-reference, applies defaults, and keeps a private deeply immutable copy.

Mutating your own data afterwards cannot affect a running Game Session. Calling
`startGame` again captures a new independent snapshot.

Registry keys are identities. The name under which you declare a Scene, a
Character, an Object or a Sequence is the name everything else uses to refer to
it; renaming a key renames the thing.

## How you author one

```ts
import { startGame, type GameProject } from "fondale";
import { harbour } from "./scenes/harbour";
import { michele } from "./characters/michele";
import { commandLexicon, commandFallbacks } from "./commands";

const project = {
  identity: "com.example.harbour",
  version: "1",
  logicalResolution: { width: 1280, height: 720 },
  scenes: { harbour },
  characters: { michele },
  initialScene: "harbour",
  commandLexicon,
  commandFallbacks,
} satisfies GameProject;

const session = await startGame(project, {
  target: document.querySelector<HTMLElement>("#game")!,
});
```

Use `satisfies` rather than a type annotation: it checks the value without
widening its inferred type, so registry keys stay literal and references stay
checkable.

Import only from the package root. Deep imports into the package are not
supported. The single exception is `fondale/testing`, which a
shipped game never imports.

## Values and rules

| Field | Value | Rules |
| --- | --- | --- |
| `identity` | non-empty string | identifies stored data; changing it abandons existing saves |
| `version` | non-empty string | your own Project Version, independent from the package version |
| `logicalResolution` | positive integer width and height | the fixed visible frame and the HUD canvas |
| `scenes` | named `SceneDefinition` registry | at least the initial Scene |
| `initialScene` | Scene key | must exist in `scenes` |
| `characters`, `objects`, `sequences`, `detailViews` | named registries | optional, default empty |
| `playerCharacter` | Character key | the Character the Camera follows and Commands move |
| `variables` | name-to-boolean map | declares every Game Variable and its initial value |
| `narrativeFacts`, `claims` | named registries | optional, default empty |
| `inventoryAppearanceSize` | positive integer | the square size every Inventory Appearance is drawn at |
| `letterboxColor` | CSS hex colour | defaults to `#000000` |
| `narrativeContext` | non-empty string | required as soon as any Character declares a dialogue profile |
| `commandLexicon` | `CommandLexicon` | required once any Noun exists |
| `commandFallbacks` | Verb-keyed `CommandResponse` map | the last resort that guarantees every Command answers |
| `hudTheme` | `HUDTheme` | optional; letterbox defaults to `#000000` |

### Startup

`startGame` works in a fixed order and stops at the first layer that fails.
It compiles an isolated project snapshot, validates any untrusted Save
Snapshot, then resolves to a `GameSession` once assets validate, WebGL starts
and the first frame is drawn.

Semantic validation always precedes browser work: an invalid definition is
reported before any asset is fetched, so a broken project fails fast and
without side effects.

`StartGameOptions` carries an unowned `target` element, an optional unknown
`snapshot`, and — for a project with dialogue — exactly one connection form,
either `dialogueServerUrl` or the low-level `dialogueProvider`. Supplying both
is invalid.

`GameSession` exposes `createSaveSnapshot`, `getStatus`, `getDiagnostics`, and
an idempotent terminal `stop`.

## Errors

An invalid project rejects `startGame` with an `AuthoringError` carrying every
`AuthoringDiagnostic` the failing layer produced, stably ordered. Each
diagnostic has a stable `code`, a `family`, the capability `owner` responsible
for the rule, an authoring `path`, a `message`, and optional `suggestion` and
`cause`.

Families are `definition`, `reference`, `state`, `save`, `asset`, and
`environment` — in the order startup reaches them.

| Code | Cause |
| --- | --- |
| `definition.project.identity` | identity is empty or not a string |
| `definition.project.version` | version is empty or not a string |
| `definition.logical-resolution.positive-integer` | a resolution axis is not a positive integer |
| `reference.scene.initial` | `initialScene` names a Scene that does not exist |
| `definition.narrative-context.required` | a Character declares a dialogue profile but the project declares no Narrative Context |
| `environment.webgl.unavailable` | the browser cannot start WebGL |
| `environment.target.occupied` | the target element already hosts a session |
| `environment.start.failed` | startup failed after validation |
| `environment.dialogue-connection.ambiguous` | both connection forms were supplied |

## Example

The whole example is assembled in [`game.ts`](../recipes/game.ts): two Scenes,
two Characters, one Object, two Sequences, a Detail View, the Command Lexicon
and the theme, handed to `startGame`.

## See also

[Scene](scene.md) · [Character](character.md) · [Interaction](interaction.md) · [Save](save.md) · [Testing](testing.md)
